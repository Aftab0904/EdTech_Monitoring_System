-- EdUplift AI: Funnel Analysis & Revenue Leakage Queries

-- 1. Funnel Analysis: Identify drop-off rates between Sign-up and Enrollment
-- Assumption: 'is_enrolled' indicates the final stage of the funnel.
SELECT 
    traffic_source,
    COUNT(user_id) AS total_signups,
    SUM(is_enrolled) AS total_enrollments,
    ROUND(CAST(SUM(is_enrolled) AS FLOAT) / COUNT(user_id) * 100, 2) AS conversion_rate_percent,
    (COUNT(user_id) - SUM(is_enrolled)) AS drop_offs,
    ROUND(CAST((COUNT(user_id) - SUM(is_enrolled)) AS FLOAT) / COUNT(user_id) * 100, 2) AS drop_off_rate_percent
FROM 
    edtech_users
GROUP BY 
    traffic_source
ORDER BY 
    conversion_rate_percent DESC;

-- 2. Engagement vs Revenue (Leakage Identification)
-- Identifies segments with high platform time but low conversion/revenue.
SELECT 
    traffic_source,
    AVG(time_on_platform) AS avg_time_spent,
    AVG(courses_viewed) AS avg_courses_viewed,
    SUM(is_enrolled) AS enrollments,
    SUM(revenue_generated) AS total_revenue,
    ROUND(SUM(revenue_generated) / NULLIF(SUM(is_enrolled), 0), 2) AS arpu_enrolled -- Average Revenue Per Enrolled User
FROM 
    edtech_users
GROUP BY 
    traffic_source
HAVING 
    AVG(time_on_platform) > (SELECT AVG(time_on_platform) FROM edtech_users)
    AND SUM(revenue_generated) < (SELECT AVG(revenue_generated) * COUNT(*)/6 FROM edtech_users) -- Just an example threshold
ORDER BY 
    avg_time_spent DESC;

-- 3. Churn Risk Indicators
-- Users who signed up but haven't been active recently (if we had a 'days_since_last_active' column)
-- Using synthetic last_active_date vs current_date
SELECT 
    user_id,
    traffic_source,
    signup_date,
    last_active_date,
    (JULIANDAY('now') - JULIANDAY(last_active_date)) AS days_inactive,
    is_enrolled
FROM 
    edtech_users
WHERE 
    is_enrolled = 1 
    AND (JULIANDAY('now') - JULIANDAY(last_active_date)) > 30
ORDER BY 
    days_inactive DESC;
