"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Download, FileCode } from "lucide-react";
import { processProcurementDocument } from "@/app/actions/analyze";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
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

        try {
            const data = await processProcurementDocument(formData);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to analyze document");
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

PILLAR ALIGNMENT:
- Decision Intelligence: ${(result.pillarAlignment.decisionIntelligence * 100).toFixed(1)}%
- Compliance Automation: ${(result.pillarAlignment.complianceAutomation * 100).toFixed(1)}%
- HITL Governance: ${(result.pillarAlignment.hitlGovernance * 100).toFixed(1)}%

ALERTS & ANOMALIES:
${result.alerts.length > 0 ? result.alerts.join('\n') : 'No critical anomalies detected.'}

TEXT PREVIEW (EXTRACTED):
${result.textPreview}...

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
                    <p className="text-neutral-500 text-sm">Upload PDF or Word (.docx) for Institutional Analysis</p>
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
                        className="block w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20"
                    >
                        START ADVANCED ANALYSIS
                    </button>
                )}

                {isUploading && (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                        <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
                        <div className="text-sm font-bold text-neutral-300 animate-pulse">
                            EXTRACTING & CLASSIFYING...
                        </div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest text-center max-w-xs">
                            BERT model is running inference on institutional data against PFM frameworks
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-center space-x-3 text-error-500 animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{error}</span>
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
                                <div className="text-[10px] text-neutral-500 mb-1 tracking-widest uppercase font-bold">Risk Assessment</div>
                                <div className={`text-3xl font-bold ${parseFloat(result.riskScore) > 50 ? 'text-error-500' : 'text-success-400'}`}>
                                    {result.riskScore}%
                                </div>
                            </div>
                            <div className="p-4 glass rounded-xl bg-white/[0.02]">
                                <div className="text-[10px] text-neutral-500 mb-1 tracking-widest uppercase font-bold">Focus Area</div>
                                <div className="text-lg font-bold text-accent-400 truncate">
                                    {result.topConcern.replace(/-/g, ' ').toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Platform Pillars</div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { name: "Decision", val: result.pillarAlignment.decisionIntelligence, color: "bg-primary-500" },
                                    { name: "Compliance", val: result.pillarAlignment.complianceAutomation, color: "bg-accent-500" },
                                    { name: "Governance", val: result.pillarAlignment.hitlGovernance, color: "bg-success-500" }
                                ].map((p) => (
                                    <div key={p.name} className="space-y-1">
                                        <div className="text-[8px] uppercase font-bold text-neutral-500 truncate">{p.name}</div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${p.color} transition-all duration-1000`}
                                                style={{ width: `${p.val * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {result.alerts.length > 0 && (
                            <div className="p-3 bg-error-500/5 rounded-lg border border-error-500/10">
                                <div className="text-[9px] font-black text-error-500 uppercase mb-1 tracking-widest">Active Violations / Alerts</div>
                                <ul className="text-xs text-neutral-300 space-y-1">
                                    {result.alerts.map((alert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <div className="w-1 h-1 bg-error-500 rounded-full mt-1.5 shrink-0"></div>
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
