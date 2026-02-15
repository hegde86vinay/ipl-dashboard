import { queryAll, queryOne } from "../db";
import type { TeamSummary } from "../types";

export async function getAllTeams(activeOnly = false): Promise<TeamSummary[]> {
  const teams = await queryAll<{
    id: number; name: string; slug: string; shortCode: string; color: string;
    isActive: number; matchesPlayed: number; matchesWon: number; titles: number;
  }>(`
    SELECT t.id, t.name, t.slug, t.short_code as shortCode, t.color, t.is_active as isActive,
      (SELECT COUNT(*) FROM matches m WHERE m.team1_id = t.id OR m.team2_id = t.id) as matchesPlayed,
      (SELECT COUNT(*) FROM matches m WHERE m.winner_id = t.id) as matchesWon,
      (SELECT COUNT(*) FROM matches m WHERE m.winner_id = t.id AND m.match_type = 'Final') as titles
    FROM teams t
    ${activeOnly ? "WHERE t.is_active = 1" : ""}
    ORDER BY matchesWon DESC
  `);

  return teams.map(t => ({
    id: Number(t.id),
    name: t.name,
    slug: t.slug,
    shortCode: t.shortCode,
    color: t.color,
    isActive: Number(t.isActive) === 1,
    matchesPlayed: Number(t.matchesPlayed),
    matchesWon: Number(t.matchesWon),
    titles: Number(t.titles),
    winPercentage: Number(t.matchesPlayed) > 0
      ? Math.round((Number(t.matchesWon) / Number(t.matchesPlayed)) * 1000) / 10
      : 0,
  }));
}

export async function getTeamDetail(slug: string) {
  const team = await queryOne<{
    id: number; name: string; slug: string; shortCode: string; color: string;
  }>(
    "SELECT id, name, slug, short_code as shortCode, color FROM teams WHERE slug = ?",
    [slug]
  );

  if (!team) return null;

  const teamId = Number(team.id);

  const [overall, tossRecord, seasonBySeasonRecord, headToHead, venuePerformance] =
    await Promise.all([
      queryOne<{
        matchesPlayed: number; wins: number; losses: number; noResults: number; titles: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM matches WHERE team1_id = ? OR team2_id = ?) as matchesPlayed,
          (SELECT COUNT(*) FROM matches WHERE winner_id = ?) as wins,
          (SELECT COUNT(*) FROM matches WHERE (team1_id = ? OR team2_id = ?) AND winner_id IS NOT NULL AND winner_id != ?) as losses,
          (SELECT COUNT(*) FROM matches WHERE (team1_id = ? OR team2_id = ?) AND winner_id IS NULL) as noResults,
          (SELECT COUNT(*) FROM matches WHERE winner_id = ? AND match_type = 'Final') as titles
      `, [teamId, teamId, teamId, teamId, teamId, teamId, teamId, teamId, teamId]),

      queryOne<{
        tossesWon: number; batFirstWins: number; fieldFirstWins: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM matches WHERE toss_winner_id = ?) as tossesWon,
          (SELECT COUNT(*) FROM matches WHERE toss_winner_id = ? AND toss_decision = 'bat' AND winner_id = ?) as batFirstWins,
          (SELECT COUNT(*) FROM matches WHERE toss_winner_id = ? AND toss_decision = 'field' AND winner_id = ?) as fieldFirstWins
      `, [teamId, teamId, teamId, teamId, teamId]),

      queryAll<{
        season: number; played: number; won: number; lost: number; winPct: number;
      }>(`
        SELECT
          m.season,
          COUNT(*) as played,
          SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as won,
          SUM(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != ? THEN 1 ELSE 0 END) as lost,
          ROUND(CAST(SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as winPct
        FROM matches m
        WHERE m.team1_id = ? OR m.team2_id = ?
        GROUP BY m.season
        ORDER BY m.season
      `, [teamId, teamId, teamId, teamId, teamId]),

      queryAll<{
        opponentId: number; opponentName: string; opponentShortCode: string;
        played: number; won: number; lost: number;
      }>(`
        SELECT
          t2.id as opponentId,
          t2.name as opponentName,
          t2.short_code as opponentShortCode,
          COUNT(*) as played,
          SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as won,
          SUM(CASE WHEN m.winner_id = t2.id THEN 1 ELSE 0 END) as lost
        FROM matches m
        JOIN teams t2 ON t2.id = CASE
          WHEN m.team1_id = ? THEN m.team2_id
          ELSE m.team1_id
        END
        WHERE (m.team1_id = ? OR m.team2_id = ?)
        GROUP BY t2.id
        ORDER BY played DESC
      `, [teamId, teamId, teamId, teamId]),

      queryAll<{
        venueId: number; venueName: string; played: number; won: number; winPct: number;
      }>(`
        SELECT
          v.id as venueId,
          v.name as venueName,
          COUNT(*) as played,
          SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as won,
          ROUND(CAST(SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as winPct
        FROM matches m
        JOIN venues v ON m.venue_id = v.id
        WHERE m.team1_id = ? OR m.team2_id = ?
        GROUP BY v.id
        HAVING played >= 3
        ORDER BY played DESC
        LIMIT 10
      `, [teamId, teamId, teamId, teamId]),
    ]);

  // overall and tossRecord should always exist since we found the team, but guard just in case
  const o = overall!;
  const tr = tossRecord!;

  const matchesPlayed = Number(o.matchesPlayed);
  const wins = Number(o.wins);
  const winPct = matchesPlayed > 0
    ? Math.round((wins / matchesPlayed) * 1000) / 10
    : 0;

  return {
    team: {
      id: teamId,
      name: team.name,
      slug: team.slug,
      shortCode: team.shortCode,
      color: team.color,
    },
    overall: {
      matchesPlayed,
      wins,
      losses: Number(o.losses),
      noResults: Number(o.noResults),
      titles: Number(o.titles),
      winPercentage: winPct,
    },
    tossRecord: {
      tossesWon: Number(tr.tossesWon),
      batFirstWins: Number(tr.batFirstWins),
      fieldFirstWins: Number(tr.fieldFirstWins),
    },
    seasonBySeasonRecord: seasonBySeasonRecord.map(s => ({
      season: Number(s.season),
      played: Number(s.played),
      won: Number(s.won),
      lost: Number(s.lost),
      winPct: Number(s.winPct),
    })),
    headToHead: headToHead.map(h => ({
      opponentId: Number(h.opponentId),
      opponentName: h.opponentName,
      opponentShortCode: h.opponentShortCode,
      played: Number(h.played),
      won: Number(h.won),
      lost: Number(h.lost),
    })),
    venuePerformance: venuePerformance.map(v => ({
      venueId: Number(v.venueId),
      venueName: v.venueName,
      played: Number(v.played),
      won: Number(v.won),
      winPct: Number(v.winPct),
    })),
  };
}

