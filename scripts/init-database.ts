import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQLFile(filePath: string, stepName: string) {
    console.log(`\n🔄 ${stepName}...`);

    try {
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Split SQL into individual statements (basic approach)
        // Remove comments and split by semicolons
        const statements = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
            .join('\n')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`📝 Found ${statements.length} SQL statements`);

        // Execute each statement using RPC or direct query
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`   ⏳ Executing statement ${i + 1}/${statements.length}...`);

            try {
                // Use the PostgREST API to execute raw SQL
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: statement
                });

                if (error) {
                    console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
                    // Continue with other statements
                } else {
                    console.log(`   ✓ Statement ${i + 1} completed`);
                }
            } catch (err: any) {
                console.error(`   ❌ Exception in statement ${i + 1}:`, err.message);
            }
        }

        console.log(`✅ ${stepName} completed`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to read file: ${error.message}`);
        return false;
    }
}

async function initDatabase() {
    console.log('🚀 Initializing Fantasy Football Database\n');
    console.log('📍 Supabase URL:', SUPABASE_URL);

    const supabaseDir = path.join(__dirname, '..', 'supabase');

    // Note: This script requires the exec_sql RPC function to be created first
    console.log('\n⚠️  IMPORTANT: This script requires direct database access.');
    console.log('   Please run these SQL files manually in the Supabase SQL Editor:');
    console.log(`   1. ${path.join(supabaseDir, 'init-step1-tables.sql')}`);
    console.log(`   2. ${path.join(supabaseDir, 'init-step2-policies.sql')}`);
    console.log('\n   Or use the Supabase CLI:');
    console.log('   supabase db reset');
    console.log('   (requires supabase/migrations/ directory setup)\n');

    // Alternative: Show the user how to create the exec_sql function
    console.log('📋 To enable automatic SQL execution, create this function in Supabase:');
    console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
    `);
}

initDatabase().catch(console.error);
