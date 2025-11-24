
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function verify() {
    // Load env vars
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check count
    const { count, error: countError } = await supabase
        .from('nfl_players')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error checking count:', countError);
    } else {
        console.log(`Total players in DB: ${count}`);
    }

    // Check for Justin Jefferson
    const { data, error } = await supabase
        .from('nfl_players')
        .select('*')
        .ilike('first_name', 'Justin')
        .ilike('last_name', 'Jefferson');

    if (error) {
        console.error('Error finding Justin Jefferson:', error);
    } else {
        console.log(`Found ${data.length} players named Justin Jefferson:`);
        data.forEach(p => console.log(`- ${p.first_name} ${p.last_name} (${p.position} - ${p.nfl_team})`));
    }
}

verify();
