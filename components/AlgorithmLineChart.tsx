"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export interface ChartPoint {
  size: number;
  quicksort?: number;
  mergesort?: number;
  builtin?: number;
  nosort?: number;
}

const SERIES = [
  { key: "quicksort", label: "Quick Sort", color: "#2B6CB0" },
  { key: "mergesort", label: "Merge Sort", color: "#B5652B" },
  { key: "builtin", label: "Built-in (Baseline)", color: "#3F6B4F" },
  { key: "nosort", label: "No Sort (Baseline)", color: "#8A8478" }
];

export function AlgorithmLineChart({ data, yLabel = "Sorting Time (ms)" }: { data: ChartPoint[]; yLabel?: string }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="#D9D4C7" strokeDasharray="2 3" />
        <XAxis
          dataKey="size"
          tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: "#4B534F" }}
          label={{ value: "Candidate Documents", position: "insideBottom", offset: -4, fontSize: 11 }}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: "#4B534F" }}
          label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, borderRadius: 4 }}
          labelFormatter={(v) => `Input size: ${v}`}
        />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }} />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 2.5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
