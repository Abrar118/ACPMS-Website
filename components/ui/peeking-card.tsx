"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function PeekingCard({ children, className, rotate = "-3deg", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease }}
      className={`absolute hidden lg:block pointer-events-none select-none z-0 ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      {children}
    </motion.div>
  );
}

export function FormulaCard({ title, formula, tags, className, rotate, delay }: {
  title: string;
  formula: string;
  tags?: { label: string; color: string }[];
  className?: string;
  rotate?: string;
  delay?: number;
}) {
  return (
    <PeekingCard className={className} rotate={rotate} delay={delay}>
      <div className="w-48 bg-card border border-border rounded-xl p-3.5 shadow-lg shadow-black/5 dark:shadow-black/30">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5">{title}</p>
        <p className="font-mono text-sm text-foreground leading-relaxed">{formula}</p>
        {tags && (
          <div className="flex gap-1 mt-2.5">
            {tags.map((tag) => (
              <span key={tag.label} className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${tag.color}`}>
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </PeekingCard>
  );
}

export function StickyNote({ text, subtext, className, rotate, delay, color = "amber" }: {
  text: string;
  subtext?: string;
  className?: string;
  rotate?: string;
  delay?: number;
  color?: "amber" | "pink" | "blue" | "green";
}) {
  const colors = {
    amber: "bg-amber-200 dark:bg-amber-300/90 text-amber-900",
    pink: "bg-pink-200 dark:bg-pink-300/90 text-pink-900",
    blue: "bg-sky-200 dark:bg-sky-300/90 text-sky-900",
    green: "bg-emerald-200 dark:bg-emerald-300/90 text-emerald-900",
  };
  const pinColors = {
    amber: "bg-red-400",
    pink: "bg-violet-400",
    blue: "bg-blue-400",
    green: "bg-emerald-500",
  };

  return (
    <PeekingCard className={className} rotate={rotate} delay={delay}>
      <div className={`w-44 ${colors[color]} rounded-lg p-3.5 shadow-lg shadow-black/10 dark:shadow-black/30`}>
        <div className={`w-4 h-4 ${pinColors[color]} rounded-full mx-auto -mt-5 mb-1.5 shadow-sm`} />
        <p className="font-mono text-xs leading-relaxed">{text}</p>
        {subtext && <p className="text-[10px] italic mt-1 opacity-70">{subtext}</p>}
      </div>
    </PeekingCard>
  );
}

export function MiniNotebook({ title, lines, className, rotate, delay }: {
  title: string;
  lines: string[];
  className?: string;
  rotate?: string;
  delay?: number;
}) {
  return (
    <PeekingCard className={className} rotate={rotate} delay={delay}>
      <div className="w-44 bg-card border border-border rounded-lg overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/30">
        <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5">
          <p className="text-[10px] font-bold text-primary">{title}</p>
        </div>
        <div className="px-3 py-2 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="font-mono text-[11px] text-foreground/80 border-b border-dashed border-border/50 pb-1">{line}</p>
          ))}
        </div>
      </div>
    </PeekingCard>
  );
}
