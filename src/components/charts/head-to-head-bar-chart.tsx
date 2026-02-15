"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  data: {
    opponentName?: string;
    opponentShortCode: string;
    played: number;
    won: number;
    lost: number;
  }[];
  teamColor?: string;
}

export function HeadToHeadBarChart({ data, teamColor = "#3b82f6" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" />
        <YAxis
          type="category"
          dataKey="opponentShortCode"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          stroke="#52525b"
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          labelStyle={{ color: "#e4e4e7" }}
        />
        <Bar dataKey="won" fill={teamColor} radius={[0, 4, 4, 0]} name="Won" />
        <Bar dataKey="lost" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Lost" />
      </BarChart>
    </ResponsiveContainer>
  );
}
