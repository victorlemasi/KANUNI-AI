"use client";

import FileUpload from "@/components/dashboard/FileUpload";
import { BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0 hidden md:block">
            <a href="/saved" className="text-xs font-bold text-accent-500 hover:text-accent-400 uppercase tracking-widest border border-accent-500/30 px-4 py-2 rounded-full hover:bg-accent-500/10 transition-all">
              View Saved Reports
            </a>
          </div>

          <div className="flex justify-center mb-6">
            <div className="p-4 glass rounded-3xl border-accent-500/20 bg-accent-500/5">
              <BrainCircuit className="w-12 h-12 text-accent-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight gradient-text">
            KANUNI AI
          </h1>
          <p className="text-neutral-500 font-medium tracking-widest uppercase text-xs">
            Governance Intelligence & Portfolio Analysis
          </p>

          <div className="md:hidden pt-4">
            <a href="/saved" className="text-xs font-bold text-accent-500 hover:text-accent-400 uppercase tracking-widest border border-accent-500/30 px-4 py-2 rounded-full hover:bg-accent-500/10 transition-all">
              View Saved Reports
            </a>
          </div>
        </div>

        <div className="glass-dark p-1 rounded-3xl border-white/5 shadow-2xl">
          <FileUpload />
        </div>

        <div className="text-center">
          <p className="text-[10px] text-neutral-600 uppercase tracking-[0.3em] font-bold">
            Real-time BERT Classification • PFM Framework Compliance • Secure Institutional Memory
          </p>
        </div>
      </div>
    </main>
  );
}
