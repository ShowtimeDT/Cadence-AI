-- Fantasy Football Database Schema (REVISED)
-- Execute this SQL in your Supabase SQL Editor
-- Supports: AI features, PAR metrics, awards, halftime substitutions, league imports

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  favorite_nfl_team TEXT,
  bio TEXT,
  user_preferences JSONB DEFAULT '{}', -- fantasy preferences (e.g., "prefer RBs", "Ravens > Browns")
  theme_settings JSONB DEFAULT '{}', -- custom color preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- LEAGUES
-- ============================================================================

CREATE TABLE public.leagues (
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
  scoring_settings JSONB DEFAULT '{}', -- fully customizable
  draft_settings JSONB DEFAULT '{}',
  playoff_settings JSONB DEFAULT '{}',
  waiver_type TEXT CHECK (waiver_type IN ('rolling', 'faab')) DEFAULT 'rolling',
  trade_deadline DATE,
  allow_halftime_subs BOOLEAN DEFAULT false, -- NEW: injury protection format
  imported_from TEXT, -- NEW: 'espn', 'sleeper', 'yahoo', null
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Leagues policies
CREATE POLICY "Users can view leagues they're in" ON public.leagues
  FOR SELECT USING (
    id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    ) OR commissioner_id = auth.uid()
  );

CREATE POLICY "Commissioners can update their leagues" ON public.leagues
  FOR UPDATE USING (commissioner_id = auth.uid());

CREATE POLICY "Any authenticated user can create a league" ON public.leagues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- TEAMS
-- ============================================================================

