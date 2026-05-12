from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import duckdb
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="EdUplift AI: Growth Intelligence API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter Client Setup
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPEN_ROUTER_API_KEY"),
)

# Load models and features
MODEL_DIR = 'src/models/saved_models'
lead_model = joblib.load(os.path.join(MODEL_DIR, 'lead_scoring_model.pkl'))
lead_features = joblib.load(os.path.join(MODEL_DIR, 'lead_scoring_features.pkl'))
churn_model = joblib.load(os.path.join(MODEL_DIR, 'churn_model.pkl'))
churn_features = joblib.load(os.path.join(MODEL_DIR, 'churn_features.pkl'))

DATA_PATH = 'data/raw/synthetic_edtech_data.csv'

class UserBehavior(BaseModel):
    traffic_source: str
    time_on_platform: float
    courses_viewed: int

class SQLQuery(BaseModel):
    query: str

class AIQuestion(BaseModel):
    question: str

class LeakageAnalysisRequest(BaseModel):
    data: list

@app.get("/")
def read_root():
    return {"message": "Welcome to EdUplift AI API"}

@app.post("/predict")
def predict_growth_metrics(behavior: UserBehavior):
    try:
        input_data = {
            'time_on_platform': [behavior.time_on_platform],
            'courses_viewed': [behavior.courses_viewed]
        }
        for feat in lead_features:
            if feat.startswith('traffic_source_'):
                source = feat.replace('traffic_source_', '')
                input_data[feat] = [1 if behavior.traffic_source == source else 0]
        
        X_input = pd.DataFrame(input_data)
        X_input = X_input[lead_features]
        
        enrollment_prob = float(lead_model.predict_proba(X_input)[:, 1][0])
        X_churn_input = X_input[churn_features]
        churn_prob = float(churn_model.predict_proba(X_churn_input)[:, 1][0])
        
        return {
            "enrollment_probability": round(enrollment_prob, 4),
            "churn_probability": round(churn_prob, 4),
            "status": "Success",
            "recommendation": "High Priority" if enrollment_prob > 0.7 else "Standard"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/revenue-leakage")
def get_revenue_leakage():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=404, detail="Dataset not found.")
    df = pd.read_csv(DATA_PATH)
    leakage = df[(df['time_on_platform'] > 40) & (df['revenue_generated'] == 0)]
    summary = leakage.groupby('traffic_source').size().reset_index(name='leakage_count')
    return summary.to_dict(orient='records')

@app.get("/dataset")
def get_dataset_preview():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=404, detail="Dataset not found.")
    df = pd.read_csv(DATA_PATH)
    return df.head(50).to_dict(orient='records')

@app.post("/query")
def execute_sql_query(sql: SQLQuery):
    try:
        if not os.path.exists(DATA_PATH):
            raise HTTPException(status_code=404, detail="Dataset not found.")
        query = sql.query.replace("edtech_users", f"read_csv_auto('{DATA_PATH}')")
        result_df = duckdb.query(query).to_df()
        return result_df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL Error: {str(e)}")

@app.post("/ask-sql")
def ask_ai_sql(payload: AIQuestion):
    try:
        prompt = f"""
        You are a SQL expert for a DuckDB database. 
        The table is called 'edtech_users' and has the following columns:
        - user_id (string)
        - traffic_source (string: 'Google Ads', 'Direct', 'Organic Search', 'Referral', 'Social Media', 'Email Campaign')
        - time_on_platform (float, minutes)
        - courses_viewed (int)
        - signup_date (date)
        - last_active_date (date)
        - is_enrolled (int, 0 or 1)
        - is_churned (int, 0 or 1)
        - revenue_generated (float)

        Convert the following user question into a valid SQL query. 
        Only return the SQL query, nothing else. Do not use markdown backticks.
        User Question: {payload.question}
        """
        
        response = client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct",
            messages=[{"role": "user", "content": prompt}],
        )
        
        sql_query = response.choices[0].message.content.strip()
        # Execute the generated SQL
        return execute_sql_query(SQLQuery(query=sql_query))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI SQL Error: {str(e)}")

@app.post("/analyze-leakage")
def analyze_leakage_with_ai(payload: LeakageAnalysisRequest):
    try:
        prompt = f"""
        As an EdTech Business Analyst, analyze the following revenue leakage data (segments with high engagement but zero revenue). 
        Provide a concise, professional 2-paragraph summary identifying the biggest risk and an actionable recommendation.
        Data (Traffic Source and Count of Lost Prospects):
        {json.dumps(payload.data)}
        """
        
        response = client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct",
            messages=[{"role": "user", "content": prompt}],
        )
        
        return {"summary": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
