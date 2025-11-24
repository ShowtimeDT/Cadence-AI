#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkDatabase() {
    console.log('🔍 Checking database status...\n');

    // Try to query nfl_players table
    const { data, error } = await supabase
        .from('nfl_players')
        .select('id')
        .limit(1);

    if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('❌ Database NOT initialized');
            console.log('   The nfl_players table does not exist.\n');
            console.log('📋 To initialize the database, you have two options:\n');
            console.log('Option 1: Use the script (requires DATABASE_URL)');
            console.log('   1. Get your database password from Supabase Dashboard');
            console.log('   2. Add to .env.local:');
            console.log('      DATABASE_URL=postgresql://postgres.zznbjakshpepzesaqoxo:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
            console.log('   3. Run: npm run db:init\n');
            console.log('Option 2: Use Supabase Dashboard (manual but simple)');
            console.log('   1. Go to: https://supabase.com/dashboard/project/zznbjakshpepzesaqoxo/editor');
            console.log('   2. Click "SQL Editor"');
            console.log('   3. Copy and paste contents of: supabase/init-step1-tables.sql');
            console.log('   4. Click "Run"');
            console.log('   5. Copy and paste contents of: supabase/init-step2-policies.sql');
            console.log('   6. Click "Run"\n');
            return false;
        } else {
            console.error('❌ Database error:', error.message);
            return false;
        }
    }

    console.log('✅ Database is initialized!');
    console.log('   The nfl_players table exists.\n');

    // Check if it has data
    const { count } = await supabase
        .from('nfl_players')
        .select('*', { count: 'exact', head: true });

    if (count === 0) {
        console.log('⚠️  Database is empty');
        console.log('   Run: npm run sleeper -- sync');
        console.log('   This will populate with 11,000+ NFL players\n');
    } else {
        console.log(`📊 Database contains ${count?.toLocaleString()} players`);
    }

    return true;
}

checkDatabase().catch(console.error);
