"use client";

import FileUpload from "@/components/dashboard/FileUpload";
import { BrainCircuit, ShieldCheck, History } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-12">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] animate-pulse-ring" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/5 blur-[120px] animate-pulse-ring" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl space-y-12 relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 glass rounded-3xl animate-float bg-primary-500/5 group">
                <BrainCircuit className="w-10 h-10 text-primary-500 group-hover:text-accent-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">
                  Institutional Grade AI
                </p>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter audit-gradient-text">
                  KANUNI <span className="accent-gradient-text">AI</span>
                </h1>
              </div>
            </div>
            <p className="text-sm text-neutral-400 font-medium max-w-md leading-relaxed">
              Advanced Forensic Intelligence for Public Procurement & Governance.
              Powered by <span className="text-white font-bold">Llama-3-8B</span> for Deep Forensic Reasoning.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/saved" className="glass-button flex items-center gap-3 group">
              <History className="w-4 h-4 text-accent-500 group-hover:rotate-[-45deg] transition-transform" />
              <span>Audit History</span>
            </a>
            <div className="glass-button flex items-center gap-3 border-success-500/20 text-success-500">
              <ShieldCheck className="w-4 h-4" />
              <span>System Secure</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-2 bg-white/[0.01] border-white/[0.05]">
          <div className="glass p-8 md:p-12 rounded-[1.5rem] bg-black/20 border-white/[0.03]">
            <FileUpload />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Engine</span>
              <span className="text-[11px] font-bold text-white uppercase tracking-tighter">Llama-3-8B Reasoning</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Compliance</span>
              <span className="text-[11px] font-bold text-white">PPDA ACT 2021</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Security</span>
              <span className="text-[11px] font-bold text-white">AES-256 E2EE</span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-black">
              Decisions with Absolute Certainty
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
