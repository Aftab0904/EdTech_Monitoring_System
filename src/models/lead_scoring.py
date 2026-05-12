import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os

def train_lead_scoring_model(data_path='data/raw/synthetic_edtech_data.csv'):
    # Load data
    df = pd.read_csv(data_path)
    
    # Feature Engineering
    # One-hot encode traffic_source
    df = pd.get_dummies(df, columns=['traffic_source'], drop_first=True)
    
    # Features and Target
    X = df.drop(['user_id', 'signup_date', 'last_active_date', 'is_enrolled', 'is_churned', 'revenue_generated'], axis=1)
    y = df['is_enrolled']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize XGBoost
    model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    # Train model
    print("Training XGBoost Lead Scoring Model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature Importance
    importances = model.feature_importances_
    feature_names = X.columns
    feature_importance_df = pd.DataFrame({'feature': feature_names, 'importance': importances}).sort_values(by='importance', ascending=False)
    print("\nFeature Importance:")
    print(feature_importance_df)
    
    # Save model and feature names
    os.makedirs('src/models/saved_models', exist_ok=True)
    joblib.dump(model, 'src/models/saved_models/lead_scoring_model.pkl')
    joblib.dump(X.columns.tolist(), 'src/models/saved_models/lead_scoring_features.pkl')
    print("\nModel saved to src/models/saved_models/lead_scoring_model.pkl")

if __name__ == "__main__":
    train_lead_scoring_model()
