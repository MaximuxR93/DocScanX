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

interface AIResponse {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  sectionScores: {
    skills: number;
    projects: number;
    experience: number;
    education: number;
  };
  rewrittenBullets: {
    original: string;
    improved: string;
  }[];
  roadmap: string[];
}

export default function ResumeUpload() {

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<AIResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => setFile(files[0]),
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
          Optimize your resume with real job data
        </p>
      </div>

      {/* UPLOAD */}
      <div
        {...getRootProps({
          className: `p-8 rounded-xl border-2 border-dashed cursor-pointer mb-6 transition ${
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
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-red-400 text-sm mt-2 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </>
          ) : (
            <>
              <Upload className="mx-auto mb-2 text-purple-400" />
              <p>Upload Resume</p>
              <p className="text-xs text-gray-400">
                Drag & drop or click
              </p>
            </>
          )}

        </div>
      </div>

      {/* JOB DESCRIPTION */}
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description..."
        className="w-full p-4 rounded-xl bg-muted border border-gray-700 mb-6 focus:border-purple-500 outline-none"
      />

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-purple-500/20"
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

      {error && (
        <p className="text-red-400 mt-4 text-center">{error}</p>
      )}

      {/* RESULTS */}
      {data && (

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-10"
        >

          {/* SCORE */}
          <div className="text-center">
            <ATSScore score={data.score} />
            <p className="text-xs text-gray-400 mt-2">
              Based on keyword relevance & job match analysis
            </p>
          </div>

          {/* CHART */}
          <div className="p-6 rounded-xl bg-black/40 border border-gray-800 shadow-lg shadow-purple-500/10">
            <h3 className="mb-4 font-semibold">Score Breakdown</h3>
            <ScoreChart data={data.sectionScores} />
          </div>

          {/* SECTION CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {Object.entries(data.sectionScores).map(([k, v]) => (

              <motion.div
                key={k}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-black/40 rounded-xl border border-gray-800 hover:border-purple-500 transition shadow-md hover:shadow-purple-500/20"
              >

                <p className="text-sm text-gray-400 capitalize">
                  {k} Match
                </p>

                <div className="h-2 bg-gray-700 rounded-full mt-2">
                  <div
                    className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${v}%` }}
                  />
                </div>

                <p className="mt-2 text-sm font-semibold">{v}%</p>

              </motion.div>

            ))}

          </div>

          {/* SKILLS */}
          <div className="grid md:grid-cols-2 gap-6">

            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 shadow-md">
              <h3 className="mb-3 font-semibold">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.matchedSkills.map(s => (
                  <span key={s} className="px-3 py-1 bg-green-500/20 border border-green-400 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 shadow-md">
              <h3 className="mb-3 font-semibold">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map(s => (
                  <span key={s} className="px-3 py-1 bg-red-500/20 border border-red-400 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* BULLETS */}
          {data.rewrittenBullets.length > 0 && (
            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 shadow-md">
              <h3 className="mb-4 font-semibold">Resume Improvements</h3>

              {data.rewrittenBullets.map((b, i) => (
                <div key={i} className="mb-4">
                  <p className="text-red-400 line-through text-sm">{b.original}</p>
                  <p className="text-green-400 text-sm">{b.improved}</p>
                </div>
              ))}

            </div>
          )}

          {/* ROADMAP */}
          {data.roadmap.length > 0 && (
            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 shadow-md">
              <h3 className="mb-4 font-semibold">Career Roadmap</h3>

              <ul className="space-y-2 text-sm">
                {data.roadmap.map((r, i) => (
                  <li key={i}>👉 {r}</li>
                ))}
              </ul>

            </div>
          )}

          {/* DOWNLOAD */}
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-indigo-500/20"
          >
            <Download />
            Download Report
          </button>

        </motion.div>
      )}

    </div>
  );
}