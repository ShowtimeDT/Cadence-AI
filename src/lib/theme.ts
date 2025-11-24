/**
 * Theme Customization Utilities
 * 
 * This file provides utilities for applying custom user themes.
 * Users can customize their primary color (e.g., favorite NFL team color)
 * and the system will automatically generate all necessary shades and alpha variants.
 */

export interface ThemeColors {
    primary: {
        hue: number;        // 0-360
        saturation: number; // 0-100
        lightness: number;  // 0-100
    };
}

/**
 * Generate a complete color palette from a single HSL color.
 * Creates 10 shades (50-900) for use throughout the application.
 * 
 * @param hue - Hue value (0-360)
 * @param saturation - Saturation percentage (0-100)
 * @param baseLightness - Base lightness for the 500 shade (typically 45-55)
 * @returns Object with color shades from 50 (lightest) to 900 (darkest)
 */
function generateColorScale(
    hue: number,
    saturation: number,
    baseLightness: number
) {
    return {
        50: `hsl(${hue}, ${saturation}%, ${Math.min(baseLightness + 42, 97)}%)`,
        100: `hsl(${hue}, ${saturation - 5}%, ${Math.min(baseLightness + 37, 92)}%)`,
        200: `hsl(${hue}, ${saturation - 10}%, ${Math.min(baseLightness + 30, 85)}%)`,
        300: `hsl(${hue}, ${saturation - 5}%, ${Math.min(baseLightness + 20, 75)}%)`,
        400: `hsl(${hue}, ${saturation}%, ${Math.min(baseLightness + 10, 65)}%)`,
        500: `hsl(${hue}, ${saturation}%, ${baseLightness}%)`, // Base color
        600: `hsl(${hue}, ${saturation}%, ${Math.max(baseLightness - 10, 45)}%)`,
        700: `hsl(${hue}, ${saturation}%, ${Math.max(baseLightness - 20, 35)}%)`,
        800: `hsl(${hue}, ${saturation}%, ${Math.max(baseLightness - 30, 25)}%)`,
        900: `hsl(${hue}, ${saturation}%, ${Math.max(baseLightness - 40, 15)}%)`,
    };
}

/**
 * Apply a custom theme by setting CSS custom properties.
 * This updates all primary color shades and alpha variants.
 * 
 * @param colors - Theme color configuration
 * 
 * @example
 * // Ravens purple theme
 * applyCustomTheme({
 *   primary: { hue: 270, saturation: 60, lightness: 50 }
 * });
 * 
 * @example
 * // 49ers red theme
 * applyCustomTheme({
 *   primary: { hue: 0, saturation: 75, lightness: 45 }
 * });
 */
export function applyCustomTheme(colors: ThemeColors): void {
    const { hue, saturation, lightness } = colors.primary;
    const scale = generateColorScale(hue, saturation, lightness);

    // Apply all primary color shades
    Object.entries(scale).forEach(([shade, value]) => {
        document.documentElement.style.setProperty(
            `--color-primary-${shade}`,
            value
        );
    });

    // Update alpha color variants for effects
    // These use the base 500 shade with various opacity levels
    document.documentElement.style.setProperty(
        '--primary-glow-subtle',
        `hsla(${hue}, ${saturation}%, ${lightness}%, 0.08)`
    );
    document.documentElement.style.setProperty(
        '--primary-glow-moderate',
        `hsla(${hue}, ${saturation}%, ${lightness}%, 0.12)`
    );
    document.documentElement.style.setProperty(
        '--primary-bg-subtle',
        `hsla(${hue}, ${saturation}%, ${lightness}%, 0.1)`
    );
    document.documentElement.style.setProperty(
        '--primary-border-subtle',
        `hsla(${hue}, ${saturation}%, ${lightness}%, 0.25)`
    );
    document.documentElement.style.setProperty(
        '--primary-shadow-subtle',
        `hsla(${hue}, ${saturation}%, ${lightness}%, 0.15)`
    );

    // Update shadow color for primary buttons
    document.documentElement.style.setProperty(
        '--shadow-primary',
        `0 8px 24px -4px hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`
    );
    document.documentElement.style.setProperty(
        '--shadow-primary-lg',
        `0 12px 32px -4px hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`
    );
}

/**
 * Reset theme to default (sky blue)
 */
export function resetToDefaultTheme(): void {
    applyCustomTheme({
        primary: { hue: 200, saturation: 85, lightness: 55 },
    });
}

