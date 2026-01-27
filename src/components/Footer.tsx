"use client";

import { Shield, Mail, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer id="contact" className="glass-dark border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-8 h-8 text-accent-500" />
                            <span className="text-xl font-bold gradient-text">KANUNI AI</span>
                        </div>
                        <p className="text-neutral-400 text-sm">
                            Governance Intelligence, Decision Certainty, Africa-Ready AI.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-neutral-100 mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#solution" className="text-neutral-400 hover:text-accent-500">
                                    Solution
                                </Link>
                            </li>
                            <li>
                                <Link href="#modules" className="text-neutral-400 hover:text-accent-500">
                                    Modules
                                </Link>
                            </li>
                            <li>
                                <Link href="#market" className="text-neutral-400 hover:text-accent-500">
                                    Market
                                </Link>
                            </li>
                            <li>
                                <Link href="#roadmap" className="text-neutral-400 hover:text-accent-500">
                                    Roadmap
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-neutral-100 mb-4">Get in Touch</h3>
                        <div className="space-y-3">
                            <a
                                href="mailto:info@kanuni.ai"
                                className="flex items-center space-x-2 text-neutral-400 hover:text-accent-500 text-sm"
                            >
                                <Mail className="w-4 h-4" />
                                <span>info@kanuni.ai</span>
                            </a>
                            <div className="flex space-x-4 pt-2">
                                <a href="#" className="text-neutral-400 hover:text-accent-500">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-neutral-400 hover:text-accent-500">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 pt-8 text-center text-sm text-neutral-500">
                    <p>&copy; {new Date().getFullYear()} KANUNI AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
