// UI component prop types
export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    glassmorphism?: boolean;
}

export interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    delay?: number;
}

export interface ContainerProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}
