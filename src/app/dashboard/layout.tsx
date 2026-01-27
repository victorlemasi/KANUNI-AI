"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Bell, Search, User } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-neutral-100 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-16 glass-dark border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 md:hidden hover:bg-white/5 rounded-lg text-neutral-400"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden sm:flex items-center px-3 py-1.5 glass rounded-full border border-white/5">
                            <Search className="w-4 h-4 text-neutral-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Search intelligence..."
                                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 glass rounded-lg hover:bg-white/10 relative">
                            <Bell className="w-5 h-5 text-neutral-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-[#020617]"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center border border-white/10 cursor-pointer hover:scale-105 transition-transform">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
