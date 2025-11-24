-- ============================================================================
-- EXTEND PLAYER_STATS TABLE WITH COMPREHENSIVE STATS
-- ============================================================================
-- The player_stats table already exists with basic fields. We'll add detailed
-- stat columns to support comprehensive fantasy scoring from Sleeper API.

-- Drop existing player_stats table and recreate with full stats
-- (Safe since this is a new system with no production data)
DROP TABLE IF EXISTS public.player_stats CASCADE;

-- Create comprehensive player_stats table
CREATE TABLE public.player_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Reference to player (UUID to match nfl_players.id)
    player_id UUID NOT NULL REFERENCES public.nfl_players(id) ON DELETE CASCADE,

    -- Season and week information
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    season_type TEXT NOT NULL DEFAULT 'regular', -- 'regular', 'post', 'pre'
    nfl_game_id TEXT,

    -- Passing stats (6 fields)
    passing_attempts INTEGER DEFAULT 0,
    passing_completions INTEGER DEFAULT 0,
    passing_yards DECIMAL(10,2) DEFAULT 0,
    passing_touchdowns INTEGER DEFAULT 0,
    passing_interceptions INTEGER DEFAULT 0,
    passing_2pt_conversions INTEGER DEFAULT 0,

    -- Rushing stats (6 fields)
    rushing_attempts INTEGER DEFAULT 0,
    rushing_yards DECIMAL(10,2) DEFAULT 0,
    rushing_touchdowns INTEGER DEFAULT 0,
    rushing_2pt_conversions INTEGER DEFAULT 0,
    rushing_fumbles INTEGER DEFAULT 0,
    rushing_fumbles_lost INTEGER DEFAULT 0,

    -- Receiving stats (7 fields)
    receptions INTEGER DEFAULT 0,
    receiving_targets INTEGER DEFAULT 0,
    receiving_yards DECIMAL(10,2) DEFAULT 0,
    receiving_touchdowns INTEGER DEFAULT 0,
    receiving_2pt_conversions INTEGER DEFAULT 0,
    receiving_fumbles INTEGER DEFAULT 0,
    receiving_fumbles_lost INTEGER DEFAULT 0,

    -- Kicking stats (9 fields)
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    field_goals_0_19 INTEGER DEFAULT 0,
    field_goals_20_29 INTEGER DEFAULT 0,
    field_goals_30_39 INTEGER DEFAULT 0,
    field_goals_40_49 INTEGER DEFAULT 0,
    field_goals_50_plus INTEGER DEFAULT 0,
    extra_points_made INTEGER DEFAULT 0,
    extra_points_attempted INTEGER DEFAULT 0,

    -- Defense/ST stats (9 fields)
    defense_sacks DECIMAL(10,2) DEFAULT 0,
    defense_interceptions INTEGER DEFAULT 0,
    defense_fumbles_recovered INTEGER DEFAULT 0,
    defense_fumbles_forced INTEGER DEFAULT 0,
    defense_safeties INTEGER DEFAULT 0,
    defense_touchdowns INTEGER DEFAULT 0,
    defense_blocked_kicks INTEGER DEFAULT 0,
    defense_points_allowed INTEGER DEFAULT 0,
    defense_yards_allowed INTEGER DEFAULT 0,

    -- Return stats (1 field)
    return_touchdowns INTEGER DEFAULT 0,

    -- Calculated fantasy points (auto-calculated by trigger)
    fantasy_points_standard DECIMAL(10,2) DEFAULT 0,
    fantasy_points_ppr DECIMAL(10,2) DEFAULT 0,
    fantasy_points_half_ppr DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one stat record per player per week
    UNIQUE(player_id, season, week, season_type)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_season_week ON public.player_stats(season, week);
