"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: { date: string; sales: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
          <YAxis stroke="#a1a1aa" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#141416",
              border: "1px solid #27272a",
              borderRadius: "0.5rem",
            }}
            formatter={(value) => [`¥${Number(value).toLocaleString()}`, "売上"]}
          />
          <Bar dataKey="sales" fill="#d4af37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
