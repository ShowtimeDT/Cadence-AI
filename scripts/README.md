# NFL Stats Data Pipeline

This directory contains scripts for importing real NFL player statistics from Sleeper API into Supabase.

## Prerequisites

1. **Database Setup**: Run the migration in Supabase
2. **Player Mapping**: Ensure `nfl_players` has `sleeper_id` column
3. **Environment Variables**: Set in `.env.local`

## Usage

```bash
# Fetch all weeks for 2025 season
npm run fetch-stats

# Fetch specific week
npm run fetch-stats -- --week=12

# Fetch specific season
npm run fetch-stats -- --season=2024
```

## Sources
- [Sleeper API](https://docs.sleeper.com/)
- [Stats endpoints](https://sleeper-api-client.readthedocs.io/en/latest/endpoints/stats.html)
