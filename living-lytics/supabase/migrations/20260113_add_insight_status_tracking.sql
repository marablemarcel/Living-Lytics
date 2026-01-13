-- Add status tracking fields to insights table
-- Migration: add_insight_status_tracking
-- Created: 2026-01-13

-- Add new columns for tracking insight lifecycle
ALTER TABLE insights
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_viewed ON insights(user_id, viewed_at) WHERE viewed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insights_actioned ON insights(user_id, actioned_at) WHERE actioned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insights_feedback ON insights(user_id, feedback) WHERE feedback IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insights_confidence ON insights(user_id, confidence_score DESC);

-- Add comments for documentation
COMMENT ON COLUMN insights.viewed_at IS 'Timestamp when the user first viewed this insight';
COMMENT ON COLUMN insights.actioned_at IS 'Timestamp when the user marked this insight as actioned';
COMMENT ON COLUMN insights.feedback IS 'User feedback: helpful or not_helpful';
COMMENT ON COLUMN insights.feedback_at IS 'Timestamp when feedback was provided';
COMMENT ON COLUMN insights.confidence_score IS 'AI confidence score (0-1) for this insight';
