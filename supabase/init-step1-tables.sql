-- Fantasy Football Database Schema - STEP 1: Tables Only
-- Run this first to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  favorite_nfl_team TEXT,
  bio TEXT,
  user_preferences JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- LEAGUES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  commissioner_id UUID REFERENCES public.users(id) NOT NULL,
  league_type TEXT CHECK (league_type IN ('redraft', 'keeper', 'dynasty')) DEFAULT 'redraft',
  scoring_type TEXT CHECK (scoring_type IN ('standard', 'ppr', 'half_ppr', 'custom')) DEFAULT 'ppr',
  status TEXT CHECK (status IN ('setup', 'drafting', 'active', 'completed')) DEFAULT 'setup',
  season_year INTEGER NOT NULL,
  team_count INTEGER CHECK (team_count >= 2 AND team_count <= 20) DEFAULT 10,
  roster_settings JSONB DEFAULT '{}',
  scoring_settings JSONB DEFAULT '{}',
  draft_settings JSONB DEFAULT '{}',
  playoff_settings JSONB DEFAULT '{}',
  waiver_type TEXT CHECK (waiver_type IN ('rolling', 'faab')) DEFAULT 'rolling',
  trade_deadline DATE,
  allow_halftime_subs BOOLEAN DEFAULT false,
  imported_from TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  draft_position INTEGER,
  waiver_priority INTEGER,
  faab_budget INTEGER DEFAULT 100,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  points_for DECIMAL(10, 2) DEFAULT 0,
  points_against DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, owner_id)
);

-- ============================================================================
-- NFL PLAYERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nfl_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sleeper_id TEXT UNIQUE,
  espn_id TEXT,
  yahoo_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL,
  nfl_team TEXT,
  jersey_number INTEGER,
  status TEXT CHECK (status IN ('active', 'injured', 'out', 'doubtful', 'questionable')) DEFAULT 'active',
  injury_description TEXT,
  bye_week INTEGER,
  years_exp INTEGER,
  college TEXT,
  height TEXT,
  weight INTEGER,
  headshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROSTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rosters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  position_type TEXT CHECK (position_type IN ('starter', 'bench', 'ir', 'taxi')) DEFAULT 'bench',
  roster_position TEXT,
  acquired_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acquisition_type TEXT CHECK (acquisition_type IN ('draft', 'waiver', 'trade', 'free_agent')) DEFAULT 'free_agent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- ============================================================================
-- MATCHUPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.matchups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL,
  team1_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  team1_score DECIMAL(10, 2) DEFAULT 0,
  team2_score DECIMAL(10, 2) DEFAULT 0,
  is_playoff BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'final')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, week, team1_id)
);

-- ============================================================================
-- PLAYER STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  nfl_game_id TEXT,
  half TEXT CHECK (half IN ('first', 'second', 'full')) NOT NULL DEFAULT 'full',
  passing_yards INTEGER DEFAULT 0,
  passing_tds INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  rushing_yards INTEGER DEFAULT 0,
  rushing_tds INTEGER DEFAULT 0,
  receptions INTEGER DEFAULT 0,
  receiving_yards INTEGER DEFAULT 0,
  receiving_tds INTEGER DEFAULT 0,
  fumbles_lost INTEGER DEFAULT 0,
  two_point_conversions INTEGER DEFAULT 0,
  fantasy_points_ppr DECIMAL(10, 2) DEFAULT 0,
  fantasy_points_standard DECIMAL(10, 2) DEFAULT 0,
  fantasy_points_half_ppr DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, season, week, half)
);

-- ============================================================================
-- AWARDS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_awards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  award_type TEXT CHECK (award_type IN ('highest_scorer', 'lowest_scorer', 'biggest_upset', 'biggest_loser', 'closest_matchup', 'biggest_winner')) NOT NULL,
  value DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, week, award_type)
);

CREATE TABLE IF NOT EXISTS public.season_awards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  season_year INTEGER NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  award_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, season_year, team_id, award_type)
);

