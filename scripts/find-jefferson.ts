#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findJefferson() {
    console.log('Looking for Justin Jefferson specifically...\n');

    const { data, error } = await supabase
        .from('nfl_players')
        .select('*')
        .eq('first_name', 'Justin')
        .eq('last_name', 'Jefferson');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Results:', data?.length || 0);
    if (data && data.length > 0) {
        data.forEach(p => {
            console.log(`Found: ${p.first_name} ${p.last_name}`);
            console.log(`  Position: ${p.position}`);
            console.log(`  Team: ${p.nfl_team}`);
            console.log(`  Sleeper ID: ${p.sleeper_id}`);
        });
    } else {
        console.log('❌ Justin Jefferson not found in database!');
        console.log('\nSearching for any active WRs named Jefferson...');

        const { data: anyJeff } = await supabase
            .from('nfl_players')
            .select('*')
            .eq('last_name', 'Jefferson')
            .eq('position', 'WR');

        console.log('Found', anyJeff?.length || 0, 'WRs named Jefferson');
        anyJeff?.forEach(p => console.log(`  - ${p.first_name} ${p.last_name} (${p.nfl_team || 'No team'})`));
    }
}

findJefferson().catch(console.error);
