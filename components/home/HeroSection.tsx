"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { HyperText } from "../ui/hyper-text";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Particles } from "../ui/particles";
import { ShineBorder } from "../ui/shine-border";

export default function HeroSection() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");
  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  }, [resolvedTheme]);

  return (
    <section className="relative select-none min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/50 pointer-events-none z-10" />
      <div className="absolute inset-0 overflow-hidden">
        <Particles
          className="absolute inset-0 z-0"
          quantity={100}
          ease={80}
          color={color}
          refresh
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent pointer-events-none z-10" />

      <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-25 z-20">
        <div
          className="absolute top-1/4 left-10 w-32 h-32 border-2 border-blue-400/50 rounded-full"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-20 w-40 h-40 border-2 border-purple-400/50 rotate-45"
          style={{
            animation:
              "spin 20s linear infinite, pulse 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-pink-400/50 rounded-full"
          style={{ animation: "pulse 3s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-36 h-36 border-2 border-cyan-400/50 rotate-12"
          style={{
            animation:
              "spin 25s linear infinite reverse, pulse 4.5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-28 h-28 border-2 border-emerald-400/50"
          style={{
            animation:
              "spin 30s linear infinite, pulse 5s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden z-20">
        <div
          className="absolute top-20 left-1/4 text-6xl text-blue-300/10 dark:text-blue-400/10 font-bold select-none"
          style={{ animation: "float 8s ease-in-out infinite" }}
        >
          π
        </div>
        <div
          className="absolute bottom-32 right-1/4 text-7xl text-purple-300/10 dark:text-purple-400/10 font-bold select-none"
          style={{ animation: "float 9s ease-in-out infinite 1s" }}
        >
          ∑
        </div>
        <div
          className="absolute top-1/2 left-12 text-5xl text-pink-300/10 dark:text-pink-400/10 font-bold select-none"
          style={{ animation: "float 7.5s ease-in-out infinite 2s" }}
        >
          ∫
        </div>
        <div
          className="absolute top-1/3 right-16 text-8xl text-cyan-300/10 dark:text-cyan-400/10 font-bold select-none"
          style={{ animation: "float 10s ease-in-out infinite 0.5s" }}
        >
          ∞
        </div>
        <div
          className="absolute bottom-1/5 left-2/5 text-6xl text-emerald-300/10 dark:text-emerald-400/10 font-bold select-none"
          style={{ animation: "float 8.5s ease-in-out infinite 1.5s" }}
        >
          Σ
        </div>
        <div
          className="absolute top-2/3 right-1/3 text-5xl text-yellow-300/10 dark:text-yellow-400/10 font-bold select-none"
          style={{ animation: "float 9.5s ease-in-out infinite 2.5s" }}
        >
          √
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden z-5 pointer-events-none">
        <div
          className="absolute top-16 left-16 text-blue-400/70 dark:text-blue-400/60 font-mono text-sm backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-blue-400/30 transform -rotate-6"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          ∫₀^∞ e^(-x²)dx = √π/2
        </div>
        <div
          className="absolute top-24 right-20 text-purple-400/70 dark:text-purple-400/60 font-mono text-sm backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-purple-400/30 transform rotate-3"
          style={{ animation: "float 7s ease-in-out infinite 1s" }}
        >
          lim(x→0) (sin x)/x = 1
        </div>
        <div
          className="absolute bottom-24 left-24 text-pink-400/70 dark:text-pink-400/60 font-mono text-base backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-pink-400/30 transform rotate-6"
          style={{ animation: "float 5.5s ease-in-out infinite 2s" }}
        >
          e^(iπ) + 1 = 0
        </div>
        <div
          className="absolute bottom-32 right-32 text-cyan-400/70 dark:text-cyan-400/60 font-mono text-sm backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-cyan-400/30 transform -rotate-3"
          style={{ animation: "float 6.5s ease-in-out infinite 0.5s" }}
        >
          ∑(n=1→∞) 1/n² = π²/6
        </div>
        <div
          className="absolute top-1/3 right-12 text-emerald-400/70 dark:text-emerald-400/60 font-mono text-xs backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-2 py-1 rounded-lg border border-emerald-400/30 transform rotate-12"
          style={{ animation: "float 7.5s ease-in-out infinite 1.5s" }}
        >
          ∇²f = ∂²f/∂x² + ∂²f/∂y²
        </div>
        <div
          className="absolute top-1/2 left-20 text-yellow-400/70 dark:text-yellow-400/60 font-mono text-xs backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-2 py-1 rounded-lg border border-yellow-400/30 transform -rotate-12"
          style={{ animation: "float 8s ease-in-out infinite 2.5s" }}
        >
          ∫∫ f(x,y)dxdy
        </div>
        <div
          className="absolute top-1/4 left-1/3 text-red-400/70 dark:text-red-400/60 font-mono text-sm backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-red-400/30 transform rotate-6"
          style={{ animation: "float 6s ease-in-out infinite 3s" }}
        >
          d/dx[f(g(x))] = f'(g(x))·g'(x)
        </div>
        <div
          className="absolute top-2/3 right-1/4 text-indigo-400/70 dark:text-indigo-400/60 font-mono text-xs backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-2 py-1 rounded-lg border border-indigo-400/30 transform -rotate-6"
          style={{ animation: "float 7s ease-in-out infinite 1s" }}
        >
          det(A) = ∑σ sgn(σ)∏aᵢσ(ᵢ)
        </div>
        <div
          className="absolute top-1/4 right-1/3 text-violet-400/70 dark:text-violet-400/60 font-mono text-sm backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-violet-400/30 transform rotate-9"
          style={{ animation: "float 6.5s ease-in-out infinite 2s" }}
        >
          ∮ F·dr = ∬(∇×F)·dS
        </div>
        <div
          className="absolute bottom-1/4 left-1/4 text-rose-400/70 dark:text-rose-400/60 font-mono text-xs backdrop-blur-sm bg-slate-900/30 dark:bg-slate-900/40 px-2 py-1 rounded-lg border border-rose-400/30 transform -rotate-9"
          style={{ animation: "float 7.5s ease-in-out infinite 0.8s" }}
        >
          Γ(n) = ∫₀^∞ t^(n-1)e^(-t)dt
        </div>
      </div>

      {/* <div className="absolute inset-0">
          <div className="text-emerald-400 dark:text-emerald-600 font-mono text-lg tracking-wider absolute top-10 left-10 rotate-12 animate-pulse">
            ∫₀^∞ e^(-x²) dx = √π/2
          </div>
          <div className="text-blue-400 dark:text-blue-600 font-mono text-sm absolute top-20 right-20 -rotate-6 animate-pulse delay-1000">
            lim(x→0) (sin x)/x = 1
          </div>
          <div className="text-purple-400 dark:text-purple-600 font-mono text-base absolute bottom-32 left-16 rotate-6 animate-pulse delay-2000">
            ∇²φ = ρ/ε₀
          </div>
          <div className="text-yellow-400 dark:text-yellow-600 font-mono text-lg absolute bottom-20 right-24 -rotate-12 animate-pulse delay-3000">
            e^(iπ) + 1 = 0
          </div>
          <div className="text-red-400 dark:text-red-900 font-mono text-sm absolute top-1/3 left-1/4 rotate-3 animate-pulse delay-500">
            ∂f/∂x = lim(h→0) [f(x+h)-f(x)]/h
          </div>
          <div className="text-cyan-400 dark:text-cyan-600 font-mono text-base absolute top-2/3 right-1/3 -rotate-3 animate-pulse delay-1500">
            ∑(n=1 to ∞) 1/n² = π²/6
          </div>
        </div> */}

      {/* Main content */}
      <div className="relative z-20 text-center px-4 max-w-[1500px] mx-auto">
        <HyperText
          animateOnHover={false}
          duration={1200}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          ACPS Club of Mathematics
        </HyperText>
        {/* <HyperText
          animateOnHover={false}
          className="text-xl md:text-2xl mb-8 text-gray-200 dark:text-gray-300 font-light"
        >
          Think Logical
        </HyperText> */}
        <p className="text-xl md:text-2xl mb-8 text-gray-200 dark:text-gray-300 font-light">
          Think Logical
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?tab=register">
            <Button
              size="lg"
              variant="outline"
              className="bg-[#2a3040] border-gray-200 text-gray-200 hover:bg-gray-200 px-8 py-3 text-lg transform-gpu transition-transform duration-300 ease-out hover:scale-[101%] relative w-full max-w-[350px] overflow-hidden"
            >
              <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
              {/* <HyperText
                animateOnHover={false}
                className="overflow-hidden py-0 text-base md:text-lg text-gray-200 font-semibold"
              >
                Join Now
              </HyperText> */}
              Join Now
            </Button>
          </Link>
          <Link href="/resources">
            <Button
              size="lg"
              variant="outline"
              className="bg-[#2a3040] border-gray-200 text-gray-200 hover:bg-gray-200 px-8 py-3 text-lg transform-gpu transition-transform duration-300 ease-out hover:scale-[101%]"
            >
              {/* <HyperText
                animateOnHover={false}
                className="overflow-hidden py-0 text-base md:text-lg text-gray-200 font-semibold"
              >
                Explore Resources
              </HyperText> */}
              Explore Resources
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-gray-200/60 rounded-full p-1 flex justify-center">
            <div className="w-1.5 h-3 mt-0.5 bg-gray-200/80 rounded-full animate-bounce" />
          </div>
          <span className="text-xs text-gray-200/60 font-light">Scroll</span>
        </div>
      </div>
    </section>
  );
}
