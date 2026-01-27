"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ArrowLeft, Trash2, Search } from "lucide-react";
import Link from "next/link";

export default function SavedReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('kanuni_reports') || '[]');
        setReports(saved);
    }, []);

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear all saved reports?")) {
            localStorage.removeItem('kanuni_reports');
            setReports([]);
        }
    };

    const downloadReport = (result: any) => {
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

AI SUGGESTIONS:
${result.suggestions?.map((s: string) => `- ${s}`).join('\n') || 'N/A'}

PILLAR ALIGNMENT:
- Decision Intelligence: ${(result.pillarAlignment.decisionIntelligence * 100).toFixed(1)}%
- Compliance Automation: ${(result.pillarAlignment.complianceAutomation * 100).toFixed(1)}%
- HITL Governance: ${(result.pillarAlignment.hitlGovernance * 100).toFixed(1)}%

ALERTS:
${result.alerts.length > 0 ? result.alerts.join('\n') : 'No critical anomalies detected.'}

AUDIT TRAIL:
- Log ID: ${result.auditTrail?.inferenceTime || 'N/A'}
- Model: ${result.auditTrail?.model || 'BERT'}

-----------------------------------------
(c) KANUNI AI
    `;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KANUNI_Report_${result.fileName.split('.')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredReports = reports.filter(r =>
        r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.topConcern.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#020617] text-neutral-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors text-sm font-bold uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Analysis
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight gradient-text">Institutional Memory</h1>
                        <p className="text-neutral-500 text-sm">Secure Governance Report Archive</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-accent-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reports..."
                                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:bg-white/10 focus:border-accent-500/50 transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {reports.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="p-2 glass border-error-500/30 text-error-500 hover:bg-error-500/10 rounded-xl transition-colors"
                                title="Clear History"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredReports.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
                        <FileText className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-500">No Reports Found</h3>
                        <p className="text-neutral-600 text-sm mt-2">Processed documents will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report, idx) => (
                            <div key={idx} className="glass rounded-2xl p-6 border-white/5 hover:border-accent-500/30 hover:bg-white/[0.02] transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-accent-500/10 transition-colors"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-500/10 rounded-xl">
                                        <FileText className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${report.riskScore > 50 ? 'bg-error-500/10 text-error-400' : 'bg-success-500/10 text-success-400'}`}>
                                        Risk: {report.riskScore}%
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-1 truncate text-neutral-200" title={report.fileName}>{report.fileName}</h3>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-4">
                                    {new Date(report.timestamp).toLocaleDateString()} • {new Date(report.timestamp).toLocaleTimeString()}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="text-xs text-neutral-400 line-clamp-2 min-h-[2.5em]">
                                        <span className="text-accent-500 font-bold uppercase text-[10px] mr-2">Focus:</span>
                                        {report.topConcern}
                                    </div>
                                </div>

                                <button
                                    onClick={() => downloadReport(report)}
                                    className="w-full py-2 flex items-center justify-center gap-2 glass border-accent-500/20 text-accent-400 font-bold text-xs rounded-lg hover:bg-accent-500/10 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    DOWNLOAD REPORT
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
