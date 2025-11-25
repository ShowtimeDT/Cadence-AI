#!/usr/bin/env tsx
async function testChat() {
    const query = process.argv[2] || 'Compare Patrick Mahomes vs Josh Allen';
    console.log(`Testing chat with query: "${query}"\n`);

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: query
                    }
                ]
            })
        });

        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
            let fullResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullResponse += chunk;
            }

            // Parse and display text deltas
            const lines = fullResponse.split('\n').filter(line => line.startsWith('data: '));
            for (const line of lines) {
                const data = line.replace('data: ', '');
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'text-delta') {
                        process.stdout.write(parsed.delta);
                    }
                } catch (e) {
                    // Skip parse errors
                }
            }
            console.log('\n');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

testChat();
