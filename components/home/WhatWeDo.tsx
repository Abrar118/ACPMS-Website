"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Calculator, Trophy, Lightbulb, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const objectives = [
  {
    icon: Calculator,
    title: "Problem Solving",
    description:
      "Develop your math skills through challenging problems and real-world applications. Build critical thinking and problem-solving abilities.",
  },
  {
    icon: Trophy,
    title: "Olympiad Preparation",
    description:
      "Preparing for math Olympiads helps you think outside the box and tackle advanced problems with confidence.",
  },
  {
    icon: Lightbulb,
    title: "Creativity",
    description:
      "Learn how creativity fuels problem-solving. Apply mathematical thinking in innovative ways.",
  },
  {
    icon: HeartHandshake,
    title: "Love for Math",
    description:
      "Embrace your passion for mathematics and explore its beauty in a supportive environment.",
  },
];

export default function WhatWeDo() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Our Objectives"
          subtitle="Empowering students through mathematical excellence"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {objectives.map((objective, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <GlassCard className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <objective.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {objective.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {objective.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
