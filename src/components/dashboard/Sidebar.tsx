"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BrainCircuit,
    FileCheck2,
    Users,
    ShoppingCart,
    ShieldAlert,
    History,
    Settings,
    X
} from "lucide-react";

const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Decision Intelligence", icon: BrainCircuit, href: "/dashboard/intelligence" },
    { name: "Compliance Automation", icon: FileCheck2, href: "/dashboard/automation" },
    { name: "HITL Governance", icon: Users, href: "/dashboard/governance" },
    { divider: true },
    { name: "Procurement Risk", icon: ShoppingCart, href: "/dashboard/procurement" },
    { name: "Early Warnings", icon: ShieldAlert, href: "/dashboard/alerts" },
    { name: "Audit Trails", icon: History, href: "/dashboard/audit" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 glass-dark border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold gradient-text">KANUNI AI</span>
                        </Link>
                        <button onClick={onClose} className="md:hidden">
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item, idx) => {
                            if (item.divider) {
                                return <div key={idx} className="my-4 border-t border-white/5" />;
                            }

                            const active = pathname === item.href;
                            const Icon = item.icon!;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href!}
                                    onClick={() => onClose()}
                                    className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group
                    ${active
                                            ? "bg-primary-600/20 text-accent-400 border border-primary-500/20"
                                            : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"}
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? "text-accent-400" : "group-hover:text-neutral-200"}`} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Profile/Settings */}
                    <div className="p-4 border-t border-white/5">
                        <Link
                            href="/dashboard/settings"
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-neutral-200 transition-all"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
