"use client"

import { useState } from "react"

export default function ResumeUpload() {

  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    console.log("Selected file:", selectedFile)
    setFile(selectedFile)
  }

  const handleUpload = async () => {

    if (!file) {
      alert("Please upload a resume")
      return
    }

    const formData = new FormData()
    formData.append("resume", file)

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    console.log("API RESPONSE:", data)
  }

  return (

    <div className="p-10">

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 ml-4"
      >
        Analyze Resume
      </button>

    </div>

  )
}