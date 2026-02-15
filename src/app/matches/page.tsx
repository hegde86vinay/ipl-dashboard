"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/components/cards/match-card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface MatchResult {
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
  superOver: boolean;
  matchType: string;
}

interface Filters {
  seasons: number[];
  teams: { slug: string; name: string; shortCode: string }[];
  venues: { id: number; name: string }[];
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [season, setSeason] = useState("all");
  const [team, setTeam] = useState("all");
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchMatches = (reset = false) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    const params = new URLSearchParams();
    if (season !== "all") params.set("season", season);
    if (team !== "all") params.set("team", team);
    params.set("limit", "20");
    params.set("offset", currentOffset.toString());

    fetch(`/api/matches?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (reset || currentOffset === 0) {
          setMatches(data.matches);
        } else {
          setMatches(prev => [...prev, ...data.matches]);
        }
        setTotal(data.total);
        setFilters(data.filters);
        setLoading(false);
      });
  };

  useEffect(() => {
    setOffset(0);
    fetchMatches(true);
  }, [season, team]);

  const loadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    setLoading(true);
    const params = new URLSearchParams();
    if (season !== "all") params.set("season", season);
    if (team !== "all") params.set("team", team);
    params.set("limit", "20");
    params.set("offset", newOffset.toString());

    fetch(`/api/matches?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setMatches(prev => [...prev, ...data.matches]);
        setLoading(false);
      });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Match Finder</h1>
        <p className="text-muted-foreground mt-1">
          Browse and filter all 1,095 IPL matches
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {filters?.seasons.map(s => (
              <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={team} onValueChange={setTeam}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {filters?.teams.map(t => (
              <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {total} matches found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map(m => (
          <MatchCard
            key={m.id}
            season={m.season}
            date={m.date}
            venue={m.venue}
            team1={m.team1}
            team1ShortCode={m.team1ShortCode}
            team2={m.team2}
            team2ShortCode={m.team2ShortCode}
            winner={m.winner}
            result={m.result}
            resultMargin={m.resultMargin}
            playerOfMatch={m.playerOfMatch}
            superOver={m.superOver}
            matchType={m.matchType}
          />
        ))}
      </div>

      {matches.length < total && (
        <div className="text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : `Load More (${matches.length} of ${total})`}
          </Button>
        </div>
      )}

      {matches.length === 0 && !loading && (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No matches found with the selected filters</p>
        </div>
      )}
    </div>
  );
}
