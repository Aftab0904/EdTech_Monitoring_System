import pandas as pd

def identify_revenue_leakage(df):
    """
    Identifies 'Leakage Points' in the EdTech funnel.
    Leakage Points: Segments with high engagement (time_on_platform) but zero revenue.
    """
    # Define thresholds
    avg_time = df['time_on_platform'].mean()
    
    # Filter for high engagement and zero revenue
    leakage_df = df[(df['time_on_platform'] > avg_time) & (df['revenue_generated'] == 0)]
    
    # Analyze by traffic source
    leakage_summary = leakage_df.groupby('traffic_source').agg({
        'user_id': 'count',
        'time_on_platform': 'mean',
        'courses_viewed': 'mean'
    }).rename(columns={'user_id': 'lost_prospects_count', 'time_on_platform': 'avg_wasted_time'})
    
    leakage_summary['leakage_score'] = (leakage_summary['lost_prospects_count'] * leakage_summary['avg_wasted_time']) / 100
    
    return leakage_summary.sort_values(by='leakage_score', ascending=False)

if __name__ == "__main__":
    df = pd.read_csv('EdUplift_AI/data/raw/synthetic_edtech_data.csv')
    print("Identifying Revenue Leakage Points...")
    leakage = identify_revenue_leakage(df)
    print("\nRevenue Leakage Summary (by Traffic Source):")
    print(leakage)
    
    print("\nTop 5 High-Risk Leakage Users (High Engagement, No Revenue):")
    high_engagement_no_rev = df[df['revenue_generated'] == 0].sort_values(by='time_on_platform', ascending=False)
    print(high_engagement_no_rev[['user_id', 'traffic_source', 'time_on_platform', 'courses_viewed']].head())
