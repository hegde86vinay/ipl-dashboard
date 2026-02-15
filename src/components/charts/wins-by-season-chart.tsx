"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { season: number; played: number; won: number; winPct: number }[];
  color?: string;
}

export function WinsBySeasonChart({ data, color = "#3b82f6" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="season" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" domain={[0, 100]} unit="%" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          labelStyle={{ color: "#e4e4e7" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            if (name === "winPct") return [`${value}%`, "Win %"];
            return [value, name];
          }}
        />
        <Line
          type="monotone"
          dataKey="winPct"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
