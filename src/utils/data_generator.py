import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta

# Initialize Faker
fake = Faker()

def generate_edtech_data(num_rows=10000):
    """
    Generates a realistic EdTech dataset for revenue and engagement optimization.
    """
    data = []
    
    # Traffic sources and their conversion probabilities
    traffic_sources = ['Google Ads', 'Direct', 'Organic Search', 'Referral', 'Social Media', 'Email Campaign']
    source_weights = [0.2, 0.15, 0.25, 0.1, 0.2, 0.1]
    
    for _ in range(num_rows):
        user_id = fake.uuid4()
        traffic_source = random.choices(traffic_sources, weights=source_weights)[0]
        
        # Time on platform in minutes
        time_on_platform = np.random.gamma(shape=2.0, scale=15.0) 
        
        # Courses viewed
        courses_viewed = random.randint(0, 10)
        
        # Dates
        signup_date = fake.date_between(start_date='-1y', end_date='today')
        
        # Enrollment logic (influenced by time and courses viewed)
        enrollment_prob = min(0.1 + (time_on_platform / 200) + (courses_viewed / 20), 0.9)
        is_enrolled = 1 if random.random() < enrollment_prob else 0
        
        # Revenue generated
        if is_enrolled:
            revenue_generated = round(random.uniform(49.0, 499.0), 2)
            # Active date is usually after signup if enrolled
            last_active_date = signup_date + timedelta(days=random.randint(1, 30))
        else:
            revenue_generated = 0.0
            # Active date might be same or shortly after signup
            last_active_date = signup_date + timedelta(days=random.randint(0, 5))
            
        # Churn logic (only for enrolled users)
        is_churned = 0
        if is_enrolled:
            # High time on platform and more courses viewed reduces churn probability
            churn_prob = max(0.7 - (time_on_platform / 100) - (courses_viewed / 15), 0.05)
            is_churned = 1 if random.random() < churn_prob else 0
            
        data.append({
            'user_id': user_id,
            'traffic_source': traffic_source,
            'time_on_platform': round(time_on_platform, 2),
            'courses_viewed': courses_viewed,
            'signup_date': signup_date,
            'last_active_date': last_active_date,
            'is_enrolled': is_enrolled,
            'is_churned': is_churned,
            'revenue_generated': revenue_generated
        })
        
    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    print("Generating EdTech dataset...")
    df = generate_edtech_data(10000)
    
    # Save to CSV
    output_path = 'data/raw/synthetic_edtech_data.csv'
    df.to_csv(output_path, index=False)
    print(f"Dataset generated and saved to {output_path}")
    
    # Quick display
    print("\nFirst 5 rows:")
    print(df.head())
    
    print("\nDataset Summary:")
    print(df.describe())
    print("\nEnrollment Distribution:")
    print(df['is_enrolled'].value_counts(normalize=True))
