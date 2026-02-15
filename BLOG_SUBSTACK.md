I Built a Full-Stack IPL Analytics Dashboard Using AI — Here's Exactly How

I recently built an interactive IPL cricket dashboard that lets you explore 17 seasons of Indian Premier League data — team records, player stats, head-to-head matchups, and match history. The entire app was built using Claude Code as my AI pair programmer, from data analysis to cloud deployment.

Here's the complete journey — every decision, every problem, and every lesson learned. If you're curious about building data-driven web apps (or using AI to code), this is for you.


THE STARTING POINT: RAW DATA, NO PLAN

It all started with two CSV files I had lying around:

matches.csv — 1,095 rows covering every IPL match from 2008 to 2024

deliveries.csv — 260,920 rows of ball-by-ball data (every single delivery bowled in 17 seasons)

I didn't start with a grand vision. I simply dropped these files into Claude Code and asked: "Analyze my IPL dataset and suggest 10 interesting stats we could showcase."

Within minutes, I had insights I hadn't thought of:

- Virat Kohli has scored 8,014 runs across all IPL seasons
- AB de Villiers hit 252 sixes in his career
- Teams winning the toss win 51.6% of matches (barely above chance!)
- The number of sixes per season has nearly tripled from 2008 to 2024

That's when the real question hit me: What if I could turn this into an interactive app where anyone can explore this data?

[Screenshot: Add your Overview dashboard screenshot here]


PHASE 1: CHOOSING THE ARCHITECTURE

Before writing a single line of code, I had to make several decisions.

The Tech Stack

Framework → Next.js 16 (App Router) — Server components for fast data loading, API routes built-in

Language → TypeScript — Type safety across 55 files and 4,700+ lines of code

Database → SQLite (local) + Turso (cloud) — Perfect for read-heavy analytics, zero-config locally

Charts → Recharts — Composable React charts, great dark mode support

UI → shadcn/ui + Tailwind CSS — Beautiful components without a heavy UI library

Deployment → Vercel + Turso — Free tier, instant deploys, edge database


The Database Design

The raw CSV data was messy. Team names had changed over the years — Delhi Daredevils became Delhi Capitals, Kings XI Punjab became Punjab Kings. Venue names were inconsistent. Season formats varied between "2008" and "2007/08".

So before building anything, I designed a normalized schema with 5 tables:

teams (15 rows) — canonical team names, brand colors, URL slugs

venues (40 rows) — standardized "Stadium, City" format

players (741 rows) — unique player names

matches (1,095 rows) — foreign keys linking to teams, venues, and players

deliveries (260,920 rows) — ball-by-ball data with foreign keys everywhere

This normalization step was crucial. By mapping 19 raw team names to 15 canonical ones, and 58 raw venue strings to 40 clean ones, every query downstream became simpler and faster.


Server vs Client Components

Not every page needs the same rendering strategy. I decided upfront:

Server Components — for pages where data doesn't change based on user interaction (Overview, Team Detail, Player Detail). These fetch data directly from the database with zero API call overhead.

Client Components — for interactive pages (Player Search, Match Finder, Head-to-Head). These use fetch() to call API routes because the user is filtering and searching dynamically.

This hybrid approach gives you the best of both worlds: fast initial loads and rich interactivity.


PHASE 2: BUILDING THE DATA LAYER

The Seed Script

The first real code I wrote was a seed script — it reads both CSVs, normalizes the data, and inserts everything into SQLite.

The key challenges were:

1. Team name evolution — I built a mapping of all historical team names to their current canonical names

2. Venue standardization — Mapped every raw venue string to a clean "Stadium Name, City" format, including venues in South Africa (2009 IPL) and UAE (2020-21 seasons)

3. Performance — 260,920 deliveries is a LOT of rows. I used batch inserts (50,000 per transaction) and created 11 database indexes for fast querying

The seed script runs in about 5 seconds and creates a 21MB SQLite database. That single file powers the entire application.


The Query Layer

Instead of writing SQL inline everywhere, I created a dedicated query layer with 5 modules:

overview.ts — 11 parallel queries powering the dashboard KPIs

teams.ts — team listings, detailed team profiles, player rosters

players.ts — search functionality, full player profiles with 9 parallel queries

matches.ts — dynamic filtering with pagination

