"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CategoryBreakdown } from "@/lib/types";
import { PieChart as PieChartIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const filteredData = data.filter((d) => d.co2Kg > 0);

  if (filteredData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ opacity: 0.7 }}>
          <PieChartIcon size={36} />
        </div>
        <h4>No data yet</h4>
        <p>Log activities to see your category breakdown.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={100}
            paddingAngle={4}
            dataKey="co2Kg"
            nameKey="label"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown) => [`${Number(value).toFixed(2)} kg CO₂`, ""]}
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
          <Legend
            verticalAlign="bottom"
            formatter={(value: string) => {
              const item = filteredData.find((d) => d.label === value);
              return (
                <span style={{ color: isDark ? "#94A3B8" : "#475569", fontSize: "0.85rem", fontWeight: 450 }}>
                  {value} ({item ? `${item.co2Kg.toFixed(1)} kg · ${item.percentage}%` : ""})
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
