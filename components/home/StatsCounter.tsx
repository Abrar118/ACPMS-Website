"use client";

import { useEffect, useRef } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useTransform,
    animate,
} from "framer-motion";

interface Stat {
    label: string;
    value: number;
    suffix?: string;
}

interface StatsCounterProps {
    stats: Stat[];
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, (latest) => Math.round(latest));
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            const controls = animate(motionValue, value, {
                duration: 2,
                ease: "easeOut",
            });
            return controls.stop;
        }
    }, [isInView, motionValue, value]);

    useEffect(() => {
        const unsubscribe = rounded.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = String(latest);
            }
        });
        return unsubscribe;
    }, [rounded]);

    return (
        <span className="text-4xl md:text-5xl font-bold text-foreground">
            <span ref={ref}>0</span>
            {suffix && <span className="text-primary">{suffix}</span>}
        </span>
    );
}

export default function StatsCounter({ stats }: StatsCounterProps) {
    return (
        <section className="py-16 px-4 border-y border-white/[0.06]">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <AnimatedNumber
                                value={stat.value}
                                suffix={stat.suffix}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
