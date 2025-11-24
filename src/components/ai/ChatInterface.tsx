'use client';

import { useChat } from '@ai-sdk/react';
import styles from './ChatInterface.module.css';
import { useRef, useEffect, useState } from 'react';
import 'prismjs/themes/prism-tomorrow.css';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={styles.copyButton}
            aria-label="Copy message"
            title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copied ? '✓' : '⧉'}
        </button>
    );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Dynamically import Prism only on client-side
        const loadPrism = async () => {
            if (typeof window !== 'undefined' && codeRef.current) {
                const Prism = (await import('prismjs')).default;

                // Load language-specific grammars
                try {
                    if (language === 'javascript' || language === 'js') {
                        await import('prismjs/components/prism-javascript');
                    } else if (language === 'typescript' || language === 'ts') {
                        await import('prismjs/components/prism-typescript');
                    } else if (language === 'jsx') {
                        await import('prismjs/components/prism-jsx');
                    } else if (language === 'tsx') {
                        await import('prismjs/components/prism-tsx');
                    } else if (language === 'python' || language === 'py') {
                        await import('prismjs/components/prism-python');
                    } else if (language === 'sql') {
                        await import('prismjs/components/prism-sql');
                    } else if (language === 'bash' || language === 'sh') {
                        await import('prismjs/components/prism-bash');
                    }
                } catch (e) {
                    console.warn('Failed to load Prism language:', language, e);
                }

                Prism.highlightElement(codeRef.current);
            }
        };

        loadPrism();
    }, [code, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeLanguage}>{language}</span>
                <button
                    onClick={handleCopy}
                    className={styles.codeCopyButton}
                    aria-label="Copy code"
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? '✓ Copied' : '⧉ Copy'}
                </button>
            </div>
            <pre className={styles.codePre}>
                <code ref={codeRef} className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
}

