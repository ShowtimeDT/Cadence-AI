import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSleeperPlayers, mapSleeperPlayerToDatabase } from '@/lib/sleeper';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export async function POST() {
    try {
        // Force load .env.local manually to bypass any Next.js caching issues
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = dotenv.parse(fs.readFileSync(envPath));
            for (const k in envConfig) {
                process.env[k] = envConfig[k];
            }
        }

        // Use Service Role Key to bypass RLS for admin sync
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
            return NextResponse.json({
                success: false,
                error: 'Invalid Credentials Detected',
                debug: {
                    url_exists: !!supabaseUrl,
                    url_value: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined',
                    key_exists: !!serviceKey,
                    is_placeholder: supabaseUrl?.includes('placeholder')
                }
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);

        // 1. Fetch all players from Sleeper
        console.log('Fetching players from Sleeper...');
        const sleeperPlayers = await getSleeperPlayers();
        const playersList = Object.values(sleeperPlayers);

        console.log(`Fetched ${playersList.length} players from Sleeper.`);

        // 2. Map players to DB format
        // Filter out inactive players or players with no team if desired, 
        // but for a full DB we usually keep everyone. 
        // Sleeper includes free agents and retired players sometimes.
        // Let's keep active players and free agents, maybe filter out retired if status is 'inactive' 
        // but Sleeper status is usually 'Active', 'Inactive', 'Injured', etc.

        const dbPlayers = playersList
            .filter(p => p.position) // Ensure they have a position
            .map(p => mapSleeperPlayerToDatabase(p.player_id, p));

        // 3. Upsert in batches
        const BATCH_SIZE = 500;
        let upsertedCount = 0;
        let errorCount = 0;
        let firstError = null;

        for (let i = 0; i < dbPlayers.length; i += BATCH_SIZE) {
            const batch = dbPlayers.slice(i, i + BATCH_SIZE);

            const { error } = await supabase
                .from('nfl_players')
                .upsert(batch, {
                    onConflict: 'sleeper_id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error(`Error upserting batch ${i / BATCH_SIZE}:`, error);
                if (!firstError) firstError = error;
                errorCount += batch.length;
            } else {
                upsertedCount += batch.length;
            }
        }

        return NextResponse.json({
            success: upsertedCount > 0,
            message: `Synced ${upsertedCount} players. Failed: ${errorCount}`,
            total_sleeper: playersList.length,
            first_error: firstError
        });

    } catch (error: any) {
        console.error('Sync failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to sync players',
                details: error.message || String(error),
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
