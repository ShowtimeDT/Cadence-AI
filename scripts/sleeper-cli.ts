#!/usr/bin/env tsx

/**
 * Sleeper CLI Tool
 * Control Sleeper API and sync data from the command line
 *
 * Usage:
 *   npm run sleeper -- status              # Get NFL season/week info
 *   npm run sleeper -- players             # Fetch all NFL players
 *   npm run sleeper -- stats <season> <week>   # Get player stats
 *   npm run sleeper -- projections <season> <week>  # Get projections
 *   npm run sleeper -- sync                # Sync players to database
 */

import {
  getSleeperNFLState,
  getSleeperPlayers,
  getSleeperPlayerStats,
  getSleeperProjections,
  mapSleeperPlayerToDatabase
} from '../src/lib/sleeper';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.assign(process.env, envConfig);
}

const command = process.argv[2];
const args = process.argv.slice(3);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message: string) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function info(message: string) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function warn(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

async function getNFLStatus() {
  log('\n🏈 Fetching NFL Season Status...', colors.bright);
  try {
    const state = await getSleeperNFLState();
    log('\n📊 Current NFL State:', colors.cyan);
    console.log(`  Season: ${state.season}`);
    console.log(`  Week: ${state.week}`);
    console.log(`  Season Type: ${state.season_type}`);
    console.log(`  Display Week: ${state.display_week}`);
    success('\nStatus fetched successfully!');
  } catch (err: any) {
    error(`Failed to fetch NFL status: ${err.message}`);
    process.exit(1);
  }
}

async function getPlayers() {
  log('\n👥 Fetching All NFL Players...', colors.bright);
  try {
    const players = await getSleeperPlayers();
    const playerArray = Object.values(players);

    log(`\n📊 Found ${playerArray.length.toLocaleString()} players`, colors.cyan);

    // Show sample of 10 players
    log('\n🎯 Sample Players:', colors.blue);
    playerArray.slice(0, 10).forEach((player: any) => {
      console.log(`  ${player.first_name} ${player.last_name} - ${player.position} (${player.team || 'FA'})`);
    });

    success('\nPlayers fetched successfully!');
    info(`Total: ${playerArray.length.toLocaleString()} players`);
  } catch (err: any) {
    error(`Failed to fetch players: ${err.message}`);
    process.exit(1);
  }
}

async function getStats() {
  if (args.length < 2) {
    error('Usage: npm run sleeper -- stats <season> <week>');
    error('Example: npm run sleeper -- stats 2024 1');
    process.exit(1);
  }

  const season = args[0];
  const week = args[1];

  log(`\n📈 Fetching Stats for ${season} Week ${week}...`, colors.bright);
  try {
    const stats = await getSleeperPlayerStats(season, parseInt(week));
    const statArray = Object.entries(stats);

    log(`\n📊 Found stats for ${statArray.length.toLocaleString()} players`, colors.cyan);

    // Show top 10 by fantasy points (PPR)
    const topPlayers = statArray
      .filter(([_, s]: any) => s.pts_ppr)
      .sort(([_, a]: any, [__, b]: any) => (b.pts_ppr || 0) - (a.pts_ppr || 0))
      .slice(0, 10);

    log('\n🏆 Top 10 Fantasy Scorers (PPR):', colors.blue);
    topPlayers.forEach(([playerId, stats]: any, index) => {
      console.log(`  ${index + 1}. Player ${playerId}: ${stats.pts_ppr?.toFixed(2)} pts`);
    });

    success('\nStats fetched successfully!');
  } catch (err: any) {
    error(`Failed to fetch stats: ${err.message}`);
    process.exit(1);
  }
}

async function getProjections() {
  if (args.length < 2) {
    error('Usage: npm run sleeper -- projections <season> <week>');
    error('Example: npm run sleeper -- projections 2024 1');
    process.exit(1);
  }

  const season = args[0];
  const week = args[1];

  log(`\n🔮 Fetching Projections for ${season} Week ${week}...`, colors.bright);
  try {
    const projections = await getSleeperProjections(season, parseInt(week));
    const projArray = Object.entries(projections);

    log(`\n📊 Found projections for ${projArray.length.toLocaleString()} players`, colors.cyan);

    // Show top 10 by projected fantasy points (PPR)
    const topProjections = projArray
      .filter(([_, p]: any) => p.pts_ppr)
      .sort(([_, a]: any, [__, b]: any) => (b.pts_ppr || 0) - (a.pts_ppr || 0))
      .slice(0, 10);

    log('\n🎯 Top 10 Projected Scorers (PPR):', colors.blue);
    topProjections.forEach(([playerId, proj]: any, index) => {
      console.log(`  ${index + 1}. Player ${playerId}: ${proj.pts_ppr?.toFixed(2)} pts (proj)`);
    });

    success('\nProjections fetched successfully!');
  } catch (err: any) {
    error(`Failed to fetch projections: ${err.message}`);
    process.exit(1);
  }
}

async function syncPlayers() {
  log('\n🔄 Syncing NFL Players to Database...', colors.bright);

  // Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    error('Missing Supabase credentials in .env.local');
    error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    info('Fetching players from Sleeper...');
    const sleeperPlayers = await getSleeperPlayers();
    const playerArray = Object.values(sleeperPlayers);

    log(`📊 Found ${playerArray.length.toLocaleString()} players to sync`, colors.cyan);

    // Map to database format
    info('Mapping to database format...');
    const dbPlayers = playerArray
      .filter((p: any) => p.position && p.first_name && p.last_name)
      .map(mapSleeperPlayerToDatabase);

    log(`✓ Mapped ${dbPlayers.length.toLocaleString()} valid players`, colors.green);

    // Batch upsert (500 at a time to avoid timeout)
    const batchSize = 500;
    let synced = 0;
    let errors = 0;

    for (let i = 0; i < dbPlayers.length; i += batchSize) {
      const batch = dbPlayers.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(dbPlayers.length / batchSize);

      info(`Syncing batch ${batchNum}/${totalBatches} (${batch.length} players)...`);

      const { error: batchError } = await supabase
        .from('nfl_players')
        .upsert(batch, {
          onConflict: 'sleeper_id',
          ignoreDuplicates: false
        });

      if (batchError) {
        error(`Batch ${batchNum} failed: ${batchError.message}`);
        errors += batch.length;
      } else {
        synced += batch.length;
        log(`  ✓ Batch ${batchNum} completed`, colors.green);
      }
    }

    log('\n📊 Sync Summary:', colors.bright);
    console.log(`  Total Players: ${dbPlayers.length.toLocaleString()}`);
    console.log(`  ${colors.green}Synced: ${synced.toLocaleString()}${colors.reset}`);
    if (errors > 0) {
      console.log(`  ${colors.red}Errors: ${errors.toLocaleString()}${colors.reset}`);
    }

    if (errors === 0) {
      success('\n🎉 All players synced successfully!');
    } else {
      warn(`\nSync completed with ${errors} errors`);
    }
  } catch (err: any) {
    error(`Sync failed: ${err.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}⚡ Sleeper CLI Tool${colors.reset}

${colors.bright}Usage:${colors.reset}
  npm run sleeper -- <command> [args]

${colors.bright}Commands:${colors.reset}
  ${colors.cyan}status${colors.reset}                    Get current NFL season and week info
  ${colors.cyan}players${colors.reset}                   Fetch all NFL players from Sleeper
  ${colors.cyan}stats <season> <week>${colors.reset}    Get player stats for a specific week
  ${colors.cyan}projections <season> <week>${colors.reset}  Get player projections
  ${colors.cyan}sync${colors.reset}                      Sync all players to Supabase database

${colors.bright}Examples:${colors.reset}
  npm run sleeper -- status
  npm run sleeper -- players
  npm run sleeper -- stats 2024 1
  npm run sleeper -- projections 2024 12
  npm run sleeper -- sync

${colors.bright}Environment:${colors.reset}
  Requires .env.local with:
    - NEXT_PUBLIC_SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
  `);
}

// Main command router
async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'status':
      await getNFLStatus();
      break;
    case 'players':
      await getPlayers();
      break;
    case 'stats':
      await getStats();
      break;
    case 'projections':
      await getProjections();
      break;
    case 'sync':
      await syncPlayers();
      break;
    default:
      error(`Unknown command: ${command}`);
      info('Run "npm run sleeper -- help" for usage');
      process.exit(1);
  }
}

main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
