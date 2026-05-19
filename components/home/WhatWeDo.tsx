"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { FormulaCard, StickyNote } from "@/components/ui/peeking-card";
import { Calculator, Trophy, Lightbulb, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const objectives = [
  {
    icon: Calculator,
    title: "Problem Solving",
    description:
      "Tackle challenging puzzles and real-world problems that sharpen your critical thinking.",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-200",
    darkAccent: "from-red-500/20 to-orange-500/20",
    iconBg: "bg-red-500/15 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
    hoverBorder: "hover:border-amber-300 dark:hover:border-red-500/30",
    emoji: "🧩",
  },
  {
    icon: Trophy,
    title: "Olympiad Prep",
    description:
      "Train for national and international math competitions with expert guidance.",
    lightBg: "bg-sky-50",
    lightBorder: "border-sky-200",
    darkAccent: "from-amber-500/20 to-yellow-500/20",
    iconBg: "bg-amber-500/15 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-sky-300 dark:hover:border-amber-500/30",
    emoji: "🏆",
  },
  {
    icon: Lightbulb,
    title: "Creative Thinking",
    description:
      "Discover how mathematical creativity leads to elegant solutions and new ideas.",
    lightBg: "bg-emerald-50",
    lightBorder: "border-emerald-200",
    darkAccent: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500/30",
    emoji: "💡",
  },
  {
    icon: HeartHandshake,
    title: "Love for Math",
    description:
      "Join a community that celebrates mathematics and makes learning genuinely fun.",
    lightBg: "bg-violet-50",
    lightBorder: "border-violet-200",
    darkAccent: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/15 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-500/30",
    emoji: "❤️",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhatWeDo() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <StickyNote
        text="Find all primes p such that p² + 2 is also prime"
        subtext="— Olympiad warmup"
        className="top-8 -right-4"
        rotate="-5deg"
        delay={0.3}
        color="pink"
      />
      <FormulaCard
        title="Binomial Theorem"
        formula="(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏbᵏ"
        tags={[
          { label: "Combinatorics", color: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" },
        ]}
        className="bottom-12 -left-6"
        rotate="4deg"
        delay={0.5}
      />
      <div className="max-w-7xl mx-auto relative">
        <SectionHeader
          title="What We Do"
          subtitle="Four pillars that drive everything at ACPSCM"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {objectives.map((obj, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease }}
            >
              <div
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1
                  ${obj.lightBg} ${obj.lightBorder} ${obj.hoverBorder}
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:backdrop-blur-xl dark:hover:bg-white/[0.06]`}
              >
                <div className={`h-1 w-full bg-gradient-to-r ${obj.darkAccent} hidden dark:block`} />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${obj.iconBg} flex items-center justify-center`}>
                      <obj.icon className={`w-6 h-6 ${obj.iconColor}`} />
                    </div>
                    <span className="text-2xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                      {obj.emoji}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {obj.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {obj.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
