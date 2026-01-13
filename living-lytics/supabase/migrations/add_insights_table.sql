-- Insights table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('trend', 'anomaly', 'opportunity', 'performance', 'attribution', 'root_cause', 'strategic', 'general')),
  platform TEXT DEFAULT 'all',
  model_used TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_created ON insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON insights(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_insights_platform ON insights(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_insights_category ON insights(user_id, category);
CREATE INDEX IF NOT EXISTS idx_insights_dismissed ON insights(user_id, dismissed);

-- Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own insights
CREATE POLICY "Users can view own insights"
  ON insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON insights
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON insights
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE insights IS 'Stores AI-generated marketing insights with model metadata and cost tracking';
COMMENT ON COLUMN insights.model_used IS 'OpenAI model used: gpt-4o-mini, gpt-4o, or o1-mini';
COMMENT ON COLUMN insights.tokens_used IS 'Total tokens consumed for this insight generation';
COMMENT ON COLUMN insights.cost IS 'Cost in USD for generating this insight';
