"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyBreakdown } from "@/lib/types";
import type { ReactNode } from "react";
import { useTheme } from "./ThemeProvider";

interface WeeklyTrendChartProps {
  data: DailyBreakdown[];
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "rgba(255, 255, 255, 0.07)" : "#e2e8e5";
  const axisTextColor = isDark ? "#94A3B8" : "#7a8a82";
  const todayBarColor = isDark ? "#34D399" : "#1F5A3D";
  const otherBarColor = isDark ? "rgba(52, 211, 153, 0.35)" : "#a8d8b9";

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: axisTextColor, fontSize: 13 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: axisTextColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}`}
            label={{
              value: "kg CO₂",
              angle: -90,
              position: "insideLeft",
              fill: axisTextColor,
              fontSize: 12,
            }}
          />
          <Tooltip
            formatter={(value: unknown) => [`${Number(value).toFixed(2)} kg CO₂`, "Emissions"]}
            labelFormatter={(label: ReactNode) => {
              const labelStr = String(label);
              const item = data.find((d) => d.day === labelStr);
              return item ? `${labelStr} (${item.date})` : labelStr;
            }}
            contentStyle={{
              borderRadius: "12px",
              background: isDark ? "rgba(14, 23, 19, 0.95)" : "rgba(255, 255, 255, 0.95)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.06)",
              color: isDark ? "#f8fafc" : "#0f172a",
              fontSize: "0.85rem",
              backdropFilter: "blur(12px)",
            }}
          />
          <Bar dataKey="co2Kg" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday ? todayBarColor : otherBarColor}
                stroke={entry.isToday ? (isDark ? "#10B981" : "#1a3a2a") : "none"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <div className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ background: todayBarColor }}
          ></div>
          <span style={{ color: isDark ? "#CBD5E1" : "inherit" }}>Today</span>
        </div>
        <div className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ background: otherBarColor }}
          ></div>
          <span style={{ color: isDark ? "#94A3B8" : "inherit" }}>Other days</span>
        </div>
      </div>
    </div>
  );
}
