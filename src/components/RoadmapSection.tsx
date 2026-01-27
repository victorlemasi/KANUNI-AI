"use client";

import { CheckCircle2, Circle } from "lucide-react";

const phases = [
    {
        phase: "Phase 0",
        title: "Preparation",
        timeline: "0–1 Month",
        status: "current",
        items: [
            "Co-founder recruitment",
            "Advisory board setup",
            "Pilot partner identification",
            "KPI definition",
        ],
    },
    {
        phase: "Phase 1",
        title: "Pilot",
        timeline: "1–6 Months",
        status: "upcoming",
        items: ["MVP development", "Data integration", "Pilot deployment", "User feedback"],
    },
    {
        phase: "Phase 2",
        title: "Funding & Alignment",
        timeline: "6–12 Months",
        status: "upcoming",
        items: ["Engage donors", "Secure seed funding", "Legal compliance", "Market validation"],
    },
    {
        phase: "Phase 3",
        title: "Multi-Sector Expansion",
        timeline: "Year 2",
        status: "future",
        items: [
            "Deploy to national ministries",
            "Private sector rollout",
            "Additional modules",
            "Scale operations",
        ],
    },
    {
        phase: "Phase 4",
        title: "Platform Ecosystem",
        timeline: "Year 3–5",
        status: "future",
        items: [
            "Launch marketplace",
            "University partnerships",
            "Cross-sector analytics",
            "Regional expansion",
        ],
    },
    {
        phase: "Phase 5",
        title: "Continental Leadership",
        timeline: "Year 5+",
        status: "future",
        items: [
            "EAC deployment",
            "AU integration",
            "AI Governance Academy",
            "Pan-Africa platform",
        ],
    },
];

export default function RoadmapSection() {
    return (
        <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-950/30 to-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Implementation Roadmap</span>
                    </h2>
                    <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
                        A phased approach from pilot to continental leadership, building sustainable governance
                        intelligence infrastructure across Africa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {phases.map((phase, index) => (
                        <div
                            key={index}
                            className={`glass-dark p-6 rounded-xl hover:scale-105 transition-all ${phase.status === "current" ? "border-2 border-accent-500" : ""
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-sm font-semibold text-accent-500">{phase.phase}</div>
                                    <div className="text-xl font-bold text-neutral-100">{phase.title}</div>
                                </div>
                                {phase.status === "current" ? (
                                    <CheckCircle2 className="w-6 h-6 text-success-500" />
                                ) : (
                                    <Circle className="w-6 h-6 text-neutral-600" />
                                )}
                            </div>
                            <div className="text-sm text-neutral-400 mb-4">{phase.timeline}</div>
                            <ul className="space-y-2">
                                {phase.items.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-2 text-sm text-neutral-300">
                                        <span className="text-accent-500 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
