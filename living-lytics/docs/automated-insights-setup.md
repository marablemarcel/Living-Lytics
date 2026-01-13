# Automated Insights Generation Setup

## Overview

This document explains how to set up automated weekly insight generation using Supabase Edge Functions and cron jobs.

## Prerequisites

- Supabase project with CLI installed
- OpenAI API key configured in environment variables
- Connected data sources

## Edge Function Deployment

### 1. Deploy the Edge Function

```bash
# From project root
supabase functions deploy generate-insights-batch
```

### 2. Set Environment Variables

The function requires these environment variables (automatically available in Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `APP_URL` - Your application URL (for API calls)

## Cron Job Setup

### Option 1: Supabase Cron (Recommended)

Create a cron job in your Supabase dashboard or via SQL:

```sql
-- Create cron job to run every Monday at 8 AM UTC
SELECT cron.schedule(
  'generate-insights-weekly',
  '0 8 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-insights-batch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### Option 2: External Cron Service

Use a service like GitHub Actions, Vercel Cron, or Render Cron:

**GitHub Actions Example:**

```yaml
# .github/workflows/generate-insights.yml
name: Generate Weekly Insights

on:
  schedule:
    - cron: '0 8 * * 1' # Every Monday at 8 AM UTC

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-insights-batch \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

## Manual Triggering

You can manually trigger insight generation for testing:

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-insights-batch \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Rate Limiting

The batch function includes built-in rate limiting:
- 2-second delay between users
- Skips users with insights generated in the last 7 days
- Prevents duplicate generation

## Monitoring

### Check Function Logs

```bash
supabase functions logs generate-insights-batch
```

### Query Generation Results

```sql
-- Check recent insights
SELECT 
  user_id,
  category,
  priority,
  confidence_score,
  created_at
FROM insights
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Check generation stats
SELECT 
  DATE(created_at) as date,
  COUNT(*) as insights_generated,
  AVG(confidence_score) as avg_confidence,
  AVG(cost) as avg_cost
FROM insights
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Cost Management

Monitor OpenAI API costs:

```sql
-- Total cost by day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as insights,
  SUM(cost) as total_cost,
  AVG(tokens_used) as avg_tokens
FROM insights
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

Expected costs:
- ~$0.01-0.05 per insight (depending on model)
- ~100-500 users = $1-25 per week

## Troubleshooting

### Function Fails

1. Check environment variables are set
2. Verify service role key has correct permissions
3. Check function logs for errors

### No Insights Generated

1. Verify users have connected data sources
2. Check confidence score threshold (minimum 50%)
3. Ensure sufficient data exists (7+ days recommended)

### High Costs

1. Review model selection (use gpt-4o-mini for routine insights)
2. Implement user tier filtering (paid users only)
3. Adjust generation frequency

## Best Practices

1. **Start Small**: Test with a few users before enabling for all
2. **Monitor Costs**: Set up alerts for unexpected API usage
3. **User Feedback**: Track helpful/not helpful ratings to improve prompts
4. **Confidence Scores**: Regularly review low-confidence insights
5. **A/B Testing**: Test different prompts and models for optimization
