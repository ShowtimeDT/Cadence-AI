import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ai/ChatInterface';
import styles from '../page.module.css'; // Reusing main page styles for background

export default function ChatPage() {
    return (
        <main className={styles.main}>
            <Header />

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                paddingTop: '180px',
                width: '100%'
            }}>
                <h1 className={styles.chatTitle}>
                    Cadence AI Assistant
                </h1>

                <ChatInterface />
            </div>
        </main>
    );
}
