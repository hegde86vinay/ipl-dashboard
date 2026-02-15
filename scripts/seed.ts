import Database from "better-sqlite3";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import {
  normalizeTeam,
  normalizeVenue,
  normalizeSeason,
  teamSlug,
  extractCityFromVenue,
  TEAM_SHORT_CODE,
  TEAM_COLORS,
  ACTIVE_TEAMS,
} from "../src/lib/normalization";

const DB_PATH = path.join(process.cwd(), "data", "ipl.db");
const MATCHES_CSV = path.join(process.cwd(), "data", "matches.csv");
const DELIVERIES_CSV = path.join(process.cwd(), "data", "deliveries.csv");

// Delete existing database
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Deleted existing database");
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    city TEXT
  );

  CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE matches (
    id INTEGER PRIMARY KEY,
    season INTEGER NOT NULL,
    city TEXT,
    match_date TEXT NOT NULL,
    match_type TEXT,
    player_of_match_id INTEGER REFERENCES players(id),
    venue_id INTEGER NOT NULL REFERENCES venues(id),
    team1_id INTEGER NOT NULL REFERENCES teams(id),
    team2_id INTEGER NOT NULL REFERENCES teams(id),
    toss_winner_id INTEGER REFERENCES teams(id),
    toss_decision TEXT,
    winner_id INTEGER REFERENCES teams(id),
    result TEXT,
    result_margin INTEGER,
    target_runs INTEGER,
    target_overs REAL,
    super_over INTEGER DEFAULT 0,
    method TEXT
  );

  CREATE TABLE deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    inning INTEGER NOT NULL,
    batting_team_id INTEGER NOT NULL REFERENCES teams(id),
    bowling_team_id INTEGER NOT NULL REFERENCES teams(id),
    over_num INTEGER NOT NULL,
    ball_num INTEGER NOT NULL,
    batter_id INTEGER NOT NULL REFERENCES players(id),
    bowler_id INTEGER NOT NULL REFERENCES players(id),
    non_striker_id INTEGER NOT NULL REFERENCES players(id),
    batsman_runs INTEGER NOT NULL DEFAULT 0,
    extra_runs INTEGER NOT NULL DEFAULT 0,
    total_runs INTEGER NOT NULL DEFAULT 0,
    extras_type TEXT,
    is_wicket INTEGER NOT NULL DEFAULT 0,
    player_dismissed_id INTEGER REFERENCES players(id),
    dismissal_kind TEXT,
    fielder_id INTEGER REFERENCES players(id)
  );
