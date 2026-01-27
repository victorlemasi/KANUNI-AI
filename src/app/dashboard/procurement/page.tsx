import { ShoppingCart, AlertCircle } from "lucide-react";
import FileUpload from "@/components/dashboard/FileUpload";

export default function ProcurementPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-success-500" />
                    Procurement Risk Scoring
                </h1>
                <p className="text-neutral-400 mt-1">Evaluate specific procurement instances for compliance risks before approval.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <FileUpload />

                    <div className="glass p-6 rounded-2xl">
                        <h2 className="text-xl font-bold mb-4">Historical Risk Trends</h2>
                        <div className="h-48 flex items-end justify-between space-x-2">
                            {[40, 65, 30, 85, 45, 60, 25].map((h, i) => (
                                <div key={i} className="flex-1 space-y-2 group">
                                    <div
                                        className={`w-full bg-primary-600/20 rounded-t-lg transition-all group-hover:bg-primary-500/40 cursor-help relative`}
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[10px] font-bold">
                                            {h}%
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 text-center uppercase tracking-tighter">Day {i + 1}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-dark p-6 rounded-2xl space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-warning-500 uppercase text-xs tracking-widest">
                            <AlertCircle className="w-4 h-4" />
                            Active Monitoring
                        </h3>
                        <div className="space-y-4">
                            <div className="text-4xl font-bold font-mono">18</div>
                            <p className="text-sm text-neutral-400">Total requisitions analyzed this week.</p>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-[10px] font-bold text-neutral-500 uppercase">Alert Density</div>
                                <div className="text-lg font-bold text-success-500">LOW</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl">
                        <h3 className="font-bold text-sm mb-4">AI Compliance Model</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-400">Model</span>
                                <span className="text-accent-400 font-mono">mobilebert-uncased</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-400">Context Window</span>
                                <span className="text-neutral-200">512 Tokens</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-400">Latency</span>
                                <span className="text-success-500">~250ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
