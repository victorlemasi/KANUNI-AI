"use client";

import { Brain, FileCheck, Users2, Blocks, Shield, Bell, FileText, Search } from "lucide-react";

const pillars = [
    {
        icon: Brain,
        title: "Decision Intelligence",
        description: "Predictive risk scoring & compliance alerts",
        color: "from-primary-600 to-primary-800",
    },
    {
        icon: FileCheck,
        title: "Compliance Automation",
        description: "Audit-ready documentation, dashboards, reporting",
        color: "from-accent-600 to-accent-800",
    },
    {
        icon: Users2,
        title: "Human-in-the-Loop Governance",
        description: "Explainable AI that supports, not replaces, decision-making",
        color: "from-success-600 to-success-700",
    },
    {
        icon: Blocks,
        title: "Modular Expansion",
        description: "Public procurement → corporate compliance → NGO oversight → financial risk",
        color: "from-warning-600 to-warning-500",
    },
];

const coreModules = [
    {
        icon: Shield,
        title: "Procurement Risk Scoring",
        description: "Evaluate each procurement instance for risk before approval",
    },
    {
        icon: FileCheck,
        title: "Compliance Monitoring",
        description: "Reduces human error, strengthens institutional memory",
    },
    {
        icon: Bell,
        title: "Early-Warning Alerts",
        description: "Detect anomalies before they escalate into compliance issues",
    },
    {
        icon: FileText,
        title: "Decision Logs / Audit Trails",
        description: "Document every decision and recommendation for accountability",
    },
];

export default function SolutionSection() {
    return (
        <section id="solution" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary-950/30">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">The KANUNI AI Solution</span>
                    </h2>
                    <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
                        An AI-powered platform built on four foundational pillars, delivering real-time governance
                        intelligence and compliance automation.
                    </p>
                </div>

                {/* Platform Pillars */}
                <div className="mb-20">
                    <h3 className="text-3xl font-bold text-center mb-12">Platform Pillars</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pillars.map((pillar, index) => (
                            <div
                                key={index}
                                className="glass-dark p-6 rounded-xl hover:scale-105 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                <pillar.icon className="w-12 h-12 text-accent-500 mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="text-lg font-bold mb-2 text-neutral-100">{pillar.title}</h4>
                                <p className="text-sm text-neutral-400">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Core Modules */}
                <div id="modules" className="glass-dark p-8 sm:p-12 rounded-2xl">
                    <h3 className="text-3xl font-bold text-center mb-4">Core Modules (Phase 1 – Procurement)</h3>
                    <p className="text-center text-neutral-400 mb-12 max-w-2xl mx-auto">
                        Initial focus on procurement intelligence with plans to expand across all governance domains
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coreModules.map((module, index) => (
                            <div
                                key={index}
                                className="glass p-6 rounded-xl hover:bg-white/10 transition-all flex items-start space-x-4 group"
                            >
                                <module.icon className="w-10 h-10 text-primary-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <div>
                                    <h4 className="text-lg font-bold mb-2 text-neutral-100">{module.title}</h4>
                                    <p className="text-neutral-400">{module.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Phase 2 Modules Preview */}
                <div className="mt-12 text-center glass p-8 rounded-2xl">
                    <h4 className="text-2xl font-bold mb-4">Coming in Phase 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Search className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                            <div className="font-semibold text-neutral-200">Contract Review Automation</div>
                        </div>
                        <div>
                            <Shield className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                            <div className="font-semibold text-neutral-200">Fraud & Anomaly Detection</div>
                        </div>
                        <div>
                            <FileCheck className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                            <div className="font-semibold text-neutral-200">Internal Audit AI Assistant</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
