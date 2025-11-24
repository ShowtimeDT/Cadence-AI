#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSearch() {
    console.log('Testing database search for Justin Jefferson...\n');

    // Test 1: Search by first name
    console.log('Test 1: Search by first_name ilike %Justin%');
    const { data: test1, error: error1 } = await supabase
        .from('nfl_players')
        .select('*')
        .ilike('first_name', '%Justin%')
        .limit(3);

    console.log('Results:', test1?.length || 0);
    if (test1 && test1.length > 0) {
        test1.forEach(p => console.log(`  - ${p.first_name} ${p.last_name} (${p.position} - ${p.nfl_team})`));
    }
    console.log();

    // Test 2: Search by last name
    console.log('Test 2: Search by last_name ilike %Jefferson%');
    const { data: test2, error: error2 } = await supabase
        .from('nfl_players')
        .select('*')
        .ilike('last_name', '%Jefferson%')
        .limit(3);

    console.log('Results:', test2?.length || 0);
    if (test2 && test2.length > 0) {
        test2.forEach(p => console.log(`  - ${p.first_name} ${p.last_name} (${p.position} - ${p.nfl_team})`));
    }
    console.log();

    // Test 3: Combined OR search (like in the API)
    const searchTerm = 'Justin Jefferson';
    console.log('Test 3: Using same query as API - or() with ilike');
    const { data: test3, error: error3 } = await supabase
        .from('nfl_players')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nfl_team.ilike.%${searchTerm}%`)
        .limit(5);

    console.log('Results:', test3?.length || 0);
    if (error3) {
        console.log('Error:', error3.message);
    }
    if (test3 && test3.length > 0) {
        test3.forEach(p => console.log(`  - ${p.first_name} ${p.last_name} (${p.position} - ${p.nfl_team})`));
    }
    console.log();

    // Test 4: Check column names
    console.log('Test 4: Get one player to check column structure');
    const { data: sample } = await supabase
        .from('nfl_players')
        .select('*')
        .limit(1);

    if (sample && sample.length > 0) {
        console.log('Available columns:', Object.keys(sample[0]).join(', '));
    }
}

testSearch().catch(console.error);
