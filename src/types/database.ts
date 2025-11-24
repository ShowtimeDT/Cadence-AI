// TypeScript types for database models

export interface User {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    favorite_nfl_team: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

export type LeagueType = 'redraft' | 'keeper' | 'dynasty';
export type ScoringType = 'standard' | 'ppr' | 'half_ppr' | 'custom';
export type LeagueStatus = 'setup' | 'drafting' | 'active' | 'completed';
export type WaiverType = 'rolling' | 'faab';

export interface League {
    id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    commissioner_id: string;
    league_type: LeagueType;
    scoring_type: ScoringType;
    status: LeagueStatus;
    season_year: number;
    team_count: number;
    roster_settings: RosterSettings;
    scoring_settings: ScoringSettings;
    draft_settings: DraftSettings;
    playoff_settings: PlayoffSettings;
    waiver_type: WaiverType;
    trade_deadline: string | null;
    created_at: string;
    updated_at: string;
}

export interface RosterSettings {
    qb: number;
    rb: number;
    wr: number;
    te: number;
    flex: number;
    superflex?: number;
    k: number;
    def: number;
    bench: number;
    ir?: number;
}

export interface ScoringSettings {
    passingYards: number;
    passingTDs: number;
    interceptions: number;
    rushingYards: number;
    rushingTDs: number;
    receptions: number;
    receivingYards: number;
    receivingTDs: number;
    fumblesLost: number;
    twoPointConversions: number;
}

export interface DraftSettings {
    type: 'snake' | 'auction' | 'linear';
    date: string | null;
    seconds_per_pick: number;
    randomize_order: boolean;
}

export interface PlayoffSettings {
    teams: number;
    weeks: number;
    bracket_type: 'single' | 'double';
}

export interface Team {
    id: string;
    league_id: string;
    owner_id: string;
    name: string;
    logo_url: string | null;
    draft_position: number | null;
    waiver_priority: number | null;
    faab_budget: number;
    wins: number;
    losses: number;
    ties: number;
    points_for: number;
    points_against: number;
    created_at: string;
    updated_at: string;
}

export type PlayerStatus = 'active' | 'injured' | 'out' | 'doubtful' | 'questionable';
export type NFLPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

export interface NFLPlayer {
    id: string;
    sleeper_id: string | null;
    espn_id: string | null;
    yahoo_id: string | null;
    first_name: string;
    last_name: string;
    position: NFLPosition;
    nfl_team: string | null;
    jersey_number: number | null;
    status: PlayerStatus;
    injury_description: string | null;
    bye_week: number | null;
    years_exp: number | null;
    college: string | null;
    height: string | null;
    weight: number | null;
    headshot_url: string | null;
    created_at: string;
    updated_at: string;
}

export type PositionType = 'starter' | 'bench' | 'ir' | 'taxi';
export type AcquisitionType = 'draft' | 'waiver' | 'trade' | 'free_agent';

export interface Roster {
    id: string;
    team_id: string;
    player_id: string;
    position_type: PositionType;
    roster_position: string | null;
    acquired_date: string;
    acquisition_type: AcquisitionType;
    created_at: string;
}

export type MatchupStatus = 'scheduled' | 'in_progress' | 'final';

export interface Matchup {
    id: string;
    league_id: string;
    week: number;
    team1_id: string;
    team2_id: string | null;
    team1_score: number;
    team2_score: number;
    is_playoff: boolean;
    status: MatchupStatus;
    created_at: string;
    updated_at: string;
}

export interface PlayerStats {
    id: string;
    player_id: string;
    season: number;
    week: number;
    nfl_game_id: string | null;
    passing_yards: number;
    passing_tds: number;
    interceptions: number;
    rushing_yards: number;
    rushing_tds: number;
    receptions: number;
    receiving_yards: number;
    receiving_tds: number;
    fumbles_lost: number;
    two_point_conversions: number;
    fantasy_points_ppr: number;
    fantasy_points_standard: number;
    fantasy_points_half_ppr: number;
    created_at: string;
    updated_at: string;
}

export interface DraftPick {
    id: string;
    league_id: string;
    team_id: string;
    player_id: string;
    round: number;
    pick_number: number;
    overall_pick: number;
    picked_at: string;
}

export type TransactionType = 'waiver' | 'free_agent' | 'trade' | 'drop';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
    id: string;
    league_id: string;
    team_id: string;
    transaction_type: TransactionType;
    players_added: string[];
    players_dropped: string[];
    faab_bid: number | null;
    status: TransactionStatus;
    processed_at: string | null;
    created_at: string;
}

export type TradeStatus = 'proposed' | 'accepted' | 'rejected' | 'vetoed' | 'completed';

export interface Trade {
    id: string;
    league_id: string;
    status: TradeStatus;
    proposed_by: string;
    trade_data: {
        teams: {
            team_id: string;
            gives: string[];
            receives: string[];
        }[];
    };
    proposed_at: string;
    completed_at: string | null;
    created_at: string;
}

export type MessageType = 'chat' | 'announcement' | 'system';

export interface LeagueMessage {
    id: string;
    league_id: string;
    user_id: string;
    message: string;
    message_type: MessageType;
    created_at: string;
}

// Extended types with relations
export interface TeamWithOwner extends Team {
    owner: User;
}

export interface RosterWithPlayer extends Roster {
    player: NFLPlayer;
}

export interface MatchupWithTeams extends Matchup {
    team1: Team;
    team2: Team | null;
}

export interface LeagueMessageWithUser extends LeagueMessage {
    user: User;
}
