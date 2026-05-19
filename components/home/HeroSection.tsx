"use client";

import { AmbientGlow } from "@/components/ui/ambient-glow";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const floatingSymbols = [
  { char: "π", className: "top-[10%] left-[8%] text-7xl", delay: "0s", color: "rgba(220, 38, 38, 0.12)" },
  { char: "∑", className: "bottom-[15%] right-[10%] text-8xl", delay: "4s", color: "rgba(255, 255, 255, 0.06)" },
  { char: "∫", className: "top-[40%] left-[3%] text-6xl", delay: "8s", color: "rgba(220, 38, 38, 0.10)" },
  { char: "∞", className: "top-[18%] right-[6%] text-9xl", delay: "2s", color: "rgba(220, 38, 38, 0.14)" },
  { char: "√", className: "bottom-[30%] left-[18%] text-5xl", delay: "12s", color: "rgba(255, 255, 255, 0.05)" },
  { char: "Δ", className: "top-[60%] right-[22%] text-7xl", delay: "6s", color: "rgba(220, 38, 38, 0.10)" },
  { char: "∂", className: "top-[75%] left-[12%] text-6xl", delay: "10s", color: "rgba(255, 255, 255, 0.05)" },
  { char: "Ω", className: "top-[8%] right-[30%] text-5xl", delay: "14s", color: "rgba(220, 38, 38, 0.08)" },
  { char: "θ", className: "bottom-[10%] left-[40%] text-6xl", delay: "3s", color: "rgba(220, 38, 38, 0.10)" },
  { char: "λ", className: "top-[50%] right-[5%] text-8xl", delay: "7s", color: "rgba(255, 255, 255, 0.06)" },
  { char: "φ", className: "bottom-[45%] right-[35%] text-5xl", delay: "16s", color: "rgba(220, 38, 38, 0.08)" },
  { char: "±", className: "top-[30%] left-[25%] text-4xl", delay: "11s", color: "rgba(255, 255, 255, 0.05)" },
];

function StickyNote({ children, className, rotate = "-3deg", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease }}
      className={`absolute hidden lg:block pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none dark:block hidden" />

      <AmbientGlow size="lg" position="top-right" color="rgba(220, 38, 38, 0.1)" className="hidden dark:block" />
      <AmbientGlow size="md" position="bottom-left" color="rgba(220, 38, 38, 0.08)" className="hidden dark:block" />

      {/* Floating math symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {floatingSymbols.map((symbol) => (
          <div
            key={symbol.char}
            className={`absolute font-bold ${symbol.className}`}
            style={{ color: symbol.color, animation: `float 20s ease-in-out infinite`, animationDelay: symbol.delay }}
          >
            {symbol.char}
          </div>
        ))}
      </div>

      {/* === Peeking math cards from edges === */}

      {/* Top-left: Sticky note with Euler's identity */}
      <StickyNote className="top-[12%] -left-4" rotate="-6deg" delay={0.5}>
        <div className="w-52 bg-amber-200 dark:bg-amber-300/90 rounded-lg p-4 shadow-lg shadow-black/10 dark:shadow-black/30">
          <div className="w-5 h-5 bg-red-400 rounded-full mx-auto -mt-6 mb-2 shadow-sm" />
          <p className="font-mono text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold text-sm">Euler&apos;s Identity</span>
            <br />
            e<sup>iπ</sup> + 1 = 0
            <br />
            <span className="text-[10px] italic mt-1 block opacity-70">
              &quot;The most beautiful equation&quot;
            </span>
          </p>
        </div>
      </StickyNote>

      {/* Top-right: Reminder/formula card */}
      <StickyNote className="top-[8%] -right-2" rotate="4deg" delay={0.7}>
        <div className="w-56 bg-card border border-border rounded-xl p-4 shadow-lg shadow-black/5 dark:shadow-black/30">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Quadratic Formula</p>
          <p className="font-mono text-sm text-foreground leading-relaxed">
            x = (-b ± √(b²-4ac)) / 2a
          </p>
          <div className="flex gap-1 mt-3">
            <span className="text-[9px] bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-md font-medium">Algebra</span>
            <span className="text-[9px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-medium">Class 9</span>
          </div>
        </div>
      </StickyNote>

      {/* Bottom-left: Calculator mockup */}
      <StickyNote className="bottom-[12%] -left-6" rotate="5deg" delay={0.9}>
        <div className="w-44 bg-card border border-border rounded-2xl p-3 shadow-lg shadow-black/5 dark:shadow-black/30">
          <div className="bg-muted rounded-lg px-3 py-2 mb-2 text-right">
            <p className="text-[10px] text-muted-foreground">sin(π/4)</p>
            <p className="font-mono text-lg font-bold text-foreground">0.7071</p>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {["sin", "cos", "tan", "π", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−"].map((key) => (
              <div key={key} className="bg-muted hover:bg-accent text-center rounded-md py-1.5 text-[10px] font-medium text-foreground">
                {key}
              </div>
            ))}
          </div>
        </div>
      </StickyNote>

      {/* Bottom-right: Graph paper snippet */}
      <StickyNote className="bottom-[8%] -right-4" rotate="-4deg" delay={1.1}>
        <div className="w-52 bg-card border border-border rounded-xl p-4 shadow-lg shadow-black/5 dark:shadow-black/30">
          <p className="text-[10px] font-semibold text-foreground mb-2">Pythagorean Theorem</p>
          {/* Mini triangle drawing */}
          <div className="relative w-full h-20 mb-2">
            <svg viewBox="0 0 100 80" className="w-full h-full text-primary">
              <line x1="10" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="70" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="10" x2="90" y2="70" stroke="currentColor" strokeWidth="2" strokeDasharray="4,2" />
              <text x="45" y="85" fontSize="8" fill="currentColor" className="font-mono">a</text>
              <text x="0" y="45" fontSize="8" fill="currentColor" className="font-mono">b</text>
              <text x="52" y="35" fontSize="8" fill="currentColor" className="font-mono">c</text>
              <rect x="10" y="60" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <p className="font-mono text-sm text-center text-foreground">a² + b² = c²</p>
        </div>
      </StickyNote>

      {/* Mid-right: Small notebook snippet */}
      <StickyNote className="top-[45%] -right-8" rotate="2deg" delay={0.6}>
        <div className="w-40 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-3 shadow-lg shadow-black/5 dark:shadow-black/20">
          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">Today&apos;s Problem</p>
          <p className="font-mono text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            If n! = 720,
            <br />find n = ?
          </p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-500 mt-1.5 italic">Hint: Try small values</p>
        </div>
      </StickyNote>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-[0.25em] uppercase text-muted-foreground">
            Adamjee Cantonment Public School
          </p>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          Club of
          <br />
          Mathematics
        </motion.h1>

        <motion.div
          className="mt-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
        >
          <div className="h-px w-12 bg-primary/50" />
          <p className="text-xl md:text-2xl font-light italic tracking-wide text-foreground/70">
            &ldquo;Think Logical&rdquo;
          </p>
          <div className="h-px w-12 bg-primary/50" />
        </motion.div>

        <motion.div
          className="mt-10 flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease }}
        >
          <Link
            href="/auth?tab=register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-3 text-base font-medium transition-colors"
          >
            Join Now
          </Link>
          <Link
            href="/events"
            className="rounded-xl px-8 py-3 text-base font-medium border border-border bg-secondary text-foreground hover:bg-accent transition-all"
          >
            Explore Events
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1, ease }}
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground/50 animate-bounce" />
      </motion.div>
    </section>
  );
}
