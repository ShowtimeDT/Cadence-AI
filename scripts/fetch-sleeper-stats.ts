/**
 * Fetch NFL Player Stats from Sleeper API
 *
 * This script fetches weekly stats for the entire 2025 NFL season from the Sleeper API
 * and stores them in Supabase. Fantasy points are automatically calculated via database triggers.
 *
 * Usage: npx tsx scripts/fetch-sleeper-stats.ts [--week=1] [--season=2025]
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SLEEPER_API_BASE = 'https://api.sleeper.com';
const CURRENT_SEASON = 2025;
const REGULAR_SEASON_WEEKS = 18; // NFL has 18 weeks now

// Rate limiting: Sleeper allows up to 1000 calls per minute
const RATE_LIMIT_DELAY = 100; // 100ms between requests = max 600 requests/minute

interface SleeperStats {
  player_id: string;
  stats: {
    [key: string]: any; // Sleeper returns many stat fields dynamically
  };
  player: {
    position: string;
    [key: string]: any;
  };
}

interface PlayerMapping {
  sleeper_id: string;
  our_id: string;
  name: string;
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch stats for a specific week from Sleeper API
 */
async function fetchSleeperStatsForWeek(
  season: number,
  week: number
): Promise<SleeperStats[]> {
  const url = `${SLEEPER_API_BASE}/stats/nfl/${season}/${week}?season_type=regular`;

  console.log(`Fetching stats for Week ${week}...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
    }

    const data: SleeperStats[] = await response.json();

    console.log(`✓ Fetched ${data.length} player stats for Week ${week}`);
    return data;

  } catch (error: any) {
    console.error(`✗ Error fetching Week ${week}:`, error.message);
    return [];
  }
}

/**
 * Map Sleeper player ID to our database player ID
 * Sleeper uses their own ID system - we map using the sleeper_id column
 */
async function getPlayerMappings(supabase: any): Promise<Map<string, string>> {
  console.log('Building player ID mappings...');

  // Fetch ALL players using pagination (Supabase client has 1000 row limit per query)
  const allPlayers: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: players, error } = await supabase
      .from('nfl_players')
      .select('id, sleeper_id, first_name, last_name, position')
      .not('sleeper_id', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching players:', error);
      break;
    }

    if (players && players.length > 0) {
      allPlayers.push(...players);
      page++;

      // If we got less than pageSize, we've reached the end
      if (players.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`   Fetched ${allPlayers.length} players from database`);

  const mappings = new Map<string, string>();

  for (const player of allPlayers) {
    if (player.sleeper_id) {
      mappings.set(player.sleeper_id, player.id);
    }
  }

  console.log(`✓ Built mappings for ${mappings.size} players with Sleeper IDs`);
  return mappings;
}

/**
 * Transform Sleeper stats format to our database format
 */
function transformSleeperStats(sleeperData: SleeperStats, ourPlayerId: string, season: number, week: number) {
  const stats = sleeperData.stats; // Access nested stats object

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

/**
 * Insert or update player stats in database
 */
async function upsertPlayerStats(supabase: any, statsData: any[]) {
  if (statsData.length === 0) {
    return { success: 0, errors: 0 };
  }

  const { data, error } = await supabase
    .from('player_stats')
    .upsert(statsData, {
      onConflict: 'player_id,season,week,season_type',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Database error:', error);
    return { success: 0, errors: statsData.length };
  }

  return { success: statsData.length, errors: 0 };
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   NFL Stats Importer - Sleeper API → Supabase            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const weekArg = args.find(arg => arg.startsWith('--week='));
  const seasonArg = args.find(arg => arg.startsWith('--season='));

  const targetSeason = seasonArg ? parseInt(seasonArg.split('=')[1]) : CURRENT_SEASON;
  const targetWeek = weekArg ? parseInt(weekArg.split('=')[1]) : null;

  // Initialize Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  console.log(`📊 Target Season: ${targetSeason}`);
  console.log(`📅 Weeks: ${targetWeek ? `Week ${targetWeek} only` : `All weeks (1-${REGULAR_SEASON_WEEKS})`}\n`);

  // Get player ID mappings
  const playerMappings = await getPlayerMappings(supabase);

  if (playerMappings.size === 0) {
    console.error('❌ No player mappings found. Make sure nfl_players table has sleeper_id column populated.');
    process.exit(1);
  }

  // Determine which weeks to fetch
  const weeksToFetch = targetWeek ? [targetWeek] : Array.from({ length: REGULAR_SEASON_WEEKS }, (_, i) => i + 1);

  let totalSuccess = 0;
  let totalErrors = 0;
  let totalSkipped = 0;

  // Fetch and store stats for each week
  for (const week of weeksToFetch) {
    console.log(`\n─────────────────────────────────────────`);
    console.log(`📥 Processing Week ${week}...`);
    console.log(`─────────────────────────────────────────`);

    // Fetch stats from Sleeper
    const sleeperStats = await fetchSleeperStatsForWeek(targetSeason, week);

    if (sleeperStats.length === 0) {
      console.log(`⚠️  No stats available for Week ${week} (might not be played yet)`);
      continue;
    }

    // Transform and filter stats
    const transformedStats = [];
    for (const sleeperStat of sleeperStats) {
      const ourPlayerId = playerMappings.get(sleeperStat.player_id);

      if (!ourPlayerId) {
        totalSkipped++;
        continue; // Skip players not in our database
      }

      const transformed = transformSleeperStats(sleeperStat, ourPlayerId, targetSeason, week);
      transformedStats.push(transformed);
    }

    console.log(`📝 Transformed ${transformedStats.length} player stats (${totalSkipped} skipped - not in database)`);

    // Insert into database
    console.log(`💾 Inserting into database...`);
    const result = await upsertPlayerStats(supabase, transformedStats);

    totalSuccess += result.success;
    totalErrors += result.errors;

    console.log(`✓ Week ${week} complete: ${result.success} inserted, ${result.errors} errors`);

    // Rate limiting delay
    if (week < weeksToFetch[weeksToFetch.length - 1]) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  // Final summary
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║                    IMPORT COMPLETE                         ║`);
  console.log(`╠═══════════════════════════════════════════════════════════╣`);
  console.log(`║  ✓ Successfully imported: ${totalSuccess.toString().padEnd(5)} stats           ║`);
  console.log(`║  ✗ Errors: ${totalErrors.toString().padEnd(5)} stats                         ║`);
  console.log(`║  ⊘ Skipped (not in DB): ${totalSkipped.toString().padEnd(5)} players          ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);

  console.log(`💡 Fantasy points have been automatically calculated for Standard, PPR, and Half-PPR scoring!`);
  console.log(`💡 Run queries like: SELECT * FROM player_stats WHERE season = ${targetSeason} ORDER BY fantasy_points_ppr DESC LIMIT 10;\n`);
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
