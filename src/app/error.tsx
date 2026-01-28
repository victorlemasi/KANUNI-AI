'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Next.js Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 text-neutral-100">
            <div className="max-w-xl w-full glass-dark p-8 rounded-3xl border border-error-500/20 space-y-8 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-error-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-error-500/10 rounded-full ring-1 ring-error-500/20">
                        <AlertCircle className="w-12 h-12 text-error-500 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black gradient-text">System Interruption</h1>
                        <p className="text-neutral-400 text-sm max-w-md mx-auto">
                            Kanuni AI encountered a critical error during server-side rendering. This usually occurs when system resources are exceeded or a module fails to initialize.
                        </p>
                    </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-neutral-500 uppercase font-black tracking-widest">Error Context</span>
                        <span className="text-error-400 font-bold uppercase">Critical</span>
                    </div>

                    <div className="space-y-2 overflow-x-auto">
                        <p className="text-neutral-300">
                            <span className="text-neutral-500 mr-2">Message:</span>
                            {error.message || "Generic Server Component Error"}
                        </p>
                        {error.digest && (
                            <p className="text-accent-400">
                                <span className="text-neutral-500 mr-2">Digest ID:</span>
                                {error.digest}
                            </p>
                        )}
                        <p className="text-neutral-500 italic">
                            Production builds omit full stack traces for security.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry System
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Home className="w-4 h-4" />
                        Back to Safety
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-black">
                        System Integrity Log • Audit Trail Active
                    </p>
                </div>
            </div>
        </div>
    );
}
