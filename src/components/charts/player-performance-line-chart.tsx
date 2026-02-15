"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  data: { season: number; runs: number; innings: number; avg?: number | null; sr: number | null }[];
}

export function PlayerPerformanceLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="season" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" />
        <YAxis yAxisId="left" tick={{ fill: "#60a5fa", fontSize: 12 }} stroke="#3b82f6" />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: "#34d399", fontSize: 12 }} stroke="#10b981" />
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
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="runs"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Runs"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sr"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Strike Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
