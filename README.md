# Cadence - AI-Powered Fantasy Football

> **The next-generation fantasy football platform** powered by AI insights, real-time data, and industry-leading accessibility.

## 🚀 Vision

Build an AI-first fantasy football platform that empowers **all users**—regardless of physical ability or football knowledge—to compete, strategize, and dominate their leagues. We prioritize accessibility (AAA), security, privacy, and a premium user experience with cutting-edge AI features powered by GPT-5.

## ✨ Key Features

### 🤖 Cadence AI - Your Fantasy Assistant
- **AI Draft Assistant**: Predicts player availability and suggests optimal picks
- **AI Lineup Optimizer**: Automatically set your lineup based on projections
- **AI Trade Analyzer**: Evaluate trades with "Help Us Both" or "Ultra-Aggressive" modes
- **AI Pickup Suggestions**: Personalized waiver wire recommendations
- **Conversational AI**: Ask Cadence AI anything about your team, matchups, or strategy
- **AI Projections**: Aggregated insights from multiple sources

### 📊 Points Above Replacement (PAR)
- **True Value Metrics**: Understand player value relative to replacement level
- **Position-Specific Baselines**: Know who's truly valuable at each position
- **AI-Enhanced Rankings**: Rankings based on PAR, not just raw points

### 🏆 Awards & Achievements
- **Weekly Awards**: Highest Scorer, Biggest Upset, Closest Matchup, etc.
- **Season Aggregates**: Track awards all season long
- **Competitive Fun**: Recognition beyond just wins and losses

### ⚡ Live Scoring (20-Second Updates)
- **Real-Time Fantasy Scoring**: Updates every 20 seconds during games
- **Interactive Matchups**: Creative, engaging matchup views
- **Fantasy-First Design**: NFL scores minimized, fantasy matchups center stage

### 🔄 Halftime Substitutions
- **Injury Protection**: Sub players at halftime if starter gets injured
- **Only 2nd Half Counts**: Substitute's first half doesn't count
- **Unique Format**: Never-before-seen league type

### 🎨 Fully Customizable
- **Custom Scoring**: Configure any stat, any point value
- **League Import**: Bring your entire league history from ESPN/Sleeper/Yahoo
- **AI League Setup**: Natural language league creation
- **Theme Customization**: Team-specific themes or full color wheel

### ♿ Accessibility & Security
- **AAA WCAG Compliance**: Industry-leading accessibility
- **Privacy-First**: Minimal data collection, user data control
- **Top-Tier Security**: OWASP best practices, regular audits

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** (App Router, React Server Components)
- **TypeScript** (Full type safety)
- **Vanilla CSS** (Glassmorphism design, smooth 60fps animations)
- **React Query** (Server state management)

### Backend & Database
- **Supabase** (PostgreSQL with RLS)
- **Sleeper API** (Live NFL data)
- **ESPN API** (Backup)

### AI & ML
- **OpenAI API / Anthropic Claude** (Conversational AI)
- **Custom ML** (Projection aggregation, PAR calculations)
- **DALL-E / Stable Diffusion** (AI image generation)

### Infrastructure
- **Vercel** (Hosting, edge functions)
- **Supabase Auth** (Authentication)
- **Supabase Storage** (File storage)

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier)
- **Git**

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd fantasy-football
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration (add when ready)
# OPENAI_API_KEY=your-openai-key
# ANTHROPIC_API_KEY=your-anthropic-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the schema in `supabase/schema.sql`
4. Verify all tables are created

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📁 Project Structure

```
fantasy-football/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/         # Supabase client configs
│   │   │   ├── client.ts     # Browser client
│   │   │   ├── server.ts     # Server client
│   │   │   └── middleware.ts # Session management
│   │   └── sleeper.ts        # Sleeper API integration
│   ├── types/                 # TypeScript type definitions
│   │   └── database.ts       # Database types
│   ├── hooks/                 # Custom React hooks
│   ├── styles/               # CSS files
│   │   └── variables.css     # CSS custom properties
│   └── middleware.ts         # Next.js middleware
├── supabase/
│   └── schema.sql            # Database schema
├── public/                    # Static files
├── .env.local                # Environment variables (not in git)
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── next.config.ts            # Next.js config
```

## 🎯 Development Roadmap

### ✅ Sprint 1: Foundation Setup (COMPLETED)
- Next.js project initialized
- Design system created (glassmorphism, CSS variables)
- Supabase integration configured
- Database schema designed

### 🔄 Sprint 2: Player Database & AI Integration (Weeks 3-4)
- Sleeper API integration
- Player database with halftime stats
- AI API integration (OpenAI/Claude)
- Player profiles with PAR metrics
- AI projection system

### 📍 Sprint 3: Live Scoring & Matchups (Weeks 5-6)
- Real-time scoring (20s updates)
- Interactive matchup views
- Weekly awards system
- Glassmorphism UI

### 🔜 Sprint 4: Waiver Wire & Transactions (Weeks 7-8)
- Waiver system with AI suggestions
- Transaction processing
- FAAB support

### 🔜 Sprint 5: Draft System (Weeks 9-10)
- Live draft with AI assistant
- Color-coded draft board
- Pick grading system
- AI autodraft

### 🔜 Sprint 6: User & League Management (Weeks 11-12)
- Authentication & profiles
- League creation (AI setup)
- League import (ESPN/Sleeper/Yahoo)
- Redesigned dashboards

### 🔜 Sprint 7: Polish & Testing (Weeks 13-14)
- AAA accessibility testing
- Security audit
- Performance optimization
- Production deployment

## 🔑 Key Principles

### Code Quality
- **Small Functions**: Each function does one thing well
- **Reusable Code**: DRY principles throughout
- **Type Safety**: TypeScript for all code
- **Clean Code**: ESLint + Prettier

### Design
- **Glassmorphism**: Modern glass design patterns
- **Smooth Animations**: 60fps, hardware-accelerated
- **Mobile-First**: Optimized for mobile devices
- **Accessible**: AAA WCAG compliance

### Security & Privacy
- **Minimal Data Collection**: Only what's necessary
- **Row Level Security**: Database-level permissions
- **OWASP Compliance**: Industry best practices
- **Transparent**: Clear privacy policies

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

The app is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📚 Documentation

- [Implementation Plan](../.gemini/antigravity/brain/4f9ea1b4-097d-4b95-8f3b-e663dd52ea99/implementation_plan.md) - Comprehensive feature and technical plan
- [Database Schema](./supabase/schema.sql) - Complete database structure
- [API Documentation](./docs/api.md) - API endpoints (coming soon)

## 🤝 Contributing

This is a private project, but contributions are welcome from team members.

### Development Workflow
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review
5. Merge after approval

## 📄 License

Private project - All rights reserved

## 🎯 Success Metrics

### Technical
- ⚡ Page load < 2 seconds
- 🔄 99.9% uptime during NFL season
- 📱 Mobile-first responsive
- ♿ AAA accessibility compliant
- 🔒 A+ security rating

### User Experience
- 🤖 High AI feature engagement
- 📊 Strong weekly active users
- 🏆 High draft completion rate
- 💬 Active league chats
- ⭐ High user satisfaction (NPS)

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review the implementation plan
3. Contact the development team

---

**Built with ❤️ for fantasy football managers everywhere**
