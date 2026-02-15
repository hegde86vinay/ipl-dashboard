# IPL Dashboard (2008-2024)

Interactive analytics dashboard for 17 seasons of Indian Premier League cricket. Explore team records, player stats, head-to-head matchups, and match history across 1,095 matches and 741 players.

**Live:** [ipl-dashboard-2008-24.vercel.app](https://ipl-dashboard-2008-24.vercel.app)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Database | SQLite (local) / Turso libSQL (production) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Deployment | Vercel + Turso Cloud |

---

## Architecture

```
                CSV Files (matches.csv, deliveries.csv)
                              |
                    scripts/seed.ts
                    (normalize + import)
                              |
                 SQLite Database (5 tables)
                              |
                 @libsql/client (dual mode)
               /                          \
      file:data/ipl.db              Turso Cloud
        (development)               (production)
               \                          /
                  Query Layer (async)
                  src/lib/queries/
                              |
              +---------+----------+---------+
              |         |          |         |
          overview   teams    players   matches
            .ts       .ts       .ts       .ts
              |         |          |         |
              +---------+----------+---------+
                              |
               +-------- API Routes --------+
               |    /api/overview           |
               |    /api/teams              |
               |    /api/players            |
               |    /api/matches            |
               |    /api/head-to-head       |
               +----------------------------+
                     |              |
            Server Components  Client Components
            (direct query)     (fetch from API)
                     |              |
                  Recharts + shadcn/ui + Tailwind
```

### Data Flow

1. **Raw Data**: Two CSV files - `matches.csv` (1,095 rows) and `deliveries.csv` (260,920 rows)
2. **Normalization**: `seed.ts` cleans team names (19 raw to 15 canonical), venue names (58 to 40), and season formats
3. **Database**: Normalized into 5 relational tables with foreign keys and 11 indexes
4. **Dual Mode**: `@libsql/client` connects to local SQLite file in dev, Turso cloud in production
5. **Query Layer**: Async functions with `Promise.all()` for parallel query execution
6. **Rendering**: Server components call queries directly; client components fetch via API routes

---

## Database Schema

```sql
teams (15 rows)
  id, name, slug, short_code, color, is_active

venues (40 rows)
  id, name, city

players (741 rows)
  id, name

matches (1,095 rows)
  id, season, match_date, match_type,
  team1_id, team2_id, winner_id, toss_winner_id,
  venue_id, player_of_match_id,
  result, result_margin, super_over

deliveries (260,920 rows)
  id, match_id, inning, over_num, ball_num,
  batting_team_id, bowling_team_id,
  batter_id, bowler_id, non_striker_id,
  batsman_runs, extra_runs, total_runs,
  is_wicket, dismissal_kind, player_dismissed_id
```

---

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Overview with KPIs, season charts, leaderboards |
| `/teams` | Server | All 15 franchises with win records |
| `/teams/[slug]` | Server | Team detail - season trend, H2H, venues, top players |
| `/players` | Client | Search 741 players with debounced input |
| `/players/[id]` | Server | Batting + bowling stats, season charts, opponent breakdown |
| `/head-to-head` | Client | Compare any two teams across all seasons |
| `/matches` | Client | Filter and browse all 1,095 matches with infinite scroll |

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/overview` | Dashboard KPIs, leaderboards, season trends |
| `GET /api/teams` | All teams with win/loss/title stats |
| `GET /api/teams/[slug]` | Full team profile (H2H, venues, seasons) |
| `GET /api/teams/[slug]/players` | Top batters and bowlers for a team |
| `GET /api/players?search=` | Paginated player search |
| `GET /api/players/[id]` | Complete player profile with 9 stat categories |
| `GET /api/head-to-head?team1=&team2=` | Head-to-head comparison |
| `GET /api/matches` | Filtered match search with pagination |

---

## Project Structure

```
src/
  app/
    api/                # 8 API route handlers
    teams/              # Team listing + detail pages
    players/            # Player search + detail pages
    head-to-head/       # Team comparison page
    matches/            # Match finder with filters
    page.tsx            # Overview dashboard
    layout.tsx          # Root layout with sidebar
  components/
    cards/              # StatCard, TeamCard, MatchCard
    charts/             # 7 Recharts visualizations (Area, Bar, Line)
    layout/             # Responsive sidebar with mobile hamburger menu
    ui/                 # 14 shadcn/ui primitives
  lib/
    db.ts               # Database client (local SQLite / Turso cloud)
    types.ts            # TypeScript interfaces
    normalization.ts    # Team, venue, and season normalization maps
    queries/            # 5 async query modules with Promise.all
  hooks/
    use-debounce.ts     # Debounce hook for search input
scripts/
  seed.ts               # CSV-to-SQLite importer with normalization
```

---

## Data Normalization

The raw IPL CSV data required significant cleaning:

**Team Names** (19 raw to 15 canonical):
- Delhi Daredevils / Delhi Capitals -> Delhi Capitals
- Kings XI Punjab -> Punjab Kings
- Royal Challengers Bangalore -> Royal Challengers Bengaluru
- Rising Pune Supergiants / Supergiant -> Rising Pune Supergiant

**Venues** (58 raw to 40 canonical):
- Standardized to "Stadium Name, City" format
- Handles IPL seasons held in South Africa (2009), UAE (2020-21)

**Seasons**: Converts "2007/08" format to integer year (2008)

---

## Getting Started

### Prerequisites
- Node.js 18+
- IPL dataset CSVs in `data/` folder (`matches.csv`, `deliveries.csv`)

### Local Development

```bash
# Install dependencies
npm install

# Seed the database (creates data/ipl.db from CSVs)
npx tsx scripts/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Production

```bash
# 1. Set up Turso cloud database
turso auth login
turso db create ipl-dashboard
sqlite3 data/ipl.db .dump > data/ipl_dump.sql
turso db shell ipl-dashboard < data/ipl_dump.sql

# 2. Get credentials
turso db show ipl-dashboard --url     # TURSO_DATABASE_URL
turso db tokens create ipl-dashboard  # TURSO_AUTH_TOKEN

# 3. Deploy on Vercel
# Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN as environment variables
```

---

## Performance Highlights

- **11 database indexes** for optimized query execution
- **Promise.all()** for parallel queries (up to 11 concurrent in overview)
- **WAL mode** for concurrent database reads
- **Debounced search** (300ms) to minimize API calls
- **Infinite scroll** pagination on match finder
- **Static generation** for pages without dynamic params
- **Responsive design** with mobile-first approach

---

## Built With

Built as a portfolio project using [Claude Code](https://claude.ai/claude-code).
