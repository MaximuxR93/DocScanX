"use client";

import { useEffect, useState } from "react";

interface ATSScoreProps {
  score: number;
  label?: string;
}

export default function ATSScore({ score, label = "ATS Match" }: ATSScoreProps) {

  const [animated, setAnimated] = useState<number>(0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#facc15";
    return "#ef4444";
  };

  const getScoreLabel = () => {
    if (score >= 75) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 25) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="flex flex-col items-center gap-2">

      <div className="relative w-32 h-32">

        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">

          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="8"
          />

          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />

        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <span className="text-3xl font-bold">
            {Math.round(animated)}%
          </span>

        </div>

      </div>

      <span className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span className="text-sm font-semibold" style={{ color: getScoreColor() }}>
        {getScoreLabel()}
      </span>

    </div>
  );
}