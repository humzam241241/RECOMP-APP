# RECOMP - 90 Day Body Recomposition App

A production-ready Next.js application for tracking a 90-day body recomposition journey with workout tracking, nutrition logging, habit/dopamine management, and mindset lessons.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5 (JWT strategy, PrismaAdapter)
- **Server State:** React Query (TanStack Query)
- **Client State:** Zustand
- **API:** REST routes (Node.js runtime)

## Features

### Core Modules

1. **Journey Tracking** - 90-day progression through Foundation → Build → Optimize phases
2. **Workout Sessions** - Push/Pull/Legs rotation with exercise sets and progressive overload tracking
3. **Nutrition Planning** - Macro tracking with phase-adjusted targets
4. **Dopamine System** - Good/bad habit logging with bonuses (first win, swap, streak)
5. **Mindset Lessons** - Daily unlockable content for mental development

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/journey/today` | Get current journey state |
| GET | `/api/me/workouts/today` | Get today's workout session |
| PATCH | `/api/me/workouts/[sessionId]` | Update workout/sets |
| GET | `/api/me/nutrition/today` | Get today's nutrition plan |
| PATCH | `/api/me/nutrition/today/log` | Log a meal |
| GET | `/api/me/dopamine/today` | Get dopamine state |
| POST | `/api/me/dopamine/log` | Log a habit |
| GET | `/api/me/mindset/today` | Get mindset lessons |
| PATCH | `/api/me/mindset/[lessonId]/complete` | Complete a lesson |

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Create `.env.local` (recommended) or `.env`:

```bash
# Copy example
cp env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/recomp?schema=public"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secret:
```bash
openssl rand -base64 32
```

3. **Setup database:**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npm run seed
```

4. **Start development server:**

```bash
npm run dev
```

5. **Open http://localhost:3000**

### How to Run on Windows

**One-Click Startup:**

Double-click `start.bat` or run:
```bash
npm run start:win
```

The script will:
- ✅ Check and start PostgreSQL if needed
- ✅ Free port 3000 (kill existing processes)
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Seed database (if seed.ts exists)
- ✅ Start Next.js dev server
- ✅ Verify Google OAuth configuration

**Manual Steps (if needed):**

1. Ensure PostgreSQL is running on `localhost:5432`
2. Create `.env.local` with your configuration
3. Run `npm run start:win` or double-click `start.bat`

**Verification:**

After startup, check:
- Server: http://localhost:3000
- Auth providers: http://localhost:3000/api/auth/providers
  - Should show `google` provider with client ID suffix

### Demo Credentials

After seeding:
- **Email:** demo@recomp.app
- **Password:** demo1234

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handlers
│   │   └── me/                    # Protected API routes
│   │       ├── journey/today/
│   │       ├── workouts/
│   │       ├── nutrition/
│   │       ├── dopamine/
│   │       └── mindset/
│   ├── layout.tsx
│   └── page.tsx
├── hooks/
│   └── useTodayQueries.ts         # React Query hooks
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── auth-utils.ts              # Auth helpers
│   ├── prisma.ts                  # Prisma singleton
│   └── today-service.ts           # Core business logic
├── providers/
│   └── query-provider.tsx         # React Query provider
├── stores/
│   ├── journey-store.ts           # Zustand stores
│   ├── today-store.ts
│   ├── dopamine-store.ts
│   └── mindset-store.ts
└── types/
    ├── dto.ts                     # API response types
    └── next-auth.d.ts             # NextAuth type extensions

prisma/
├── schema.prisma                  # Database schema
└── seed.ts                        # Demo data seeder
```

## Dopamine System

The dopamine tracking system incentivizes good habits with a scoring mechanism:

### Scoring

- **Good habit:** +10 points
- **Bad habit:** -5 points
- **First win bonus:** +5 points (first good habit of the day)
- **Swap bonus:** +15 points (log good habit within 60 min of bad habit)
- **Streak bonus:** +10 points (consecutive days with good habits)
- **Perfect day:** Deferred to end-of-day processing

### Default Habits

**Good Habits:**
- Morning Workout, 8 Hours Sleep, Hit Protein Goal
- 10 Min Meditation, 10K Steps, Drink 3L Water
- Cold Shower, Read 20 Pages

**Bad Habits:**
- Social Media Scrolling, Late Night Snacking
- Skipped Workout, Alcohol, Processed Food
- Less Than 6h Sleep

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run seed         # Seed database with demo data
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Phase System

| Phase | Days | Focus |
|-------|------|-------|
| Foundation | 1-30 | Build habits, learn movements |
| Build | 31-60 | Progressive overload, volume increase |
| Optimize | 61-90 | Peak performance, fine-tuning |

Nutrition targets adjust per phase:

| Phase | Calories | Protein | Carbs | Fat |
|-------|----------|---------|-------|-----|
| Foundation | 2000 | 150g | 200g | 70g |
| Build | 2200 | 170g | 220g | 75g |
| Optimize | 2400 | 180g | 250g | 80g |

## Workout Rotation

7-day cycle: Push → Pull → Legs → Rest → Push → Pull → Legs

Each workout includes 5 exercises with 3-4 sets targeting different rep ranges for strength and hypertrophy.

## License

MIT
