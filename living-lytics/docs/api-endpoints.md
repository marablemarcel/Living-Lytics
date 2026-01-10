# Living Lytics API Endpoints

API reference documentation for all Living Lytics endpoints.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

---

## Authentication Endpoints

### POST /api/oauth/google

Initiates Google OAuth flow or handles the OAuth callback.

**Flow:**
1. User clicks "Connect" on Google Analytics
2. Frontend redirects to `/api/oauth/google`
3. API redirects to Google OAuth consent screen
4. User approves, Google redirects back with `code`
5. API exchanges code for tokens
6. Tokens are encrypted and stored in database
7. User is redirected to `/dashboard/sources`

**Query Parameters (Callback):**

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| code      | string | Authorization code from Google       |
| state     | string | CSRF token for validation            |
| error     | string | Error code if user denied access     |

**Response:**

Redirects to `/dashboard/sources` with query params:
- `?success=google_analytics` - Connection successful
- `?error=access_denied` - User denied permission
- `?error=invalid_state` - CSRF validation failed
- `?error=token_exchange_failed` - Failed to get tokens

**Security:**
- Uses HttpOnly cookies for CSRF state token
- State parameter validated on callback
- Tokens encrypted before database storage

---

## Data Sources Endpoints

### POST /api/sources/[id]/sync

Manually trigger a data sync for a connected source.

**Authentication:** Required (via Supabase session)

**Path Parameters:**

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| id        | string | Data source UUID         |

**Request:**

```bash
POST /api/sources/abc123-def456/sync
Authorization: Bearer <session_token>
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Sync completed",
  "last_synced_at": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error - Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```
Status: 401

**Response (Error - Not Found):**

```json
{
  "error": "Data source not found"
}
```
Status: 404

**Response (Error - Forbidden):**

```json
{
  "error": "You do not own this data source"
}
```
Status: 403

**Response (Error - Server Error):**

```json
{
  "error": "Sync failed",
  "details": "Error message here"
}
```
Status: 500

---

## Future Endpoints (Week 6+)

### GET /api/analytics/data

Fetch analytics data for connected sources.

**Planned for:** Week 6

**Expected Parameters:**
- `source_id` - Filter by specific source
- `start_date` - Start of date range
- `end_date` - End of date range
- `metrics` - Comma-separated metric types

---

### GET /api/analytics/summary

Get aggregated analytics summary.

**Planned for:** Week 6

**Expected Response:**
```json
{
  "total_visitors": 12500,
  "total_sessions": 18200,
  "avg_session_duration": 245,
  "top_sources": [...]
}
```

---

### POST /api/insights/generate

Generate AI-powered insights from analytics data.

**Planned for:** Week 9

**Expected Request:**
```json
{
  "date_range": "30d",
  "focus_areas": ["traffic", "engagement"]
}
```

**Expected Response:**
```json
{
  "insights": [
    {
      "type": "opportunity",
      "priority": "high",
      "title": "Traffic spike detected",
      "description": "...",
      "recommendation": "..."
    }
  ]
}
```

---

## Error Codes

| Code | Description                        |
|------|------------------------------------|
| 400  | Bad Request - Invalid parameters   |
| 401  | Unauthorized - Not logged in       |
| 403  | Forbidden - Not authorized         |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error - Something went wrong|

---

## Rate Limiting

Currently no rate limiting is implemented. This will be added in production.

Planned limits:
- OAuth endpoints: 10 requests/minute
- Sync endpoints: 5 requests/minute per source
- Analytics endpoints: 60 requests/minute

---

## Versioning

API versioning will be added when breaking changes are introduced.

Future format: `/api/v1/endpoint`
