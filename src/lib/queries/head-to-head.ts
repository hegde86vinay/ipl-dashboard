import { queryAll, queryOne } from "../db";

export async function getHeadToHead(team1Slug: string, team2Slug: string) {
  const teamSql =
    "SELECT id, name, short_code as shortCode, color FROM teams WHERE slug = ?";

  const [t1, t2] = await Promise.all([
    queryOne<{ id: number; name: string; shortCode: string; color: string }>(
      teamSql,
      [team1Slug]
    ),
    queryOne<{ id: number; name: string; shortCode: string; color: string }>(
      teamSql,
      [team2Slug]
    ),
  ]);

  if (!t1 || !t2) return null;

  const [overall, bySeason, byVenue, recentMatches] = await Promise.all([
    queryOne<{
      totalMatches: number;
      team1Wins: number;
      team2Wins: number;
      noResults: number;
    }>(
      `SELECT
        COUNT(*) as totalMatches,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team1Wins,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team2Wins,
        SUM(CASE WHEN m.winner_id IS NULL THEN 1 ELSE 0 END) as noResults
      FROM matches m
      WHERE (m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)`,
      [t1.id, t2.id, t1.id, t2.id, t2.id, t1.id]
    ),

    queryAll<{ season: number; team1Wins: number; team2Wins: number }>(
      `SELECT
        m.season,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team1Wins,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team2Wins
      FROM matches m
      WHERE (m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)
      GROUP BY m.season
      ORDER BY m.season`,
      [t1.id, t2.id, t1.id, t2.id, t2.id, t1.id]
    ),

    queryAll<{ venueName: string; team1Wins: number; team2Wins: number }>(
      `SELECT
        v.name as venueName,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team1Wins,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as team2Wins
      FROM matches m
      JOIN venues v ON m.venue_id = v.id
      WHERE (m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)
      GROUP BY v.id
      HAVING (team1Wins + team2Wins) > 0
      ORDER BY (team1Wins + team2Wins) DESC`,
      [t1.id, t2.id, t1.id, t2.id, t2.id, t1.id]
    ),

    queryAll<{
      matchId: number;
      season: number;
      date: string;
      venue: string;
      winner: string | null;
      result: string;
      margin: number | null;
    }>(
      `SELECT
        m.id as matchId,
        m.season,
        m.match_date as date,
        v.name as venue,
        tw.name as winner,
        m.result,
        m.result_margin as margin
      FROM matches m
      JOIN venues v ON m.venue_id = v.id
      LEFT JOIN teams tw ON m.winner_id = tw.id
      WHERE (m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)
      ORDER BY m.match_date DESC
      LIMIT 5`,
      [t1.id, t2.id, t2.id, t1.id]
    ),
  ]);

  return {
    team1: t1,
    team2: t2,
    overall: overall
      ? {
          totalMatches: Number(overall.totalMatches),
          team1Wins: Number(overall.team1Wins),
          team2Wins: Number(overall.team2Wins),
          noResults: Number(overall.noResults),
        }
      : { totalMatches: 0, team1Wins: 0, team2Wins: 0, noResults: 0 },
    bySeason: bySeason.map((row) => ({
      season: Number(row.season),
      team1Wins: Number(row.team1Wins),
      team2Wins: Number(row.team2Wins),
    })),
    byVenue: byVenue.map((row) => ({
      venueName: row.venueName,
      team1Wins: Number(row.team1Wins),
      team2Wins: Number(row.team2Wins),
    })),
    recentMatches: recentMatches.map((row) => ({
      matchId: Number(row.matchId),
      season: Number(row.season),
      date: row.date,
      venue: row.venue,
      winner: row.winner,
      result: row.result,
      margin: row.margin != null ? Number(row.margin) : null,
    })),
  };
}