head-to-head.ts — team comparison with venue and season breakdowns

The key performance pattern: Promise.all() everywhere.

When a player detail page needs batting stats, bowling stats, season breakdown, opponent breakdown, and team history — those 9 queries run in parallel, not sequentially. This single pattern makes pages feel instant.

[Screenshot: Add your Player Detail page screenshot here]


PHASE 3: BUILDING THE UI

The Component Architecture

I broke the UI into three categories:

Cards (3 components)
StatCard — KPI display with icon, value, and optional color accent
TeamCard — franchise card with team color, win stats, championship count
MatchCard — match result showing teams, margin, Man of the Match, super over badge

Charts (7 components)
Season runs area chart, sixes trend bar chart, win percentage trend line chart, head-to-head comparison bars, venue performance bars, player season performance dual-axis line, and H2H season breakdown stacked bars.

Layout
A responsive sidebar that shows full navigation on desktop and collapses into a hamburger menu on mobile.


The Seven Pages

Each page has a clear purpose:

1. Overview (the home page) — Five KPI cards at the top, two season trend charts, three leaderboard tables showing top run scorers, wicket takers, and Man of the Match winners. All server-rendered for instant loading.

2. Teams — A grid of all 15 franchises (10 active, 5 defunct), sorted by wins. Click any team card to dive deeper.

3. Team Detail — Four tabs: Season Trend showing win percentage over years, Head-to-Head record vs every opponent, Venues showing win percentage at each ground, and Players listing top batters and bowlers.

4. Players — A search bar with 300ms debounce. Type "Kohli" and instantly see matching players with their run and wicket counts.

5. Player Detail — Full batting and bowling statistical breakdown. A season-wise performance chart. Record against every opponent team. Teams played for with date ranges.

6. Head-to-Head — Pick any two teams from dropdowns and see their complete rivalry: overall record, season-by-season breakdown, venue-by-venue breakdown, and the last 5 matches played.

7. Match Finder — Browse all 1,095 matches with season and team filters. Uses infinite scroll pagination to load more results.

[Screenshot: Add your Teams page screenshot here]


PHASE 4: THE DARK MODE PROBLEM

I built the entire app in dark mode — it's a cricket dashboard, dark mode feels right. Everything looked great on desktop.

Then I checked my phone.

Two problems hit me:

Problem 1: Invisible Chart Labels

The chart axis labels — years, team names, percentages — were rendered in a color too close to the dark background. On some screens, they were completely invisible.

The fix was straightforward but important. I replaced CSS variable-based colors with explicit hex colors that guaranteed visibility:

Axis tick labels got #a1a1aa (a zinc-400 tone — visible but not glaring)
Axis lines got #52525b (zinc-600 — subtle grid lines)
Tooltip labels got #e4e4e7 (zinc-200 — high contrast for readability)
Legend text got #a1a1aa (matching the axis labels for consistency)

Lesson: CSS variables are great for theming, but for chart libraries that render to canvas/SVG, explicit colors are more reliable in dark mode.

Problem 2: Mobile Was Completely Broken

The sidebar was fixed at 256px width with a 256px left margin on the content area. On a 375px wide mobile screen, that left just 119 pixels for actual content. The team cards were squished beyond recognition.

The fix: A responsive sidebar system.

On desktop (1024px and wider), the sidebar stays fixed on the left and the content has a left margin to accommodate it.

On mobile, the sidebar hides completely off-screen. A hamburger menu icon appears in the top-left corner. Tapping it slides the sidebar in as an overlay with a dark backdrop. Tapping outside, pressing Escape, or navigating to a new page automatically closes it.

Lesson: Always test on mobile early. Retrofitting responsiveness is much harder than building it in from the start.

[Screenshot: Add your mobile view screenshot here]


PHASE 5: GOING TO PRODUCTION

Getting the app from localhost to a public URL involved three steps — each with its own surprises.

Step 1: The Database Migration

Here's the thing about SQLite: the database is just a file on disk. But Vercel's serverless functions don't have a persistent filesystem. Every time a function runs, it starts fresh. So my local ipl.db file wouldn't work in production.

Enter Turso — a cloud-hosted database that speaks the SQLite protocol. Think of it as "SQLite in the cloud."

The migration involved four changes:

