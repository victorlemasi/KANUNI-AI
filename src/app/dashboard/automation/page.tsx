import { FileCheck2, Hammer } from "lucide-react";

export default function AutomationPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FileCheck2 className="w-8 h-8 text-accent-500" />
                    Compliance Automation
                </h1>
                <p className="text-neutral-400 mt-1">Audit-ready documentation and automated reporting dashboards.</p>
            </div>

            <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="p-4 bg-accent-600/10 rounded-full">
                    <Hammer className="w-12 h-12 text-accent-500" />
                </div>
                <h2 className="text-2xl font-bold">Automation Engine Under Construction</h2>
                <p className="text-neutral-400 max-w-md">
                    Configuring automated report generation for Kenya National Treasury and Auditor General standards.
                </p>
            </div>
        </div>
    );
}