CREATE INDEX IF NOT EXISTS idx_player_stats_season_type ON public.player_stats(season_type);
CREATE INDEX IF NOT EXISTS idx_player_stats_fantasy_points_ppr ON public.player_stats(fantasy_points_ppr DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_fantasy_points_standard ON public.player_stats(fantasy_points_standard DESC);

-- ============================================================================
-- FANTASY POINTS CALCULATION FUNCTIONS
-- ============================================================================
-- Note: League-specific scoring rules are stored in leagues.scoring_settings JSONB
-- These functions use standard default scoring rules for the three common formats

-- Function to calculate fantasy points using standard default scoring
-- Parameter reception_points: 0 for Standard, 1.0 for PPR, 0.5 for Half-PPR
CREATE OR REPLACE FUNCTION calculate_fantasy_points(
    stats_record public.player_stats,
    reception_points DECIMAL(10,2)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_points DECIMAL(10,2) := 0;
    defense_pa_points DECIMAL(10,2) := 0;
BEGIN
    -- Passing points (1 point per 25 yards, 4 points per TD)
    total_points := total_points + (stats_record.passing_yards * 0.04);
    total_points := total_points + (stats_record.passing_touchdowns * 4.0);
    total_points := total_points + (stats_record.passing_interceptions * -2.0);
    total_points := total_points + (stats_record.passing_2pt_conversions * 2.0);

    -- Rushing points (1 point per 10 yards, 6 points per TD)
    total_points := total_points + (stats_record.rushing_yards * 0.1);
    total_points := total_points + (stats_record.rushing_touchdowns * 6.0);
    total_points := total_points + (stats_record.rushing_2pt_conversions * 2.0);

    -- Receiving points (variable PPR, 1 point per 10 yards, 6 points per TD)
    total_points := total_points + (stats_record.receptions * reception_points);
    total_points := total_points + (stats_record.receiving_yards * 0.1);
    total_points := total_points + (stats_record.receiving_touchdowns * 6.0);
    total_points := total_points + (stats_record.receiving_2pt_conversions * 2.0);

    -- Fumble points (-2 per fumble lost)
    total_points := total_points + ((stats_record.rushing_fumbles_lost + stats_record.receiving_fumbles_lost) * -2.0);

    -- Kicking points
    total_points := total_points + (stats_record.field_goals_0_19 * 3.0);
    total_points := total_points + (stats_record.field_goals_20_29 * 3.0);
    total_points := total_points + (stats_record.field_goals_30_39 * 3.0);
    total_points := total_points + (stats_record.field_goals_40_49 * 4.0);
    total_points := total_points + (stats_record.field_goals_50_plus * 5.0);
    total_points := total_points + ((stats_record.field_goals_attempted - stats_record.field_goals_made) * -1.0);
    total_points := total_points + (stats_record.extra_points_made * 1.0);
    total_points := total_points + ((stats_record.extra_points_attempted - stats_record.extra_points_made) * -1.0);

    -- Defense/ST points (only apply if this is actually a defense/ST player)
    -- Check if any defense stats exist to determine if this is a DST player
    IF (stats_record.defense_sacks > 0 OR
        stats_record.defense_interceptions > 0 OR
        stats_record.defense_fumbles_recovered > 0 OR
        stats_record.defense_touchdowns > 0 OR
        stats_record.defense_safeties > 0 OR
        stats_record.defense_blocked_kicks > 0 OR
        stats_record.defense_points_allowed > 0 OR
        stats_record.defense_yards_allowed > 0) THEN

        -- Apply defense scoring
        total_points := total_points + (stats_record.defense_sacks * 1.0);
        total_points := total_points + (stats_record.defense_interceptions * 2.0);
        total_points := total_points + (stats_record.defense_fumbles_recovered * 2.0);
        total_points := total_points + (stats_record.defense_touchdowns * 6.0);
        total_points := total_points + (stats_record.defense_safeties * 2.0);
        total_points := total_points + (stats_record.defense_blocked_kicks * 2.0);

        -- Defense points allowed scoring (tiered)
        IF stats_record.defense_points_allowed = 0 THEN
            defense_pa_points := 10.0;
        ELSIF stats_record.defense_points_allowed BETWEEN 1 AND 6 THEN
            defense_pa_points := 7.0;
        ELSIF stats_record.defense_points_allowed BETWEEN 7 AND 13 THEN
            defense_pa_points := 4.0;
        ELSIF stats_record.defense_points_allowed BETWEEN 14 AND 20 THEN
            defense_pa_points := 1.0;
        ELSIF stats_record.defense_points_allowed BETWEEN 21 AND 27 THEN
            defense_pa_points := 0.0;
        ELSIF stats_record.defense_points_allowed BETWEEN 28 AND 34 THEN
            defense_pa_points := -1.0;
        ELSE
            defense_pa_points := -4.0;
        END IF;
        total_points := total_points + defense_pa_points;
    END IF;

    -- Return touchdowns (6 points each)
    total_points := total_points + (stats_record.return_touchdowns * 6.0);

    RETURN ROUND(total_points, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-calculate fantasy points on insert/update
CREATE OR REPLACE FUNCTION update_fantasy_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate fantasy points for all three scoring types
    NEW.fantasy_points_standard := calculate_fantasy_points(NEW, 0.0);    -- Standard (no PPR)
    NEW.fantasy_points_ppr := calculate_fantasy_points(NEW, 1.0);         -- Full PPR
    NEW.fantasy_points_half_ppr := calculate_fantasy_points(NEW, 0.5);    -- Half PPR
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then recreate
DROP TRIGGER IF EXISTS calculate_fantasy_points_trigger ON public.player_stats;

CREATE TRIGGER calculate_fantasy_points_trigger
    BEFORE INSERT OR UPDATE ON public.player_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_fantasy_points_trigger();

-- Enable Row Level Security
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Player Stats policies (public read access - anyone can view NFL stats)
CREATE POLICY "Anyone can view player stats" ON public.player_stats
  FOR SELECT USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.player_stats IS 'Comprehensive weekly NFL player statistics from Sleeper API with auto-calculated fantasy points for Standard, PPR, and Half-PPR scoring';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration extends the player_stats table with 40+ detailed stat fields
-- and auto-calculates fantasy points using PostgreSQL triggers.
--
-- Usage:
--   1. Run this migration in Supabase SQL Editor
--   2. Populate sleeper_id mappings in nfl_players table (if not done)
--   3. Run: npm run fetch-stats
--
-- The fetch-stats script will:
--   - Fetch weekly stats from Sleeper API for entire 2025 season
--   - Store in player_stats table
--   - Fantasy points auto-calculated by database trigger
-- ============================================================================
