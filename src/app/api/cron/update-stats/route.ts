import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SLEEPER_API_BASE = 'https://api.sleeper.com';
const CURRENT_SEASON = 2025;
const REGULAR_SEASON_WEEKS = 18;
const RATE_LIMIT_DELAY = 100;

interface SleeperStats {
  player_id: string;
  stats: {
    [key: string]: any;
  };
  player: {
    position: string;
    [key: string]: any;
  };
}

/**
 * Cron endpoint to update NFL player stats weekly
 *
 * Usage:
 *   - Local testing: http://localhost:3000/api/cron/update-stats?secret=YOUR_CRON_SECRET
 *   - Production: Automatically triggered by Vercel Cron on Tuesday 3AM ET
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const secretFromQuery = request.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  // Allow either Bearer token or query param (query param for easy local testing)
  const providedSecret = authHeader?.replace('Bearer ', '') || secretFromQuery;

  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    console.log('🔄 Starting weekly stats update...');

    // Get current NFL week
    const nflState = await fetchNFLState();
    const currentWeek = nflState.week;
    const currentSeason = parseInt(nflState.season);

    console.log(`📊 Current: Season ${currentSeason}, Week ${currentWeek}`);

    // Get player mappings
    const playerMappings = await getPlayerMappings(supabase);
    console.log(`✓ Loaded ${playerMappings.size} player mappings`);

    // Fetch stats for current week
    const sleeperStats = await fetchSleeperStatsForWeek(currentSeason, currentWeek);

    if (sleeperStats.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No stats available for Week ${currentWeek} yet`,
        season: currentSeason,
        week: currentWeek,
        imported: 0
      });
    }

    // Transform and filter stats
    const transformedStats = [];
    let skipped = 0;

    for (const sleeperStat of sleeperStats) {
      const ourPlayerId = playerMappings.get(sleeperStat.player_id);

      if (!ourPlayerId) {
        skipped++;
        continue;
      }

      const transformed = transformSleeperStats(sleeperStat, ourPlayerId, currentSeason, currentWeek);
      transformedStats.push(transformed);
    }

    // Upsert into database
    const { error: upsertError } = await supabase
      .from('player_stats')
      .upsert(transformedStats, {
        onConflict: 'player_id,season,week,season_type',
        ignoreDuplicates: false
      });

    if (upsertError) {
      throw new Error(`Database error: ${upsertError.message}`);
    }

    console.log(`✅ Imported ${transformedStats.length} player stats for Week ${currentWeek}`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported Week ${currentWeek} stats`,
      season: currentSeason,
      week: currentWeek,
      imported: transformedStats.length,
      skipped
    });

  } catch (error: any) {
    console.error('❌ Stats update failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch current NFL state from Sleeper
 */
async function fetchNFLState() {
  const response = await fetch(`${SLEEPER_API_BASE}/v1/state/nfl`);
  if (!response.ok) {
    throw new Error('Failed to fetch NFL state');
  }
  return response.json();
}

/**
 * Fetch stats for a specific week from Sleeper API
 */
async function fetchSleeperStatsForWeek(
  season: number,
  week: number
): Promise<SleeperStats[]> {
  const url = `${SLEEPER_API_BASE}/stats/nfl/${season}/${week}?season_type=regular`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status}`);
  }

  const data: SleeperStats[] = await response.json();
  return data;
}

/**
 * Get player ID mappings from database
 */
async function getPlayerMappings(supabase: any): Promise<Map<string, string>> {
  const allPlayers: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: players, error } = await supabase
      .from('nfl_players')
      .select('id, sleeper_id')
      .not('sleeper_id', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw new Error(`Database error: ${error.message}`);

    if (players && players.length > 0) {
      allPlayers.push(...players);
      page++;
      if (players.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  const mappings = new Map<string, string>();
  for (const player of allPlayers) {
    if (player.sleeper_id) {
      mappings.set(player.sleeper_id, player.id);
    }
  }

  return mappings;
}

/**
 * Transform Sleeper stats to database format
 */
function transformSleeperStats(
  sleeperData: SleeperStats,
  ourPlayerId: string,
  season: number,
  week: number
) {
  const stats = sleeperData.stats;

  return {
    player_id: ourPlayerId,
    season,
    week,
    season_type: 'regular',

    // Passing stats
    passing_attempts: stats.pass_att || 0,
    passing_completions: stats.pass_cmp || 0,
    passing_yards: stats.pass_yd || 0,
    passing_touchdowns: stats.pass_td || 0,
    passing_interceptions: stats.pass_int || 0,
    passing_2pt_conversions: stats.pass_2pt || 0,

    // Rushing stats
    rushing_attempts: stats.rush_att || 0,
    rushing_yards: stats.rush_yd || 0,
    rushing_touchdowns: stats.rush_td || 0,
    rushing_2pt_conversions: stats.rush_2pt || 0,
    rushing_fumbles: stats.fum || 0,
    rushing_fumbles_lost: stats.fum_lost || 0,

    // Receiving stats
    receptions: stats.rec || 0,
    receiving_targets: stats.rec_tgt || 0,
    receiving_yards: stats.rec_yd || 0,
    receiving_touchdowns: stats.rec_td || 0,
    receiving_2pt_conversions: stats.rec_2pt || 0,
    receiving_fumbles: stats.rec_fum || 0,
    receiving_fumbles_lost: stats.rec_fum_lost || 0,

    // Kicking stats
    field_goals_made: stats.fgm || 0,
    field_goals_attempted: stats.fga || 0,
    field_goals_0_19: stats.fgm_0_19 || 0,
    field_goals_20_29: stats.fgm_20_29 || 0,
    field_goals_30_39: stats.fgm_30_39 || 0,
    field_goals_40_49: stats.fgm_40_49 || 0,
    field_goals_50_plus: stats.fgm_50p || 0,
    extra_points_made: stats.xpm || 0,
    extra_points_attempted: stats.xpa || 0,

    // Defense/ST stats
    defense_sacks: stats.sack || 0,
    defense_interceptions: stats.def_int || 0,
    defense_fumbles_recovered: stats.fum_rec || 0,
    defense_fumbles_forced: stats.ff || 0,
    defense_safeties: stats.safe || 0,
    defense_touchdowns: stats.def_td || 0,
    defense_blocked_kicks: stats.blk_kick || 0,
    defense_points_allowed: stats.pts_allow || 0,
    defense_yards_allowed: stats.yds_allow || 0,

    // Return stats
    return_touchdowns: (stats.pr_td || 0) + (stats.kr_td || 0),
  };
}
