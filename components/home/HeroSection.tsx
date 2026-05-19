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

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0b]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none" />

      {/* Ambient glow */}
      <AmbientGlow
        size="lg"
        position="top-right"
        color="rgba(220, 38, 38, 0.1)"
      />
      <AmbientGlow
        size="md"
        position="bottom-left"
        color="rgba(220, 38, 38, 0.08)"
      />

      {/* Floating math symbols — very subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {floatingSymbols.map((symbol) => (
          <div
            key={symbol.char}
            className={`absolute font-bold ${symbol.className}`}
            style={{
              color: symbol.color,
              animation: `float 20s ease-in-out infinite`,
              animationDelay: symbol.delay,
            }}
          >
            {symbol.char}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Adamjee Cantonment Public School
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          Club of
          <br />
          Mathematics
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mt-6 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
        >
          Think Logical
        </motion.p>

        {/* CTA buttons */}
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
            className="rounded-xl px-8 py-3 text-base font-medium border border-white/[0.15] bg-white/[0.03] text-foreground hover:bg-white/[0.06] transition-all"
          >
            Explore Events
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
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