-- ============================================================================
-- DRAFT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.draft_picks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL,
  pick_number INTEGER NOT NULL,
  overall_pick INTEGER NOT NULL,
  picked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, overall_pick)
);

CREATE TABLE IF NOT EXISTS public.draft_pick_grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draft_pick_id UUID REFERENCES public.draft_picks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  grade TEXT NOT NULL,
  grade_score DECIMAL(5, 2),
  ai_reasoning TEXT,
  projected_season_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_season_rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL,
  projected_rank INTEGER,
  actual_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, week)
);

-- ============================================================================
-- AI FEATURES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_projections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER,
  projection_type TEXT CHECK (projection_type IN ('weekly', 'rest_of_season')) NOT NULL,
  scoring_type TEXT CHECK (scoring_type IN ('standard', 'ppr', 'half_ppr')) NOT NULL,
  projected_points DECIMAL(10, 2) NOT NULL,
  confidence_score DECIMAL(3, 2),
  data_sources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.par_baselines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position TEXT NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  scoring_type TEXT CHECK (scoring_type IN ('standard', 'ppr', 'half_ppr')) NOT NULL,
  replacement_level_points DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(position, season, week, scoring_type)
);

-- ============================================================================
-- LEAGUE IMPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.league_imports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  source_platform TEXT NOT NULL,
  source_league_id TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seasons_imported JSONB DEFAULT '[]',
  import_status TEXT CHECK (import_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- HALFTIME SUBSTITUTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.halftime_substitutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  matchup_id UUID REFERENCES public.matchups(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  roster_position TEXT NOT NULL,
  original_player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  substitute_player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  substituted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('waiver', 'free_agent', 'trade', 'drop')) NOT NULL,
  players_added JSONB DEFAULT '[]',
  players_dropped JSONB DEFAULT '[]',
  faab_bid INTEGER,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRADES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('proposed', 'accepted', 'rejected', 'vetoed', 'completed')) DEFAULT 'proposed',
  proposed_by UUID REFERENCES public.users(id) NOT NULL,
  trade_data JSONB NOT NULL,
  proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- LEAGUE MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.league_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('chat', 'announcement', 'system')) DEFAULT 'chat',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_teams_league_id ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_rosters_team_id ON public.rosters(team_id);
CREATE INDEX IF NOT EXISTS idx_rosters_player_id ON public.rosters(player_id);
CREATE INDEX IF NOT EXISTS idx_matchups_league_id ON public.matchups(league_id);
CREATE INDEX IF NOT EXISTS idx_matchups_week ON public.matchups(week);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_season_week ON public.player_stats(season, week);
CREATE INDEX IF NOT EXISTS idx_player_stats_half ON public.player_stats(half);
CREATE INDEX IF NOT EXISTS idx_nfl_players_sleeper_id ON public.nfl_players(sleeper_id);
CREATE INDEX IF NOT EXISTS idx_nfl_players_position ON public.nfl_players(position);
CREATE INDEX IF NOT EXISTS idx_nfl_players_nfl_team ON public.nfl_players(nfl_team);
CREATE INDEX IF NOT EXISTS idx_draft_picks_league_id ON public.draft_picks(league_id);
CREATE INDEX IF NOT EXISTS idx_transactions_league_id ON public.transactions(league_id);
CREATE INDEX IF NOT EXISTS idx_trades_league_id ON public.trades(league_id);
CREATE INDEX IF NOT EXISTS idx_league_messages_league_id ON public.league_messages(league_id);
CREATE INDEX IF NOT EXISTS idx_weekly_awards_league_week ON public.weekly_awards(league_id, week);
CREATE INDEX IF NOT EXISTS idx_ai_projections_player_week ON public.ai_projections(player_id, week);
CREATE INDEX IF NOT EXISTS idx_par_baselines_lookup ON public.par_baselines(position, season, week, scoring_type);
