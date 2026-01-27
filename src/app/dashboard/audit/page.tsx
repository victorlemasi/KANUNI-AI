import { History, ShieldCheck } from "lucide-react";

export default function AuditPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <History className="w-8 h-8 text-neutral-400" />
                    Audit Trails / Decision Logs
                </h1>
                <p className="text-neutral-400 mt-1">Immutable records of all platform recommendations and institutional decisions.</p>
            </div>

            <div className="glass p-6 rounded-2xl">
                <div className="overflow-hidden rounded-xl border border-white/5">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-neutral-400 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="text-neutral-500">
                                <td colSpan={5} className="px-6 py-12 text-center italic">
                                    No decision logs found for the current period. Platforms trails will appear here as governance actions are logged.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