/**
 * NFL Team Color Presets
 * Curated color themes for all NFL teams
 */
export const NFL_TEAM_THEMES: Record<string, ThemeColors> = {
    // AFC East
    bills: { primary: { hue: 215, saturation: 75, lightness: 50 } }, // Bills blue
    dolphins: { primary: { hue: 185, saturation: 85, lightness: 45 } }, // Aqua
    patriots: { primary: { hue: 220, saturation: 65, lightness: 35 } }, // Navy
    jets: { primary: { hue: 140, saturation: 70, lightness: 35 } }, // Green

    // AFC North
    ravens: { primary: { hue: 270, saturation: 60, lightness: 30 } }, // Purple
    bengals: { primary: { hue: 20, saturation: 85, lightness: 50 } }, // Orange
    browns: { primary: { hue: 20, saturation: 70, lightness: 40 } }, // Brown
    steelers: { primary: { hue: 45, saturation: 85, lightness: 50 } }, // Gold

    // AFC South
    texans: { primary: { hue: 355, saturation: 80, lightness: 40 } }, // Deep red
    colts: { primary: { hue: 220, saturation: 75, lightness: 45 } }, // Blue
    jaguars: { primary: { hue: 180, saturation: 75, lightness: 40 } }, // Teal
    titans: { primary: { hue: 205, saturation: 80, lightness: 45 } }, // Light blue

    // AFC West
    broncos: { primary: { hue: 25, saturation: 85, lightness: 50 } }, // Orange
    chiefs: { primary: { hue: 0, saturation: 85, lightness: 45 } }, // Red
    raiders: { primary: { hue: 0, saturation: 0, lightness: 15 } }, // Silver/Black
    chargers: { primary: { hue: 195, saturation: 85, lightness: 55 } }, // Powder blue

    // NFC East
    cowboys: { primary: { hue: 215, saturation: 75, lightness: 45 } }, // Navy
    giants: { primary: { hue: 220, saturation: 75, lightness: 50 } }, // Blue
    eagles: { primary: { hue: 170, saturation: 70, lightness: 35 } }, // Green
    commanders: { primary: { hue: 350, saturation: 75, lightness: 40 } }, // Burgundy

    // NFC North
    bears: { primary: { hue: 220, saturation: 80, lightness: 35 } }, // Navy
    lions: { primary: { hue: 205, saturation: 75, lightness: 50 } }, // Honolulu blue
    packers: { primary: { hue: 80, saturation: 60, lightness: 30 } }, // Green
    vikings: { primary: { hue: 270, saturation: 70, lightness: 35 } }, // Purple

    // NFC South
    falcons: { primary: { hue: 0, saturation: 85, lightness: 40 } }, // Red
    panthers: { primary: { hue: 200, saturation: 75, lightness: 45 } }, // Blue
    saints: { primary: { hue: 45, saturation: 85, lightness: 50 } }, // Gold
    buccaneers: { primary: { hue: 0, saturation: 85, lightness: 35 } }, // Red

    // NFC West
    cardinals: { primary: { hue: 0, saturation: 80, lightness: 40 } }, // Cardinal red
    rams: { primary: { hue: 220, saturation: 75, lightness: 45 } }, // Blue
    niners: { primary: { hue: 0, saturation: 85, lightness: 45 } }, // 49ers red
    seahawks: { primary: { hue: 210, saturation: 75, lightness: 30 } }, // Navy
};

/**
 * Apply an NFL team theme
 * 
 * @param teamKey - Team key from NFL_TEAM_THEMES
 * 
 * @example
 * applyNFLTeamTheme('ravens'); // Purple theme
 */
export function applyNFLTeamTheme(teamKey: keyof typeof NFL_TEAM_THEMES): void {
    const theme = NFL_TEAM_THEMES[teamKey];
    if (theme) {
        applyCustomTheme(theme);
    }
}

/**
 * Save user's theme preference to localStorage
 */
export function saveThemePreference(colors: ThemeColors): void {
    localStorage.setItem('userTheme', JSON.stringify(colors));
}

/**
 * Load and apply saved theme preference
 */
export function loadSavedTheme(): void {
    const saved = localStorage.getItem('userTheme');
    if (saved) {
        try {
            const theme = JSON.parse(saved) as ThemeColors;
            applyCustomTheme(theme);
        } catch {
            // Invalid saved theme, use default
            resetToDefaultTheme();
        }
    }
}