First, I swapped the database library from better-sqlite3 (synchronous, Node.js-only) to @libsql/client (async, works with both local files and Turso cloud).

Second, I rewrote all 5 query modules from synchronous to async code.

Third, I updated all 8 API routes and 4 server component pages to use await on the now-async query functions.

Fourth, I created a dual-mode database client. In development, it reads from the local file. In production, it connects to Turso cloud. The switch is controlled entirely by environment variables — no code changes needed.

Step 2: Pushing Data to the Cloud

This had a gotcha that cost me time.

My first attempt was to pipe the SQLite database file directly into Turso's shell command. It failed with a cryptic error about "SQL string could not be parsed."

The problem: Turso's shell expects SQL text commands (CREATE TABLE, INSERT INTO), not a raw binary database file.

The fix was a two-step process. First, dump the binary database into a SQL text file using sqlite3's .dump command. Then pipe that SQL text file into Turso's shell. 260,000+ INSERT statements later, the cloud database had all the data.

I verified with a quick count query: 15 teams, 40 venues, 741 players, 1,095 matches, 260,920 deliveries. Everything matched.

Step 3: Deploying to Vercel

The actual deployment was the easy part:

1. Pushed code to GitHub
2. Imported the repo on Vercel
3. Added two environment variables (the Turso database URL and auth token)
4. Clicked Deploy

The app was live in about 60 seconds.

But there was one more gotcha. My first Vercel project was accidentally auto-created from vercel.com/new, which generated its own separate GitHub repo. When I pushed my actual code to my real repo, Vercel kept deploying the old empty one. I spent time wondering why my changes weren't showing up.

The fix: Delete the Vercel project entirely, then re-import from the correct GitHub repo. After that, every git push triggered an automatic deployment.


THE FINAL RESULT

What I built:

- 7 interactive pages with charts, tables, and search
- 8 API endpoints serving normalized cricket data
- 260,920 ball-by-ball records in a cloud database
- Responsive design working seamlessly on desktop and mobile
- Dark mode optimized for chart readability

By the numbers:

- 55 TypeScript and React files
- 4,700+ lines of code
- 5 database tables with 11 performance indexes
- 7 chart components and 3 card components
- Built and deployed in a single day

[Screenshot: Add your final desktop dashboard screenshot here]


WHAT I LEARNED

1. Data normalization is half the battle

The raw CSV data was usable but messy. Spending time upfront to normalize team names, venue names, and season formats made everything downstream — queries, UI logic, debugging — dramatically simpler. Don't skip this step.

2. The hybrid rendering model is powerful

Server components for data that doesn't change based on user input. Client components for search bars, filters, and interactive comparisons. This isn't just a Next.js best practice — it fundamentally changes how fast your app feels to users.

3. Promise.all() is your best friend for dashboards

A dashboard page that runs 11 database queries sequentially takes 11 times longer than one that runs them all in parallel. This single pattern — wrapping independent queries in Promise.all() — made the biggest performance difference in the entire app.

4. Design for mobile from the start

I didn't, and I paid for it later. Retrofitting a desktop-first fixed sidebar into a mobile-responsive hamburger menu is absolutely doable, but it would have been significantly easier to plan for from day one.

5. Cloud SQLite is a game-changer

Turso gives you the simplicity of SQLite (no ORM needed, just write SQL) with the scalability and availability of a cloud database. For read-heavy analytics applications like dashboards, it's a perfect fit. And the free tier is generous.

6. AI pair programming accelerates the boring parts

Claude Code handled the repetitive work — creating 8 structurally similar API routes, rewriting 5 query modules from synchronous to asynchronous, generating component boilerplate. Meanwhile, I focused on the parts that matter most: architecture decisions, data modeling, and user experience design. The combination is significantly more productive than either approach alone.


TRY IT YOURSELF

The app is live at ipl-dashboard-2008-24.vercel.app

The complete source code is on GitHub with a detailed README covering the architecture, database schema, and setup instructions.

If you want to build something similar, here's my recommended order:

1. Find a dataset you're passionate about — passion keeps you going when debugging gets tedious

2. Normalize your data into clean relational tables — invest time here, it pays off 10x later

3. Build the query layer first, UI second — get your data right before making it pretty

4. Start with server components, add client components only where you need interactivity

5. Deploy with Vercel + Turso for a free, fast, production-ready setup

Happy building!
