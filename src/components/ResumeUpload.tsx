"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  Download,
  Trash2
} from "lucide-react";
import ATSScore from "./ATSScore";

interface KeywordResult {
  keyword: string;
  found: boolean;
}

interface AIResponse {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  keywordScan: KeywordResult[];
}

export default function ResumeUpload() {

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const [score, setScore] = useState<number | null>(null);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [keywordScan, setKeywordScan] = useState<KeywordResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1
  });

  const handleUpload = async () => {

    if (!file) {
      alert("Upload a resume first");
      return;
    }

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

      if (!res.ok) {
        throw new Error("AI request failed");
      }

      const data: AIResponse = await res.json();

      setScore(typeof data.score === "number" ? data.score : 0);
      setMatchedSkills(data.matchedSkills || []);
      setMissingSkills(data.missingSkills || []);
      setSuggestions(data.suggestions || []);
      setKeywordScan(data.keywordScan || []);

    } catch (err) {

      console.error(err);
      setError("AI analysis failed. Please try again.");

    }

    setLoading(false);
  };

  return (

    <div className="w-full max-w-[1000px] gradient-border glow-shadow animate-float z-10">

      <div className="glass-card p-8 md:p-10">

        {/* Header */}

        <div className="text-center mb-10">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border mb-5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-gray-400">
              AI Powered
            </span>
          </div>

          <h1 className="text-4xl font-bold gradient-text">
            Resume ATS Analyzer
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Upload your resume and compare it against a job description.
          </p>

        </div>

        {/* Upload */}

        <div
          {...getRootProps({
            className: `mb-6 p-8 rounded-xl border-2 border-dashed cursor-pointer transition ${
              isDragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 bg-muted/30"
            }`
          })}
        >

          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">

            <Upload className="w-10 h-10 text-purple-400" />

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
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove File
                </button>
              </>

            ) : (

              <>
                <p>Drag & drop your resume here</p>
                <p className="text-xs text-gray-400">
                  or click to upload PDF
                </p>
              </>

            )}

          </div>

        </div>

        {/* Job Description */}

        <textarea
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description..."
          className="w-full p-4 rounded-xl bg-muted/50 border border-gray-700 mb-6"
        />

        {/* Button */}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-purple-600 hover:scale-[1.02] transition"
        >

          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Resume
            </>
          )}

        </button>

        {/* Loading Status */}

        {loading && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Parsing resume → Matching skills → Generating suggestions...
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/20 border border-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Score */}

        {score !== null && (
          <div className="mt-10 flex justify-center">
            <ATSScore score={score} />
          </div>
        )}

        {/* Skills Dashboard */}

        {score !== null && (

          <div className="grid md:grid-cols-2 gap-6 mt-10">

            <div className="glass-card p-6">

              <h3 className="text-lg font-semibold mb-4">
                Matched Skills
              </h3>

              <div className="flex flex-wrap gap-2">

                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-green-500/20 border border-green-400 rounded-full"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>

            <div className="glass-card p-6">

              <h3 className="text-lg font-semibold mb-4">
                Missing Skills
              </h3>

              <div className="flex flex-wrap gap-2">

                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-red-500/20 border border-red-400 rounded-full"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>

          </div>

        )}

        {/* Suggestions */}

        {suggestions.length > 0 && (

          <div className="glass-card p-6 mt-6">

            <h3 className="text-lg font-semibold mb-4">
              Suggestions to Improve Resume
            </h3>

            <ul className="space-y-2 text-sm text-gray-300">

              {suggestions.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}

            </ul>

          </div>

        )}

        {/* Keyword Scanner */}

        {keywordScan.length > 0 && (

          <div className="glass-card p-6 mt-6">

            <h3 className="text-lg font-semibold mb-4">
              Keyword Scanner
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {keywordScan.map((k, i) => (

                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                    k.found
                      ? "bg-green-500/20 border border-green-400"
                      : "bg-red-500/20 border border-red-400"
                  }`}
                >

                  <span>{k.keyword}</span>
                  <span>{k.found ? "✔" : "✖"}</span>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* Download report */}

        {score !== null && (

          <button
            onClick={() => window.print()}
            className="mt-8 w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4"/>
            Download ATS Report
          </button>

        )}

      </div>

    </div>

  );
}