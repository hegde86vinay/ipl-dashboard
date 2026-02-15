import { getOverviewStats } from "@/lib/queries/overview";
import { StatCard } from "@/components/cards/stat-card";
import { SeasonRunsAreaChart } from "@/components/charts/season-runs-area-chart";
import { SixesBarChart } from "@/components/charts/sixes-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Calendar, TrendingUp, Target, Zap, Trophy } from "lucide-react";
import Link from "next/link";

export default async function OverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">IPL Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          17 seasons of Indian Premier League cricket (2008 — 2024)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="Total Matches" value={stats.totalMatches} icon={Calendar} />
        <StatCard title="Total Runs" value={stats.totalRuns} icon={TrendingUp} />
        <StatCard title="Wickets" value={stats.totalWickets} icon={Target} />
        <StatCard title="Sixes" value={stats.totalSixes} icon={Zap} color="#f59e0b" />
        <StatCard title="Fours" value={stats.totalFours} icon={Trophy} color="#3b82f6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Runs by Season</CardTitle>
          </CardHeader>
          <CardContent>
            <SeasonRunsAreaChart data={stats.runsBySeason} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sixes by Season</CardTitle>
          </CardHeader>
          <CardContent>
            <SixesBarChart data={stats.sixesBySeason} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Run Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topRunScorers.map((p, i) => (
                  <TableRow key={p.playerId}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <Link href={`/players/${p.playerId}`} className="hover:underline">
                        {p.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{p.totalRuns.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Wicket Takers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Wickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topWicketTakers.map((p, i) => (
                  <TableRow key={p.playerId}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <Link href={`/players/${p.playerId}`} className="hover:underline">
                        {p.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{p.totalWickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Player of the Match</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Awards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.mostPlayerOfMatch.map((p, i) => (
                  <TableRow key={p.playerId}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <Link href={`/players/${p.playerId}`} className="hover:underline">
                        {p.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{p.awards}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
