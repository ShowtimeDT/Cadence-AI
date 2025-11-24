interface LogoProps {
    size?: number;
    className?: string;
}

/**
 * Cadence Logo - Hexagonal badge with C and football laces
 * SVG recreation matching the original generated design
 */
export function Logo({ size = 72, className = '' }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Sky blue glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Gradient for hexagon border */}
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary-400)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity="1" />
                </linearGradient>
            </defs>

            {/* Outer hexagon with sky blue border */}
            <path
                d="M 60 10 
           L 100 35 
           L 100 85 
           L 60 110 
           L 20 85 
           L 20 35 
           Z"
                fill="none"
                stroke="url(#hexGradient)"
                strokeWidth="3"
                filter="url(#glow)"
            />

            {/* Inner hexagon - subtle */}
            <path
                d="M 60 15 
           L 95 37 
           L 95 83 
           L 60 105 
           L 25 83 
           L 25 37 
           Z"
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="0.5"
                opacity="0.2"
            />

            {/* Letter C - bold and clean */}
            <path
                d="M 75 40
           C 85 40, 90 45, 90 55
           L 90 65
           C 90 75, 85 80, 75 80
           L 60 80
           C 45 80, 40 75, 40 65
           L 40 55
           C 40 45, 45 40, 60 40
           L 70 40
           
           M 70 48
           L 60 48
           C 52 48, 50 50, 50 55
           L 50 65
           C 50 70, 52 72, 60 72
           L 65 72"
                fill="var(--text-primary)"
                strokeWidth="0"
            />

            {/* Football laces - sky blue */}
            <g stroke="var(--color-primary-400)" strokeWidth="2" strokeLinecap="round">
                {/* Vertical center line */}
                <line x1="62" y1="52" x2="62" y2="68" strokeWidth="2.5" />

                {/* Horizontal laces */}
                <line x1="58" y1="52" x2="66" y2="52" />
                <line x1="58" y1="56" x2="66" y2="56" />
                <line x1="58" y1="60" x2="66" y2="60" />
                <line x1="58" y1="64" x2="66" y2="64" />
                <line x1="58" y1="68" x2="66" y2="68" />
            </g>
        </svg>
    );
}
