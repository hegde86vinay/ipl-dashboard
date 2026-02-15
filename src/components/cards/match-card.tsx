import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  season: number;
  date: string;
  venue: string;
  team1: string;
  team1ShortCode: string;
  team2: string;
  team2ShortCode: string;
  winner: string | null;
  result: string;
  resultMargin: number | null;
  playerOfMatch: string | null;
  superOver: boolean;
  matchType?: string;
}

export function MatchCard({
  season,
  date,
  venue,
  team1,
  team1ShortCode,
  team2,
  team2ShortCode,
  winner,
  result,
  resultMargin,
  playerOfMatch,
  superOver,
  matchType,
}: MatchCardProps) {
  const resultText = winner
    ? `${winner === team1 ? team1ShortCode : team2ShortCode} won by ${resultMargin} ${result}`
    : result === "tie"
    ? "Match Tied"
    : "No Result";

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <div className="flex gap-1.5">
            {matchType && matchType !== "League" && (
              <Badge variant="outline" className="text-xs">{matchType}</Badge>
            )}
            {superOver && <Badge variant="destructive" className="text-xs">Super Over</Badge>}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${winner === team1 ? "text-foreground" : "text-muted-foreground"}`}>
              {team1ShortCode}
            </span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className={`font-semibold text-sm ${winner === team2 ? "text-foreground" : "text-muted-foreground"}`}>
              {team2ShortCode}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">{season}</Badge>
        </div>

        <p className="text-sm font-medium text-foreground">{resultText}</p>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground truncate max-w-[60%]">{venue}</p>
          {playerOfMatch && (
            <p className="text-xs text-muted-foreground">
              MoM: <span className="text-foreground">{playerOfMatch}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
