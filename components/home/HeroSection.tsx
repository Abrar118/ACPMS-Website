import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background with mathematical formulas */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-90 dark:opacity-50">
                    <div className="text-emerald-400 font-mono text-lg tracking-wider absolute top-10 left-10 rotate-12 animate-pulse">
                        ∫₀^∞ e^(-x²) dx = √π/2
                    </div>
                    <div className="text-blue-400 font-mono text-sm absolute top-20 right-20 -rotate-6 animate-pulse delay-1000">
                        lim(x→0) (sin x)/x = 1
                    </div>
                    <div className="text-purple-400 font-mono text-base absolute bottom-32 left-16 rotate-6 animate-pulse delay-2000">
                        ∇²φ = ρ/ε₀
                    </div>
                    <div className="text-yellow-400 font-mono text-lg absolute bottom-20 right-24 -rotate-12 animate-pulse delay-3000">
                        e^(iπ) + 1 = 0
                    </div>
                    <div className="text-red-400 font-mono text-sm absolute top-1/3 left-1/4 rotate-3 animate-pulse delay-500">
                        ∂f/∂x = lim(h→0) [f(x+h)-f(x)]/h
                    </div>
                    <div className="text-cyan-400 font-mono text-base absolute top-2/3 right-1/3 -rotate-3 animate-pulse delay-1500">
                        ∑(n=1 to ∞) 1/n² = π²/6
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ACPS Club of Mathematics
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 dark:text-gray-300 font-light">
                    Think Logical
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth?tab=register">
                        <Button size="lg" className="px-8 py-3 text-lg">
                            Join Now
                        </Button>
                    </Link>
                    <Link href="/resources">
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-[#2a3040] border-gray-200 text-gray-200 hover:bg-gray-200 hover:text-gray-900 px-8 py-3 text-lg"
                        >
                            Explore Resources
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-200 animate-bounce">
                <ChevronDown className="w-6 h-6" />
            </div>
        </section>
    );
}
