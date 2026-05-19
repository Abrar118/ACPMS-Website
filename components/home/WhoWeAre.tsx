"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Heart,
  Users,
  Expand,
  Zap,
  Wind,
  Bot,
  ZoomIn,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    icon: Heart,
    title: "Community Passion",
    description:
      "Join a vibrant community of students who share a deep passion for the beauty and challenge of mathematics.",
    className: "lg:col-span-2",
  },
  {
    icon: BrainCircuit,
    title: "Problem Solving Workshops",
    description:
      "Engage in stimulating workshops that sharpen your analytical skills and collaborative problem-solving abilities.",
    className: "",
  },
  {
    icon: Expand,
    title: "Skill Expansion",
    description:
      "Broaden your mathematical horizons by exploring advanced topics and concepts beyond the standard curriculum.",
    className: "",
  },
  {
    icon: Zap,
    title: "Competition Training",
    description:
      "Prepare for local and national math competitions with dedicated training sessions and experienced mentors.",
    className: "",
  },
  {
    icon: Wind,
    title: "Flexible Learning",
    description:
      "Adapt your learning path by exploring diverse mathematical fields, from pure theory to applied sciences.",
    className: "",
  },
  {
    icon: Users,
    title: "Peer Support",
    description:
      "Benefit from a strong peer support network, offering help with challenging coursework and collaborative study.",
    className: "lg:col-span-2",
  },
  {
    icon: Bot,
    title: "Practical Applications",
    description:
      "Discover the real-world applications of mathematical concepts through projects and interdisciplinary collaborations.",
    className: "lg:col-span-2",
  },
  {
    icon: ZoomIn,
    title: "Attention to Detail",
    description:
      "Cultivate precision and logical rigor by focusing on the intricate details of mathematical proofs and arguments.",
    className: "lg:col-span-2",
  },
];

export default function WhoWeAre() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Where Others Stop, We Keep Going" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {features.map((feature, index) => (
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
              className={cn(feature.className)}
            >
              <GlassCard className="p-6 h-full">
                <feature.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
