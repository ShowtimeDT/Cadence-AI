#!/usr/bin/env tsx
/**
 * Clear all player_stats data for re-import
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🗑️  Clearing player_stats table...\n');

  const { error } = await supabase
    .from('player_stats')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) {
    console.error('❌ Error clearing stats:', error);
    process.exit(1);
  }

  console.log('✅ All player_stats cleared successfully!\n');
  console.log('📊 Ready to re-import stats with: npm run fetch-stats\n');
}

main().catch(console.error);
