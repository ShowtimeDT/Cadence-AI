/**
 * Player Comparison Tool Implementation
 *
 * Compares two NFL players based on their recent performance from Supabase database.
 */

import { createClient } from '@supabase/supabase-js';

interface ComparePlayerParams {
  player1: string;
  player2: string;
  scoringType: 'standard' | 'ppr' | 'half_ppr';
  weeks: number;
}

interface ComparisonResult {
  error?: string;
  message?: string;
}

/**
 * Execute player comparison using Supabase data
 */
export async function executePlayerComparison(
  params: ComparePlayerParams
): Promise<ComparisonResult> {
  const { player1, player2, scoringType, weeks } = params;

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Search for first player by name (using first_name + last_name)
    const { data: p1Results, error: p1Error } = await supabase
      .from('nfl_players')
      .select('*')
      .or(`first_name.ilike.%${player1}%,last_name.ilike.%${player1}%`)
      .limit(5);

    if (p1Error || !p1Results || p1Results.length === 0) {
      return {
        error: `Player "${player1}" not found in database.`
      };
    }

    const p1Data = p1Results[0]; // Take first match

    // Search for second player
    const { data: p2Results, error: p2Error } = await supabase
      .from('nfl_players')
      .select('*')
      .or(`first_name.ilike.%${player2}%,last_name.ilike.%${player2}%`)
      .limit(5);

    if (p2Error || !p2Results || p2Results.length === 0) {
      return {
        error: `Player "${player2}" not found in database.`
      };
    }

    const p2Data = p2Results[0]; // Take first match

    // Query player_stats for recent performance
    const { data: p1Stats, error: p1StatsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', p1Data.id)
      .eq('season', 2025)
      .order('week', { ascending: false })
      .limit(weeks);

    const { data: p2Stats, error: p2StatsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', p2Data.id)
      .eq('season', 2025)
      .order('week', { ascending: false })
      .limit(weeks);

    if (!p1Stats || p1Stats.length === 0 || !p2Stats || p2Stats.length === 0) {
      return {
        error: `Insufficient statistics data for comparison. Make sure to run "npm run fetch-stats" to populate player stats.`
      };
    }

    // Calculate averages based on scoring type
    const scoringField = scoringType === 'standard'
      ? 'fantasy_points_standard'
      : scoringType === 'ppr'
      ? 'fantasy_points_ppr'
      : 'fantasy_points_half_ppr';

    const p1Avg = p1Stats.reduce((sum, stat) => sum + (stat[scoringField] || 0), 0) / p1Stats.length;
    const p2Avg = p2Stats.reduce((sum, stat) => sum + (stat[scoringField] || 0), 0) / p2Stats.length;

    // Generate comparison message
    const winner = p1Avg > p2Avg ? player1 : player2;
    const loser = p1Avg > p2Avg ? player2 : player1;
    const difference = Math.abs(p1Avg - p2Avg).toFixed(2);

    return {
      message: `**${winner}** is the better play (averaging ${Math.max(p1Avg, p2Avg).toFixed(2)} PPG vs ${Math.min(p1Avg, p2Avg).toFixed(2)} PPG over last ${weeks} weeks). ${winner} has outscored ${loser} by ${difference} points per game in ${scoringType.toUpperCase()} scoring.`
    };

  } catch (error: any) {
    return {
      error: `Database error: ${error.message}`
    };
  }
}
