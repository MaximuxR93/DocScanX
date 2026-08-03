"use client";

interface Props {
  data: {
    skills: number;
    projects: number;
    experience: number;
    education: number;
  };
  feedback: {
    skills: string;
    projects: string;
    experience: string;
    education: string;
  };
}

const sections = [
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
] as const;

function barColor(v: number) {
  if (v >= 75) return "#22c55e";
  if (v >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function ScoreChart({ data, feedback }: Props) {
  return (
    <div className="space-y-4">
      {sections.map(({ key, label }) => {
        const val = data[key] ?? 0;
        const color = barColor(val);
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-zinc-300">{label}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color }}>{val}%</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${val}%`,
                  background: color,
                  boxShadow: `0 0 6px ${color}66`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">{feedback[key]}</p>
          </div>
        );
      })}
    </div>
  );
}
