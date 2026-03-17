"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ScoreChart({ data }: any) {

  const chartData = [
    { name: "Skills", value: data.skills },
    { name: "Projects", value: data.projects },
    { name: "Experience", value: data.experience },
    { name: "Education", value: data.education }
  ];

  return (
    <div className="h-[260px] w-full">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart data={chartData}>

          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            stroke="#aaa"
            tick={{ fill: "#ccc" }}
          />

          <Tooltip
            contentStyle={{
              background: "#111",
              border: "1px solid #444"
            }}
          />

          <Bar
            dataKey="value"
            fill="url(#colorBar)"
            radius={[10, 10, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}