"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
                        <Sparkles className="w-4 h-4 text-accent-500" />
                        <span className="text-sm font-medium text-neutral-300">
                            Governance Intelligence, Decision Certainty, Africa-Ready AI
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                        <span className="gradient-text">KANUNI AI</span>
                        <br />
                        <span className="text-neutral-100">
                            Transforming Governance
                            <br />
                            Through Intelligence
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="max-w-3xl mx-auto text-lg sm:text-xl text-neutral-300 leading-relaxed">
                        AI-powered compliance and governance intelligence platform integrating legal frameworks,
                        PFM requirements, and predictive analytics to provide real-time decision support across
                        public and private sectors in Africa.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a
                            href="#solution"
                            className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-accent-500/50 hover:scale-105 flex items-center space-x-2"
                        >
                            <span>Explore Platform</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 glass rounded-lg font-semibold text-lg hover:bg-white/10 border border-white/20"
                        >
                            Request Demo
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
                        <div className="glass-dark p-6 rounded-xl">
                            <div className="text-3xl font-bold gradient-text">47+</div>
                            <div className="text-neutral-400 mt-2">County Governments</div>
                        </div>
                        <div className="glass-dark p-6 rounded-xl">
                            <div className="text-3xl font-bold gradient-text">$50-100M</div>
                            <div className="text-neutral-400 mt-2">Market Opportunity</div>
                        </div>
                        <div className="glass-dark p-6 rounded-xl">
                            <div className="text-3xl font-bold gradient-text">4 Pillars</div>
                            <div className="text-neutral-400 mt-2">Platform Architecture</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
