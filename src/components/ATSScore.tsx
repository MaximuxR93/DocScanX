"use client";

import { useEffect, useState } from "react";

interface ATSScoreProps {
  score: number;
}

export default function ATSScore({ score }: ATSScoreProps) {
  const safe = typeof score === "number" && !isNaN(score) ? score : 0;
  const [animated, setAnimated] = useState(0);

  const radius = 58;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(safe), 120);
    return () => clearTimeout(t);
  }, [safe]);

  const color =
    safe >= 75 ? "#22c55e" : safe >= 50 ? "#f59e0b" : "#ef4444";

  const grade =
    safe >= 85 ? "A" : safe >= 70 ? "B" : safe >= 55 ? "C" : safe >= 40 ? "D" : "F";

  const label =
    safe >= 75 ? "Strong Match" : safe >= 50 ? "Moderate Match" : "Weak Match";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
          <circle cx="68" cy="68" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <circle
            cx="68" cy="68" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums" style={{ color }}>
            {Math.round(animated)}
          </span>
          <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">/ 100</span>
        </div>
        <div
          className="absolute -top-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 border-zinc-900"
          style={{ background: color, color: "#000" }}
        >
          {grade}
        </div>
      </div>
      <span className="text-sm font-semibold tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