CREATE TABLE public.teams (
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

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams in their leagues" ON public.teams
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own teams" ON public.teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can insert teams they own" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- NFL PLAYERS
-- ============================================================================

CREATE TABLE public.nfl_players (
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

ALTER TABLE public.nfl_players ENABLE ROW LEVEL SECURITY;

-- NFL Players policies (public read access)
CREATE POLICY "Anyone can view NFL players" ON public.nfl_players
  FOR SELECT USING (true);

-- ============================================================================
-- ROSTERS
-- ============================================================================

CREATE TABLE public.rosters (
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

ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;

-- Rosters policies
CREATE POLICY "Users can view rosters in their leagues" ON public.rosters
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own roster" ON public.rosters
  FOR ALL USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- ============================================================================
-- MATCHUPS
-- ============================================================================

CREATE TABLE public.matchups (
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

ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

-- Matchups policies
CREATE POLICY "Users can view matchups in their leagues" ON public.matchups
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- PLAYER STATS (REVISED - Support halftime tracking)
-- ============================================================================

CREATE TABLE public.player_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  nfl_game_id TEXT,
  half TEXT CHECK (half IN ('first', 'second', 'full')) NOT NULL DEFAULT 'full', -- NEW
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

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Player Stats policies (public read access)
CREATE POLICY "Anyone can view player stats" ON public.player_stats
  FOR SELECT USING (true);

-- ============================================================================
-- AWARDS SYSTEM (NEW)
-- ============================================================================

-- Weekly Awards
CREATE TABLE public.weekly_awards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  award_type TEXT CHECK (award_type IN ('highest_scorer', 'lowest_scorer', 'biggest_upset', 'biggest_loser', 'closest_matchup', 'biggest_winner')) NOT NULL,
  value DECIMAL(10, 2), -- the score/margin that earned the award
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, week, award_type)
);

ALTER TABLE public.weekly_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view awards in their leagues" ON public.weekly_awards
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- Season Awards (Aggregated)
CREATE TABLE public.season_awards (
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

ALTER TABLE public.season_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view season awards in their leagues" ON public.season_awards
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DRAFT SYSTEM
-- ============================================================================

CREATE TABLE public.draft_picks (
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

ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view draft picks in their leagues" ON public.draft_picks
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- Draft Pick Grades (NEW)
CREATE TABLE public.draft_pick_grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draft_pick_id UUID REFERENCES public.draft_picks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  grade TEXT NOT NULL, -- 'A+', 'A', 'A-', 'B+', etc.
  grade_score DECIMAL(5, 2), -- numerical score (e.g., 4.0 for A, 3.7 for A-)
  ai_reasoning TEXT, -- why this grade was assigned
  projected_season_rank INTEGER, -- team's projected finish at draft time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.draft_pick_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pick grades in their leagues" ON public.draft_pick_grades
  FOR SELECT USING (
    draft_pick_id IN (
      SELECT id FROM public.draft_picks WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

-- Team Season Rankings (NEW)
CREATE TABLE public.team_season_rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL, -- 0 for pre-season
  projected_rank INTEGER,
  actual_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, week)
);

ALTER TABLE public.team_season_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rankings in their leagues" ON public.team_season_rankings
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- AI FEATURES (NEW)
-- ============================================================================

-- AI Projections
CREATE TABLE public.ai_projections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER, -- null for rest-of-season projections
  projection_type TEXT CHECK (projection_type IN ('weekly', 'rest_of_season')) NOT NULL,
  scoring_type TEXT CHECK (scoring_type IN ('standard', 'ppr', 'half_ppr')) NOT NULL,
  projected_points DECIMAL(10, 2) NOT NULL,
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  data_sources JSONB DEFAULT '[]', -- which sources were aggregated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI projections" ON public.ai_projections
  FOR SELECT USING (true);

-- Points Above Replacement Baselines (NEW)
CREATE TABLE public.par_baselines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position TEXT NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  scoring_type TEXT CHECK (scoring_type IN ('standard', 'ppr', 'half_ppr')) NOT NULL,
  replacement_level_points DECIMAL(10, 2) NOT NULL, -- avg points for replacement-level player
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(position, season, week, scoring_type)
);

ALTER TABLE public.par_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view PAR baselines" ON public.par_baselines
  FOR SELECT USING (true);

-- ============================================================================
-- LEAGUE IMPORTS (NEW)
-- ============================================================================

CREATE TABLE public.league_imports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  source_platform TEXT NOT NULL, -- 'espn', 'sleeper', 'yahoo'
  source_league_id TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seasons_imported JSONB DEFAULT '[]', -- array of season years
  import_status TEXT CHECK (import_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.league_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commissioners can view their league imports" ON public.league_imports
  FOR SELECT USING (
    league_id IN (
      SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()
    )
  );

-- ============================================================================
-- HALFTIME SUBSTITUTIONS (NEW)
-- ============================================================================

CREATE TABLE public.halftime_substitutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  matchup_id UUID REFERENCES public.matchups(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  roster_position TEXT NOT NULL, -- which position was subbed
  original_player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  substitute_player_id UUID REFERENCES public.nfl_players(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL, -- NFL game ID
  substituted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.halftime_substitutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view halftime subs in their leagues" ON public.halftime_substitutions
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can make halftime subs for their teams" ON public.halftime_substitutions
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

CREATE TABLE public.transactions (
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

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions in their leagues" ON public.transactions
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TRADES
-- ============================================================================

CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('proposed', 'accepted', 'rejected', 'vetoed', 'completed')) DEFAULT 'proposed',
  proposed_by UUID REFERENCES public.users(id) NOT NULL,
  trade_data JSONB NOT NULL, -- teams involved, players/picks exchanged (supports multi-team)
  proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trades in their leagues" ON public.trades
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- LEAGUE MESSAGES
-- ============================================================================

CREATE TABLE public.league_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('chat', 'announcement', 'system')) DEFAULT 'chat',
  image_url TEXT, -- NEW: support AI-generated images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.league_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their leagues" ON public.league_messages
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their leagues" ON public.league_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_teams_league_id ON public.teams(league_id);
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_rosters_team_id ON public.rosters(team_id);
CREATE INDEX idx_rosters_player_id ON public.rosters(player_id);
CREATE INDEX idx_matchups_league_id ON public.matchups(league_id);
CREATE INDEX idx_matchups_week ON public.matchups(week);
CREATE INDEX idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX idx_player_stats_season_week ON public.player_stats(season, week);
CREATE INDEX idx_player_stats_half ON public.player_stats(half);
CREATE INDEX idx_nfl_players_sleeper_id ON public.nfl_players(sleeper_id);
CREATE INDEX idx_nfl_players_position ON public.nfl_players(position);
CREATE INDEX idx_nfl_players_nfl_team ON public.nfl_players(nfl_team);
CREATE INDEX idx_draft_picks_league_id ON public.draft_picks(league_id);
CREATE INDEX idx_transactions_league_id ON public.transactions(league_id);
CREATE INDEX idx_trades_league_id ON public.trades(league_id);
CREATE INDEX idx_league_messages_league_id ON public.league_messages(league_id);
CREATE INDEX idx_weekly_awards_league_week ON public.weekly_awards(league_id, week);
CREATE INDEX idx_ai_projections_player_week ON public.ai_projections(player_id, week);
CREATE INDEX idx_par_baselines_lookup ON public.par_baselines(position, season, week, scoring_type);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfl_players_updated_at BEFORE UPDATE ON public.nfl_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchups_updated_at BEFORE UPDATE ON public.matchups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON public.player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_season_awards_updated_at BEFORE UPDATE ON public.season_awards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- If you see this message, the schema was created successfully!
DO $$
BEGIN
  RAISE NOTICE 'Fantasy Football Database Schema Created Successfully!';
  RAISE NOTICE 'Features enabled: AI projections, PAR metrics, awards, halftime subs, league imports';
END
$$;
