"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft flex items-center justify-center h-[300px]">
        <span className="text-sm text-secondaryText">
          No revenue data yet
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-darkSurface border border-border dark:border-darkBorder rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold">Weekly Revenue</h3>
          <p className="text-xs text-secondaryText">
            Performance over recent weeks
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}