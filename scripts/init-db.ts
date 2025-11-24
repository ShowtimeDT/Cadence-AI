#!/usr/bin/env tsx
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DB_CONNECTION_STRING = process.env.DATABASE_URL;

if (!SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
    process.exit(1);
}

if (!DB_CONNECTION_STRING) {
    console.error('\n❌ Missing DATABASE_URL in .env.local\n');
    console.log('To get your database connection string:');
    console.log('1. Go to https://supabase.com/dashboard/project/_/settings/database');
    console.log('2. Copy the "Connection string" under "Connection pooler"');
    console.log('3. Add it to .env.local as:');
    console.log('   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres\n');

    // Extract project ref from Supabase URL
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    console.log(`Your project ref is: ${projectRef}`);
    console.log(`Your connection string format:`);
    console.log(`DATABASE_URL=postgresql://postgres.${projectRef}:[YOUR-DB-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`);
    console.log('\n(Replace [YOUR-DB-PASSWORD] with your actual database password from Supabase dashboard)\n');

    process.exit(1);
}

async function executeSQLFile(client: Client, filePath: string, stepName: string) {
    console.log(`\n📄 ${stepName}...`);

    try {
        const sql = fs.readFileSync(filePath, 'utf-8');
        console.log(`   ⏳ Executing SQL...`);

        await client.query(sql);

        console.log(`   ✅ ${stepName} completed`);
        return true;
    } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Initializing Fantasy Football Database\n');

    const client = new Client({
        connectionString: DB_CONNECTION_STRING,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully\n');

        const supabaseDir = path.join(__dirname, '..', 'supabase');

        // Step 1: Create tables
        const step1Success = await executeSQLFile(
            client,
            path.join(supabaseDir, 'init-step1-tables.sql'),
            'Step 1: Creating tables'
        );

        if (!step1Success) {
            console.error('\n❌ Step 1 failed. Aborting.');
            process.exit(1);
        }

        // Step 2: Create policies and triggers
        const step2Success = await executeSQLFile(
            client,
            path.join(supabaseDir, 'init-step2-policies.sql'),
            'Step 2: Creating policies and triggers'
        );

        if (!step2Success) {
            console.error('\n❌ Step 2 failed.');
            process.exit(1);
        }

        console.log('\n🎉 Database initialized successfully!');
        console.log('\n📊 Next steps:');
        console.log('   1. Run: npm run sleeper -- sync');
        console.log('   2. This will populate the database with 11,000+ NFL players\n');

    } catch (error: any) {
        console.error('\n❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
