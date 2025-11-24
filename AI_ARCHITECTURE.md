# 🧠 AI Architecture: One Model, Multiple Tools

## 📍 Current Status (Updated: Nov 24, 2025)

### ✅ What's Working Now:
- **AI Model**: GPT-5 (gpt-5-preview-2024-11-19) with streaming responses
- **Chat Interface**: Full integration via Vercel AI SDK v5.0.101
- **UI/UX**: Complete redesign with AAA WCAG 2.1 accessibility compliance
- **Design System**: 100% of site using centralized design tokens
- **Features**: Keyboard shortcuts, code highlighting, markdown rendering, copy-to-clipboard

### 🎯 Next Priority:
- **Tool Calling**: Implement player comparison tool with GPT-5 function calling
- **Database**: Connect NFL player data from Supabase
- **Tool Execution**: Add tool handler framework to chat API

### 📊 Progress:
- Phase 1 (Basic Chat): ✅ 100% Complete
- Phase 3 (UI/UX): ✅ 100% Complete (done ahead of schedule)
- Phase 2 (Tools): ⏳ 0% - Ready to start
- Phase 4 (Advanced): ⏳ 0% - Planned
- Phase 5 (Polish): ⏳ 0% - Planned

---

## Overview

Use **ONE ML MODEL (GPT-5)** with **multiple tools/functions** to power ALL AI features in your fantasy football app.

---

## ✅ Why This Approach is BEST

### Benefits:
1. **Cost Efficient** - Single API, single billing
2. **Consistent Experience** - Same AI "personality" everywhere
3. **Easier Maintenance** - One model to update/monitor
4. **Shared Context** - Model learns from all interactions
5. **Function Calling** - Model automatically chooses the right tool

### How It Works:
```
User Request → GPT-5 → Decides which tool to use → Executes → Returns result
```

---

## 🛠️ Available Tools Architecture

### 1. **Chat Assistant** (Current)
```typescript
// API: /api/chat
Tool: "general_chat"
Purpose: Answer general fantasy football questions
Example: "Who is Justin Jefferson?"
```

### 2. **Player Comparison**
```typescript
// API: /api/tools/compare-players
Tool: "compare_players"
Input: { player1: "Mahomes", player2: "Allen" }
Output: {
  comparison: {...},
  winner: "Mahomes",
  reasoning: "...",
  confidence: 0.85
}
```

### 3. **Lineup Optimizer**
```typescript
// API: /api/tools/optimize-lineup
Tool: "optimize_lineup"
Input: {
  roster: [...players],
  week: 12,
  scoring: "ppr"
}
Output: {
  optimalLineup: {...},
  benchedPlayers: [...],
  projectedPoints: 145.3,
  reasoning: "..."
}
```

### 4. **Trade Analyzer**
```typescript
// API: /api/tools/analyze-trade
Tool: "analyze_trade"
Input: {
  give: ["Player A", "Player B"],
  receive: ["Player C"]
}
Output: {
  recommendation: "accept" | "reject",
  fairnessScore: 0.75,
  reasoning: "...",
  alternativeSuggestions: [...]
}
```

### 5. **Draft Assistant**
```typescript
// API: /api/tools/draft-recommendation
Tool: "draft_recommendation"
Input: {
  availablePlayers: [...],
  myTeam: [...],
  draftPosition: 5,
  round: 3
}
Output: {
  topPick: {...},
  alternatives: [...],
  reasoning: "...",
  riskLevel: "low"
}
```

### 6. **Waiver Wire Priority**
```typescript
// API: /api/tools/waiver-priority
Tool: "waiver_wire_priority"
Input: {
  availablePlayers: [...],
  myTeam: [...],
  week: 12
}
Output: {
  priorityList: [...],
  dropCandidates: [...],
  reasoning: "..."
}
```

