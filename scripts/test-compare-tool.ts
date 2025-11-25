#!/usr/bin/env tsx
/**
 * Test script for the compare_players tool
 * Tests the tool directly without going through the chat API
 */

import 'dotenv/config';
import { executePlayerComparison } from '../src/lib/ai/tools/comparePlayer';

async function testCompareTool() {
  console.log('=== Testing Compare Players Tool ===\n');

  // Check env vars
  console.log('Environment check:');
  console.log('  SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('  SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.log('');

  // Test 1: Compare two QBs
  console.log('Test 1: Patrick Mahomes vs Josh Allen (PPR)');
  console.log('-'.repeat(50));
  const result1 = await executePlayerComparison({
    player1: 'Patrick Mahomes',
    player2: 'Josh Allen',
    scoringType: 'ppr',
    weeks: 5
  });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('');

  // Test 2: Compare two WRs
  console.log('Test 2: Justin Jefferson vs Tyreek Hill (PPR)');
  console.log('-'.repeat(50));
  const result2 = await executePlayerComparison({
    player1: 'Justin Jefferson',
    player2: 'Tyreek Hill',
    scoringType: 'ppr',
    weeks: 5
  });
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('');

  // Test 3: Compare two RBs
  console.log('Test 3: Christian McCaffrey vs Derrick Henry (Standard)');
  console.log('-'.repeat(50));
  const result3 = await executePlayerComparison({
    player1: 'Christian McCaffrey',
    player2: 'Derrick Henry',
    scoringType: 'standard',
    weeks: 5
  });
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('');

  // Test 4: Invalid player
  console.log('Test 4: Invalid player name');
  console.log('-'.repeat(50));
  const result4 = await executePlayerComparison({
    player1: 'Fake Player Name',
    player2: 'Josh Allen',
    scoringType: 'ppr',
    weeks: 5
  });
  console.log('Result:', JSON.stringify(result4, null, 2));
}

testCompareTool().catch(console.error);