function renderMarkdown(text: string) {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let i = 0;
    let currentList: string[] = [];
    let listType: 'bullet' | 'numbered' | null = null;

    const flushList = () => {
        if (currentList.length > 0) {
            const ListTag = listType === 'numbered' ? 'ol' : 'ul';
            elements.push(
                <ListTag key={`list-${elements.length}`} className={styles.markdownList}>
                    {currentList.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: processBold(item) }} />
                    ))}
                </ListTag>
            );
            currentList = [];
            listType = null;
        }
    };

    const processBold = (line: string) => {
        return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    while (i < lines.length) {
        const line = lines[i];

        // Check for code block start
        const codeBlockMatch = line.match(/^```(\w+)?$/);
        if (codeBlockMatch) {
            flushList();
            const language = codeBlockMatch[1] || 'text';
            const codeLines: string[] = [];
            i++;

            // Collect code lines until we hit the closing ```
            while (i < lines.length && !lines[i].match(/^```$/)) {
                codeLines.push(lines[i]);
                i++;
            }

            const code = codeLines.join('\n');
            elements.push(
                <CodeBlock key={`code-${elements.length}`} code={code} language={language} />
            );
            i++; // Skip the closing ```
            continue;
        }

        // Check for list items
        const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
        const numberedMatch = line.match(/^\d+\.\s+(.+)$/);

        if (bulletMatch) {
            if (listType !== 'bullet') {
                flushList();
                listType = 'bullet';
            }
            currentList.push(bulletMatch[1]);
        } else if (numberedMatch) {
            if (listType !== 'numbered') {
                flushList();
                listType = 'numbered';
            }
            currentList.push(numberedMatch[1]);
        } else {
            flushList();
            if (line.trim()) {
                elements.push(
                    <p key={`p-${i}`} dangerouslySetInnerHTML={{ __html: processBold(line) }} />
                );
            } else {
                elements.push(<br key={`br-${i}`} />);
            }
        }
        i++;
    }

    flushList();
    return elements;
}

export function ChatInterface() {
    console.log('[ChatInterface] Component rendering');

    const { messages, sendMessage, status, error } = useChat({
        api: '/api/chat',
        onError: (err) => {
            console.error('[ChatInterface] ERROR:', err);
            console.error('[ChatInterface] Error details:', {
                message: err.message,
                stack: err.stack,
                cause: err.cause
            });
            alert('Chat error: ' + err.message);
        },
        onFinish: (message) => {
            console.log('[ChatInterface] Chat finished');
            console.log('[ChatInterface] Final message:', message);
            console.log('[ChatInterface] Message structure:', {
                id: message.id,
                role: message.role,
                content: message.content,
                parts: message.parts,
                hasContent: !!message.content,
                hasParts: !!message.parts,
                partsLength: message.parts?.length
            });
        }
    });

    console.log('[ChatInterface] Current state:', {
        messagesCount: messages.length,
        status,
        hasError: !!error,
        error: error?.message
    });

    const isLoading = status === 'submitted' || status === 'streaming';
    console.log('[ChatInterface] isLoading:', isLoading);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Cmd/Ctrl + Enter to send message
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                console.log('[ChatInterface] Keyboard shortcut: Sending message');
                sendMessage({ content: input });
                setInput('');
            }
        }

        // Escape to clear input
        if (e.key === 'Escape') {
            e.preventDefault();
            setInput('');
            console.log('[ChatInterface] Input cleared via Escape key');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[ChatInterface] Form submitted');
        console.log('[ChatInterface] Input value:', input);

        if (!input.trim()) {
            console.log('[ChatInterface] Input is empty, skipping');
            return;
        }

        console.log('[ChatInterface] Sending message:', { content: input });
        sendMessage({ content: input });
        setInput('');
        console.log('[ChatInterface] Message sent, input cleared');
    };

    return (
        <div className={styles.container} role="region" aria-label="Chat conversation">
            <div
                className={styles.messages}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
            >
                {messages.length === 0 && (
                    <div className={styles.aiMessage}>
                        Hello! I'm Cadence, your AI fantasy assistant. Ask me about any player! 🏈
                    </div>
                )}

                {error && (
                    <div className={styles.errorMessage}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <div>
                            <div className={styles.errorTitle}>Something went wrong</div>
                            <div className={styles.errorDetails}>{error.message}</div>
                        </div>
                    </div>
                )}

                {messages.map((m, index) => {
                    console.log(`[ChatInterface] Rendering message ${index}:`, {
                        id: m.id,
                        role: m.role,
                        contentType: typeof m.content,
                        content: m.content,
                        parts: m.parts,
                        hasParts: !!m.parts,
                        partsCount: m.parts?.length
                    });

                    let renderedContent;
                    let textContent = '';

                    if (typeof m.content === 'string') {
                        console.log(`[ChatInterface] Message ${index}: rendering as string`);
                        textContent = m.content;
                        // Apply markdown to AI messages
                        if (m.role === 'assistant') {
                            renderedContent = <div className={styles.markdownContent}>{renderMarkdown(m.content)}</div>;
                        } else {
                            renderedContent = m.content;
                        }
                    } else if (m.parts && Array.isArray(m.parts)) {
                        console.log(`[ChatInterface] Message ${index}: rendering ${m.parts.length} parts`);
                        const textParts = m.parts
                            .filter((p: any) => p.type === 'text')
                            .map((p: any) => p.text);
                        textContent = textParts.join('');

                        // Apply markdown to AI messages
                        if (m.role === 'assistant') {
                            renderedContent = <div className={styles.markdownContent}>{renderMarkdown(textContent)}</div>;
                        } else {
                            renderedContent = m.parts.map((part: any, i: number) => {
                                console.log(`[ChatInterface] Message ${index}, Part ${i}:`, part);
                                if (part.type === 'text') {
                                    console.log(`[ChatInterface] Message ${index}, Part ${i}: rendering text:`, part.text);
                                    return <span key={i}>{part.text}</span>;
                                }
                                console.log(`[ChatInterface] Message ${index}, Part ${i}: skipping non-text part`);
                                return null;
                            });
                        }
                    } else {
                        console.error(`[ChatInterface] Message ${index}: CANNOT RENDER - no content or parts`, m);
                        renderedContent = '[Error: Could not render message]';
                    }

                    const timestamp = new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });

                    return (
                        <div
                            key={m.id}
                            className={styles.messageWrapper}
                            role="article"
                            aria-label={`${m.role === 'user' ? 'Your' : 'Cadence\'s'} message at ${timestamp}`}
                        >
                            <div
                                className={m.role === 'user' ? styles.userMessage : styles.aiMessage}
                                aria-live="off"
                            >
                                {renderedContent}
                                {m.role === 'assistant' && textContent && (
                                    <CopyButton text={textContent} />
                                )}
                            </div>
                            <div
                                className={m.role === 'user' ? styles.timestampUser : styles.timestampAi}
                                aria-label={`Sent at ${timestamp}`}
                            >
                                {timestamp}
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className={styles.aiMessage}>
                        <div className={styles.loading}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className={styles.inputArea} aria-label="Chat input form">
                <input
                    className={styles.input}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about a player (e.g. 'Who is Justin Jefferson?') - Press Enter to send"
                    aria-label="Chat message input - Type your question about NFL players"
                    aria-describedby="keyboard-shortcuts"
                    aria-required="false"
                    aria-invalid="false"
                    disabled={isLoading}
                    minLength={1}
                    maxLength={500}
                />
                <span id="keyboard-shortcuts" className={styles.srOnly}>
                    Type your question about NFL players and press Enter to send, or use Cmd+Enter (Mac) or Ctrl+Enter (Windows) as a keyboard shortcut. Press Escape at any time to clear the input field. Minimum 1 character required to send.
                </span>
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={isLoading}
                    aria-label={isLoading ? 'Sending message...' : 'Send message'}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
