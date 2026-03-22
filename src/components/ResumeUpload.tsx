"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Sparkles,
  Loader2,
  Trash2,
  Download
} from "lucide-react";

import ATSScore from "./ATSScore";
import ScoreChart from "./ScoreChart";

interface RoadmapItem {
  step: string;
  why: string;
  priority: string;
}

interface ScoreBreakdown {
  totalSkills: number;
  matchedSkills: number;
  missingSkills: number;
  matchPercentage: number;
  formula: string;
}

interface AIResponse {
  score: number;
  reasoning: string;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  topFixes: string[];
  suggestions: string[];
  sectionScores: {
    skills: number;
    projects: number;
    experience: number;
    education: number;
  };
  sectionFeedback: {
    skills: string;
    projects: string;
    experience: string;
    education: string;
  };
  rewrittenBullets: {
    original: string;
    improved: string;
  }[];
  roadmap: RoadmapItem[];
}

export default function ResumeUpload() {

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<AIResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: (files) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  },
  accept: { "application/pdf": [".pdf"] },
  maxFiles: 1
});

  const handleUpload = async () => {
    if (!file) return alert("Upload resume");

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      setData(result);

    } catch {
      setError("Failed to analyze");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-400 mt-2">
          Data-driven ATS analysis with explainable scoring
        </p>
      </div>

      {/* UPLOAD */}
      <div
        {...getRootProps({
          className: `p-8 rounded-xl border-2 border-dashed cursor-pointer mb-6 ${
            isDragActive
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 hover:border-purple-500"
          }`
        })}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          {file ? (
            <>
              <p>{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-red-400 text-sm mt-2"
              >
                <Trash2 className="inline w-4 h-4" /> Remove
              </button>
            </>
          ) : (
            <>
              <Upload className="mx-auto mb-2 text-purple-400" />
              Upload Resume
            </>
          )}
        </div>
      </div>

      {/* JOB DESC */}
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description..."
        className="w-full p-4 rounded-xl bg-muted border border-gray-700 mb-6"
      />

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        className="w-full py-4 bg-purple-600 rounded-xl flex justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles />
            Analyze Resume
          </>
        )}
      </button>

      {error && <p className="text-red-400 mt-4">{error}</p>}

      {/* RESULTS */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-8"
        >

          {/* SCORE */}
          <div className="text-center">
            <ATSScore score={data.score} />
          </div>

          {/* WHY SCORE */}
          <div className="p-6 bg-black/40 rounded-xl border border-red-500/20">
            <h3 className="text-red-400 mb-2">Why this score?</h3>
            <p className="text-sm mb-2">{data.reasoning}</p>

            <p className="text-xs text-gray-400">
              Based on {data.scoreBreakdown.matchedSkills} matched vs{" "}
              {data.scoreBreakdown.missingSkills} missing skills
            </p>
          </div>

          {/* PROOF SECTION */}
          <div className="p-6 bg-black/40 rounded-xl border border-blue-500/20">
            <h3 className="text-blue-400 mb-3">Score Breakdown (Proof)</h3>

            <p>Matched Skills: {data.scoreBreakdown.matchedSkills}</p>
            <p>Missing Skills: {data.scoreBreakdown.missingSkills}</p>
            <p>Total Compared: {data.scoreBreakdown.totalSkills}</p>

            <div className="mt-3 bg-black/60 p-3 rounded border text-xs font-mono">
              {data.scoreBreakdown.formula}
            </div>

            <p className="mt-2 text-green-400">
              Final Score: {data.scoreBreakdown.matchPercentage}%
            </p>
          </div>

          {/* TOP FIXES */}
          <div className="p-6 bg-black/40 rounded-xl border border-yellow-500/20">
            <h3 className="text-yellow-400 mb-3">Top Priority Fixes</h3>
            {data.topFixes.map((fix, i) => (
              <p key={i}>⚠ {fix}</p>
            ))}
          </div>

          {/* CHART */}
          <div className="p-6 bg-black/40 rounded-xl border border-gray-800">
            <ScoreChart data={data.sectionScores} />
          </div>

          {/* SECTION FEEDBACK */}
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(data.sectionFeedback).map(([k, v]) => (
              <div key={k} className="p-4 bg-black/40 rounded-xl border border-gray-800">
                <p className="text-gray-400 capitalize">{k}</p>
                <p className="text-sm mt-2">{v}</p>
              </div>
            ))}
          </div>

          {/* ROADMAP */}
          <div className="p-6 bg-black/40 rounded-xl border border-gray-800">
            <h3>Career Roadmap</h3>
            {data.roadmap.map((r, i) => (
              <div key={i} className="mt-3">
                <p>{r.step} ({r.priority})</p>
                <p className="text-sm text-gray-400">{r.why}</p>
              </div>
            ))}
          </div>

          {/* DOWNLOAD */}
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-indigo-600 rounded-lg flex justify-center gap-2"
          >
            <Download /> Download Report
          </button>

        </motion.div>
      )}

    </div>
  );
}