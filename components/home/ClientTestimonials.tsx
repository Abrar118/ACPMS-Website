"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { StickyNote, FormulaCard } from "@/components/ui/peeking-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ClientTestimonials() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <StickyNote
        text="e = lim(1 + 1/n)ⁿ as n→∞"
        subtext="— Napier's constant"
        className="top-12 -left-2"
        rotate="-4deg"
        delay={0.3}
        color="blue"
      />
      <FormulaCard
        title="Golden Ratio"
        formula="φ = (1 + √5) / 2 ≈ 1.618"
        tags={[
          { label: "Fun fact", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
        ]}
        className="bottom-16 -right-4"
        rotate="5deg"
        delay={0.5}
      />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <AmbientGlow
          position="center"
          size="md"
          color="rgba(220, 38, 38, 0.08)"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="p-10 relative z-10">
            <div className="text-6xl text-primary/20 font-serif leading-none">
              &ldquo;
            </div>
            <blockquote className="text-xl md:text-2xl text-foreground/90 italic leading-relaxed mt-4">
              ACPSCM has been an incredible experience. The community is
              supportive, and the resources are top-notch. I&apos;ve learned so
              much and made great friends along the way!
            </blockquote>

            <div className="flex items-center justify-center gap-3 mt-8">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src="/api/placeholder/80/80"
                  alt="Sarah Chen"
                />
                <AvatarFallback className="text-sm font-semibold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-foreground font-medium">Sarah Chen</p>
                <p className="text-muted-foreground text-sm">
                  Mathematics Student
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
