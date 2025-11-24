# Design Principles & Brand Guidelines

## 🎨 Brand Identity

### Vision
An **elegant, upscale** fantasy football platform that feels premium, sophisticated, and professional while remaining accessible and user-friendly.

### Brand Personality
- **Elegant**: Refined aesthetic with attention to detail
- **Upscale**: Premium feel that commands respect
- **Modern**: Contemporary design patterns and interactions
- **Professional**: Trustworthy and serious about fantasy football
- **Accessible**: Beautiful for everyone, regardless of ability

---

## 🌈 Color Philosophy

### Primary Brand Colors

#### Sky Blue
**Purpose**: Energy, clarity, strategic thinking
- Represents the competitive spirit of fantasy football
- Conveys intelligence and calculated decisions
- Primary CTA color for important actions

#### Dark Gunmetal Grey
**Purpose**: Sophistication, stability, premium quality
- Creates an upscale, refined atmosphere
- Provides excellent contrast for readability
- Main background and structural color

#### Black
**Purpose**: Elegance, power, depth
- Adds drama and premium feel
- Used for deep backgrounds and emphasis
- Creates sophisticated contrast

### Color Usage Guidelines

**Primary Actions**: Sky blue (Create League, Draft Player, Save Changes)
**Secondary Actions**: Lighter sky blue or gunmetal with transparency
**Backgrounds**: Gunmetal grey gradients, black for depth
**Text**: White/light grey on dark, gunmetal on light
**Accents**: Sky blue highlights, subtle glows
**Success States**: Lighter sky blue
**Warnings**: Amber (muted, sophisticated)
**Errors**: Muted red (not bright, maintains elegance)

---

## 🎭 Design Principles

### 1. Elegant Minimalism
- **Clean layouts** with generous white space
- **Purposeful elements** - every component earns its place
- **Subtle sophistication** over flashy effects
- **Quality over quantity** in visual elements

### 2. Premium Materials
- **Glassmorphism** for elevated, modern feel
- **Soft shadows** for depth without harshness
- **Smooth gradients** that feel natural
- **High-quality typography** (Inter font family)

### 3. Refined Motion
- **Smooth animations** at 60fps
- **Purposeful transitions** that guide the eye
- **Subtle microinteractions** for feedback
- **Elegant easing** (cubic-bezier curves)
- Never jarring or distracting

### 4. Sophisticated Typography
- **Clear hierarchy** with purposeful sizing
- **Generous line spacing** for readability
- **Limited font weights** (300, 400, 600, 700)
- **Professional letter spacing** (-0.02em for headings)

### 5. Accessible Luxury
- **AAA contrast ratios** while maintaining elegance
- **Graceful degradation** for all abilities
- **Keyboard navigation** with visible focus states
- **Screen reader friendly** with semantic HTML

### 6. Intelligent Spacing
- **8px base grid** for consistency
- **Generous padding** in interactive elements
- **Breathing room** between sections
- **Balanced composition** throughout

---

## 🏗️ Component Design Standards

### Buttons
- **Primary**: Sky blue gradient, soft shadow, subtle glow on hover
- **Secondary**: Transparent with sky blue border, glassmorphism
- **Size**: Comfortable touch targets (44px minimum height)
- **States**: Smooth transitions between states
- **Disabled**: 50% opacity, no hover effects

### Cards
- **Background**: Dark gunmetal with subtle transparency
- **Border**: 1px subtle border or none
- **Shadow**: Soft, elevated shadow
- **Hover**: Gentle lift (-8px) with enhanced shadow
- **Corner radius**: 16-24px for premium feel

### Inputs
- **Background**: Slightly lighter gunmetal
- **Border**: Subtle, becomes sky blue on focus
- **Focus state**: Sky blue glow (not harsh)
- **Padding**: Generous for comfortable interaction

### Navigation
- **Minimal**: Clean, uncluttered
- **Sticky**: Smooth scroll behavior
- **Highlight**: Sky blue for active states
- **Hierarchy**: Clear primary/secondary actions

---

## 📐 Layout Principles

### Grid System
- **12-column grid** for flexibility
- **Consistent gutters** (24px standard)
- **Max-width containers** for comfortable reading
- **Responsive breakpoints**: 640px, 768px, 1024px, 1280px

### Spacing Scale
- **4px base unit** (kept consistent)
- **Ratios**: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px), 3xl(64px), 4xl(96px)
- **Vertical rhythm**: Consistent spacing between sections

### Whitespace
- **Never cramped**: Always room to breathe
- **Purposeful density**: Tight where needed (data tables), loose everywhere else
- **Balanced asymmetry**: Not always centered, but always balanced

