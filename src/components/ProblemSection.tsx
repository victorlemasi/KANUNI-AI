"use client";

import { AlertTriangle, FileX, Users, TrendingDown } from "lucide-react";

const publicChallenges = [
    {
        icon: FileX,
        title: "Frequent Adverse Audit Reports",
        description: "Persistent compliance gaps leading to audit queries and public trust erosion",
    },
    {
        icon: TrendingDown,
        title: "Delayed Procurement",
        description: "Fragmented procurement processes causing inefficiencies and project delays",
    },
    {
        icon: AlertTriangle,
        title: "Risk-Prone Contracting",
        description: "Vendor concentration and inadequate risk assessment in contracting",
    },
    {
        icon: Users,
        title: "Lack of Real-Time Intelligence",
        description: "Absence of data-driven decision support in compliance and governance",
    },
];

export default function ProblemSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">The Challenge</span>
                    </h2>
                    <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
                        Kenya's institutions face persistent compliance and governance challenges that result in
                        inefficiencies, audit queries, and public trust gaps.
                    </p>
                </div>

                {/* Key Insight */}
                <div className="glass-dark p-8 rounded-2xl mb-12 border-l-4 border-accent-500">
                    <div className="flex items-start space-x-4">
                        <AlertTriangle className="w-8 h-8 text-accent-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-accent-400">Key Insight</h3>
                            <p className="text-lg text-neutral-300">
                                The gap is not AI literacy; it is{" "}
                                <span className="font-semibold text-white">
                                    data-driven decision support in a legally robust, context-aware framework
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {publicChallenges.map((challenge, index) => (
                        <div
                            key={index}
                            className="glass p-6 rounded-xl hover:bg-white/10 transition-all group hover:scale-105"
                        >
                            <challenge.icon className="w-12 h-12 text-error-500 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-2 text-neutral-100">{challenge.title}</h3>
                            <p className="text-neutral-400">{challenge.description}</p>
                        </div>
                    ))}
                </div>

                {/* Additional Sectors */}
                <div className="mt-12 glass-dark p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-center">
                        Private Sector & NGO Challenges
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-lg font-semibold text-neutral-200">Complex Regulations</div>
                            <p className="text-neutral-400 mt-2">Navigating intricate regulatory requirements</p>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-neutral-200">Audit Overhead</div>
                            <p className="text-neutral-400 mt-2">Resource-intensive compliance processes</p>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-neutral-200">Fraud Risk</div>
                            <p className="text-neutral-400 mt-2">Operational errors and inefficient governance</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
