"use client";

import { Building2, Landmark, Briefcase, Heart } from "lucide-react";

const targets = [
    { icon: Building2, label: "County Governments", count: "47 Counties" },
    { icon: Landmark, label: "National Agencies", count: "50+ Parastatals" },
    { icon: Briefcase, label: "Large MSMEs & Corporates", count: "Thousands" },
    { icon: Heart, label: "NGOs & Donor Programs", count: "Growing Sector" },
];

export default function MarketSection() {
    return (
        <section id="market" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Market Opportunity</span>
                    </h2>
                    <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
                        Addressing a critical need across public and private sectors in Kenya, with pan-Africa
                        expansion potential.
                    </p>
                </div>

                {/* Target Markets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {targets.map((target, index) => (
                        <div
                            key={index}
                            className="glass-dark p-6 rounded-xl text-center hover:scale-105 transition-all group"
                        >
                            <target.icon className="w-12 h-12 text-accent-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <div className="text-lg font-bold text-neutral-100 mb-2">{target.label}</div>
                            <div className="text-sm text-neutral-400">{target.count}</div>
                        </div>
                    ))}
                </div>

                {/* TAM Breakdown */}
                <div className="glass-dark p-8 sm:p-12 rounded-2xl">
                    <h3 className="text-3xl font-bold text-center mb-8">Total Addressable Market</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-5xl font-bold gradient-text mb-2">$50-100M</div>
                            <div className="text-neutral-300">First 5 Years in Kenya</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold gradient-text mb-2">10×</div>
                            <div className="text-neutral-300">Pan-Africa Expansion Potential</div>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-4 text-center">Market Composition</h4>
                        <ul className="space-y-3 text-neutral-300">
                            <li className="flex items-center justify-between">
                                <span>47 counties × 10–20 compliance units each</span>
                                <span className="text-accent-500 font-semibold">470-940 units</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span>National agencies and ministries</span>
                                <span className="text-accent-500 font-semibold">50+ entities</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span>Corporates and NGOs</span>
                                <span className="text-accent-500 font-semibold">Thousands</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
