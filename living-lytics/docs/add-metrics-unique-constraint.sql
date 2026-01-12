-- Add unique constraint to metrics table
-- This constraint is required for upsert operations to work properly
-- Run this in Supabase SQL Editor

-- First, remove any duplicate rows that might already exist
-- This creates a temp table with only the latest records
CREATE TEMP TABLE metrics_deduped AS
SELECT DISTINCT ON (user_id, source_id, metric_type, date)
  id, user_id, source_id, metric_type, metric_value, date, created_at
FROM metrics
ORDER BY user_id, source_id, metric_type, date, created_at DESC;

-- Delete all rows from metrics
DELETE FROM metrics;

-- Insert the deduplicated rows back
INSERT INTO metrics (id, user_id, source_id, metric_type, metric_value, date, created_at)
SELECT id, user_id, source_id, metric_type, metric_value, date, created_at
FROM metrics_deduped;

-- Now add the unique constraint
ALTER TABLE metrics
ADD CONSTRAINT metrics_unique_constraint
UNIQUE (user_id, source_id, metric_type, date);

-- Verify the constraint was created
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'metrics'::regclass;
