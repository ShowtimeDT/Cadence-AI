-- Fix fantasy points calculation to not give defense points to offensive players
-- This replaces the calculate_fantasy_points function with a corrected version

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

-- Recalculate all existing fantasy points with the corrected function
UPDATE public.player_stats
SET
    fantasy_points_standard = calculate_fantasy_points(player_stats, 0.0),
    fantasy_points_ppr = calculate_fantasy_points(player_stats, 1.0),
    fantasy_points_half_ppr = calculate_fantasy_points(player_stats, 0.5),
    updated_at = NOW();
