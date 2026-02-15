"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  data: { season: number; team1Wins: number; team2Wins: number }[];
  team1Label: string;
  team2Label: string;
  team1Color: string;
  team2Color: string;
}

export function H2HSeasonChart({ data, team1Label, team2Label, team1Color, team2Color }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="season" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          labelStyle={{ color: "#e4e4e7" }}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa" }} />
        <Bar dataKey="team1Wins" fill={team1Color} radius={[4, 4, 0, 0]} name={team1Label} />
        <Bar dataKey="team2Wins" fill={team2Color} radius={[4, 4, 0, 0]} name={team2Label} />
      </BarChart>
    </ResponsiveContainer>
  );
}