### 7. **League Insights**
```typescript
// API: /api/tools/league-insights
Tool: "league_insights"
Input: { leagueId: "abc123" }
Output: {
  standings: [...],
  powerRankings: [...],
  trends: [...],
  upcomingMatchups: [...],
  insights: "..."
}
```

### 8. **Injury Impact Analysis**
```typescript
// API: /api/tools/injury-impact
Tool: "injury_impact"
Input: {
  injuredPlayer: "Travis Kelce",
  severity: "ankle",
  team: "KC"
}
Output: {
  impact: "high",
  affectedPlayers: [...],
  pickupSuggestions: [...],
  reasoning: "..."
}
```

---

## 🔧 Implementation Example

### Step 1: Define Tools

```typescript
// src/lib/ai/tools.ts

export const fantasyTools = [
  {
    name: 'compare_players',
    description: 'Compare two NFL players for fantasy football',
    parameters: {
      type: 'object',
      properties: {
        player1: { type: 'string', description: 'First player name' },
        player2: { type: 'string', description: 'Second player name' },
        scoringType: {
          type: 'string',
          enum: ['standard', 'ppr', 'half_ppr'],
          description: 'Scoring format'
        }
      },
      required: ['player1', 'player2']
    }
  },
  {
    name: 'optimize_lineup',
    description: 'Optimize fantasy lineup for maximum points',
    parameters: {
      type: 'object',
      properties: {
        roster: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of player IDs on roster'
        },
        week: { type: 'number', description: 'NFL week number' },
        scoringType: { type: 'string' }
      },
      required: ['roster', 'week']
    }
  },
  {
    name: 'analyze_trade',
    description: 'Analyze a fantasy football trade',
    parameters: {
      type: 'object',
      properties: {
        give: {
          type: 'array',
          items: { type: 'string' },
          description: 'Players you would give up'
        },
        receive: {
          type: 'array',
          items: { type: 'string' },
          description: 'Players you would receive'
        }
      },
      required: ['give', 'receive']
    }
  }
  // ... more tools
];
```

### Step 2: Enhanced Chat API with Tool Calling

```typescript
// src/app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { fantasyTools } from '@/lib/ai/tools';
import { executePlayerComparison } from '@/lib/ai/tools/compareP layers';
import { executeLineupOptimization } from '@/lib/ai/tools/optimizeLineup';
import { executeTradeAnalysis } from '@/lib/ai/tools/analyzeTrade';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-5-preview-2024-11-19'),
    messages,
    tools: fantasyTools,
    system: `You are Cadence, an expert fantasy football AI assistant.

You have access to powerful analysis tools:
- compare_players: For player comparisons
- optimize_lineup: For lineup optimization
- analyze_trade: For trade analysis
- ... (more tools)

When a user asks a question:
1. Determine if you need to use a tool
2. Call the appropriate tool with correct parameters
3. Use the tool result to provide an informed answer
4. Always cite specific data and explain your reasoning

Be concise, data-driven, and confident.`,

    // Handle tool calls
    onToolCall: async ({ toolName, args }) => {
      console.log(`Tool called: ${toolName}`, args);

      switch (toolName) {
        case 'compare_players':
          return await executePlayerComparison(args);
        case 'optimize_lineup':
          return await executeLineupOptimization(args);
        case 'analyze_trade':
          return await executeTradeAnalysis(args);
        // ... more tool handlers
        default:
          return { error: 'Unknown tool' };
      }
    }
  });

  return result.toTextStreamResponse();
}
```

### Step 3: Tool Implementation Example

