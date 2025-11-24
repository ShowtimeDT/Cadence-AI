import type { FeatureCardProps } from '@/types/ui';
import { Card } from './Card';
import styles from './FeatureCard.module.css';

/**
 * Feature card component for displaying key features on landing page.
 * Includes icon, title, and description with staggered animation.
 * 
 * @example
 * <FeatureCard 
 *   icon="📊" 
 *   title="Live Scoring" 
 *   description="Real-time updates"
 *   delay={0.1}
 * />
 */
export function FeatureCard({
    icon,
    title,
    description,
    delay = 0,
}: FeatureCardProps) {
    return (
        <Card hoverable glassmorphism>
            <div
                className={styles.featureCard}
                style={{ animationDelay: `${delay}s` }}
            >
                <div className={styles.icon}>{icon}</div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
        </Card>
    );
}
