import type { ButtonProps } from '@/types/ui';
import styles from './Button.module.css';

/**
 * Primary button component with multiple variants and sizes.
 * Uses design tokens for consistent styling across the application.
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    type = 'button',
    fullWidth = false,
}: ButtonProps) {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label={typeof children === 'string' ? children : undefined}
        >
            {children}
        </button>
    );
}