export async function getTeamPlayers(slug: string) {
  const team = await queryOne<{ id: number }>(
    "SELECT id FROM teams WHERE slug = ?",
    [slug]
  );
  if (!team) return null;

  const teamId = Number(team.id);

  const [batters, bowlersSimple] = await Promise.all([
    queryAll<{
      playerId: number; playerName: string; matches: number; innings: number;
      runs: number; strikeRate: number; fours: number; sixes: number;
    }>(`
      SELECT
        p.id as playerId,
        p.name as playerName,
        COUNT(DISTINCT d.match_id) as matches,
        COUNT(*) as innings,
        SUM(d.batsman_runs) as runs,
        ROUND(CAST(SUM(d.batsman_runs) AS REAL) / NULLIF(COUNT(*), 0) * 100 / NULLIF(
          (SELECT COUNT(*) FROM deliveries d2
           WHERE d2.batter_id = p.id AND d2.batting_team_id = ?
           AND d2.extras_type IS NULL OR d2.extras_type NOT IN ('wides')), 0
        ), 1) as strikeRate,
        SUM(CASE WHEN d.batsman_runs = 4 THEN 1 ELSE 0 END) as fours,
        SUM(CASE WHEN d.batsman_runs = 6 THEN 1 ELSE 0 END) as sixes
      FROM deliveries d
      JOIN players p ON d.batter_id = p.id
      WHERE d.batting_team_id = ?
      GROUP BY d.batter_id
      ORDER BY runs DESC
      LIMIT 10
    `, [teamId, teamId]),

    queryAll<{
      playerId: number; playerName: string; matches: number; wickets: number; economy: number;
    }>(`
      SELECT
        p.id as playerId,
        p.name as playerName,
        COUNT(DISTINCT d.match_id) as matches,
        SUM(CASE WHEN d.is_wicket = 1 AND d.dismissal_kind NOT IN ('run out', 'retired hurt', 'retired out', 'obstructing the field') THEN 1 ELSE 0 END) as wickets,
        ROUND(CAST(SUM(d.total_runs) AS REAL) / NULLIF(CAST(COUNT(CASE WHEN d.extras_type IS NULL OR d.extras_type NOT IN ('wides', 'noballs') THEN 1 END) AS REAL) / 6, 0), 2) as economy
      FROM deliveries d
      JOIN players p ON d.bowler_id = p.id
      JOIN matches m ON d.match_id = m.id
      WHERE (m.team1_id = ? OR m.team2_id = ?)
        AND d.bowling_team_id != ?
      GROUP BY d.bowler_id
      HAVING wickets > 0
      ORDER BY wickets DESC
      LIMIT 10
    `, [teamId, teamId, teamId]),
  ]);

  return {
    batters: batters.map(b => ({
      playerId: Number(b.playerId),
      playerName: b.playerName,
      matches: Number(b.matches),
      innings: Number(b.innings),
      runs: Number(b.runs),
      strikeRate: Number(b.strikeRate),
      fours: Number(b.fours),
      sixes: Number(b.sixes),
    })),
    bowlers: bowlersSimple.map(b => ({
      playerId: Number(b.playerId),
      playerName: b.playerName,
      matches: Number(b.matches),
      wickets: Number(b.wickets),
      economy: Number(b.economy),
    })),
  };
}