`);

console.log("Tables created");

// Parse CSVs
console.log("Parsing matches.csv...");
const matchesRaw = parse(fs.readFileSync(MATCHES_CSV, "utf-8"), {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});
console.log(`  Parsed ${matchesRaw.length} matches`);

console.log("Parsing deliveries.csv...");
const deliveriesRaw = parse(fs.readFileSync(DELIVERIES_CSV, "utf-8"), {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});
console.log(`  Parsed ${deliveriesRaw.length} deliveries`);

// Build team lookup
const teamIdMap = new Map<string, number>();
const insertTeam = db.prepare(
  "INSERT OR IGNORE INTO teams (name, slug, short_code, color, is_active) VALUES (?, ?, ?, ?, ?)"
);

const allRawTeams = new Set<string>();
for (const m of matchesRaw) {
  if (m.team1) allRawTeams.add(m.team1.trim());
  if (m.team2) allRawTeams.add(m.team2.trim());
  if (m.toss_winner) allRawTeams.add(m.toss_winner.trim());
  if (m.winner && m.winner.trim() !== "NA" && m.winner.trim() !== "") allRawTeams.add(m.winner.trim());
}

const normalizedTeams = new Set<string>();
for (const raw of allRawTeams) {
  const normalized = normalizeTeam(raw);
  if (!normalizedTeams.has(normalized)) {
    normalizedTeams.add(normalized);
    const slug = teamSlug(normalized);
    const shortCode = TEAM_SHORT_CODE[normalized] || normalized.substring(0, 3).toUpperCase();
    const color = TEAM_COLORS[shortCode] || "#666666";
    const isActive = ACTIVE_TEAMS.has(normalized) ? 1 : 0;
    insertTeam.run(normalized, slug, shortCode, color, isActive);
  }
}

// Build teamIdMap
const allTeams = db.prepare("SELECT id, name FROM teams").all() as { id: number; name: string }[];
for (const t of allTeams) {
  teamIdMap.set(t.name, t.id);
}
console.log(`  Inserted ${allTeams.length} teams`);

function getTeamId(raw: string): number {
  const normalized = normalizeTeam(raw.trim());
  const id = teamIdMap.get(normalized);
  if (!id) throw new Error(`Unknown team: "${raw}" -> "${normalized}"`);
  return id;
}

// Build venue lookup
const venueIdMap = new Map<string, number>();
const insertVenue = db.prepare("INSERT OR IGNORE INTO venues (name, city) VALUES (?, ?)");

const normalizedVenues = new Set<string>();
for (const m of matchesRaw) {
  if (m.venue) {
    const normalized = normalizeVenue(m.venue);
    if (!normalizedVenues.has(normalized)) {
      normalizedVenues.add(normalized);
      const city = extractCityFromVenue(normalized);
      insertVenue.run(normalized, city);
    }
  }
}

const allVenues = db.prepare("SELECT id, name FROM venues").all() as { id: number; name: string }[];
for (const v of allVenues) {
  venueIdMap.set(v.name, v.id);
}
console.log(`  Inserted ${allVenues.length} venues`);

function getVenueId(raw: string): number {
  const normalized = normalizeVenue(raw);
  const id = venueIdMap.get(normalized);
  if (!id) throw new Error(`Unknown venue: "${raw}" -> "${normalized}"`);
  return id;
}

// Collect all player names
console.log("Collecting player names...");
const playerNames = new Set<string>();

for (const m of matchesRaw) {
  if (m.player_of_match && m.player_of_match !== "NA") {
    playerNames.add(m.player_of_match.trim());
  }
}

for (const d of deliveriesRaw) {
  if (d.batter) playerNames.add(d.batter.trim());
  if (d.bowler) playerNames.add(d.bowler.trim());
  if (d.non_striker) playerNames.add(d.non_striker.trim());
  if (d.player_dismissed && d.player_dismissed !== "NA") playerNames.add(d.player_dismissed.trim());
  if (d.fielder && d.fielder !== "NA") playerNames.add(d.fielder.trim());
}

const insertPlayer = db.prepare("INSERT OR IGNORE INTO players (name) VALUES (?)");
const insertPlayers = db.transaction((names: string[]) => {
  for (const name of names) {
    insertPlayer.run(name);
  }
});
insertPlayers(Array.from(playerNames));

const playerIdMap = new Map<string, number>();
const allPlayers = db.prepare("SELECT id, name FROM players").all() as { id: number; name: string }[];
for (const p of allPlayers) {
  playerIdMap.set(p.name, p.id);
}
console.log(`  Inserted ${allPlayers.length} players`);

function getPlayerId(raw: string): number | null {
  if (!raw || raw === "NA" || raw.trim() === "") return null;
  const id = playerIdMap.get(raw.trim());
  if (!id) throw new Error(`Unknown player: "${raw}"`);
  return id;
}

function getPlayerIdRequired(raw: string): number {
  const id = getPlayerId(raw);
  if (!id) throw new Error(`Required player not found: "${raw}"`);
  return id;
}

// Insert matches
console.log("Inserting matches...");
const insertMatch = db.prepare(`
  INSERT INTO matches (id, season, city, match_date, match_type,
    player_of_match_id, venue_id, team1_id, team2_id,
    toss_winner_id, toss_decision, winner_id, result,
    result_margin, target_runs, target_overs, super_over, method)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMatches = db.transaction((rows: unknown[][]) => {
  for (const row of rows) {
    insertMatch.run(...row);
  }
});

