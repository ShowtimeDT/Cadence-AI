# Automated Stats Updates - Cron Job Setup

This document explains how the automatic weekly NFL stats updates work.

## Overview

The system automatically fetches the latest NFL player stats every **Tuesday at 3:00 AM ET** using Vercel Cron Jobs.

## How It Works

1. **API Endpoint**: `/api/cron/update-stats`
   - Fetches current week from Sleeper API
   - Downloads all player stats for that week
   - Upserts data into Supabase `player_stats` table
   - Fantasy points auto-calculated by database triggers

2. **Schedule**: Tuesday 3:00 AM ET (8:00 AM UTC)
   - Configured in `vercel.json`
   - Runs after Monday Night Football stats are finalized

3. **Authentication**: Protected by `CRON_SECRET` environment variable
   - Prevents unauthorized access
   - Vercel automatically includes this in scheduled requests

## Local Testing

You can test the cron endpoint locally without deploying:

### Option 1: Browser (easiest)
```
http://localhost:3000/api/cron/update-stats?secret=your-super-secret-cron-token-change-this-in-production
```

### Option 2: Curl
```bash
curl "http://localhost:3000/api/cron/update-stats?secret=your-super-secret-cron-token-change-this-in-production"
```

### Option 3: With Authorization Header
```bash
curl -H "Authorization: Bearer your-super-secret-cron-token-change-this-in-production" \
  http://localhost:3000/api/cron/update-stats
```

### Expected Response
```json
{
  "success": true,
  "message": "Successfully imported Week 12 stats",
  "season": 2025,
  "week": 12,
  "imported": 2280,
  "skipped": 32
}
```

## Production Setup

### 1. Add Environment Variable to Vercel

**During deployment or in Vercel Dashboard:**

1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add:
   - **Key**: `CRON_SECRET`
   - **Value**: Generate a secure token:
     ```bash
     openssl rand -base64 32
     ```
   - **Environments**: Production, Preview, Development

### 2. Deploy

Once deployed, Vercel will automatically:
- Read the `vercel.json` cron configuration
- Schedule the job for Tuesday 3 AM ET
- Send authenticated requests with the `CRON_SECRET`

### 3. Monitor

View cron execution logs in Vercel:
- Dashboard → Your Project → Functions → Cron
- Check execution history, errors, and response times

## Cron Schedule Explained

```json
{
  "schedule": "0 8 * * 2"
}
```

- **0** = Minute 0
- **8** = Hour 8 (UTC) = 3 AM ET (during EST)
- **\*** = Every day of month
- **\*** = Every month
- **2** = Tuesday (0 = Sunday, 1 = Monday, etc.)

**Note**: During Daylight Saving Time (EDT), this runs at 4 AM ET. Adjust to `7` if you want consistent 3 AM ET year-round.

## Manual Trigger

To manually update stats without waiting for the cron:

**Development:**
```bash
curl "http://localhost:3000/api/cron/update-stats?secret=YOUR_SECRET"
```

**Production:**
```bash
curl "https://your-domain.vercel.app/api/cron/update-stats?secret=YOUR_SECRET"
```

## Troubleshooting

### "Unauthorized" Error
- Check that `CRON_SECRET` is set in `.env.local` (local) or Vercel environment variables (production)
- Ensure the secret matches exactly (no extra spaces)

### "No stats available" Response
- Stats for the current week may not be finalized yet
- Sleeper typically updates stats within hours after games end
- Tuesday morning is when Monday Night Football stats are final

### Stats Not Updating
- Check Vercel Function logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Ensure database has all 11,162 players with `sleeper_id` populated

## Cost

**Vercel Cron Jobs:**
- Included free in all Vercel plans
- Runs once per week = ~4 executions/month
- Each execution takes ~30 seconds

**Well within free tier limits.**

## Future Enhancements

Potential improvements:
- Add Slack/Discord/email notifications on success/failure
- Retry logic for failed API requests
- Backfill missing weeks automatically
- Health check endpoint to verify data freshness
