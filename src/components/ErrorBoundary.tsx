"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                    <div className="max-w-md w-full glass-dark p-8 rounded-2xl border border-error-500/20 space-y-6">
                        <div className="flex items-center justify-center">
                            <div className="p-4 bg-error-500/10 rounded-full">
                                <AlertCircle className="w-12 h-12 text-error-500" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-neutral-100">
                                Something Went Wrong
                            </h2>
                            <p className="text-sm text-neutral-400">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
