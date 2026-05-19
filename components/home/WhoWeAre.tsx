"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { MiniNotebook, FormulaCard } from "@/components/ui/peeking-card";
import {
  Heart,
  Users,
  Expand,
  Zap,
  GraduationCap,
  Target,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Heart,
    title: "A Community That Cares",
    description:
      "Join 50+ students from class 6-10 who share your passion. Study together, compete together, grow together.",
    span: "md:col-span-2",
    lightBg: "bg-amber-100/70",
    lightBorder: "border-amber-200",
    borderAccent: "border-l-4 border-l-red-400 dark:border-l-red-500/50",
    iconColor: "text-red-600 dark:text-red-400",
    stat: "50+",
    statLabel: "Active Members",
  },
  {
    icon: BrainCircuit,
    title: "Weekly Workshops",
    description:
      "Hands-on problem solving sessions every week. No boring lectures — just puzzles, teamwork, and breakthroughs.",
    span: "",
    lightBg: "bg-sky-100/70",
    lightBorder: "border-sky-200",
    borderAccent: "border-l-4 border-l-blue-400 dark:border-l-blue-500/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Expand,
    title: "Beyond the Textbook",
    description:
      "Number theory, combinatorics, geometry proofs — explore topics your school syllabus doesn't cover.",
    span: "",
    lightBg: "bg-emerald-100/70",
    lightBorder: "border-emerald-200",
    borderAccent: "border-l-4 border-l-emerald-400 dark:border-l-emerald-500/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    title: "Competition Ready",
    description:
      "From BDMO to APMO — structured training to help you qualify and medal at every level.",
    span: "",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-200",
    borderAccent: "border-l-4 border-l-amber-400 dark:border-l-amber-500/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    stat: "3",
    statLabel: "Olympiad Levels",
  },
  {
    icon: GraduationCap,
    title: "Learn at Your Pace",
    description:
      "Beginner, intermediate, or advanced — find your level and progress at a speed that suits you.",
    span: "",
    lightBg: "bg-violet-50",
    lightBorder: "border-violet-200",
    borderAccent: "border-l-4 border-l-violet-400 dark:border-l-violet-500/50",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Users,
    title: "Mentored by Seniors",
    description:
      "Our mentors are students who've been in your shoes. They know what works, and they'll help you get there.",
    span: "md:col-span-2",
    lightBg: "bg-sky-50",
    lightBorder: "border-sky-200",
    borderAccent: "border-l-4 border-l-cyan-400 dark:border-l-cyan-500/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    stat: "10+",
    statLabel: "Mentors",
  },
  {
    icon: Target,
    title: "Real Results",
    description:
      "Our members consistently rank at national competitions. Your hard work here pays off on the big stage.",
    span: "",
    lightBg: "bg-rose-50",
    lightBorder: "border-rose-200",
    borderAccent: "border-l-4 border-l-pink-400 dark:border-l-pink-500/50",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Sparkles,
    title: "It's Actually Fun",
    description:
      "Math fests, puzzle hunts, team challenges, and more. Because the best learning happens when you're having fun.",
    span: "",
    lightBg: "bg-orange-50",
    lightBorder: "border-orange-200",
    borderAccent: "border-l-4 border-l-orange-400 dark:border-l-orange-500/50",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhoWeAre() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <AmbientGlow
        size="lg"
        position="bottom-left"
        color="rgba(220, 38, 38, 0.06)"
        className="hidden dark:block"
      />
      <MiniNotebook
        title="BDMO Prep List"
        lines={["1. Number Theory", "2. Combinatorics", "3. Geometry", "4. Algebra"]}
        className="top-16 -right-6"
        rotate="3deg"
        delay={0.4}
      />
      <FormulaCard
        title="Area of a Circle"
        formula="A = πr²"
        tags={[
          { label: "Geometry", color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
          { label: "Class 7", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
        ]}
        className="bottom-20 -left-4"
        rotate="-3deg"
        delay={0.6}
      />

      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          title="Why Join ACPSCM?"
          subtitle="Here's what makes our math club different from the rest"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease }}
              className={feature.span}
            >
              <div
                className={`group h-full rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md
                  ${feature.lightBg} ${feature.lightBorder} ${feature.borderAccent}
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:backdrop-blur-xl dark:hover:bg-white/[0.06] dark:hover:border-white/[0.15] dark:hover:shadow-none`}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <feature.icon className={`w-7 h-7 ${feature.iconColor} shrink-0`} />
                    {feature.stat && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground leading-none">
                          {feature.stat}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {feature.statLabel}
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
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
