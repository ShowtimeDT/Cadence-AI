#!/usr/bin/env tsx
/**
 * Check how many players have sleeper_id populated
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

  // Count total players
  const { count: totalCount } = await supabase
    .from('nfl_players')
    .select('*', { count: 'exact', head: true });

  // Count players with sleeper_id
  const { count: withSleeperIdCount } = await supabase
    .from('nfl_players')
    .select('*', { count: 'exact', head: true })
    .not('sleeper_id', 'is', null);

  // Count players without sleeper_id
  const { count: withoutSleeperIdCount } = await supabase
    .from('nfl_players')
    .select('*', { count: 'exact', head: true })
    .is('sleeper_id', null);

  console.log('\n📊 NFL Players Database Status:\n');
  console.log(`Total players: ${totalCount?.toLocaleString()}`);
  console.log(`With sleeper_id: ${withSleeperIdCount?.toLocaleString()}`);
  console.log(`Without sleeper_id: ${withoutSleeperIdCount?.toLocaleString()}\n`);

  if (withoutSleeperIdCount && withoutSleeperIdCount > 0) {
    console.log('⚠️  Some players are missing sleeper_id!');

    // Get a sample of players without sleeper_id
    const { data: samplePlayers } = await supabase
      .from('nfl_players')
      .select('id, first_name, last_name, position, nfl_team')
      .is('sleeper_id', null)
      .limit(10);

    console.log('\nSample players without sleeper_id:');
    samplePlayers?.forEach(p => {
      console.log(`  - ${p.first_name} ${p.last_name} (${p.position}, ${p.nfl_team || 'FA'})`);
    });
  } else {
    console.log('✅ All players have sleeper_id populated!');
  }
}

main().catch(console.error);