const matchRows: unknown[][] = [];
for (const m of matchesRaw) {
  const season = normalizeSeason(m.season);
  const city = m.city && m.city !== "NA" ? m.city.trim() : null;
  const pomId = getPlayerId(m.player_of_match);
  const venueId = getVenueId(m.venue);
  const team1Id = getTeamId(m.team1);
  const team2Id = getTeamId(m.team2);
  const tossWinnerId = m.toss_winner ? getTeamId(m.toss_winner) : null;
  const tossDecision = m.toss_decision || null;
  const winnerId = m.winner && m.winner !== "NA" && m.winner.trim() !== "" ? getTeamId(m.winner) : null;
  const result = m.result || null;
  const resultMargin = m.result_margin && m.result_margin !== "NA" ? parseInt(m.result_margin) : null;
  const targetRuns = m.target_runs && m.target_runs !== "NA" ? parseInt(m.target_runs) : null;
  const targetOvers = m.target_overs && m.target_overs !== "NA" ? parseFloat(m.target_overs) : null;
  const superOver = m.super_over === "Y" ? 1 : 0;
  const method = m.method && m.method !== "NA" ? m.method : null;

  matchRows.push([
    parseInt(m.id), season, city, m.date, m.match_type,
    pomId, venueId, team1Id, team2Id,
    tossWinnerId, tossDecision, winnerId, result,
    resultMargin, targetRuns, targetOvers, superOver, method,
  ]);
}

insertMatches(matchRows);
console.log(`  Inserted ${matchRows.length} matches`);

// Insert deliveries in batches
console.log("Inserting deliveries...");
const insertDelivery = db.prepare(`
  INSERT INTO deliveries (match_id, inning, batting_team_id, bowling_team_id,
    over_num, ball_num, batter_id, bowler_id, non_striker_id,
    batsman_runs, extra_runs, total_runs, extras_type,
    is_wicket, player_dismissed_id, dismissal_kind, fielder_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertDeliveryBatch = db.transaction((rows: unknown[][]) => {
  for (const row of rows) {
    insertDelivery.run(...row);
  }
});

const BATCH_SIZE = 50000;
let batch: unknown[][] = [];
let totalInserted = 0;

for (const d of deliveriesRaw) {
  const battingTeamId = getTeamId(d.batting_team);
  const bowlingTeamId = getTeamId(d.bowling_team);
  const batterId = getPlayerIdRequired(d.batter);
  const bowlerId = getPlayerIdRequired(d.bowler);
  const nonStrikerId = getPlayerIdRequired(d.non_striker);
  const dismissedId = getPlayerId(d.player_dismissed);
  const fielderId = getPlayerId(d.fielder);
  const extrasType = d.extras_type && d.extras_type.trim() !== "" ? d.extras_type.trim() : null;
  const dismissalKind = d.dismissal_kind && d.dismissal_kind !== "NA" ? d.dismissal_kind.trim() : null;

  batch.push([
    parseInt(d.match_id), parseInt(d.inning), battingTeamId, bowlingTeamId,
    parseInt(d.over), parseInt(d.ball), batterId, bowlerId, nonStrikerId,
    parseInt(d.batsman_runs), parseInt(d.extra_runs), parseInt(d.total_runs),
    extrasType, parseInt(d.is_wicket), dismissedId, dismissalKind, fielderId,
  ]);

  if (batch.length >= BATCH_SIZE) {
    insertDeliveryBatch(batch);
    totalInserted += batch.length;
    console.log(`  Inserted ${totalInserted} deliveries...`);
    batch = [];
  }
}

if (batch.length > 0) {
  insertDeliveryBatch(batch);
  totalInserted += batch.length;
}
console.log(`  Inserted ${totalInserted} deliveries total`);

// Create indexes
console.log("Creating indexes...");
db.exec(`
  CREATE INDEX idx_deliveries_match ON deliveries(match_id);
  CREATE INDEX idx_deliveries_batter ON deliveries(batter_id);
  CREATE INDEX idx_deliveries_bowler ON deliveries(bowler_id);
  CREATE INDEX idx_deliveries_batting_team ON deliveries(batting_team_id);
  CREATE INDEX idx_matches_season ON matches(season);
  CREATE INDEX idx_matches_team1 ON matches(team1_id);
  CREATE INDEX idx_matches_team2 ON matches(team2_id);
  CREATE INDEX idx_matches_winner ON matches(winner_id);
  CREATE INDEX idx_matches_venue ON matches(venue_id);
  CREATE INDEX idx_matches_date ON matches(match_date);
  CREATE INDEX idx_matches_pom ON matches(player_of_match_id);
`);

// Run ANALYZE
db.exec("ANALYZE");

console.log("\nDone! Summary:");
console.log(`  Teams:      ${allTeams.length}`);
console.log(`  Venues:     ${allVenues.length}`);
console.log(`  Players:    ${allPlayers.length}`);
console.log(`  Matches:    ${matchRows.length}`);
console.log(`  Deliveries: ${totalInserted}`);

db.close();
