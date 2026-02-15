// Database row types
export interface TeamRow {
  id: number;
  name: string;
  slug: string;
  short_code: string;
  color: string;
  is_active: number;
}

export interface VenueRow {
  id: number;
  name: string;
  city: string | null;
}

export interface PlayerRow {
  id: number;
  name: string;
}

export interface MatchRow {
  id: number;
  season: number;
  city: string | null;
  match_date: string;
  match_type: string;
  player_of_match_id: number | null;
  venue_id: number;
  team1_id: number;
  team2_id: number;
  toss_winner_id: number | null;
  toss_decision: string | null;
  winner_id: number | null;
  result: string;
  result_margin: number | null;
  target_runs: number | null;
  target_overs: number | null;
  super_over: number;
  method: string | null;
}

// API response types
export interface OverviewStats {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  totalSixes: number;
  totalFours: number;
  seasons: number[];
  topRunScorers: { playerId: number; playerName: string; totalRuns: number }[];
  topWicketTakers: { playerId: number; playerName: string; totalWickets: number }[];
  mostPlayerOfMatch: { playerId: number; playerName: string; awards: number }[];
  runsBySeason: { season: number; totalRuns: number; totalMatches: number; avgRunsPerMatch: number }[];
  sixesBySeason: { season: number; totalSixes: number }[];
}

export interface TeamSummary {
  id: number;
  name: string;
  slug: string;
  shortCode: string;
  color: string;
  isActive: boolean;
  matchesPlayed: number;
  matchesWon: number;
  winPercentage: number;
  titles: number;
}

export interface TeamDetail {
  team: { id: number; name: string; slug: string; shortCode: string; color: string };
  overall: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    noResults: number;
    winPercentage: number;
    titles: number;
  };
  tossRecord: {
    tossesWon: number;
    batFirstWins: number;
    fieldFirstWins: number;
  };
  seasonBySeasonRecord: {
    season: number;
    played: number;
    won: number;
    lost: number;
    winPct: number;
  }[];
  headToHead: {
    opponentId: number;
    opponentName: string;
    opponentShortCode: string;
    played: number;
    won: number;
    lost: number;
  }[];
  venuePerformance: {
    venueId: number;
    venueName: string;
    played: number;
    won: number;
    winPct: number;
  }[];
}

export interface PlayerBattingStats {
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  average: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  highestScore: number;
  notOuts: number;
}

export interface PlayerBowlingStats {
  matches: number;
  overs: number;
  wickets: number;
  runsConceded: number;
  economy: number;
  average: number;
  bestFigures: string;
}

export interface PlayerDetail {
  player: { id: number; name: string };
  batting: PlayerBattingStats;
  bowling: PlayerBowlingStats;
  battingBySeason: {
    season: number;
    runs: number;
    innings: number;
    avg: number;
    sr: number;
  }[];
  battingByTeamFaced: {
    opponentName: string;
    opponentShortCode: string;
    innings: number;
    runs: number;
    avg: number;
    sr: number;
  }[];
  teamsPlayedFor: {
    teamName: string;
    teamShortCode: string;
    seasons: number[];
  }[];
}

export interface HeadToHeadData {
  team1: { id: number; name: string; shortCode: string; color: string };
  team2: { id: number; name: string; shortCode: string; color: string };
  overall: {
    totalMatches: number;
    team1Wins: number;
    team2Wins: number;
    noResults: number;
  };
  bySeason: {
    season: number;
    team1Wins: number;
    team2Wins: number;
  }[];
  byVenue: {
    venueName: string;
    team1Wins: number;
    team2Wins: number;
  }[];
  recentMatches: {
    matchId: number;
    season: number;
    date: string;
    venue: string;
    winner: string | null;
    result: string;
    margin: number | null;
  }[];
}

export interface MatchSummary {
  id: number;
  season: number;
  date: string;
  venue: string;
  city: string | null;
  team1: string;
  team1ShortCode: string;
  team2: string;
  team2ShortCode: string;
  tossWinner: string | null;
  tossDecision: string | null;
  winner: string | null;
  result: string;
  resultMargin: number | null;
  playerOfMatch: string | null;
  superOver: boolean;
  method: string | null;
}

export interface PlayerSearchResult {
  id: number;
  name: string;
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
}
