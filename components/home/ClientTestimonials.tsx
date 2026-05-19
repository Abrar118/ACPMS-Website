"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ClientTestimonials() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
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
