"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, Sparkles, Loader2, Trash2, FileText,
  CheckCircle2, XCircle, AlertTriangle, ChevronRight,
  ArrowRight, Zap, Target, BookOpen, Map, Pencil, BarChart2
} from "lucide-react";
import ATSScore from "./ATSScore";
import ScoreChart from "./ScoreChart";

interface RoadmapItem { step: string; why: string; priority: string; }
interface ScoreBreakdown {
  totalSkills: number; matchedSkills: number;
  missingSkills: number; matchPercentage: number; formula: string;
}
interface AIResponse {
  score: number; reasoning: string; scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[]; missingSkills: string[]; topFixes: string[];
  suggestions: string[];
  sectionScores: { skills: number; projects: number; experience: number; education: number; };
  sectionFeedback: { skills: string; projects: string; experience: string; education: string; };
  rewrittenBullets: { original: string; improved: string; }[];
  roadmap: RoadmapItem[];
}

const TABS = [
  { id: "overview", label: "Overview", icon: Target },
  { id: "sections", label: "Sections", icon: BarChart2 },
  { id: "bullets", label: "Bullet Rewriter", icon: Pencil },
  { id: "roadmap", label: "Roadmap", icon: Map },
] as const;

type Tab = typeof TABS[number]["id"];

const priorityConfig: Record<string, { color: string; bg: string; label: string } | undefined> = {
  high:   { color: "#ef4444", bg: "#ef444415", label: "High" },
  medium: { color: "#f59e0b", bg: "#f59e0b15", label: "Medium" },
  low:    { color: "#22c55e", bg: "#22c55e15", label: "Low" },
};

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => setFile(files[0] ?? null),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("jobDescription", jobDescription);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) {
        const t = await res.text();
        setError(t || "Analysis failed");
        return;
      }
      const result = await res.json();
      setData(result);
      setActiveTab("overview");
    } catch (e: any) {
      setError(e?.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 py-12">

      {/* ── HEADER ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
          <Zap className="w-3 h-3 text-violet-400" />
          Powered by Llama 3.3 · 70B
        </div>
        <h1 className="text-5xl font-black tracking-tight gradient-text mb-2">DocScanX</h1>
        <p className="text-zinc-500 text-base">
          Drop your resume. Get a brutally honest ATS score in seconds.
        </p>
      </div>

      {/* ── INPUT PANEL ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[180px]
            ${isDragActive
              ? "border-violet-500 bg-violet-500/8"
              : file
              ? "border-zinc-700 bg-zinc-900/60"
              : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/40"
            }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · PDF</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setData(null); }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Upload className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">
                  {isDragActive ? "Drop it here" : "Drag & drop your resume"}
                </p>
                <p className="text-xs text-zinc-600 mt-1">PDF only · max 10MB</p>
              </div>
            </>
          )}
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Job Description <span className="text-zinc-700">(optional but recommended)</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for a targeted match score..."
            className="flex-1 w-full p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors min-h-[148px]"
          />
        </div>
      </div>

      {/* ── ANALYZE BUTTON ── */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: file && !loading ? "0 0 32px #7c3aed44" : "none",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your resume…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Resume
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── RESULTS ── */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-10"
          >

            {/* Score Hero */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
              <ATSScore score={data.score} />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-2">Score Reasoning</h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{data.reasoning}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                    ✓ {data.scoreBreakdown.matchedSkills} matched skills
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                    ✗ {data.scoreBreakdown.missingSkills} missing skills
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">
                    {data.scoreBreakdown.formula}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Fixes Banner */}
            {data.topFixes?.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Top Priority Fixes</span>
                </div>
                <ul className="space-y-2">
                  {data.topFixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
                    ${activeTab === id
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >

                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">

                      {/* Matched Skills */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <h3 className="text-sm font-semibold text-white">Matched Skills</h3>
                          <span className="ml-auto text-xs text-zinc-600">{data.matchedSkills.length} found</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.matchedSkills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <h3 className="text-sm font-semibold text-white">Missing Skills</h3>
                          <span className="ml-auto text-xs text-zinc-600">{data.missingSkills.length} gaps</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.missingSkills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {data.suggestions?.length > 0 && (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">Suggestions</h3>
                        </div>
                        <ul className="space-y-2">
                          {data.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                              <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SECTIONS TAB ── */}
                {activeTab === "sections" && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                    <h3 className="text-sm font-semibold text-white mb-6">Section-by-Section Breakdown</h3>
                    <ScoreChart data={data.sectionScores} feedback={data.sectionFeedback} />
                  </div>
                )}

                {/* ── BULLET REWRITER TAB ── */}
                {activeTab === "bullets" && (
                  <div className="space-y-4">
                    {data.rewrittenBullets?.length > 0 ? (
                      data.rewrittenBullets.map((b, i) => (
                        <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                          <div className="p-4 border-b border-zinc-800">
                            <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">Original</p>
                            <p className="text-sm text-zinc-400 leading-relaxed">{b.original}</p>
                          </div>
                          <div className="p-4 bg-green-500/5">
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">✦ Improved</p>
                            <p className="text-sm text-green-300 leading-relaxed">{b.improved}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
                        <Pencil className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">No bullet rewrites generated for this resume.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ROADMAP TAB ── */}
                {activeTab === "roadmap" && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                    <h3 className="text-sm font-semibold text-white mb-6">Career Improvement Roadmap</h3>
                    <div className="relative">
                      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-zinc-800" />
                      <div className="space-y-6">
                        {data.roadmap.map((r, i) => {
                          const p = priorityConfig[r.priority?.toLowerCase()] ?? { color: "#f59e0b", bg: "#f59e0b15", label: "Medium" };
                          return (
                            <div key={i} className="flex gap-4 relative">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 border-2 border-zinc-900"
                                style={{ background: p.bg, color: p.color, borderColor: p.color + "44" }}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-white">{r.step}</p>
                                  <span
                                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                                    style={{ background: p.bg, color: p.color }}
                                  >
                                    {p.label}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">{r.why}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Reset */}
            <button
              onClick={() => { setData(null); setFile(null); setJobDescription(""); }}
              className="mt-8 w-full py-3 rounded-xl border border-zinc-800 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
            >
              Analyze another resume
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
