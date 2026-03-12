"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import ATSScore from "./ATSScore";

export default function ResumeUpload() {

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
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

    try {

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setAnalysis(data.analysis || "No response from AI.");

      // try to extract score from response
      const match = data.analysis?.match(/(\d+)\s*\/?\s*100/);
      if (match) {
        setScore(parseInt(match[1]));
      } else {
        setScore(null);
      }

    } catch (err) {
      console.error(err);
      setAnalysis("Failed to connect to AI service.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-[750px] gradient-border glow-shadow animate-float z-10">

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
              isDragActive ? "border-purple-500 bg-purple-500/10" : "border-gray-700 bg-muted/30"
            }`
          })}
        >

          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">

            <Upload className="w-10 h-10 text-purple-400" />

            {file ? (
              <>
                <p>{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
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
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Resume
            </>
          )}

        </button>

        {/* Score */}

        {score !== null && (
          <div className="mt-8 flex justify-center">
            <ATSScore score={score} />
          </div>
        )}

        {/* Result */}

        {analysis && (
          <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-purple-500/20">

            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              AI Analysis
            </h2>

            <pre className="whitespace-pre-wrap text-sm text-gray-200">
              {analysis}
            </pre>

          </div>
        )}

      </div>

    </div>
  );
}