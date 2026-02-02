"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Download, ShieldAlert, Cpu, Gauge, BrainCircuit } from "lucide-react";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [analysisType, setAnalysisType] = useState<'procurement' | 'contract' | 'fraud' | 'audit'>('procurement');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    // State removed: worker ref is sufficient
    const [modelStatus, setModelStatus] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);

    // Initialize Worker
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!workerRef.current) {
            const w = new Worker('/worker.js', { type: 'module' });
            w.addEventListener('message', (e) => {
                const { status, message, output, progress: p } = e.data;
                switch (status) {
                    case 'initiate':
                        setModelStatus(message);
                        break;
                    case 'progress':
                        if (p) setProgress(Math.round(p));
                        break;
                    case 'analyzing':
                        setModelStatus(message);
                        break;
                    case 'classification_complete':
                        setResult((prev: any) => ({
                            ...prev,
                            pillarAlignment: output
                        }));
                        break;
                    case 'complete':
                        // Merge synthesis into result
                        setResult((prev: any) => ({
                            ...prev,
                            auditOpinion: output,
                            // Enhance suggestions with AI output if needed
                        }));
                        setModelStatus('');
                        setIsUploading(false);
                        break;
                }
            });
            workerRef.current = w;
            // setWorker(w); // Unused state removed
        }
        return () => {
            // cleanup if needed, but we usually want to keep model loaded
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            const ext = selected.name.split('.').pop()?.toLowerCase();
            const allowed = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'xlsx', 'xls', 'csv', 'txt'];
            if (!ext || !allowed.includes(ext)) {
                setError("Please upload a supported file (PDF, Docs, Excel, CSV, Text, Image)");
                return;
            }
            setFile(selected);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("analysisType", analysisType);

        let attempts = 0;
        const maxRetries = 1;

        try {
            while (attempts <= maxRetries) {
                attempts++;
                try {
                    // Ver AM: Server does extraction + Rule Checks only
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        body: formData,
                    });

                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const result = await response.json();
                        if (!result.success) throw new Error(result.error);

                        // 1. Show Server Results Immediatey (Rule Based)
                        setResult(result.data); // This has Findings + Risk Score

                        // 2. Trigger Client-Side AI (Synthesis)
                        if (workerRef.current && result.data.text) {
                            setModelStatus("Initializing AI Pipeline...");
                            workerRef.current.postMessage({
                                type: 'analyze',
                                text: result.data.text
                            });
                            // Don't set isUploading to false yet, wait for worker
                        } else {
                            setIsUploading(false);
                        }

                        // Persist basic report
                        if (typeof window !== 'undefined') {
                            const saved = JSON.parse(localStorage.getItem('kanuni_reports') || '[]');
                            localStorage.setItem('kanuni_reports', JSON.stringify([result.data, ...saved].slice(0, 20)));
                        }
                        return;
                    } else {
                        throw new Error(`Server Error: ${response.status}`);
                    }
                } catch (err: any) {
                    console.warn(`[Upload] Attempt ${attempts} failed:`, err);
                    if (attempts <= maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    throw err;
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Analysis failed");
            setIsUploading(false);
        }
    };

    const downloadReport = () => {
        if (!result) return;
        const reportContent = `
KANUNI AI GOVERNANCE INTELLIGENCE REPORT
-----------------------------------------
File: ${result.fileName}
Analyzed: ${new Date(result.timestamp).toLocaleString()}
-----------------------------------------
EXECUTIVE SUMMARY:
${result.reportSummary}

RISK ANALYTICS:
- Risk Score: ${result.riskScore}%
- Primary Concern: ${result.topConcern.toUpperCase()}

AI SUGGESTIONS / RECOMMENDATIONS:
${result.suggestions?.map((s: string) => `- ${s}`).join('\n')}

PILLAR ALIGNMENT:
- Decision Intelligence: ${(result.pillarAlignment.decisionIntelligence * 100).toFixed(1)}%
- Compliance Automation: ${(result.pillarAlignment.complianceAutomation * 100).toFixed(1)}%
- HITL Governance: ${(result.pillarAlignment.hitlGovernance * 100).toFixed(1)}%

ALERTS & ANOMALIES:
${result.alerts.length > 0 ? result.alerts.join('\n') : 'No critical anomalies detected.'}

AUDIT TRAIL:
- Model: ${result.auditTrail?.model || 'N/A'}
- Regulatory Context: ${result.auditTrail?.regulatoryContext || 'PPDA Act 2021'}
- Confidence: ${result.auditTrail ? (result.auditTrail.confidence * 100).toFixed(1) : 0}%
-----------------------------------------
(c) KANUNI AI - Decision Certainty
    `;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KANUNI_Report_${result.fileName.split('.')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-10">
            {/* INTAKE ZONE */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black audit-gradient-text uppercase tracking-tighter">Compliance Intake</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Select Audit Protocol & Source File</p>
                    </div>

                    <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05]">
                        {[
                            { id: 'procurement', label: 'Procurement', color: 'bg-primary-500' },
                            { id: 'contract', label: 'Contract', color: 'bg-accent-500' },
                            { id: 'fraud', label: 'Fraud', color: 'bg-error-500' },
                            { id: 'audit', label: 'Audit', color: 'bg-success-500' }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setAnalysisType(mode.id as any)}
                                className={`px-4 py-2 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${analysisType === mode.id
                                    ? `${mode.color} text-white shadow-xl scale-105`
                                    : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.txt"
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center p-12 md:p-20 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01] cursor-pointer hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 group"
                    >
                        <div className="p-6 glass rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all">
                            {file ? <FileText className="w-10 h-10 text-accent-500 animate-float" /> : <Upload className="w-10 h-10 text-neutral-500 group-hover:text-primary-500" />}
                        </div>
                        <div className="text-center space-y-2">
                            <span className="text-sm font-black text-white group-hover:accent-gradient-text transition-colors">
                                {file ? file.name : "DROP SOURCE FILE OR CLICK TO BROWSE"}
                            </span>
                            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.4em]">
                                PDF • DOCX • EXCEL • CSV • TXT • IMG (Max 50MB)
                            </p>
                        </div>
                    </label>
                </div>

                {file && !isUploading && !result && (
                    <button
                        onClick={handleUpload}
                        className="w-full glass-button !bg-primary-500 !p-6 flex items-center justify-center gap-4 group hover:scale-[1.01] active:scale-[0.99] shadow-primary-500/20 shadow-2xl"
                    >
                        <Cpu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-sm tracking-[0.3em]">INITIALIZE FORENSIC AUDIT</span>
                    </button>
                )}

                {isUploading && (
                    <div className="glass-card !bg-white/[0.02] p-12 flex flex-col items-center justify-center space-y-6 shimmer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse" />
                            <Loader2 className="w-16 h-16 animate-spin text-primary-500 relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.5em] animate-pulse">Running {analysisType} Diagnostics</h4>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                {modelStatus || "Applying BERT classification & PPDA legislative mapping..."}
                                {progress > 0 && ` (${progress}%)`}
                            </p>
                        </div>
                        <div className="w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="glass-card !border-error-500/20 !bg-error-500/5 p-6 animate-in shake duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-3 glass rounded-2xl bg-error-500/10">
                            <AlertCircle className="w-6 h-6 text-error-500" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <h4 className="text-xs font-black text-error-500 uppercase tracking-widest">Protocol Interruption</h4>
                            <p className="text-sm text-neutral-400 font-medium">{error}</p>
                            <button onClick={handleUpload} className="text-[10px] font-black text-white hover:text-error-400 underline uppercase mt-2">Attempt Recovery</button>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-8">
                    {/* EXECUTIVE HEADER */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="glass-card flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`p-5 glass rounded-3xl ${result.riskScore > 50 ? 'bg-error-500/10' : 'bg-success-500/10'}`}>
                                    <Gauge className={`w-10 h-10 ${result.riskScore > 50 ? 'text-error-500' : 'text-success-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Composite Risk Level</p>
                                    <div className={`text-4xl font-black tracking-tighter ${result.riskScore > 50 ? 'text-error-500' : 'text-success-500'}`}>
                                        {result.riskLevel} <span className="text-xl opacity-40">({result.riskScore}%)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <button onClick={downloadReport} className="glass-button !p-4 group">
                                    <Download className="w-4 h-4 text-accent-500 group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="glass-card flex-1">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Primary Regulatory Concern</p>
                            <h4 className="text-xl font-bold accent-gradient-text uppercase leading-tight line-clamp-2">
                                {result.topConcern}
                            </h4>
                        </div>
                    </div>

                    {/* FINDINGS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Governance Pillars */}
                        <div className="glass-card space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Platform Pillar Alignment</h4>
                                <ShieldAlert className="w-4 h-4 text-primary-500" />
                            </div>
                            <div className="space-y-5">
                                {[
                                    { name: "Decision Intelligence", val: result?.pillarAlignment?.decisionIntelligence || 0, color: "bg-primary-500" },
                                    { name: "Compliance Automation", val: result?.pillarAlignment?.complianceAutomation || 0, color: "bg-accent-500" },
                                    { name: "HITL Governance", val: result?.pillarAlignment?.hitlGovernance || 0, color: "bg-success-500" }
                                ].map((p) => (
                                    <div key={p.name} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                            <span className="text-neutral-500">{p.name}</span>
                                            <span className="text-white">{(p.val * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${p.color} transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                                                style={{ width: `${p.val * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Suggestions */}
                        <div className="glass-card bg-accent-500/[0.02] border-accent-500/10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Strategic Suggestions</h4>
                                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                            </div>
                            <ul className="space-y-3">
                                {result.suggestions?.map((s: string, i: number) => (
                                    <li key={i} className="flex gap-4 p-3 glass rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(234,179,8,0.5)] group-hover:scale-150 transition-transform" />
                                        <span className="text-xs text-neutral-300 font-medium leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ALERTS & AUDIT TRAIL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 glass-card !bg-white/[0.01] space-y-4">
                            {/* AI Suggestions */}
                            {result.suggestions && result.suggestions.length > 0 && (
                                <div className="space-y-4">
                                    {/* NEW: Dual-AI Opinion */}
                                    {result.auditOpinion && (
                                        <div className="p-5 glass rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                                <Cpu className="w-12 h-12 text-primary-500 animate-pulse" />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest">
                                                    <BrainCircuit className="w-4 h-4" />
                                                    Synthesized Audit Opinion (GenAI)
                                                </div>
                                                <p className="text-sm text-neutral-100 font-medium leading-relaxed italic">
                                                    &quot;{result.auditOpinion}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 p-4 glass rounded-xl border-accent-500/10 bg-accent-500/5">
                                        <div className="text-[10px] font-black text-accent-400 uppercase tracking-widest">Strategic Recommendations</div>
                                        <ul className="space-y-1">
                                            {result.suggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-xs text-neutral-100 flex items-center gap-2 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-error-500" />
                                <h4 className="text-[10px] font-black text-error-500 uppercase tracking-[0.3em]">Integrity Alerts & Anomalies</h4>
                            </div>
                            {result.alerts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {result.alerts.map((a: string, i: number) => (
                                        <div key={i} className="p-3 glass rounded-xl border-error-500/10 text-[11px] font-medium text-neutral-200">
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">No Integrity Disruptions Detected</p>
                                </div>
                            )}
                        </div>

                        <div className="glass-card space-y-4 font-mono text-[10px]">
                            <div className="pb-3 border-b border-white/5 flex justify-between items-center text-neutral-500 uppercase font-black tracking-widest">
                                <span>Audit Ledger</span>
                                <FileText className="w-3 h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">ENGINE_SIG</span>
                                    <span className="text-white px-2 py-0.5 glass rounded bg-primary-500/10">{result.auditTrail?.engine || 'FORENSIC-Q'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">COMPLIANCE</span>
                                    <span className="text-accent-500 font-bold">{result.auditTrail?.regulatoryContext || 'PPDA_ACT_2021'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">CONFIDENCE</span>
                                    <span className="text-white">{(result.auditTrail?.confidence * 100 || 0).toFixed(1)}%</span>
                                </div>
                                <div className="pt-2 flex justify-center">
                                    <div className="px-4 py-1.5 glass rounded-full bg-success-500/5 border-success-500/20 text-success-500 font-black tracking-[0.2em] text-[8px]">
                                        SYSTEM_VERIFIED_AUTHENTIC
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
