import type { CardProps } from '@/types/ui';
import styles from './Card.module.css';

/**
 * Base card component with optional glassmorphism effect.
 * 
 * @example
 * <Card glassmorphism hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 */
export function Card({
    children,
    className = '',
    hoverable = false,
    glassmorphism = true,
}: CardProps) {
    const classNames = [
        styles.card,
        glassmorphism && styles.glassmorphism,
        hoverable && styles.hoverable,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={classNames}>{children}</div>;
}
