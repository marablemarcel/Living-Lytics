-- Week 8: Database Optimization SQL Script
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. DAILY METRICS SUMMARY VIEW
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS daily_metrics_summary;

-- Create aggregated daily metrics view for faster queries
CREATE OR REPLACE VIEW daily_metrics_summary AS
SELECT 
  user_id,
  source_id,
  date,
  -- Google Analytics metrics
  SUM(CASE WHEN metric_type = 'page_views' THEN metric_value ELSE 0 END) as page_views,
  SUM(CASE WHEN metric_type = 'sessions' THEN metric_value ELSE 0 END) as sessions,
  SUM(CASE WHEN metric_type = 'users' THEN metric_value ELSE 0 END) as users,
  AVG(CASE WHEN metric_type = 'bounce_rate' THEN metric_value ELSE NULL END) as bounce_rate,
  AVG(CASE WHEN metric_type = 'avg_session_duration' THEN metric_value ELSE NULL END) as avg_session_duration,
  -- Facebook metrics
  SUM(CASE WHEN metric_type LIKE 'facebook%' THEN metric_value ELSE 0 END) as facebook_total,
  SUM(CASE WHEN metric_type = 'facebook_page_impressions' THEN metric_value ELSE 0 END) as facebook_impressions,
  SUM(CASE WHEN metric_type = 'facebook_page_engaged_users' THEN metric_value ELSE 0 END) as facebook_engaged_users,
  -- Instagram metrics
  SUM(CASE WHEN metric_type LIKE 'instagram%' THEN metric_value ELSE 0 END) as instagram_total,
  SUM(CASE WHEN metric_type = 'instagram_impressions' THEN metric_value ELSE 0 END) as instagram_impressions,
  SUM(CASE WHEN metric_type = 'instagram_reach' THEN metric_value ELSE 0 END) as instagram_reach
FROM metrics
GROUP BY user_id, source_id, date;

-- Grant select permission on view
GRANT SELECT ON daily_metrics_summary TO authenticated;

-- ============================================
-- 2. COMPOSITE INDEXES
-- ============================================

-- Index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_metrics_user_source_date 
ON metrics(user_id, source_id, date);

-- Index for metric type filtering
CREATE INDEX IF NOT EXISTS idx_metrics_type 
ON metrics(user_id, metric_type, date);

-- Index for source queries
CREATE INDEX IF NOT EXISTS idx_metrics_source_date
ON metrics(source_id, date DESC);

-- Index for data sources queries
CREATE INDEX IF NOT EXISTS idx_data_sources_user_platform
ON data_sources(user_id, platform, connection_status);

-- ============================================
-- 3. CROSS-PLATFORM METRICS VIEW
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS cross_platform_metrics;

-- Create cross-platform aggregated view
CREATE OR REPLACE VIEW cross_platform_metrics AS
SELECT 
  m.user_id,
  m.date,
  ds.platform,
  -- Web metrics
  SUM(CASE WHEN ds.platform = 'google_analytics' AND m.metric_type = 'page_views' THEN m.metric_value ELSE 0 END) as web_page_views,
  SUM(CASE WHEN ds.platform = 'google_analytics' AND m.metric_type = 'sessions' THEN m.metric_value ELSE 0 END) as web_sessions,
  SUM(CASE WHEN ds.platform = 'google_analytics' AND m.metric_type = 'users' THEN m.metric_value ELSE 0 END) as web_users,
  -- Social metrics
  SUM(CASE WHEN ds.platform = 'facebook_instagram' THEN m.metric_value ELSE 0 END) as social_engagement,
  SUM(CASE WHEN m.metric_type LIKE 'facebook%' OR m.metric_type LIKE 'instagram%' THEN m.metric_value ELSE 0 END) as total_social_engagement
FROM metrics m
JOIN data_sources ds ON m.source_id = ds.id
GROUP BY m.user_id, m.date, ds.platform;

-- Grant select permission on view
GRANT SELECT ON cross_platform_metrics TO authenticated;

-- ============================================
-- 4. OPTIMIZE RLS POLICIES
-- ============================================

-- Check existing RLS policies
-- Note: Review and optimize these based on your specific RLS setup

-- Example: Ensure RLS policies use indexed columns
-- ALTER POLICY "Users can view their own metrics" ON metrics
-- USING (user_id = auth.uid());

-- ============================================
-- 5. ANALYZE TABLES
-- ============================================

-- Update statistics for query planner
ANALYZE metrics;
ANALYZE data_sources;

-- ============================================
-- 6. VACUUM (Optional - run during low traffic)
-- ============================================

-- Reclaim storage and update statistics
-- VACUUM ANALYZE metrics;
-- VACUUM ANALYZE data_sources;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test daily metrics summary view
-- SELECT * FROM daily_metrics_summary 
-- WHERE user_id = 'your-user-id' 
-- AND date >= '2024-01-01'
-- LIMIT 10;

-- Test cross-platform metrics view
-- SELECT * FROM cross_platform_metrics
-- WHERE user_id = 'your-user-id'
-- AND date >= '2024-01-01'
-- LIMIT 10;

-- Check index usage
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('metrics', 'data_sources')
-- ORDER BY idx_scan DESC;

-- ============================================
-- NOTES
-- ============================================

-- 1. Run this script during low traffic periods
-- 2. Monitor query performance after creating indexes
-- 3. Views are automatically updated when underlying data changes
-- 4. Indexes will slow down INSERT/UPDATE operations slightly but speed up SELECT queries significantly
-- 5. Consider creating materialized views for very large datasets (requires manual refresh)

-- ============================================
-- OPTIONAL: MATERIALIZED VIEWS (for very large datasets)
-- ============================================

-- Uncomment if you need materialized views for better performance
-- Note: Materialized views need to be refreshed manually or on a schedule

-- CREATE MATERIALIZED VIEW IF NOT EXISTS daily_metrics_materialized AS
-- SELECT * FROM daily_metrics_summary;

-- CREATE UNIQUE INDEX ON daily_metrics_materialized(user_id, source_id, date);

-- Refresh materialized view (run this periodically)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_metrics_materialized;
