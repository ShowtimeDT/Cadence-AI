import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { fantasyTools } from '@/lib/ai/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    console.log('[API] ========== NEW CHAT REQUEST ==========');
    console.log('[API] Request URL:', req.url);
    console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()));

    try {
        const body = await req.json();
        console.log('[API] Request body:', JSON.stringify(body, null, 2));

        const { messages } = body;
        console.log('[API] Received messages count:', messages.length);
        console.log('[API] All messages:', messages);

        const lastMessage = messages[messages.length - 1].content;
        console.log('[API] Last message content:', lastMessage);
        console.log('[API] Last message full:', messages[messages.length - 1]);

        // 1. Search for players in the database based on the user's message
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const searchTerm = lastMessage.replace(/[^\w\s]/gi, '').trim();
        console.log('[API] Search term after cleanup:', searchTerm);

        // Smart search: split into words and try different combinations
        const words = searchTerm.split(/\s+/).filter((w: string) => w.length > 0);
        console.log('[API] Search words:', words);
        let players = null;

        if (words.length >= 2) {
            console.log('[API] Attempting first+last name search');
            const { data: nameSearch, error: searchError } = await supabase
                .from('nfl_players')
                .select('*')
                .ilike('first_name', `%${words[0]}%`)
                .ilike('last_name', `%${words[words.length - 1]}%`)
                .limit(5);

            if (searchError) {
                console.error('[API] Name search error:', searchError);
            }
            console.log('[API] Name search results:', nameSearch?.length || 0, 'players');
            players = nameSearch;
        }

        // If no results or single word, fall back to general search
        if (!players || players.length === 0) {
            console.log('[API] Attempting general search (fallback)');
            const searchPattern = words.join('%');
            const { data: generalSearch, error: searchError } = await supabase
                .from('nfl_players')
                .select('*')
                .or(`first_name.ilike.%${words[0] || searchTerm}%,last_name.ilike.%${words[0] || searchTerm}%,nfl_team.ilike.%${searchTerm}%`)
                .limit(5);

            if (searchError) {
                console.error('[API] General search error:', searchError);
            }
            console.log('[API] General search results:', generalSearch?.length || 0, 'players');
            players = generalSearch;
        }

        console.log('[API] Final players found:', players?.length || 0);
        if (players && players.length > 0) {
            console.log('[API] Player names:', players.map(p => `${p.first_name} ${p.last_name}`));
        }

        // 2. Construct system prompt with context and tool instructions
        let systemPrompt = `You are Cadence, an expert fantasy football AI assistant.
You help users make drafting and roster decisions.
Always be concise, confident, and data-driven.

You have access to powerful analysis tools:
- **compare_players**: Use this when users ask about comparing two specific players (e.g., "Should I start Mahomes or Allen?", "Who's better: Jefferson or Hill?")
- **optimize_lineup**: Use this when users need lineup help (coming soon)
- **analyze_trade**: Use this when users ask about trades (coming soon)

When a user asks a question that requires player comparison, use the compare_players tool to get detailed stats and analysis.

Context from database:
`;

        if (players && players.length > 0) {
            systemPrompt += `Found the following players matching the query:\n${JSON.stringify(players, null, 2)}\n\n`;
            systemPrompt += `Use this data to answer the user's question. If the data answers it, cite the specific stats (e.g. "Justin Jefferson is a WR for MIN...").`;
        } else {
            systemPrompt += `No specific player data found in the database for this query. Answer based on your general NFL knowledge, but mention you couldn't find specific database records.`;
        }

        // 3. Check for OpenAI Key
        console.log('[API] Checking for OpenAI API key');
        console.log('[API] OpenAI key present:', !!process.env.OPENAI_API_KEY);

        if (!process.env.OPENAI_API_KEY) {
            console.error('[API] MISSING OPENAI_API_KEY');
            return new Response(
                `[System]: OpenAI API Key is missing. \n\nI found these players in your database:\n${players?.map(p => `- ${p.first_name} ${p.last_name} (${p.position} - ${p.nfl_team})`).join('\n') || 'None'}\n\nPlease add OPENAI_API_KEY to .env.local to enable full AI chat.`,
                {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
                }
            );
        }

        // 4. Stream response using Vercel AI SDK with GPT-5
        console.log('[API] Starting GPT-5 stream');
        console.log('[API] Model:', 'gpt-5');
        console.log('[API] System prompt length:', systemPrompt.length);
        console.log('[API] Raw messages:', messages);

        // Convert UI messages to model messages
        const modelMessages = messages.map((msg: any) => {
            // If message has parts (UI format), convert to content string
            if (msg.parts && Array.isArray(msg.parts)) {
                const textContent = msg.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
                console.log('[API] Converting UI message to model format:', {
                    role: msg.role,
                    originalParts: msg.parts.length,
                    convertedContent: textContent
                });
                return {
                    role: msg.role,
                    content: textContent
                };
            }
            // Already in model format
            console.log('[API] Message already in model format:', msg);
            return msg;
        });

        console.log('[API] Model messages for AI:', modelMessages);

        const result = streamText({
            model: openai('gpt-5'),
            system: systemPrompt,
            messages: modelMessages,
            tools: fantasyTools,
        });

        console.log('[API] streamText result created:', !!result);
        console.log('[API] result methods:', Object.keys(result));

        // Use toUIMessageStreamResponse() - the correct method for AI SDK v5
        const response = result.toUIMessageStreamResponse();
        console.log('[API] Response created:', !!response);
        console.log('[API] Response status:', response.status);
        console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('[API] ========== RETURNING RESPONSE ==========');

        return response;
    } catch (error: any) {
        console.error('[API] ========== ERROR ==========');
        console.error('[API] Error type:', error?.constructor?.name);
        console.error('[API] Error message:', error?.message);
        console.error('[API] Error stack:', error?.stack);
        console.error('[API] Error cause:', error?.cause);
        console.error('[API] Full error:', error);
        console.error('[API] ========== END ERROR ==========');

        return new Response(
            JSON.stringify({
                error: error.message,
                type: error?.constructor?.name,
                details: error?.cause
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
