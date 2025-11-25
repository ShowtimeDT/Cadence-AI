#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Get Mahomes ID
  const { data: mahomes } = await supabase
    .from('nfl_players')
    .select('id')
    .ilike('last_name', 'Mahomes')
    .single();

  console.log('Mahomes ID:', mahomes?.id);

  // Check stats for Mahomes
  const { data: stats, count } = await supabase
    .from('player_stats')
    .select('*', { count: 'exact' })
    .eq('player_id', mahomes?.id)
    .limit(5);

  console.log('Mahomes stats count:', count);
  console.log('Mahomes stats sample:', stats);

  // Check sample players with stats
  const { data: sampleStats } = await supabase
    .from('player_stats')
    .select('player_id')
    .limit(10);

  if (sampleStats) {
    console.log('\nSample players with stats:');
    for (const stat of sampleStats.slice(0, 5)) {
      const { data: player } = await supabase
        .from('nfl_players')
        .select('first_name, last_name, position')
        .eq('id', stat.player_id)
        .single();
      console.log('  -', player?.first_name, player?.last_name, `(${player?.position})`);
    }
  }
}

check();
