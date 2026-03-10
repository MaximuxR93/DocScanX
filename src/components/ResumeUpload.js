"use client";

import { useState } from "react";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setAnalysis(data.analysis || "No response from AI.");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>AI Resume ATS Analyzer</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        {analysis}
      </pre>
    </div>
  );
}