---

## ✨ Visual Effects

### Shadows
- **Soft, diffused** shadows (no hard edges)
- **Multi-layer** for depth (combine blur sizes)
- **Colored shadows** (sky blue glow for CTAs)
- **Never black** shadows (use gunmetal with opacity)

### Gradients
- **Subtle transitions** (30-60 degree angles)
- **Sky blue to darker blue** for primary elements
- **Gunmetal to black** for backgrounds
- **Never harsh** color jumps

### Glassmorphism
- **Backdrop blur**: 10-20px
- **Subtle transparency**: 5-10% white overlay
- **Delicate borders**: 1px with 10-20% white
- **Layer depth**: Multiple glass layers for depth

### Animations
- **Duration**: 150-350ms (fast: 150ms, base: 250ms, slow: 350ms)
- **Easing**: cubic-bezier(0.4, 0.0, 0.2, 1) for elegance
- **Transform-based**: Use transform for performance
- **Purposeful**: Every animation has meaning

---

## 🎯 Component Hierarchy

### Primary Elements
- Main CTAs (Create League, Draft)
- Active navigation items
- Critical alerts
**Color**: Sky blue, prominent

### Secondary Elements
- Supporting actions
- Informational cards
- Data displays
**Color**: Gunmetal, subtle sky blue accents

### Tertiary Elements
- Background elements
- Decorative details
- Subtle indicators
**Color**: Black, deep gunmetal

---

## 📱 Responsive Design

### Mobile First
- **Design for mobile**, enhance for desktop
- **Touch targets**: Minimum 44x44px
- **Readable text**: Minimum 16px
- **Comfortable spacing**: Extra padding on mobile

### Breakpoint Strategy
- **Mobile**: Up to 640px (single column, stacked)
- **Tablet**: 640-1024px (2 columns, adapted layouts)
- **Desktop**: 1024px+ (full layouts, multiple columns)
- **Large**: 1280px+ (max width, centered)

---

## 🔤 Typography Scale

### Font Family
**Primary**: Inter (Google Fonts)
- Professional, modern, excellent readability
- Wide range of weights for hierarchy

### Hierarchy
- **Hero (60px)**: Landing page headlines
- **H1 (48px)**: Page titles
- **H2 (36px)**: Section headers
- **H3 (30px)**: Subsection headers
- **H4 (24px)**: Card titles
- **H5 (20px)**: Small headings
- **H6 (18px)**: Subtle headings
- **Body (16px)**: Standard text
- **Small (14px)**: Supporting text
- **XSmall (12px)**: Captions, labels

### Line Height
- **Tight (1.2)**: Headings, display text
- **Normal (1.5)**: Body text, UI elements
- **Relaxed (1.75)**: Long-form content

---

## 🎨 Accessibility Standards

### Contrast
- **AAA compliance** for all text
- **4.5:1 minimum** for normal text
- **3:1 minimum** for large text
- **Sky blue on black**: High contrast approved

### Focus States
- **Visible indicators** (sky blue outline)
- **Never remove** focus styles
- **Consistent across** all interactive elements
- **3px outline** for visibility

### Motion
- **Respect prefers-reduced-motion**
- **Disable animations** when requested
- **Maintain functionality** without animation

---

## 🎪 Customization Support

### User Theming
While our brand uses sky blue, gunmetal, and black:
- Users can **customize primary color** to any team
- System **maintains contrast ratios**
- **Shades auto-generated** from user choice
- **Elegant preset themes** for NFL teams

### Dark Mode (Default)
- **Default theme**: Dark gunmetal backgrounds
- **Light mode available**: Inverted with care
- **Smooth transition**: 250ms theme switch

---

## ✅ Design Checklist

Every component should:
- [ ] Use design tokens (no hardcoded colors)
- [ ] Meet AAA accessibility standards
- [ ] Have smooth 60fps animations
- [ ] Work on mobile and desktop
- [ ] Support keyboard navigation
- [ ] Have clear focus states
- [ ] Feel elegant and premium
- [ ] Use glassmorphism appropriately
- [ ] Follow spacing scale
- [ ] Maintain visual hierarchy

---

## 🚀 Implementation Notes

### CSS Variables
All colors, spacing, shadows defined as CSS variables in `variables.css`

### Component Library
Reusable components in `src/components/ui/` follow these principles

### Naming Convention
- Colors: `--color-primary-*`, `--color-gunmetal-*`
- Spacing: `--spacing-*`
- Effects: `--shadow-*`, `--radius-*`

---

**Remember**: Elegance is in the details. Every pixel, every transition, every color choice should feel intentional and sophisticated.
