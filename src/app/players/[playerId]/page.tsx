import { getPlayerDetail } from "@/lib/queries/players";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/cards/stat-card";
import { PlayerPerformanceLineChart } from "@/components/charts/player-performance-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TrendingUp, Target, Zap, Award, Hash, Crosshair } from "lucide-react";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const data = await getPlayerDetail(parseInt(playerId));
  if (!data) notFound();

  const { player, batting, bowling, battingBySeason, battingByTeamFaced, teamsPlayedFor } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{player.name}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {teamsPlayedFor.map(t => (
            <Badge key={t.teamShortCode} variant="outline">
              {t.teamShortCode} ({t.seasons[0]}–{t.seasons[t.seasons.length - 1]})
            </Badge>
          ))}
        </div>
      </div>

      {/* Batting Stats */}
      {batting.runs > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Batting</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard title="Matches" value={batting.matches} icon={Hash} />
            <StatCard title="Runs" value={batting.runs} icon={TrendingUp} />
            <StatCard title="Average" value={batting.average} icon={Target} />
            <StatCard title="Strike Rate" value={batting.strikeRate} icon={Zap} />
            <StatCard title="Highest" value={batting.highestScore} icon={Award} />
            <StatCard
              title="50s / 100s"
              value={`${batting.fifties} / ${batting.hundreds}`}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{batting.fours}</p>
                <p className="text-xs text-muted-foreground mt-1">Fours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{batting.sixes}</p>
                <p className="text-xs text-muted-foreground mt-1">Sixes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{batting.ballsFaced.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Balls Faced</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{batting.notOuts}</p>
                <p className="text-xs text-muted-foreground mt-1">Not Outs</p>
              </CardContent>
            </Card>
          </div>

          {battingBySeason.length > 1 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Season-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerPerformanceLineChart data={battingBySeason} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bowling Stats */}
      {bowling.wickets > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Bowling</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard title="Wickets" value={bowling.wickets} icon={Crosshair} />
            <StatCard title="Economy" value={bowling.economy} icon={Target} />
            <StatCard title="Average" value={bowling.average} icon={TrendingUp} />
            <StatCard title="Best" value={bowling.bestFigures} icon={Award} />
            <StatCard title="Overs" value={bowling.overs} icon={Hash} />
            <StatCard title="Runs Given" value={bowling.runsConceded} icon={TrendingUp} />
          </div>
        </div>
      )}

      {/* Performance vs Teams */}
      {battingByTeamFaced.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batting vs Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead className="text-right">Inn</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">SR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {battingByTeamFaced.map(t => (
                  <TableRow key={t.opponentShortCode}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{t.opponentShortCode}</Badge>
                      <span className="ml-2 text-sm">{t.opponentName}</span>
                    </TableCell>
                    <TableCell className="text-right">{t.innings}</TableCell>
                    <TableCell className="text-right font-semibold">{t.runs.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{t.avg}</TableCell>
                    <TableCell className="text-right">{t.sr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
