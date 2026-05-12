import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os

def train_churn_model(data_path='data/raw/synthetic_edtech_data.csv'):
    # Load data
    df = pd.read_csv(data_path)
    
    # Churn model is typically for enrolled users
    df_enrolled = df[df['is_enrolled'] == 1].copy()
    
    if df_enrolled.empty:
        print("No enrolled users found for churn training.")
        return

    # Feature Engineering
    # One-hot encode traffic_source
    df_enrolled = pd.get_dummies(df_enrolled, columns=['traffic_source'], drop_first=True)
    
    # Features and Target
    X = df_enrolled.drop(['user_id', 'signup_date', 'last_active_date', 'is_enrolled', 'is_churned', 'revenue_generated'], axis=1)
    y = df_enrolled['is_churned']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42
    )
    
    # Train model
    print("Training Random Forest Churn Model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    # ROC-AUC can be problematic if only one class exists in y_test, but split should handle it
    try:
        print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    except:
        pass
        
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
    joblib.dump(model, 'src/models/saved_models/churn_model.pkl')
    joblib.dump(X.columns.tolist(), 'src/models/saved_models/churn_features.pkl')
    print("\nModel saved to src/models/saved_models/churn_model.pkl")

if __name__ == "__main__":
    train_churn_model()
