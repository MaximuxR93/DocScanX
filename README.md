# 🚀 DocScanX — AI Resume ATS Analyzer

An **AI-powered Resume Analyzer** that evaluates resumes against job descriptions and generates an **ATS (Applicant Tracking System) score**, skill analysis, keyword matching, and improvement suggestions.

Built with **Next.js, TypeScript, TailwindCSS, and AI (Groq Llama 3.3)**, this tool simulates how modern ATS systems screen resumes before recruiters see them.

---

# ✨ Features

🔎 **AI Resume Analysis**
Upload a resume and compare it with a job description using AI.

📊 **ATS Score Calculation**
Get a realistic ATS match score based on matched vs missing skills.

🧠 **Skill Matching**
Detects skills present in the resume that match job requirements.

❌ **Missing Skills Detection**
Shows important skills missing from your resume.

💡 **Improvement Suggestions**
AI suggests how to improve your resume for better ATS compatibility.

🔑 **Keyword Scanner**
Highlights keywords found or missing from the job description.

📄 **PDF Resume Parsing**
Automatically extracts text from uploaded PDF resumes.

⬇ **Downloadable ATS Report**
Generate a clean report after resume analysis.

🎨 **Modern SaaS UI**
Beautiful gradient UI with glassmorphism and animated components.

---

# 🖼 Preview

![Preview](https://raw.githubusercontent.com/vercel/next.js/canary/examples/with-tailwindcss/public/vercel.svg)

*(Replace with your own screenshot later)*

---

# 🛠 Tech Stack

**Frontend**

* Next.js 16 (App Router)
* React
* TypeScript
* TailwindCSS
* Lucide Icons
* React Dropzone

**Backend**

* Next.js API Routes
* Node.js Runtime
* Groq AI API (Llama 3.3 70B)

**Other Tools**

* PDF Text Extract
* Git & GitHub

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/MaximuxR93/DocScanX.git
cd DocScanX
```

Install dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

# ▶ Running the Project

Start the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 📂 Project Structure

```
src
 ├── app
 │   ├── api
 │   │   └── analyze
 │   │       └── route.ts
 │   ├── page.tsx
 │   └── globals.css
 │
 ├── components
 │   ├── ResumeUpload.tsx
 │   └── ATSScore.tsx
 │
 └── utils
```

---

# 📊 How It Works

1️⃣ User uploads a **PDF Resume**
2️⃣ Backend extracts text using **pdf-text-extract**
3️⃣ AI analyzes the resume vs **job description**
4️⃣ Skills are categorized into:

* Matched Skills
* Missing Skills

5️⃣ Backend calculates **ATS Score**

```
ATS Score = matched_skills / total_skills * 100
```

6️⃣ Results are displayed in a **visual dashboard**

---

# 🚀 Future Improvements

* Resume **PDF Preview**
* **AI Resume Rewrite Suggestions**
* **Multiple Job Description Comparison**
* **Resume Keyword Heatmap**
* **Authentication + Saved Reports**
* **Deployment Dashboard**

---

# 🌍 Deployment

The easiest way to deploy is with **Vercel**.

```bash
npm install -g vercel
vercel
```

Or deploy directly:

👉 https://vercel.com/new

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repo
2. Create a branch

```
git checkout -b feature/new-feature
```

3. Commit changes

```
git commit -m "Added new feature"
```

4. Push and open a Pull Request.

---

# 📜 License

MIT License

---

# 👨‍💻 Author

**MaximuxR93**

GitHub
https://github.com/MaximuxR93

---

⭐ If you like this project, consider **starring the repo**!