```typescript
// src/lib/ai/tools/comparePlayersimport { createClient } from '@/lib/supabase/server';

export async function executePlayerComparison(args: {
  player1: string;
  player2: string;
  scoringType?: string;
}) {
  const supabase = createClient();

  // 1. Find players in database
  const { data: p1 } = await supabase
    .from('nfl_players')
    .select('*')
    .ilike('full_name', `%${args.player1}%`)
    .single();

  const { data: p2 } = await supabase
    .from('nfl_players')
    .select('*')
    .ilike('full_name', `%${args.player2}%`)
    .single();

  if (!p1 || !p2) {
    return { error: 'Player not found' };
  }

  // 2. Get recent stats
  const { data: p1Stats } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', p1.id)
    .order('week', { ascending: false })
    .limit(5);

  const { data: p2Stats } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', p2.id)
    .order('week', { ascending: false })
    .limit(5);

  // 3. Calculate averages
  const scoringField = args.scoringType === 'ppr'
    ? 'fantasy_points_ppr'
    : 'fantasy_points_standard';

  const p1Avg = calculateAverage(p1Stats, scoringField);
  const p2Avg = calculateAverage(p2Stats, scoringField);

  // 4. Return structured comparison
  return {
    player1: {
      name: `${p1.first_name} ${p1.last_name}`,
      position: p1.position,
      team: p1.nfl_team,
      avgPoints: p1Avg,
      lastFiveGames: p1Stats
    },
    player2: {
      name: `${p2.first_name} ${p2.last_name}`,
      position: p2.position,
      team: p2.nfl_team,
      avgPoints: p2Avg,
      lastFiveGames: p2Stats
    },
    winner: p1Avg > p2Avg ? 'player1' : 'player2',
    difference: Math.abs(p1Avg - p2Avg),
    confidence: calculateConfidence(p1Stats, p2Stats)
  };
}

function calculateAverage(stats: any[], field: string) {
  if (!stats || stats.length === 0) return 0;
  const sum = stats.reduce((acc, s) => acc + (s[field] || 0), 0);
  return sum / stats.length;
}

function calculateConfidence(stats1: any[], stats2: any[]) {
  // Calculate confidence based on sample size and consistency
  const minGames = Math.min(stats1?.length || 0, stats2?.length || 0);
  if (minGames < 3) return 0.6;
  if (minGames < 5) return 0.75;
  return 0.9;
}
```

---

## 💬 User Experience Examples

### Example 1: Natural Question → Tool Auto-Selection
```
User: "Should I start Mahomes or Allen this week?"

GPT-5 thinks: "This requires player comparison"
→ Calls: compare_players(player1="Mahomes", player2="Allen")
→ Gets: Detailed stats comparison
→ Responds: "I'd start Patrick Mahomes this week. He's averaging
   24.3 PPR points over his last 5 games compared to Allen's 21.8.
   Plus, KC faces a defense ranked 28th against QBs."
```

### Example 2: Complex Multi-Tool Request
```
User: "I'm thinking of trading CMC and Tyreek Hill for Justin
Jefferson and Josh Jacobs. What do you think?"

GPT-5 thinks: "This needs trade analysis"
→ Calls: analyze_trade(give=["CMC", "Tyreek Hill"],
        receive=["Justin Jefferson", "Josh Jacobs"])
→ Gets: Trade analysis with projections
→ Responds: "I'd reject this trade. You're giving up the #1 RB
   and a top-5 WR for a WR1 and mid-tier RB. The fairness score
   is only 0.62. You're losing about 8 PPG in projected points."
```

### Example 3: Lineup Help
```
User: "Help me set my lineup for week 12"

GPT-5 thinks: "Need lineup optimization"
→ Calls: optimize_lineup(roster=[...], week=12)
→ Gets: Optimal lineup with projections
→ Responds: "Here's your optimal lineup for Week 12:
   QB: Jalen Hurts (proj. 23.4 pts)
   RB1: Christian McCaffrey (proj. 26.8 pts)
   RB2: Austin Ekeler (proj. 19.2 pts)
   ...
   Projected total: 142.6 points

   I'm benching Gabe Davis this week due to his tough matchup
   against SF's #1 ranked pass defense."
```

---

## 🎯 Benefits of This Architecture

### 1. **Contextual Intelligence**
The model automatically knows when to:
- Use a tool (complex analysis)
- Just answer (simple question)
- Use multiple tools (multi-step reasoning)

