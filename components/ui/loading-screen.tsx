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
  { text: "∫ Knowledge · dx", delay: 0.2 },
  { text: "= Passion + Practice", delay: 0.8 },
  { text: "= ACPSCM ∎", delay: 1.4 },
];

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setSkip(true);
      setShow(false);
      setShouldRender(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show && shouldRender) {
      const cleanup = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(cleanup);
    }
  }, [show, shouldRender]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#0a0a0b" }}
        >
          {mathSymbols.map((item, i) => (
            <span
              key={i}
              className="absolute text-white/[0.04] text-2xl md:text-4xl font-serif select-none pointer-events-none"
              style={{ top: item.top, left: item.left }}
            >
              {item.symbol}
            </span>
          ))}

          <div className="flex flex-col items-center gap-3">
            {equationSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.delay, duration: 0.5, ease: "easeOut" }}
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

          <div className="w-48 h-0.5 bg-white/[0.08] rounded-full overflow-hidden mx-auto mt-8">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.3, ease: "easeInOut" }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-muted-foreground text-xs mt-6 tracking-widest uppercase"
          >
            Loading mathematical universe...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
