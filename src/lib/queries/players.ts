import { queryAll, queryOne } from "../db";

export async function searchPlayers(search: string, limit = 20, offset = 0) {
  const [players, total] = await Promise.all([
    queryAll<{
      id: number; name: string; matchesPlayed: number; totalRuns: number; totalWickets: number;
    }>(`
      SELECT
        p.id,
        p.name,
        (SELECT COUNT(DISTINCT d.match_id) FROM deliveries d WHERE d.batter_id = p.id OR d.bowler_id = p.id) as matchesPlayed,
        (SELECT COALESCE(SUM(d.batsman_runs), 0) FROM deliveries d WHERE d.batter_id = p.id) as totalRuns,
        (SELECT COUNT(*) FROM deliveries d WHERE d.bowler_id = p.id AND d.is_wicket = 1
          AND d.dismissal_kind NOT IN ('run out', 'retired hurt', 'retired out', 'obstructing the field')) as totalWickets
      FROM players p
      WHERE p.name LIKE ?
      ORDER BY matchesPlayed DESC
      LIMIT ? OFFSET ?
    `, [`%${search}%`, limit, offset]),

    queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM players WHERE name LIKE ?",
      [`%${search}%`]
    ),
  ]);

  return {
    players: players.map(p => ({
      ...p,
      id: Number(p.id),
      matchesPlayed: Number(p.matchesPlayed),
      totalRuns: Number(p.totalRuns),
      totalWickets: Number(p.totalWickets),
    })),
    total: Number(total?.count ?? 0),
  };
}

