# Coding Standards & Naming Conventions

## 📏 Naming Conventions

### Files
- **React Components**: `PascalCase.tsx` (e.g., `Button.tsx`, `PlayerCard.tsx`)
- **Utilities/Helpers**: `camelCase.ts` (e.g., `formatScore.ts`, `calculatePar.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)
- **CSS Modules**: `ComponentName.module.css` (e.g., `Button.module.css`)
- **Global CSS**: `kebab-case.css` (e.g., `variables.css`, `globals.css`)
- **Hooks**: `use` prefix + `PascalCase.ts` (e.g., `useAuth.ts`, `usePlayerStats.ts`)

### Code Elements
- **React Components**: `PascalCase` (e.g., `Button`, `PlayerCard`)
- **Functions**: `camelCase` (e.g., `calculateFantasyPoints`, `formatPlayerName`)
- **Variables**: `camelCase` (e.g., `playerStats`, `teamScore`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_TEAM_SIZE`, `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `PlayerStats`, `LeagueSettings`)
- **Enums**: `PascalCase` for enum name, `PascalCase` for values (e.g., `LeagueStatus.Active`)
- **CSS Classes**: `camelCase` for modules, `kebab-case` for global (e.g., `.primaryButton`, `.flex-center`)
- **CSS Variables**: `kebab-case` (e.g., `--color-primary`, `--spacing-md`)

### Directories
- **React Components**: `components/` (flat) or `components/feature-name/` (grouped)
- **Pages**: `app/page-name/` (Next.js convention)
- **Utilities**: `lib/` or `utils/`
- **Types**: `types/`
- **Hooks**: `hooks/`
- **Styles**: `styles/`

## 🏗️ Component Structure

### Reusable UI Components
Location: `src/components/ui/`

**Button Variants:**
- Primary, Secondary, Tertiary
- Sizes: Small, Medium, Large
- States: Default, Hover, Active, Disabled

**Card Components:**
- Base Card (glass effect)
- Feature Card
- Player Card
- Stats Card

**Layout Components:**
- Container
- Grid
- Flex layouts

### Feature Components
Location: `src/components/`

Group by feature (e.g., `components/player/`, `components/league/`)

## 🎨 Design Token Usage

### Always Use CSS Variables
❌ **BAD:**
```css
.button {
  background: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
}
```

✅ **GOOD:**
```css
.button {
  background: var(--color-primary-500);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
}
```

### Spacing
Always use the spacing scale:
- `var(--spacing-xs)` - 4px
- `var(--spacing-sm)` - 8px
- `var(--spacing-md)` - 16px
- `var(--spacing-lg)` - 24px
- `var(--spacing-xl)` - 32px
- `var(--spacing-2xl)` - 48px
- `var(--spacing-3xl)` - 64px
- `var(--spacing-4xl)` - 96px

### Colors
Use semantic color names:
- `var(--color-primary-*)` - Primary brand colors
- `var(--color-accent-*)` - Accent/secondary colors
- `var(--text-primary)` - Main text
- `var(--text-secondary)` - Secondary text
- `var(--bg-primary)` - Main background

### Typography
- `var(--font-size-*)` - Font sizes (xs to 6xl)
- `var(--font-weight-*)` - Font weights
- `var(--line-height-*)` - Line heights

## 📦 Code Organization

### Function Size
Keep functions small and focused (< 20 lines when possible)

❌ **BAD:**
```typescript
function handleUserAction(data) {
  // 100 lines of mixed logic
}
```

✅ **GOOD:**
```typescript
function validateUserData(data: UserData): boolean { }
function saveUserToDatabase(data: UserData): Promise<void> { }
function sendWelcomeEmail(user: User): Promise<void> { }

function handleUserSignup(data: UserData): Promise<void> {
  if (!validateUserData(data)) return;
  await saveUserToDatabase(data);
  await sendWelcomeEmail(data);
}
```

### Reusability
Extract repeated patterns into components or utilities

❌ **BAD:**
```tsx
<div className="card">
  <h3>Title 1</h3>
  <p>Content 1</p>
</div>
<div className="card">
  <h3>Title 2</h3>
  <p>Content 2</p>
</div>
```

✅ **GOOD:**
```tsx
<Card title="Title 1" content="Content 1" />
<Card title="Title 2" content="Content 2" />
```

## 🎯 TypeScript Best Practices

### Type Everything
- No `any` types (use `unknown` if truly unknown)
- Use interfaces for objects
- Use type unions for restricted values
- Export types alongside components

### Example:
```typescript
// types/ui.ts
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// components/ui/Button.tsx
import type { ButtonProps } from '@/types/ui';

export function Button({ variant, size, children, ...props }: ButtonProps) {
  // implementation
}
```

## 📝 Documentation

### Component Documentation
```typescript
/**
 * Primary button component with multiple variants and sizes.
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({ ... }) { }
```

### Function Documentation
```typescript
/**
 * Calculates fantasy points based on player stats and scoring type.
 * 
 * @param stats - Player statistics object
 * @param scoringType - Type of scoring (standard, ppr, half_ppr)
 * @returns Total fantasy points rounded to 2 decimal places
 */
export function calculateFantasyPoints(
  stats: PlayerStats,
  scoringType: ScoringType
): number { }
```

## 🔄 Import Organization

Order imports logically:
```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal utilities
import { calculateScore } from '@/lib/scoring';
import { formatDate } from '@/lib/format';

// 4. Components
import { Button } from '@/components/ui/Button';
import { PlayerCard } from '@/components/player/PlayerCard';

// 5. Types
import type { Player, Team } from '@/types/database';

// 6. Styles
import styles from './Page.module.css';
```

## ✅ Checklist for Every File

- [ ] Follows naming convention
- [ ] Uses design tokens (no hardcoded values)
- [ ] Functions are small (<20 lines)
- [ ] Properly typed (TypeScript)
- [ ] Reusable where appropriate
- [ ] Documented (complex logic)
- [ ] Imports organized
- [ ] No console.logs (use proper logging)
