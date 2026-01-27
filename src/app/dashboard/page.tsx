import {
    TrendingUp,
    ShieldAlert,
    FileText,
    CheckCircle,
    Activity,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const stats = [
        { label: "Compliance Score", value: "94.2%", icon: Activity, trend: "+2.1%", color: "text-success-500" },
        { label: "Active Alerts", value: "3", icon: ShieldAlert, trend: "-1", color: "text-error-500" },
        { label: "Pending Reviews", value: "12", icon: FileText, trend: "4 new", color: "text-accent-500" },
        { label: "Completed Audits", value: "48", icon: CheckCircle, trend: "+12%", color: "text-primary-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Institutional Overview</h1>
                    <p className="text-neutral-400 mt-1">Real-time governance intelligence and compliance summary.</p>
                </div>
                <div className="text-sm glass px-4 py-2 rounded-lg flex items-center space-x-2">
                    <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                    <span className="text-neutral-300">PFM Framework Fully Synced</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${stat.color === 'text-error-500' ? 'text-error-500' : 'text-success-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-2xl font-bold mt-2">{stat.value}</div>
                        <div className="text-sm text-neutral-500 font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Alerts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Priority Compliance Alerts</h2>
                        <Link href="/dashboard/alerts" className="text-accent-500 text-sm font-semibold flex items-center hover:underline">
                            View all <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-lg bg-error-500/10 flex items-center justify-center text-error-500">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-200">Procurement Anomaly Detected</h3>
                                        <p className="text-sm text-neutral-500">County Health Dept - Vendor Concentration Risk (Level 4)</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-neutral-300">14m ago</div>
                                    <button className="text-xs text-accent-500 font-bold hover:underline">INVESTIGATE</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Integration */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Module Quick Access</h2>
                    <div className="grid gap-3">
                        {[
                            { label: "Procurement Scoring", href: "/dashboard/procurement", desc: "Evaluate risk for new items" },
                            { label: "Audit Readiness", href: "/dashboard/audit", desc: "Generate compliance reports" },
                            { label: "Policy Advisor", href: "/dashboard/intelligence", desc: "Ask AI about PFM rules" }
                        ].map((action) => (
                            <Link key={action.label} href={action.href} className="glass-dark p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all block group">
                                <div className="font-bold text-neutral-200 group-hover:text-accent-400 transition-colors uppercase tracking-wider text-xs mb-1">{action.label}</div>
                                <p className="text-sm text-neutral-500">{action.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
