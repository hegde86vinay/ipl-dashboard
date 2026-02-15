import { getTeamDetail, getTeamPlayers } from "@/lib/queries/teams";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/cards/stat-card";
import { WinsBySeasonChart } from "@/components/charts/wins-by-season-chart";
import { HeadToHeadBarChart } from "@/components/charts/head-to-head-bar-chart";
import { VenuePerformanceChart } from "@/components/charts/venue-performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trophy, TrendingUp, Target, Percent } from "lucide-react";
import Link from "next/link";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>;
}) {
  const { teamSlug } = await params;
  const data = await getTeamDetail(teamSlug);
  if (!data) notFound();

  const playersData = await getTeamPlayers(teamSlug);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-xl"
          style={{ backgroundColor: data.team.color }}
        >
          {data.team.shortCode}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{data.team.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {data.overall.titles > 0 && (
              <Badge variant="outline">{data.overall.titles}x IPL Champion</Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {data.overall.matchesPlayed} matches played
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Wins" value={data.overall.wins} icon={Trophy} color={data.team.color} />
        <StatCard title="Win %" value={`${data.overall.winPercentage}%`} icon={Percent} />
        <StatCard title="Tosses Won" value={data.tossRecord.tossesWon} icon={Target} />
        <StatCard
          title="Losses"
          value={data.overall.losses}
          icon={TrendingUp}
          description={`${data.overall.noResults} no results`}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Season Trend</TabsTrigger>
          <TabsTrigger value="h2h">Head-to-Head</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Win % by Season</CardTitle>
            </CardHeader>
            <CardContent>
              <WinsBySeasonChart data={data.seasonBySeasonRecord} color={data.team.color} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="h2h">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record vs Other Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <HeadToHeadBarChart data={data.headToHead} teamColor={data.team.color} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Win % at Venues (min 3 matches)</CardTitle>
            </CardHeader>
            <CardContent>
              <VenuePerformanceChart data={data.venuePerformance} color={data.team.color} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Batters</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Runs</TableHead>
                      <TableHead className="text-right">4s</TableHead>
                      <TableHead className="text-right">6s</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playersData?.batters.map(p => (
                      <TableRow key={p.playerId}>
                        <TableCell>
                          <Link href={`/players/${p.playerId}`} className="hover:underline">
                            {p.playerName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{p.runs.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{p.fours}</TableCell>
                        <TableCell className="text-right">{p.sixes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Bowlers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Wickets</TableHead>
                      <TableHead className="text-right">Econ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playersData?.bowlers.map(p => (
                      <TableRow key={p.playerId}>
                        <TableCell>
                          <Link href={`/players/${p.playerId}`} className="hover:underline">
                            {p.playerName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{p.wickets}</TableCell>
                        <TableCell className="text-right">{p.economy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
