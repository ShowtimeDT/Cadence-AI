#!/usr/bin/env tsx
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const modelsToTest = [
    'gpt-5',
    'gpt-5-chat-latest',
    'gpt-5-2025-08-07',
    'gpt-5-mini',
    'gpt-5-mini-2025-08-07',
    'gpt-5-nano',
    'gpt-5-nano-2025-08-07',
    'gpt-5.1',
    'gpt-5.1-2025-11-13',
    'gpt-5.1-chat-latest',
];

async function testModel(modelName: string) {
    try {
        console.log(`\n🧪 Testing: ${modelName}`);

        const result = streamText({
            model: openai(modelName),
            messages: [{
                role: 'user',
                content: 'Say "test successful" if you can read this.'
            }],
            maxTokens: 20,
        });

        const response = result.toUIMessageStreamResponse();

        // Try to read the stream
        const reader = response.body?.getReader();
        if (reader) {
            await reader.read();
            console.log(`   ✅ ${modelName} - WORKS!`);
            reader.releaseLock();
            return true;
        }
        return false;
    } catch (error: any) {
        if (error.message?.includes('does not exist') || error.message?.includes('not found')) {
            console.log(`   ❌ ${modelName} - Model not found`);
        } else {
            console.log(`   ⚠️  ${modelName} - Error: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log('🔍 Testing GPT-5 model names with Vercel AI SDK...\n');

    const workingModels = [];

    for (const model of modelsToTest) {
        const works = await testModel(model);
        if (works) {
            workingModels.push(model);
        }
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n\n📊 Summary:');
    if (workingModels.length > 0) {
        console.log('✅ Working models:');
        workingModels.forEach(m => console.log(`   - ${m}`));
    } else {
        console.log('❌ No GPT-5 models found. GPT-5 may not be available yet.');
        console.log('\nTrying gpt-4o as fallback...');
        await testModel('gpt-4o');
    }
}

main().catch(console.error);
