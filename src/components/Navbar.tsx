"use client";

import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <Shield className="w-8 h-8 text-accent-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold gradient-text">KANUNI AI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#solution" className="text-neutral-300 hover:text-accent-500 font-medium">
                            Solution
                        </Link>
                        <Link href="#modules" className="text-neutral-300 hover:text-accent-500 font-medium">
                            Modules
                        </Link>
                        <Link href="#market" className="text-neutral-300 hover:text-accent-500 font-medium">
                            Market
                        </Link>
                        <Link href="#roadmap" className="text-neutral-300 hover:text-accent-500 font-medium">
                            Roadmap
                        </Link>
                        <Link
                            href="#contact"
                            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-500/50 hover:scale-105"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg glass hover:bg-white/10"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden glass-dark border-t border-white/10">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            href="#solution"
                            className="block px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Solution
                        </Link>
                        <Link
                            href="#modules"
                            className="block px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Modules
                        </Link>
                        <Link
                            href="#market"
                            className="block px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Market
                        </Link>
                        <Link
                            href="#roadmap"
                            className="block px-4 py-2 rounded-lg hover:bg-white/10 text-neutral-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Roadmap
                        </Link>
                        <Link
                            href="#contact"
                            className="block px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg font-semibold text-center"
                            onClick={() => setIsOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
