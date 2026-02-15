import { queryAll, queryOne } from "../db";

export async function getOverviewStats(seasonFrom = 2008, seasonTo = 2024) {
  const [
    totalMatches,
    totalRuns,
    totalWickets,
    totalSixes,
    totalFours,
    seasons,
    topRunScorers,
    topWicketTakers,
    mostPlayerOfMatch,
    runsBySeason,
    sixesBySeason,
  ] = await Promise.all([
    queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM matches WHERE season BETWEEN ? AND ?",
      [seasonFrom, seasonTo]
    ),

    queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(d.total_runs), 0) as total
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE m.season BETWEEN ? AND ?`,
      [seasonFrom, seasonTo]
    ),

    queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(d.is_wicket), 0) as total
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE m.season BETWEEN ? AND ?`,
      [seasonFrom, seasonTo]
    ),

    queryOne<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE d.batsman_runs = 6 AND m.season BETWEEN ? AND ?`,
      [seasonFrom, seasonTo]
    ),

    queryOne<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE d.batsman_runs = 4 AND m.season BETWEEN ? AND ?`,
      [seasonFrom, seasonTo]
    ),

    queryAll<{ season: number }>(
      "SELECT DISTINCT season FROM matches WHERE season BETWEEN ? AND ? ORDER BY season",
      [seasonFrom, seasonTo]
    ),

    queryAll<{ playerId: number; playerName: string; totalRuns: number }>(
      `SELECT d.batter_id as playerId, p.name as playerName,
              SUM(d.batsman_runs) as totalRuns
       FROM deliveries d
       JOIN players p ON d.batter_id = p.id
       JOIN matches m ON d.match_id = m.id
       WHERE m.season BETWEEN ? AND ?
       GROUP BY d.batter_id
       ORDER BY totalRuns DESC
       LIMIT 5`,
      [seasonFrom, seasonTo]
    ),

    queryAll<{ playerId: number; playerName: string; totalWickets: number }>(
      `SELECT d.bowler_id as playerId, p.name as playerName,
              SUM(d.is_wicket) as totalWickets
       FROM deliveries d
       JOIN players p ON d.bowler_id = p.id
       JOIN matches m ON d.match_id = m.id
       WHERE m.season BETWEEN ? AND ?
         AND d.is_wicket = 1
         AND d.dismissal_kind NOT IN ('run out', 'retired hurt', 'retired out', 'obstructing the field')
       GROUP BY d.bowler_id
       ORDER BY totalWickets DESC
       LIMIT 5`,
      [seasonFrom, seasonTo]
    ),

    queryAll<{ playerId: number; playerName: string; awards: number }>(
      `SELECT m.player_of_match_id as playerId, p.name as playerName,
              COUNT(*) as awards
       FROM matches m
       JOIN players p ON m.player_of_match_id = p.id
       WHERE m.season BETWEEN ? AND ? AND m.player_of_match_id IS NOT NULL
       GROUP BY m.player_of_match_id
       ORDER BY awards DESC
       LIMIT 5`,
      [seasonFrom, seasonTo]
    ),

    queryAll<{ season: number; totalRuns: number; totalMatches: number; avgRunsPerMatch: number }>(
      `SELECT m.season,
              SUM(d.total_runs) as totalRuns,
              COUNT(DISTINCT m.id) as totalMatches,
              ROUND(CAST(SUM(d.total_runs) AS REAL) / COUNT(DISTINCT m.id), 1) as avgRunsPerMatch
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE m.season BETWEEN ? AND ?
       GROUP BY m.season
       ORDER BY m.season`,
      [seasonFrom, seasonTo]
    ),

    queryAll<{ season: number; totalSixes: number }>(
      `SELECT m.season, COUNT(*) as totalSixes
       FROM deliveries d
       JOIN matches m ON d.match_id = m.id
       WHERE d.batsman_runs = 6 AND m.season BETWEEN ? AND ?
       GROUP BY m.season
       ORDER BY m.season`,
      [seasonFrom, seasonTo]
    ),
  ]);

  return {
    totalMatches: Number(totalMatches?.count ?? 0),
    totalRuns: Number(totalRuns?.total ?? 0),
    totalWickets: Number(totalWickets?.total ?? 0),
    totalSixes: Number(totalSixes?.total ?? 0),
    totalFours: Number(totalFours?.total ?? 0),
    seasons: seasons.map(s => Number(s.season)),
    topRunScorers: topRunScorers.map(r => ({
      playerId: Number(r.playerId),
      playerName: r.playerName,
      totalRuns: Number(r.totalRuns),
    })),
    topWicketTakers: topWicketTakers.map(r => ({
      playerId: Number(r.playerId),
      playerName: r.playerName,
      totalWickets: Number(r.totalWickets),
    })),
    mostPlayerOfMatch: mostPlayerOfMatch.map(r => ({
      playerId: Number(r.playerId),
      playerName: r.playerName,
      awards: Number(r.awards),
    })),
    runsBySeason: runsBySeason.map(r => ({
      season: Number(r.season),
      totalRuns: Number(r.totalRuns),
      totalMatches: Number(r.totalMatches),
      avgRunsPerMatch: Number(r.avgRunsPerMatch),
    })),
    sixesBySeason: sixesBySeason.map(r => ({
      season: Number(r.season),
      totalSixes: Number(r.totalSixes),
    })),
  };
}
