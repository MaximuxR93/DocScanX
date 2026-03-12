import ResumeUpload from "@/components/ResumeUpload";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* glow background */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[140px]" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <ResumeUpload />

    </div>
  );
}