### 2. **Scalability**
Adding new features is easy:
```typescript
// Just add a new tool definition!
{
  name: 'weather_impact',
  description: 'Analyze weather impact on player performance',
  ...
}
```

### 3. **Consistent Personality**
The AI maintains the same "Cadence" personality whether:
- Chatting casually
- Analyzing trades
- Optimizing lineups
- Providing draft advice

### 4. **Cost Optimization**
- Single API key
- Shared rate limits
- Batch processing possible
- Caching opportunities

---

## 📊 Implementation Roadmap

### ✅ Phase 1: Basic Chat Foundation (COMPLETED)
- ✅ Basic chat working with GPT-4o
- ✅ Streaming responses via Vercel AI SDK
- ✅ Message history and state management
- ✅ Error handling and loading states
- ⏳ Player comparison tool (NEXT PRIORITY)
- ⏳ Lineup optimization tool (NEXT PRIORITY)

### ✅ Phase 3: UI/UX Enhancement (COMPLETED - Done ahead of Phase 2)
- ✅ iMessage-style chat bubbles with elegant styling
- ✅ Design token system (100% of site uses variables.css)
- ✅ Keyboard navigation (Cmd/Ctrl+Enter to send, Escape to clear)
- ✅ Code syntax highlighting with Prism.js
- ✅ AAA WCAG 2.1 compliance (entire site)
  - ✅ 21:1 contrast ratios for primary text
  - ✅ 44x44px minimum touch targets (all components)
  - ✅ Enhanced focus indicators (4px outline + glow)
  - ✅ Comprehensive ARIA attributes
  - ✅ Full screen reader support
- ✅ Markdown rendering (bold, lists, paragraphs)
- ✅ Copy-to-clipboard functionality
- ✅ Responsive design with mobile optimization
- ✅ Timestamps for all messages
- ✅ Loading animations and error states

### Phase 2: Trade & Draft (NEXT UP)
- ⏳ Add trade analyzer tool
- ⏳ Add draft assistant tool
- ⏳ Add UI for structured tool responses
- ⏳ Tool calling integration with GPT-4o

### Phase 4: Advanced Features
- ⏳ Add waiver wire tool
- ⏳ Add league insights tool
- ⏳ Add injury impact tool

### Phase 5: Performance & Polish
- ⏳ Add response caching (Redis)
- ⏳ Optimize tool performance
- ⏳ Add analytics dashboard
- ⏳ Rate limiting per user

---

## 🔐 Security & Performance

### Rate Limiting
```typescript
// Implement per-user rate limiting
const rateLimiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute'
});
```

### Caching
```typescript
// Cache player data and stats
const cache = new Redis({...});

// Cache player comparisons for 1 hour
await cache.set(
  `comparison:${player1}:${player2}`,
  result,
  { ex: 3600 }
);
```

### Cost Management
```typescript
// Track API usage per user
await logUsage({
  userId,
  tokens: result.usage.totalTokens,
  cost: calculateCost(result.usage),
  toolsUsed: result.toolCalls.map(t => t.name)
});
```

---

## 🚀 Next Steps

1. **Test current chat** - Make sure basic chat works
2. **Add first tool** - Start with player comparison
3. **Build tool UI** - Create components for structured responses
4. **Add more tools** - Gradually expand capabilities
5. **Optimize** - Cache, rate limit, monitor costs

---

## 📝 Summary

**One Model (GPT-5) + Multiple Tools = Complete Fantasy Football AI Platform**

This architecture gives you:
- ✅ Single, consistent AI experience
- ✅ Powerful analysis capabilities
- ✅ Easy to extend with new features
- ✅ Cost-efficient and scalable
- ✅ Natural language interface
- ✅ AAA WCAG 2.1 accessible UI

The model automatically decides when to use which tool, making it feel like magic to users! 🪄

**Current Status**: Phase 1 & 3 complete. Ready to implement tool calling in Phase 2.
