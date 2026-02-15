import { queryAll, queryOne } from "../db";
import type { InValue } from "@libsql/client";
import type { MatchSummary } from "../types";

interface MatchFilters {
  season?: number;
  teamSlug?: string;
  venueId?: number;
  result?: string;
  limit?: number;
  offset?: number;
}

export async function searchMatches(filters: MatchFilters) {
  const { season, teamSlug, venueId, result, limit = 20, offset = 0 } = filters;

  const conditions: string[] = [];
  const params: InValue[] = [];

  if (season) {
    conditions.push("m.season = ?");
    params.push(season);
  }

  if (teamSlug) {
    conditions.push("(t1.slug = ? OR t2.slug = ?)");
    params.push(teamSlug, teamSlug);
  }

  if (venueId) {
    conditions.push("m.venue_id = ?");
    params.push(venueId);
  }

  if (result) {
    conditions.push("m.result = ?");
    params.push(result);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const matches = await queryAll<{
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
    superOver: number;
    method: string | null;
    matchType: string;
  }>(
    `SELECT
      m.id, m.season, m.match_date as date,
      v.name as venue, v.city,
      t1.name as team1, t1.short_code as team1ShortCode,
      t2.name as team2, t2.short_code as team2ShortCode,
      tw.name as tossWinner, m.toss_decision as tossDecision,
      w.name as winner, m.result, m.result_margin as resultMargin,
      p.name as playerOfMatch, m.super_over as superOver, m.method,
      m.match_type as matchType
    FROM matches m
    JOIN venues v ON m.venue_id = v.id
    JOIN teams t1 ON m.team1_id = t1.id
    JOIN teams t2 ON m.team2_id = t2.id
    LEFT JOIN teams tw ON m.toss_winner_id = tw.id
    LEFT JOIN teams w ON m.winner_id = w.id
    LEFT JOIN players p ON m.player_of_match_id = p.id
    ${whereClause}
    ORDER BY m.match_date DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const total = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
    FROM matches m
    JOIN teams t1 ON m.team1_id = t1.id
    JOIN teams t2 ON m.team2_id = t2.id
    ${whereClause}`,
    params
  );

  // Get filter options
  const seasons = await queryAll<{ season: number }>(
    "SELECT DISTINCT season FROM matches ORDER BY season DESC"
  );

  const teams = await queryAll<{ slug: string; name: string; shortCode: string }>(
    "SELECT slug, name, short_code as shortCode FROM teams ORDER BY name"
  );

  const venues = await queryAll<{ id: number; name: string }>(
    "SELECT id, name FROM venues ORDER BY name"
  );

  return {
    matches: matches.map(m => ({
      ...m,
      id: Number(m.id),
      season: Number(m.season),
      resultMargin: m.resultMargin != null ? Number(m.resultMargin) : null,
      superOver: Number(m.superOver) === 1,
    })),
    total: Number(total?.count ?? 0),
    filters: {
      seasons: seasons.map(s => Number(s.season)),
      teams,
      venues: venues.map(v => ({ id: Number(v.id), name: v.name })),
    },
  };
}
