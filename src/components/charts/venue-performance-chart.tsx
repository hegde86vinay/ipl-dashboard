"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { venueName: string; played: number; won: number; winPct: number }[];
  color?: string;
}

export function VenuePerformanceChart({ data, color = "#3b82f6" }: Props) {
  const chartData = data.map(d => ({
    ...d,
    shortVenue: d.venueName.split(",")[0].substring(0, 20),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#52525b" domain={[0, 100]} unit="%" />
        <YAxis
          type="category"
          dataKey="shortVenue"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          stroke="#52525b"
          width={130}
        />
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
        <Bar dataKey="winPct" fill={color} radius={[0, 4, 4, 0]} name="Win %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
