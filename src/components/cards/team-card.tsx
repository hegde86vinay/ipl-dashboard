import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamCardProps {
  name: string;
  shortCode: string;
  color: string;
  matchesPlayed: number;
  matchesWon: number;
  winPercentage: number;
  titles: number;
  isActive: boolean;
}

export function TeamCard({
  name,
  shortCode,
  color,
  matchesPlayed,
  matchesWon,
  winPercentage,
  titles,
  isActive,
}: TeamCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            {shortCode}
          </div>
          {titles > 0 && (
            <Badge variant="outline" className="text-xs">
              {titles}x Champion
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {!isActive && (
          <Badge variant="secondary" className="text-xs mb-2">Defunct</Badge>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">Played</p>
            <p className="text-sm font-semibold">{matchesPlayed}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Won</p>
            <p className="text-sm font-semibold">{matchesWon}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Win%</p>
            <p className="text-sm font-semibold">{winPercentage}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
