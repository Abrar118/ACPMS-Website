"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mathSymbols = [
  { symbol: "∑", top: "8%", left: "12%" },
  { symbol: "π", top: "15%", left: "78%" },
  { symbol: "∞", top: "72%", left: "8%" },
  { symbol: "Δ", top: "85%", left: "85%" },
  { symbol: "√", top: "35%", left: "92%" },
  { symbol: "∂", top: "55%", left: "5%" },
  { symbol: "λ", top: "22%", left: "45%" },
  { symbol: "θ", top: "68%", left: "72%" },
  { symbol: "∇", top: "42%", left: "18%" },
  { symbol: "φ", top: "90%", left: "42%" },
  { symbol: "ε", top: "5%", left: "60%" },
  { symbol: "Ω", top: "78%", left: "35%" },
];

const equationSteps = [
  { text: "∫ Knowledge · dx", delay: 0 },
  { text: "= Passion + Practice", delay: 0.6 },
  { text: "= ACPSCM ∎", delay: 1.2 },
];

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem("acpscm-loading-shown");
    if (alreadyShown) {
      setIsVisible(false);
      return;
    }

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mediaQuery.matches;
    setPrefersReducedMotion(reducedMotion);

    // Mark as shown
    sessionStorage.setItem("acpscm-loading-shown", "1");

    if (reducedMotion) {
      // Show briefly then hide for reduced motion users
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 100);
      return () => clearTimeout(timer);
    }

    setIsVisible(true);

    // Dismiss after ~2.5s
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until we've checked sessionStorage (avoids flash)
  if (isVisible === null || isVisible === false) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#0a0a0b" }}
        >
          {/* Background math symbols */}
          {mathSymbols.map((item, i) => (
            <span
              key={i}
              className="absolute text-white/[0.04] text-2xl md:text-4xl font-serif select-none pointer-events-none"
              style={{ top: item.top, left: item.left }}
            >
              {item.symbol}
            </span>
          ))}

          {/* Equation solver */}
          <div className="flex flex-col items-center gap-3">
            {equationSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : step.delay,
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: "easeOut",
                }}
                className={`font-mono text-lg md:text-2xl tracking-wide ${
                  index === equationSteps.length - 1
                    ? "text-primary font-semibold"
                    : "text-white/80"
                }`}
              >
                {step.text}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-48 h-0.5 bg-white/[0.08] rounded-full overflow-hidden mx-auto mt-8">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--primary, #dc2626)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 2.2,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.3,
              duration: prefersReducedMotion ? 0 : 0.4,
            }}
            className="text-muted-foreground text-xs mt-6 tracking-widest uppercase"
          >
            Loading mathematical universe...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
