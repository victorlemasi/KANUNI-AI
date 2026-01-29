"use client";

import { useEffect, useState } from "react";
import { History, FileText, ExternalLink, ShieldCheck, AlertCircle, Search, Download, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SavedReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/procurement');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setReports(data);
                }
            } catch (err) {
                console.error("Failed to fetch reports:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(r =>
        r.fileName.toLowerCase().includes(search.toLowerCase()) ||
        r.topConcern.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen p-6 md:p-12">
            {/* Background Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/5 blur-[120px] animate-pulse-ring" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/5 blur-[120px] animate-pulse-ring" style={{ animationDelay: '3s' }} />
            </div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] hover:text-accent-500 transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Return to Command Centre
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black audit-gradient-text tracking-tighter uppercase font-sans">
                            Institutional <span className="accent-gradient-text">Ledger</span>
                        </h1>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em]">
                            Verified Chain of Custody • Secure Audit History
                        </p>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-accent-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ANALYTICS..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full glass bg-white/[0.02] border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:border-accent-500/30 transition-all"
                        />
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Audits', value: reports.length, icon: History },
                        { label: 'High Risk', value: reports.filter(r => r.riskScore > 50).length, icon: AlertCircle, color: 'text-error-500' },
                        { label: 'Compliant', value: reports.filter(r => r.riskLevel === 'Low').length, icon: ShieldCheck, color: 'text-success-500' },
                        { label: 'System Integrity', value: '100%', icon: History, color: 'text-primary-500' }
                    ].map((m, i) => (
                        <div key={i} className="glass-card !p-4 flex items-center gap-4 hover:scale-[1.02]">
                            <div className="p-3 glass rounded-xl bg-white/[0.02]">
                                <m.icon className={`w-5 h-5 ${m.color || 'text-neutral-400'}`} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{m.label}</p>
                                <p className="text-xl font-black text-white">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audit Grid */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="glass-card p-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] animate-pulse">Syncing Ledger...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="glass-card p-20 text-center space-y-4">
                            <FileText className="w-12 h-12 text-neutral-500 mx-auto" />
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white uppercase tracking-widest">No Records Found</p>
                                <p className="text-[10px] text-neutral-500 font-medium">Verify your search or run a new audit protocol.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredReports.map((report) => (
                                <div key={report.id} className="glass-card hover:bg-white/[0.03] !p-0 group relative overflow-hidden">
                                    {/* Risk Indicator Side-bar */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${report.riskScore > 50 ? 'bg-error-500' : 'bg-success-500'} opacity-70`} />

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 glass rounded-2xl bg-white/[0.02]">
                                                <FileText className="w-6 h-6 text-primary-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest truncate max-w-xs">{report.fileName}</h3>
                                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${report.riskScore > 50 ? 'bg-error-500/10 text-error-400' : 'bg-success-500/10 text-success-400'}`}>
                                                        {report.riskLevel}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest truncate max-w-lg">
                                                    Concerns: {report.topConcern}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Risk Score</span>
                                                <span className={`text-xl font-black ${report.riskScore > 50 ? 'text-error-500' : 'text-success-400'}`}>{report.riskScore}%</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Processed</span>
                                                <span className="text-[10px] font-bold text-white uppercase">{new Date(report.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 glass rounded-xl text-neutral-500 hover:text-accent-500 hover:bg-white/5 transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 glass rounded-xl text-neutral-500 hover:text-error-500 hover:bg-white/5 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
