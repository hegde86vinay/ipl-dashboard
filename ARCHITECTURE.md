# IPL Dashboard — Architecture Diagrams

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Browser (Client)"
        A[User] --> B[Client Components<br/>Players Search, Match Finder,<br/>Head-to-Head]
        A --> C[Server-Rendered HTML<br/>Overview, Teams, Player Detail]
    end

    subgraph "Next.js on Vercel (Server)"
        D[Server Components<br/>page.tsx files]
        E[API Routes<br/>/api/* endpoints]
        F[Query Layer<br/>src/lib/queries/]
        G[DB Client<br/>@libsql/client]
    end

    subgraph "Database"
        H[(Turso Cloud<br/>Production)]
        I[(SQLite File<br/>Local Dev)]
    end

    B -->|fetch /api/*| E
    C -.->|pre-rendered on server| D
    D -->|direct call| F
    E -->|direct call| F
    F -->|SQL queries| G
    G -->|TURSO_DATABASE_URL set| H
    G -->|No env vars| I

    style A fill:#f59e0b,color:#000
    style H fill:#3b82f6,color:#fff
    style I fill:#10b981,color:#fff
```

## 2. Request Flow — Server Component (e.g., Overview Page)

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Next as Next.js Server
    participant SC as Server Component<br/>(page.tsx)
    participant QL as Query Layer<br/>(overview.ts)
    participant DB as Turso Database

    User->>Next: GET /
    Next->>SC: Render OverviewPage()
    SC->>QL: await getOverviewStats()

    par 11 Parallel Queries
        QL->>DB: SELECT COUNT(*) FROM matches
        QL->>DB: SELECT SUM(batsman_runs) FROM deliveries
        QL->>DB: SELECT SUM(is_wicket) FROM deliveries
        QL->>DB: SELECT ... top run scorers
        QL->>DB: SELECT ... top wicket takers
        QL->>DB: SELECT ... runs by season
        QL->>DB: SELECT ... sixes by season
        QL->>DB: ...more queries
    end

    DB-->>QL: Query results
    QL-->>SC: OverviewStats object
    SC-->>Next: Rendered HTML + Charts
    Next-->>User: Complete HTML page

    Note over User: Page loads instantly<br/>No client-side fetch needed
```

## 3. Request Flow — Client Component (e.g., Player Search)

```mermaid
sequenceDiagram
    participant User as User Browser
    participant CC as Client Component<br/>(players/page.tsx)
    participant API as API Route<br/>(/api/players)
    participant QL as Query Layer<br/>(players.ts)
    participant DB as Turso Database

    User->>CC: Loads /players page
    Note over CC: Static HTML shell loads<br/>(no data yet)

    CC->>API: fetch("/api/players?search=&limit=30")
    API->>QL: await searchPlayers("", 30, 0)
    QL->>DB: SELECT ... FROM players LIMIT 30
    DB-->>QL: Player rows
    QL-->>API: { players: [...], total: 741 }
    API-->>CC: JSON response
    CC-->>User: Renders player cards

    User->>CC: Types "Kohli"
    Note over CC: 300ms debounce
    CC->>API: fetch("/api/players?search=Kohli&limit=30")
    API->>QL: await searchPlayers("Kohli", 30, 0)
    QL->>DB: SELECT ... WHERE name LIKE '%Kohli%'
    DB-->>QL: Matching players
    QL-->>API: { players: [...], total: 2 }
    API-->>CC: JSON response
    CC-->>User: Updates with filtered results
```

## 4. Data Pipeline — CSV to Production

```mermaid
flowchart LR
    subgraph "Source Data"
        A[matches.csv<br/>1,095 rows]
        B[deliveries.csv<br/>260,920 rows]
    end

    subgraph "Seed Script (scripts/seed.ts)"
        C[Parse CSVs]
        D[Normalize Data<br/>19→15 teams<br/>58→40 venues<br/>Season formats]
        E[Batch Insert<br/>50K per transaction]
        F[Create Indexes<br/>11 indexes]
    end

    subgraph "Local Database"
        G[(data/ipl.db<br/>21MB SQLite)]
    end

    subgraph "Cloud Migration"
        H[sqlite3 .dump<br/>→ SQL text file]
        I[turso db shell<br/>← pipe SQL in]
    end

    subgraph "Production"
        J[(Turso Cloud DB<br/>libsql://...turso.io)]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J

    style G fill:#10b981,color:#fff
    style J fill:#3b82f6,color:#fff
```

## 5. Database Schema — Entity Relationships

```mermaid
erDiagram
    TEAMS {
        int id PK
        text name
        text slug
        text short_code
        text color
        int is_active
    }

    VENUES {
        int id PK
        text name
        text city
    }

    PLAYERS {
        int id PK
        text name
    }

    MATCHES {
        int id PK
        int season
        text match_date
        text match_type
        int team1_id FK
        int team2_id FK
        int winner_id FK
        int toss_winner_id FK
        int venue_id FK
        int player_of_match_id FK
        text result
        int result_margin
        int super_over
    }

    DELIVERIES {
        int id PK
        int match_id FK
        int inning
        int batting_team_id FK
        int bowling_team_id FK
        int over_num
        int ball_num
        int batter_id FK
        int bowler_id FK
        int batsman_runs
        int extra_runs
        int total_runs
        int is_wicket
        text dismissal_kind
        int player_dismissed_id FK
    }

    TEAMS ||--o{ MATCHES : "plays in (team1/team2)"
    TEAMS ||--o{ MATCHES : "wins"
    VENUES ||--o{ MATCHES : "hosted at"
    PLAYERS ||--o{ MATCHES : "player of match"
    MATCHES ||--o{ DELIVERIES : "contains"
    TEAMS ||--o{ DELIVERIES : "bats/bowls"
    PLAYERS ||--o{ DELIVERIES : "batter/bowler"
```

## 6. Component Architecture — Page Rendering Strategy

```mermaid
graph LR
    subgraph "Server Components (SSR)"
        A["/ Overview<br/>⚡ Direct DB query"]
        B["/teams<br/>⚡ Direct DB query"]
        C["/teams/[slug]<br/>⚡ Direct DB query"]
        D["/players/[id]<br/>⚡ Direct DB query"]
    end

    subgraph "Client Components (CSR)"
        E["/players<br/>🔍 Search + Debounce"]
        F["/matches<br/>🔍 Filters + Infinite Scroll"]
        G["/head-to-head<br/>🔍 Team Selectors"]
    end

    subgraph "API Routes (Server)"
        H["/api/overview"]
        I["/api/teams"]
        J["/api/players"]
        K["/api/matches"]
        L["/api/head-to-head"]
    end

    subgraph "Query Layer"
        M["overview.ts<br/>11 parallel queries"]
        N["teams.ts<br/>5 parallel queries"]
        O["players.ts<br/>9 parallel queries"]
        P["matches.ts<br/>dynamic filters"]
        Q["head-to-head.ts<br/>4 parallel queries"]
    end

    A --> M
    B --> N
    C --> N
    D --> O

    E -->|fetch| J
    F -->|fetch| K
    G -->|fetch| L

    H --> M
    I --> N
    J --> O
    K --> P
    L --> Q

    style A fill:#10b981,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#10b981,color:#fff
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#000
    style F fill:#f59e0b,color:#000
    style G fill:#f59e0b,color:#000
```

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Developer"
        A[Local Machine<br/>npm run dev] -->|git push| B[GitHub<br/>hegde86vinay/ipl-dashboard]
    end

    subgraph "CI/CD"
        B -->|auto-trigger| C[Vercel Build<br/>next build]
    end

    subgraph "Production (Vercel)"
        C --> D[Static Pages<br/>/, /teams, /players<br/>Pre-rendered at build]
        C --> E[Serverless Functions<br/>API Routes + Dynamic Pages<br/>Run on demand]
    end

    subgraph "Database (Turso)"
        F[(Turso Cloud<br/>AWS ap-south-1<br/>15 teams, 741 players<br/>1,095 matches<br/>260,920 deliveries)]
    end

    subgraph "Users"
        G[Desktop Browser]
        H[Mobile Browser]
    end

    G --> D
    G --> E
    H --> D
    H --> E
    E -->|TURSO_DATABASE_URL<br/>TURSO_AUTH_TOKEN| F

    style F fill:#3b82f6,color:#fff
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#000
```
