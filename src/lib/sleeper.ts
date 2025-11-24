// Sleeper API Types and Utility Functions

export interface SleeperPlayer {
    player_id: string;
    first_name: string;
    last_name: string;
    position: string;
    team: string | null;
    number: number;
    status: string;
    injury_status: string | null;
    injury_body_part: string | null;
    years_exp: number;
    college: string;
    height: string;
    weight: string;
    age: number;
    sport: string;
}

export interface SleeperNFLState {
    week: number;
    season_type: string;
    season: string;
    previous_season: string;
    display_week: number;
    season_start_date: string;
    league_season: string;
    league_create_season: string;
}

export interface SleeperGame {
    game_id: string;
    season: string;
    week: number;
    home_team: string;
    away_team: string;
    status: string;
    start_time: string;
    home_score: number;
    away_score: number;
    quarter: number | null;
    time_remaining: string | null;
}

export interface SleeperPlayerStats {
    player_id: string;
    stats: {
        [key: string]: number;
    };
    points?: number;
}

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

/**
 * Fetch the current NFL state (week, season, etc.)
 */
export async function getSleeperNFLState(): Promise<SleeperNFLState> {
    const response = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
    if (!response.ok) {
        throw new Error('Failed to fetch NFL state from Sleeper');
    }
    return response.json();
}

/**
 * Fetch all NFL players from Sleeper
 */
export async function getSleeperPlayers(): Promise<Record<string, SleeperPlayer>> {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) {
        throw new Error('Failed to fetch players from Sleeper');
    }
    return response.json();
}

/**
 * Fetch player stats for a specific week
 */
export async function getSleeperPlayerStats(
    season: string,
    week: number
): Promise<SleeperPlayerStats[]> {
    const response = await fetch(
        `${SLEEPER_BASE_URL}/stats/nfl/regular/${season}/${week}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch player stats from Sleeper');
    }
    return response.json();
}

/**
 * Fetch projections for a specific week
 */
export async function getSleeperProjections(
    season: string,
    week: number
): Promise<Record<string, SleeperPlayerStats>> {
    const response = await fetch(
        `${SLEEPER_BASE_URL}/projections/nfl/regular/${season}/${week}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch projections from Sleeper');
    }
    return response.json();
}

/**
 * Calculate fantasy points based on stats and scoring settings
 */
export function calculateFantasyPoints(
    stats: { [key: string]: number },
    scoringType: 'standard' | 'ppr' | 'half_ppr'
): number {
    let points = 0;

    // Passing
    points += (stats.pass_yd || 0) * 0.04; // 1 point per 25 yards
    points += (stats.pass_td || 0) * 4; // 4 points per TD
    points += (stats.pass_int || 0) * -2; // -2 per INT

    // Rushing
    points += (stats.rush_yd || 0) * 0.1; // 1 point per 10 yards
    points += (stats.rush_td || 0) * 6; // 6 points per TD

    // Receiving
    points += (stats.rec_yd || 0) * 0.1; // 1 point per 10 yards
    points += (stats.rec_td || 0) * 6; // 6 points per TD

    // Receptions
    if (scoringType === 'ppr') {
        points += (stats.rec || 0) * 1; // 1 point per reception
    } else if (scoringType === 'half_ppr') {
        points += (stats.rec || 0) * 0.5; // 0.5 points per reception
    }

    // Bonuses and penalties
    points += (stats.bonus_rush_yd_100 || 0) * 3; // Bonus for 100+ rush yards
    points += (stats.bonus_rec_yd_100 || 0) * 3; // Bonus for 100+ rec yards
    points += (stats.bonus_pass_yd_300 || 0) * 3; // Bonus for 300+ pass yards
    points += (stats.fum_lost || 0) * -2; // -2 per fumble lost
    points += (stats.pass_2pt || 0) * 2; // 2 points per 2PT conversion
    points += (stats.rush_2pt || 0) * 2; // 2 points per 2PT conversion
    points += (stats.rec_2pt || 0) * 2; // 2 points per 2PT conversion

    return Math.round(points * 100) / 100; // Round to 2 decimal places
}

/**
 * Map Sleeper player to our database format
 */
export function mapSleeperPlayerToDatabase(player: SleeperPlayer) {
    return {
        sleeper_id: player.player_id, // Extract from player object
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        nfl_team: player.team,
        jersey_number: player.number || null,
        status: mapSleeperStatus(player.status, player.injury_status),
        injury_description: player.injury_body_part || null,
        years_exp: player.years_exp || 0,
        college: player.college || null,
        height: player.height || null,
        weight: parseInt(player.weight) || null,
    };
}

/**
 * Map Sleeper status to our status enum
 */
function mapSleeperStatus(
    status: string,
    injuryStatus: string | null
): 'active' | 'injured' | 'out' | 'doubtful' | 'questionable' {
    if (injuryStatus) {
        const lowerStatus = injuryStatus.toLowerCase();
        if (lowerStatus === 'out') return 'out';
        if (lowerStatus === 'doubtful') return 'doubtful';
        if (lowerStatus === 'questionable') return 'questionable';
        return 'injured';
    }
    return status === 'Active' ? 'active' : 'injured';
}
