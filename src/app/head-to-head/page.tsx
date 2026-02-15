"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/cards/stat-card";
import { MatchCard } from "@/components/cards/match-card";
import { H2HSeasonChart } from "@/components/charts/h2h-season-chart";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Swords, Trophy, Minus } from "lucide-react";

interface Team {
  slug: string;
  name: string;
  shortCode: string;
}

interface H2HData {
  team1: { id: number; name: string; shortCode: string; color: string };
  team2: { id: number; name: string; shortCode: string; color: string };
  overall: { totalMatches: number; team1Wins: number; team2Wins: number; noResults: number };
  bySeason: { season: number; team1Wins: number; team2Wins: number }[];
  byVenue: { venueName: string; team1Wins: number; team2Wins: number }[];
  recentMatches: {
    matchId: number; season: number; date: string; venue: string;
    winner: string | null; result: string; margin: number | null;
  }[];
}

export default function HeadToHeadPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [data, setData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(d => setTeams(d.teams.map((t: { slug: string; name: string; shortCode: string }) => ({
        slug: t.slug, name: t.name, shortCode: t.shortCode,
      }))));
  }, []);

  useEffect(() => {
    if (team1 && team2 && team1 !== team2) {
      setLoading(true);
      fetch(`/api/head-to-head?team1=${team1}&team2=${team2}`)
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        });
    }
  }, [team1, team2]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Head to Head</h1>
        <p className="text-muted-foreground mt-1">Compare any two IPL franchises</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select value={team1} onValueChange={setTeam1}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Team 1" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(t => (
              <SelectItem key={t.slug} value={t.slug} disabled={t.slug === team2}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xl font-bold text-muted-foreground">vs</span>

        <Select value={team2} onValueChange={setTeam2}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Team 2" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(t => (
              <SelectItem key={t.slug} value={t.slug} disabled={t.slug === team1}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title={data.team1.shortCode + " Wins"}
              value={data.overall.team1Wins}
              icon={Trophy}
              color={data.team1.color}
            />
            <StatCard
              title="Total Matches"
              value={data.overall.totalMatches}
              icon={Swords}
            />
            <StatCard
              title={data.team2.shortCode + " Wins"}
              value={data.overall.team2Wins}
              icon={Trophy}
              color={data.team2.color}
            />
          </div>

          {data.overall.noResults > 0 && (
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {data.overall.noResults} no result(s)
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.bySeason.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Season-wise Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <H2HSeasonChart
                    data={data.bySeason}
                    team1Label={data.team1.shortCode}
                    team2Label={data.team2.shortCode}
                    team1Color={data.team1.color}
                    team2Color={data.team2.color}
                  />
                </CardContent>
              </Card>
            )}

            {data.byVenue.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">By Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.byVenue.map(v => (
                      <div key={v.venueName} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-40 truncate">{v.venueName.split(",")[0]}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden flex">
                            <div
                              className="h-full rounded-l-full"
                              style={{
                                width: `${(v.team1Wins / (v.team1Wins + v.team2Wins)) * 100}%`,
                                backgroundColor: data.team1.color,
                              }}
                            />
                            <div
                              className="h-full rounded-r-full"
                              style={{
                                width: `${(v.team2Wins / (v.team1Wins + v.team2Wins)) * 100}%`,
                                backgroundColor: data.team2.color,
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono w-12 text-right">
                            {v.team1Wins}-{v.team2Wins}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {data.recentMatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.recentMatches.map(m => (
                    <MatchCard
                      key={m.matchId}
                      season={m.season}
                      date={m.date}
                      venue={m.venue}
                      team1={data.team1.name}
                      team1ShortCode={data.team1.shortCode}
                      team2={data.team2.name}
                      team2ShortCode={data.team2.shortCode}
                      winner={m.winner}
                      result={m.result}
                      resultMargin={m.margin}
                      playerOfMatch={null}
                      superOver={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!team1 || !team2 ? (
        <div className="text-center py-20">
          <Swords className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select two teams above to compare their head-to-head record</p>
        </div>
      ) : null}
    </div>
  );
}
