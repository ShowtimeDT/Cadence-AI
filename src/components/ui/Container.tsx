import type { ContainerProps } from '@/types/ui';
import styles from './Container.module.css';

/**
 * Responsive container component with multiple size options.
 * Centers content and applies consistent padding.
 * 
 * @example
 * <Container size="lg">
 *   <h1>Page Content</h1>
 * </Container>
 */
export function Container({
    children,
    size = 'lg',
    className = '',
}: ContainerProps) {
    const classNames = [
        styles.container,
        styles[size],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={classNames}>{children}</div>;
}
