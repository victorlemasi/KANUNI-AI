"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { processProcurementPDF } from "@/app/actions/analyze";

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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
            const data = await processProcurementPDF(formData);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to analyze document");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass p-8 rounded-2xl border-dashed border-2 border-white/10 text-center space-y-4">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary-600/10 rounded-full">
                        <Upload className="w-8 h-8 text-primary-500" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold">Analysis via KANUNI AI BERT</h3>
                    <p className="text-neutral-500 text-sm">Upload procurement PDF for real-time risk scoring</p>
                </div>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                />

                <label
                    htmlFor="pdf-upload"
                    className="inline-block px-6 py-2 glass hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                >
                    {file ? file.name : "Choose PDF File"}
                </label>

                {file && !isUploading && !result && (
                    <button
                        onClick={handleUpload}
                        className="block w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all"
                    >
                        START BERT ANALYSIS
                    </button>
                )}

                {isUploading && (
                    <div className="flex items-center justify-center space-x-3 text-accent-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">AI models loading & analyzing...</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-center space-x-3 text-error-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 space-y-6">
                    <div className="glass-dark p-6 rounded-2xl space-y-4 border border-accent-500/20">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold flex items-center space-x-2">
                                <CheckCircle2 className="w-5 h-5 text-success-500" />
                                <span>Analysis Complete</span>
                            </h4>
                            <span className="text-xs text-neutral-500">{result.fileName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 glass rounded-xl">
                                <div className="text-sm text-neutral-500 mb-1 tracking-wider uppercase font-semibold">Risk Score</div>
                                <div className={`text-4xl font-bold ${parseFloat(result.riskScore) > 50 ? 'text-error-500' : 'text-success-500'}`}>
                                    {result.riskScore}%
                                </div>
                            </div>
                            <div className="p-4 glass rounded-xl">
                                <div className="text-sm text-neutral-500 mb-1 tracking-wider uppercase font-semibold">Primary Concern</div>
                                <div className="text-lg font-bold text-accent-400 capitalize">
                                    {result.topConcern.replace(/-/g, ' ')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest text-[10px]">Pillar Alignment</div>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Decision Intelligence</span>
                                        <span>{(result.pillarAlignment.decisionIntelligence * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-1000"
                                            style={{ width: `${result.pillarAlignment.decisionIntelligence * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Compliance Automation</span>
                                        <span>{(result.pillarAlignment.complianceAutomation * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-500 transition-all duration-1000"
                                            style={{ width: `${result.pillarAlignment.complianceAutomation * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {result.alerts.length > 0 && (
                            <div className="p-3 bg-error-500/5 rounded-lg border border-error-500/10">
                                <div className="text-[10px] font-bold text-error-500 uppercase mb-1">Critical Alerts</div>
                                <ul className="text-xs text-neutral-300 list-disc list-inside">
                                    {result.alerts.map((alert: string, i: number) => (
                                        <li key={i}>{alert}</li>
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
