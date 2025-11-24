/**
 * AI Tool Definitions for Fantasy Football Platform
 *
 * These tools are used by GPT-5 to perform specific fantasy football
 * analysis tasks like player comparisons, lineup optimization, etc.
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * Player Comparison Tool
 * Compares two NFL players based on their recent performance and stats
 */
export const comparePlayersTool = tool({
  description: 'Compare two NFL players for fantasy football. Use this when users ask about which player to start, trade, or draft between two specific players.',
  parameters: z.object({
    player1: z.string().describe('First player name (e.g., "Patrick Mahomes")'),
    player2: z.string().describe('Second player name (e.g., "Josh Allen")'),
    scoringType: z.enum(['standard', 'ppr', 'half_ppr']).optional().describe('Fantasy scoring format. Defaults to PPR.'),
    weeks: z.number().optional().describe('Number of recent weeks to analyze. Defaults to 5.')
  }),
  execute: async ({ player1, player2, scoringType = 'ppr', weeks = 5 }) => {
    // Import the execution function dynamically to avoid circular dependencies
    const { executePlayerComparison } = await import('./tools/comparePlayer');
    return await executePlayerComparison({
      player1,
      player2,
      scoringType,
      weeks
    });
  }
});

/**
 * Lineup Optimization Tool
 * Optimizes a fantasy football lineup for maximum projected points
 */
export const optimizeLineupTool = tool({
  description: 'Optimize a fantasy football lineup to maximize projected points. Use this when users ask for lineup help or "who should I start".',
  parameters: z.object({
    roster: z.array(z.string()).describe('Array of player names on the roster'),
    week: z.number().describe('NFL week number (1-18)'),
    scoringType: z.enum(['standard', 'ppr', 'half_ppr']).optional().describe('Fantasy scoring format'),
    positions: z.object({
      qb: z.number().optional(),
      rb: z.number().optional(),
      wr: z.number().optional(),
      te: z.number().optional(),
      flex: z.number().optional(),
      dst: z.number().optional(),
      k: z.number().optional()
    }).optional().describe('League roster settings')
  }),
  execute: async ({ roster, week, scoringType = 'ppr', positions }) => {
    const { executeLineupOptimization } = await import('./tools/optimizeLineup');
    return await executeLineupOptimization({
      roster,
      week,
      scoringType,
      positions
    });
  }
});

/**
 * Trade Analyzer Tool
 * Analyzes a proposed fantasy football trade for fairness and value
 */
export const analyzeTradeTool = tool({
  description: 'Analyze a fantasy football trade proposal. Use this when users ask if they should accept/reject a trade or get trade advice.',
  parameters: z.object({
    give: z.array(z.string()).describe('Players you would give up in the trade'),
    receive: z.array(z.string()).describe('Players you would receive in the trade'),
    scoringType: z.enum(['standard', 'ppr', 'half_ppr']).optional().describe('Fantasy scoring format'),
    myRoster: z.array(z.string()).optional().describe('Your current roster (for context)')
  }),
  execute: async ({ give, receive, scoringType = 'ppr', myRoster }) => {
    const { executeTradeAnalysis } = await import('./tools/analyzeTrade');
    return await executeTradeAnalysis({
      give,
      receive,
      scoringType,
      myRoster
    });
  }
});

/**
 * All available tools for the AI chat
 */
export const fantasyTools = {
  compare_players: comparePlayersTool,
  optimize_lineup: optimizeLineupTool,
  analyze_trade: analyzeTradeTool
};

export type FantasyTools = typeof fantasyTools;
