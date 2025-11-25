#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Get Josh Allen ID
  const { data: allen } = await supabase
    .from('nfl_players')
    .select('id, first_name, last_name, position')
    .ilike('first_name', 'Josh%')
    .ilike('last_name', 'Allen%')
    .limit(5);

  console.log('Josh Allen search results:', allen);

  if (allen && allen.length > 0) {
    // Get the QB Josh Allen
    const qbAllen = allen.find(p => p.position === 'QB');
    console.log('QB Josh Allen:', qbAllen);

    if (qbAllen) {
      // Check stats for QB Josh Allen
      const { data: stats, count } = await supabase
        .from('player_stats')
        .select('week, season, fantasy_points_ppr', { count: 'exact' })
        .eq('player_id', qbAllen.id)
        .order('week', { ascending: false })
        .limit(10);

      console.log('Josh Allen QB stats count:', count);
      console.log('Josh Allen QB stats:', stats);
    }
  }
}

check();