export async function getPlayerDetail(playerId: number) {
  const player = await queryOne<{ id: number; name: string }>(
    "SELECT id, name FROM players WHERE id = ?",
    [playerId]
  );
  if (!player) return null;

  // Run all independent queries concurrently
  const [batting, dismissals, highestScore, milestones, bowling, bestFigures, battingBySeason, battingByTeamFaced, teamsPlayedFor] = await Promise.all([
    // Batting stats
    queryOne<{
      matches: number; innings: number; runs: number; ballsFaced: number; fours: number; sixes: number;
    }>(`
      SELECT
        COUNT(DISTINCT d.match_id) as matches,
        COUNT(DISTINCT d.match_id || '-' || d.inning) as innings,
        SUM(d.batsman_runs) as runs,
        COUNT(CASE WHEN d.extras_type IS NULL OR d.extras_type NOT IN ('wides') THEN 1 END) as ballsFaced,
        SUM(CASE WHEN d.batsman_runs = 4 THEN 1 ELSE 0 END) as fours,
        SUM(CASE WHEN d.batsman_runs = 6 THEN 1 ELSE 0 END) as sixes
      FROM deliveries d
      WHERE d.batter_id = ?
    `, [playerId]),

    // Dismissals count (for computing average)
    queryOne<{ outs: number }>(`
      SELECT COUNT(*) as outs
      FROM deliveries d
      WHERE d.player_dismissed_id = ?
        AND d.dismissal_kind NOT IN ('retired hurt', 'retired out')
    `, [playerId]),

    // Highest score per innings
    queryOne<{ highest: number }>(`
      SELECT COALESCE(MAX(inning_runs), 0) as highest FROM (
        SELECT SUM(d.batsman_runs) as inning_runs
        FROM deliveries d
        WHERE d.batter_id = ?
        GROUP BY d.match_id, d.inning
      )
    `, [playerId]),

    // 50s and 100s
    queryOne<{ fifties: number; hundreds: number }>(`
      SELECT
        SUM(CASE WHEN inning_runs >= 50 AND inning_runs < 100 THEN 1 ELSE 0 END) as fifties,
        SUM(CASE WHEN inning_runs >= 100 THEN 1 ELSE 0 END) as hundreds
      FROM (
        SELECT SUM(d.batsman_runs) as inning_runs
        FROM deliveries d
        WHERE d.batter_id = ?
        GROUP BY d.match_id, d.inning
      )
    `, [playerId]),

    // Bowling stats
    queryOne<{
      matches: number; legalBalls: number; runsConceded: number; wickets: number;
    }>(`
      SELECT
        COUNT(DISTINCT d.match_id) as matches,
        COUNT(CASE WHEN d.extras_type IS NULL OR d.extras_type NOT IN ('wides', 'noballs') THEN 1 END) as legalBalls,
        SUM(d.total_runs) as runsConceded,
        SUM(CASE WHEN d.is_wicket = 1 AND d.dismissal_kind NOT IN ('run out', 'retired hurt', 'retired out', 'obstructing the field') THEN 1 ELSE 0 END) as wickets
      FROM deliveries d
      WHERE d.bowler_id = ?
    `, [playerId]),

    // Best bowling figures
    queryOne<{ w: number; r: number }>(`
      SELECT
        SUM(CASE WHEN d.is_wicket = 1 AND d.dismissal_kind NOT IN ('run out', 'retired hurt', 'retired out', 'obstructing the field') THEN 1 ELSE 0 END) as w,
        SUM(d.total_runs) as r
      FROM deliveries d
      WHERE d.bowler_id = ?
      GROUP BY d.match_id, d.inning
      ORDER BY w DESC, r ASC
      LIMIT 1
    `, [playerId]),

    // Batting by season
    queryAll<{
      season: number; runs: number; innings: number; avg: number; sr: number;
    }>(`
      SELECT
        m.season,
        SUM(d.batsman_runs) as runs,
        COUNT(DISTINCT d.match_id || '-' || d.inning) as innings,
        ROUND(CAST(SUM(d.batsman_runs) AS REAL) / NULLIF(
          (SELECT COUNT(*) FROM deliveries d2 WHERE d2.batter_id = ? AND d2.player_dismissed_id = ?
            AND d2.match_id IN (SELECT id FROM matches WHERE season = m.season)), 0
        ), 2) as avg,
        ROUND(CAST(SUM(d.batsman_runs) AS REAL) / NULLIF(
          COUNT(CASE WHEN d.extras_type IS NULL OR d.extras_type NOT IN ('wides') THEN 1 END), 0
        ) * 100, 1) as sr
      FROM deliveries d
      JOIN matches m ON d.match_id = m.id
      WHERE d.batter_id = ?
      GROUP BY m.season
      ORDER BY m.season
    `, [playerId, playerId, playerId]),

    // Batting by team faced
    queryAll<{
      opponentName: string; opponentShortCode: string; innings: number; runs: number; sr: number;
    }>(`
      SELECT
        t.name as opponentName,
        t.short_code as opponentShortCode,
        COUNT(DISTINCT d.match_id || '-' || d.inning) as innings,
        SUM(d.batsman_runs) as runs,
        ROUND(CAST(SUM(d.batsman_runs) AS REAL) / NULLIF(
          COUNT(CASE WHEN d.extras_type IS NULL OR d.extras_type NOT IN ('wides') THEN 1 END), 0
        ) * 100, 1) as sr
      FROM deliveries d
      JOIN teams t ON d.bowling_team_id = t.id
      WHERE d.batter_id = ?
      GROUP BY d.bowling_team_id
      HAVING innings >= 2
      ORDER BY runs DESC
    `, [playerId]),

    // Teams played for
    queryAll<{ teamName: string; teamShortCode: string; seasons: string }>(`
      SELECT DISTINCT
        t.name as teamName,
        t.short_code as teamShortCode,
        GROUP_CONCAT(DISTINCT m.season) as seasons
      FROM deliveries d
      JOIN teams t ON d.batting_team_id = t.id
      JOIN matches m ON d.match_id = m.id
      WHERE d.batter_id = ?
      GROUP BY t.id
      ORDER BY MIN(m.season)
    `, [playerId]),
  ]);

  const battingMatches = Number(batting?.matches ?? 0);
  const battingInnings = Number(batting?.innings ?? 0);
  const battingRuns = Number(batting?.runs ?? 0);
  const battingBallsFaced = Number(batting?.ballsFaced ?? 0);
  const battingFours = Number(batting?.fours ?? 0);
  const battingSixes = Number(batting?.sixes ?? 0);
  const outs = Number(dismissals?.outs ?? 0);
  const highest = Number(highestScore?.highest ?? 0);
  const fifties = Number(milestones?.fifties ?? 0);
  const hundreds = Number(milestones?.hundreds ?? 0);

  const notOuts = battingInnings - outs;
  const average = outs > 0 ? Math.round((battingRuns / outs) * 100) / 100 : battingRuns;
  const strikeRate = battingBallsFaced > 0 ? Math.round((battingRuns / battingBallsFaced) * 10000) / 100 : 0;

  const bowlingMatches = Number(bowling?.matches ?? 0);
  const legalBalls = Number(bowling?.legalBalls ?? 0);
  const runsConceded = Number(bowling?.runsConceded ?? 0);
  const wickets = Number(bowling?.wickets ?? 0);

  const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;
  const bowlingEconomy = overs > 0 ? Math.round((runsConceded / (legalBalls / 6)) * 100) / 100 : 0;
  const bowlingAverage = wickets > 0 ? Math.round((runsConceded / wickets) * 100) / 100 : 0;

  return {
    player: { id: Number(player.id), name: player.name },
    batting: {
      matches: battingMatches,
      innings: battingInnings,
      runs: battingRuns,
      ballsFaced: battingBallsFaced,
      average,
      strikeRate,
      fours: battingFours,
      sixes: battingSixes,
      fifties,
      hundreds,
      highestScore: highest,
      notOuts,
    },
    bowling: {
      matches: bowlingMatches,
      overs,
      wickets,
      runsConceded,
      economy: bowlingEconomy,
      average: bowlingAverage,
      bestFigures: bestFigures ? `${Number(bestFigures.w)}/${Number(bestFigures.r)}` : "0/0",
    },
    battingBySeason: battingBySeason.map(b => ({
      season: Number(b.season),
      runs: Number(b.runs),
      innings: Number(b.innings),
      avg: b.avg != null ? Number(b.avg) : null,
      sr: b.sr != null ? Number(b.sr) : null,
    })),
    battingByTeamFaced: battingByTeamFaced.map(b => ({
      opponentName: b.opponentName,
      opponentShortCode: b.opponentShortCode,
      innings: Number(b.innings),
      runs: Number(b.runs),
      sr: b.sr != null ? Number(b.sr) : null,
      avg: Number(b.innings) > 0 ? Math.round((Number(b.runs) / Number(b.innings)) * 100) / 100 : 0,
    })),
    teamsPlayedFor: teamsPlayedFor.map(t => ({
      teamName: t.teamName,
      teamShortCode: t.teamShortCode,
      seasons: t.seasons.split(",").map(Number).sort(),
    })),
  };
}
