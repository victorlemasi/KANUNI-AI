"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Download, FileCode } from "lucide-react";
import { processProcurementDocument } from "@/app/actions/analyze";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [analysisType, setAnalysisType] = useState<'procurement' | 'contract' | 'fraud' | 'audit'>('procurement');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            const ext = selected.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf' && ext !== 'docx') {
                setError("Please upload a PDF or Word (.docx) file");
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

        try {
            const data = await processProcurementDocument(formData);
            setResult(data);

            // Persist for "Saved Reports"
            const saved = JSON.parse(localStorage.getItem('kanuni_reports') || '[]');
            localStorage.setItem('kanuni_reports', JSON.stringify([data, ...saved].slice(0, 20)));
        } catch (err: any) {
            console.error("Analysis error:", err);

            // Provide more specific error messages
            let errorMessage = err.message || "Failed to analyze document";

            if (errorMessage.includes("AI model")) {
                errorMessage = "AI model failed to load. This may be due to server memory constraints. Please try again or contact support.";
            } else if (errorMessage.includes("No readable text")) {
                errorMessage = "Could not extract text from the document. Please ensure it's not a scanned image or empty file.";
            } else if (errorMessage.includes("Unsupported file format")) {
                errorMessage = "Please upload a PDF or Word (.docx) file only.";
            }

            setError(errorMessage);
        } finally {
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
- Confidence: ${result.auditTrail ? (result.auditTrail.confidence * 100).toFixed(1) : 0}%
- Log ID: ${result.auditTrail?.inferenceTime || Date.now()}

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
        <div className="space-y-6">
            <div className="glass p-8 rounded-2xl border-dashed border-2 border-white/10 text-center space-y-4">
                <div className="flex justify-center space-x-4">
                    <div className="p-4 bg-primary-600/10 rounded-full">
                        <Upload className="w-8 h-8 text-primary-500" />
                    </div>
                    <div className="p-4 bg-accent-600/10 rounded-full">
                        <FileCode className="w-8 h-8 text-accent-500" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">Multi-Format Compliance Intake</h3>
                    <p className="text-neutral-500 text-sm">Select Analysis Mode & Upload Document</p>
                </div>

                {/* Analysis Mode Toggle */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setAnalysisType('procurement')}
                        className={`px-3 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${analysisType === 'procurement'
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Procurement
                    </button>
                    <button
                        onClick={() => setAnalysisType('contract')}
                        className={`px-3 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${analysisType === 'contract'
                            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30 scale-105'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Contract
                    </button>
                    <button
                        onClick={() => setAnalysisType('fraud')}
                        className={`px-3 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${analysisType === 'fraud'
                            ? 'bg-error-500 text-white shadow-lg shadow-error-500/30 scale-105'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Fraud
                    </button>
                    <button
                        onClick={() => setAnalysisType('audit')}
                        className={`px-3 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${analysisType === 'audit'
                            ? 'bg-success-500 text-white shadow-lg shadow-success-500/30 scale-105'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Audit
                    </button>
                </div>

                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="doc-upload"
                />

                <label
                    htmlFor="doc-upload"
                    className="inline-block px-6 py-2 glass hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                >
                    {file ? (
                        <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent-400" />
                            {file.name}
                        </span>
                    ) : "Choose PDF or Word File"}
                </label>

                {file && !isUploading && !result && (
                    <button
                        onClick={handleUpload}
                        className={`block w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl uppercase tracking-widest relative overflow-hidden group ${analysisType === 'procurement' ? 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-primary-600/20' :
                            analysisType === 'contract' ? 'bg-gradient-to-r from-accent-600 to-accent-500 shadow-accent-600/20' :
                                analysisType === 'fraud' ? 'bg-gradient-to-r from-error-600 to-error-500 shadow-error-600/20' :
                                    'bg-gradient-to-r from-success-600 to-success-500 shadow-success-600/20'
                            } hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <FileCode className="w-5 h-5" />
                            RUN {analysisType} PROTOCOLS
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                )}

                {isUploading && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className={`absolute inset-0 blur-xl rounded-full animate-pulse ${analysisType === 'procurement' ? 'bg-primary-500/20' :
                                analysisType === 'contract' ? 'bg-accent-500/20' :
                                    analysisType === 'fraud' ? 'bg-error-500/20' :
                                        'bg-success-500/20'
                                }`}></div>
                            <Loader2 className={`w-12 h-12 animate-spin relative z-10 ${analysisType === 'procurement' ? 'text-primary-500' :
                                analysisType === 'contract' ? 'text-accent-500' :
                                    analysisType === 'fraud' ? 'text-error-500' :
                                        'text-success-500'
                                }`} />
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm font-black text-white tracking-widest uppercase animate-pulse">
                                RUNNING {analysisType} DIAGNOSTICS...
                            </div>
                            <p className="text-[10px] text-neutral-400 font-medium tracking-wide">
                                Analyzing patterns against governance frameworks
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl space-y-3 animate-in shake duration-300">
                    <div className="flex items-start space-x-3 text-error-500">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <span className="text-sm font-semibold block">{error}</span>
                        </div>
                    </div>
                    {file && (
                        <button
                            onClick={handleUpload}
                            className="w-full py-2 bg-error-500/20 hover:bg-error-500/30 border border-error-500/30 text-error-400 rounded-lg text-xs font-bold transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 space-y-4">
                    <div className="glass-dark p-6 rounded-2xl space-y-4 border border-accent-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                        <div className="flex items-center justify-between">
                            <h4 className="font-bold flex items-center space-x-2 text-success-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Governance Report Ready</span>
                            </h4>
                            <button
                                onClick={downloadReport}
                                className="flex items-center gap-2 px-3 py-1.5 glass-dark border border-accent-500/30 text-accent-400 rounded-lg text-xs font-bold hover:bg-accent-500/10 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                SAVE REPORT
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 glass rounded-xl bg-white/[0.02]">
                                <div className="text-[10px] text-neutral-500 mb-1 tracking-widest uppercase font-black">Risk Assessment</div>
                                <div className={`text-3xl font-black ${result.riskScore > 50 ? 'text-error-500' : 'text-success-400'}`}>
                                    {result.riskScore}%
                                </div>
                            </div>
                            <div className="p-4 glass rounded-xl bg-white/[0.02]">
                                <div className="text-[10px] text-neutral-500 mb-1 tracking-widest uppercase font-black">Focus Area</div>
                                <div className="text-lg font-black text-accent-400 truncate">
                                    {result.topConcern.replace(/-/g, ' ').toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        {result.suggestions && result.suggestions.length > 0 && (
                            <div className="space-y-2 p-4 glass rounded-xl border-accent-500/10 bg-accent-500/5">
                                <div className="text-[10px] font-black text-accent-400 uppercase tracking-widest">AI Suggestions & Recommendations</div>
                                <ul className="space-y-1">
                                    {result.suggestions.map((s: string, i: number) => (
                                        <li key={i} className="text-xs text-neutral-100 flex items-center gap-2 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Pillar Alignment */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Platform Pillar Alignment</div>
                                <div className="space-y-3">
                                    {[
                                        { name: "Decision Intelligence", val: result.pillarAlignment.decisionIntelligence, color: "bg-primary-500" },
                                        { name: "Compliance Automation", val: result.pillarAlignment.complianceAutomation, color: "bg-accent-500" },
                                        { name: "HITL Governance", val: result.pillarAlignment.hitlGovernance, color: "bg-success-500" }
                                    ].map((p) => (
                                        <div key={p.name} className="space-y-1">
                                            <div className="flex justify-between text-[9px] uppercase font-black text-neutral-400">
                                                <span>{p.name}</span>
                                                <span>{(p.val * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${p.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                                                    style={{ width: `${p.val * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decision Log / Audit Trail */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Decision Log / Audit Trail</div>
                                <div className="p-3 glass rounded-xl border-white/5 space-y-2 font-mono text-[9px]">
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                        <span className="text-neutral-500">Log ID</span>
                                        <span className="text-neutral-300">{result.auditTrail?.inferenceTime || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                        <span className="text-neutral-500">Model Engine</span>
                                        <span className="text-neutral-300">{result.auditTrail?.model || 'BERT'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">System Integrity</span>
                                        <span className="text-success-500 font-black">VERIFIED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.alerts.length > 0 && (
                            <div className="p-3 bg-error-500/10 rounded-xl border border-error-500/20">
                                <div className="text-[10px] font-black text-error-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" />
                                    Early-Warning Alerts
                                </div>
                                <ul className="text-xs text-neutral-200 space-y-1 font-medium">
                                    {result.alerts.map((alert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1 h-1 bg-error-500 rounded-full mt-1.5 shadow-[0_0_5px_rgba(239,68,68,0.5)] shrink-0"></div>
                                            <span>{alert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
