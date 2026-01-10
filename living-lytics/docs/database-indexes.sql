-- Living Lytics Database Performance Indexes
-- Run these in Supabase SQL Editor to optimize query performance

-- ============================================
-- DATA SOURCES TABLE INDEXES
-- ============================================

-- Index for faster user data source lookups
-- Used when fetching all sources for a specific user and platform
CREATE INDEX IF NOT EXISTS idx_data_sources_user_platform
  ON data_sources(user_id, platform);

-- Index for connection status queries
-- Used when filtering sources by their connection state
CREATE INDEX IF NOT EXISTS idx_data_sources_status
  ON data_sources(connection_status);

-- Index for finding connections needing sync
-- Used to identify stale connections that need refreshing
CREATE INDEX IF NOT EXISTS idx_data_sources_last_synced
  ON data_sources(last_synced_at);

-- Composite index for user + status queries
-- Optimizes queries that filter by both user and status
CREATE INDEX IF NOT EXISTS idx_data_sources_user_status
  ON data_sources(user_id, connection_status);

-- ============================================
-- METRICS TABLE INDEXES (for Week 6+)
-- ============================================

-- Index for user metrics queries
-- Used when fetching metrics for a user's dashboard
CREATE INDEX IF NOT EXISTS idx_metrics_user_date
  ON metrics(user_id, date DESC);

-- Index for source-specific metrics
-- Used when viewing analytics for a specific data source
CREATE INDEX IF NOT EXISTS idx_metrics_source
  ON metrics(source_id, date DESC);

-- Index for metric type queries
-- Used when filtering by specific metric types
CREATE INDEX IF NOT EXISTS idx_metrics_type
  ON metrics(metric_type);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run this to verify indexes were created:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('data_sources', 'metrics');

-- ============================================
-- NOTES
-- ============================================

-- These indexes improve read performance but slightly slow writes.
-- For our use case (more reads than writes), this is the right tradeoff.
--
-- If you need to drop an index:
-- DROP INDEX IF EXISTS index_name;
