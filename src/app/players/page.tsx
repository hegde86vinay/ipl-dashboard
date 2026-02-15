"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import Link from "next/link";

interface PlayerResult {
  id: number;
  name: string;
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<PlayerResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/players?search=${encodeURIComponent(debouncedSearch)}&limit=30`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data.players);
        setTotal(data.total);
        setLoading(false);
      });
  }, [debouncedSearch]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-muted-foreground mt-1">
          Search and explore batting and bowling stats for 741 IPL players
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players... (e.g. Kohli, Bumrah)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {loading ? "Searching..." : `${total} players found`}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(p => (
          <Link key={p.id} href={`/players/${p.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {p.matchesPlayed} matches
                  </Badge>
                  {p.totalRuns > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {p.totalRuns.toLocaleString()} runs
                    </Badge>
                  )}
                  {p.totalWickets > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {p.totalWickets} wickets
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
