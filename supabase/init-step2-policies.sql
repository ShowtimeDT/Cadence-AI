-- Fantasy Football Database Schema - STEP 2: Security Policies & Triggers
-- Run this AFTER step 1 completes successfully

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_pick_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_season_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.par_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halftime_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- LEAGUES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view leagues they're in" ON public.leagues;
CREATE POLICY "Users can view leagues they're in" ON public.leagues
  FOR SELECT USING (
    id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    ) OR commissioner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Commissioners can update their leagues" ON public.leagues;
CREATE POLICY "Commissioners can update their leagues" ON public.leagues
  FOR UPDATE USING (commissioner_id = auth.uid());

DROP POLICY IF EXISTS "Any authenticated user can create a league" ON public.leagues;
CREATE POLICY "Any authenticated user can create a league" ON public.leagues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- TEAMS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view teams in their leagues" ON public.teams;
CREATE POLICY "Users can view teams in their leagues" ON public.teams
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own teams" ON public.teams;
CREATE POLICY "Users can update their own teams" ON public.teams
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert teams they own" ON public.teams;
CREATE POLICY "Users can insert teams they own" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- NFL PLAYERS POLICIES (PUBLIC ACCESS)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view NFL players" ON public.nfl_players;
CREATE POLICY "Anyone can view NFL players" ON public.nfl_players
  FOR SELECT USING (true);

-- ============================================================================
-- ROSTERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view rosters in their leagues" ON public.rosters;
CREATE POLICY "Users can view rosters in their leagues" ON public.rosters
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage their own roster" ON public.rosters;
CREATE POLICY "Users can manage their own roster" ON public.rosters
  FOR ALL USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- ============================================================================
-- MATCHUPS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view matchups in their leagues" ON public.matchups;
CREATE POLICY "Users can view matchups in their leagues" ON public.matchups
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- PLAYER STATS POLICIES (PUBLIC ACCESS)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view player stats" ON public.player_stats;
CREATE POLICY "Anyone can view player stats" ON public.player_stats
  FOR SELECT USING (true);

-- ============================================================================
-- AWARDS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view awards in their leagues" ON public.weekly_awards;
CREATE POLICY "Users can view awards in their leagues" ON public.weekly_awards
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view season awards in their leagues" ON public.season_awards;
CREATE POLICY "Users can view season awards in their leagues" ON public.season_awards
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DRAFT POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view draft picks in their leagues" ON public.draft_picks;
CREATE POLICY "Users can view draft picks in their leagues" ON public.draft_picks
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view pick grades in their leagues" ON public.draft_pick_grades;
CREATE POLICY "Users can view pick grades in their leagues" ON public.draft_pick_grades
  FOR SELECT USING (
    draft_pick_id IN (
      SELECT id FROM public.draft_picks WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can view rankings in their leagues" ON public.team_season_rankings;
CREATE POLICY "Users can view rankings in their leagues" ON public.team_season_rankings
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- AI FEATURES POLICIES (PUBLIC ACCESS)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view AI projections" ON public.ai_projections;
CREATE POLICY "Anyone can view AI projections" ON public.ai_projections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view PAR baselines" ON public.par_baselines;
CREATE POLICY "Anyone can view PAR baselines" ON public.par_baselines
  FOR SELECT USING (true);

-- ============================================================================
-- LEAGUE IMPORTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Commissioners can view their league imports" ON public.league_imports;
CREATE POLICY "Commissioners can view their league imports" ON public.league_imports
  FOR SELECT USING (
    league_id IN (
      SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()
    )
  );

-- ============================================================================
-- HALFTIME SUBSTITUTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view halftime subs in their leagues" ON public.halftime_substitutions;
CREATE POLICY "Users can view halftime subs in their leagues" ON public.halftime_substitutions
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE league_id IN (
        SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can make halftime subs for their teams" ON public.halftime_substitutions;
CREATE POLICY "Users can make halftime subs for their teams" ON public.halftime_substitutions
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view transactions in their leagues" ON public.transactions;
CREATE POLICY "Users can view transactions in their leagues" ON public.transactions
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TRADES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view trades in their leagues" ON public.trades;
CREATE POLICY "Users can view trades in their leagues" ON public.trades
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- LEAGUE MESSAGES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their leagues" ON public.league_messages;
CREATE POLICY "Users can view messages in their leagues" ON public.league_messages
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their leagues" ON public.league_messages;
CREATE POLICY "Users can send messages in their leagues" ON public.league_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND league_id IN (
      SELECT league_id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

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
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leagues_updated_at ON public.leagues;
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nfl_players_updated_at ON public.nfl_players;
CREATE TRIGGER update_nfl_players_updated_at BEFORE UPDATE ON public.nfl_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matchups_updated_at ON public.matchups;
CREATE TRIGGER update_matchups_updated_at BEFORE UPDATE ON public.matchups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_stats_updated_at ON public.player_stats;
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON public.player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_season_awards_updated_at ON public.season_awards;
CREATE TRIGGER update_season_awards_updated_at BEFORE UPDATE ON public.season_awards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fantasy Football Database Initialized Successfully!';
  RAISE NOTICE 'Features enabled: AI projections, PAR metrics, awards, halftime subs, league imports';
  RAISE NOTICE 'Next step: Sync NFL players using POST /api/sync/players';
END
$$;
