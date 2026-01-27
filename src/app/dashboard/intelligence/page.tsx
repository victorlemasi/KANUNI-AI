import { BrainCircuit, Info } from "lucide-react";

export default function IntelligencePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-primary-500" />
                    Decision Intelligence
                </h1>
                <p className="text-neutral-400 mt-1">Predictive risk scoring and real-time compliance alerts.</p>
            </div>

            <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="p-4 bg-primary-600/10 rounded-full">
                    <BrainCircuit className="w-12 h-12 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold">Intelligence Module Initializing</h2>
                <p className="text-neutral-400 max-w-md">
                    Integrating legal frameworks and PFM requirements. Analytical models are being calibrated for institutional data.
                </p>
                <div className="flex items-center gap-2 text-sm text-accent-500 glass px-4 py-2 rounded-lg">
                    <Info className="w-4 h-4" />
                    Predictive scoring engine active in sandbox mode.
                </div>
            </div>
        </div>
    );
}
