# Google Analytics Integration - Testing Guide

## 🧪 Local Testing Instructions

### Prerequisites

1. **Supabase CLI installed:**

   ```bash
   npm install -g supabase
   ```

2. **Supabase project initialized:**

   ```bash
   supabase init
   ```

3. **Environment variables configured:**
   - Copy `supabase/env.template` to `supabase/.env`
   - Fill in your actual credentials

---

## Testing the Edge Function

### Step 1: Start Supabase

```bash
supabase start
```

This will start:

- PostgreSQL database
- Supabase Studio (http://localhost:54323)
- Edge Functions runtime

### Step 2: Serve the Edge Function

```bash
supabase functions serve sync-google-analytics
```

The function will be available at:

```
http://127.0.0.1:54321/functions/v1/sync-google-analytics
```

### Step 3: Get Your JWT Token

1. Open your app in development mode: `npm run dev`
2. Log in to your account
3. Open browser DevTools → Application → Local Storage
4. Find the Supabase auth token (key: `sb-<project>-auth-token`)
5. Copy the `access_token` value

### Step 4: Test the Function

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-google-analytics' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "sourceId": "your-ga-source-id",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Sync initiated successfully",
  "sourceId": "...",
  "propertyId": "...",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "timestamp": "2024-01-11T..."
}
```

---

## Testing the Sync API Route

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Test via Browser Console

1. Navigate to `/dashboard/sources`
2. Open browser DevTools → Console
3. Run:

```javascript
fetch("/api/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sourceId: "your-source-id",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Step 3: Test via UI

1. Go to `/dashboard/sources`
2. Find your Google Analytics source
3. Click "Sync Now" button
4. Watch for:
   - Loading spinner
   - Success toast notification
   - Updated "Last synced" timestamp

---

## Verifying Data in Database

### Via Supabase Studio

1. Open http://localhost:54323
2. Navigate to Table Editor → `metrics`
3. Verify:
   - Records exist for your source_id
   - Dates are in `YYYY-MM-DD` format
   - All 7 metric types are present per date:
     - `page_views`
     - `sessions`
     - `users`
     - `bounce_rate`
     - `avg_session_duration`
     - `pages_per_session`
     - `engagement_rate`

### Via SQL

```sql
-- Check total records
SELECT COUNT(*) FROM metrics WHERE source_id = 'your-source-id';

-- Check date range
SELECT MIN(date), MAX(date) FROM metrics WHERE source_id = 'your-source-id';

-- Check metric types
SELECT DISTINCT metric_type FROM metrics WHERE source_id = 'your-source-id';

-- Check for duplicates (should return 0 rows)
SELECT date, metric_type, COUNT(*)
FROM metrics
WHERE source_id = 'your-source-id'
GROUP BY date, metric_type
HAVING COUNT(*) > 1;

-- View sample data
SELECT * FROM metrics
WHERE source_id = 'your-source-id'
ORDER BY date DESC
LIMIT 20;
```

---

## Testing Dashboard Integration

### Test Overview Page

1. Navigate to `/dashboard/overview`
2. Verify:
   - Metric cards show real data (not mock data)
   - Charts display actual metrics
   - Date range picker works
   - Loading states appear during fetch

### Test Analytics Page

1. Navigate to `/dashboard/analytics`
2. Verify:
   - All charts show real data
   - Traffic sources are accurate
   - Device breakdown is correct
   - Top pages display actual page paths

---

## Common Issues & Solutions

### Issue: "Missing authorization header"

**Solution:** Make sure you're passing the JWT token in the Authorization header:

```bash
--header 'Authorization: Bearer YOUR_TOKEN'
```

### Issue: "Data source not found"

**Solution:**

1. Verify the source_id is correct
2. Check that the source belongs to the authenticated user
3. Ensure the source is a Google Analytics source

### Issue: "No property ID configured"

**Solution:**

1. Go to `/dashboard/sources`
2. Edit your GA source
3. Add your GA4 property ID
4. Save changes

### Issue: No data in database after sync

**Solution:**

1. Check Edge Function logs: `supabase functions logs sync-google-analytics`
2. Verify GA credentials are valid
3. Check that property ID has data for the date range
4. Look for validation errors in console

### Issue: Duplicate records in database

**Solution:**
This shouldn't happen with the delete-then-insert pattern. If it does:

```sql
-- Remove duplicates manually
DELETE FROM metrics a USING metrics b
WHERE a.id > b.id
  AND a.source_id = b.source_id
  AND a.date = b.date
  AND a.metric_type = b.metric_type;
```

---

## Performance Testing

### Test Batch Processing

Sync a large date range (e.g., 90 days) and verify:

- Data is fetched in 30-day chunks
- Records are inserted in batches of 100
- No timeout errors occur
- All data is saved correctly

### Test Concurrent Syncs

Try syncing multiple sources simultaneously:

```javascript
Promise.all([
  fetch("/api/sync", {
    method: "POST",
    body: JSON.stringify({ sourceId: "source-1" }),
  }),
  fetch("/api/sync", {
    method: "POST",
    body: JSON.stringify({ sourceId: "source-2" }),
  }),
]);
```

Verify:

- Both syncs complete successfully
- No race conditions
- Data is correctly attributed to each source

---

## Next Steps

After successful local testing:

1. **Deploy Edge Function:**

   ```bash
   supabase functions deploy sync-google-analytics
   ```

2. **Set Production Secrets:**

   ```bash
   supabase secrets set GOOGLE_CLIENT_ID=...
   supabase secrets set GOOGLE_CLIENT_SECRET=...
   supabase secrets set ENCRYPTION_KEY=...
   ```

3. **Test in Production:**

   - Use production URL
   - Verify with real user accounts
   - Monitor function logs

4. **Set Up Monitoring:**
   - Enable error tracking
   - Set up alerts for failed syncs
   - Monitor database growth

---

## Support

If you encounter issues:

1. Check the walkthrough.md for detailed implementation details
2. Review Supabase function logs
3. Check browser console for errors
4. Verify environment variables are set correctly
