"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

interface EventCountdownProps {
    nextEvent: { title: string; event_date: string | Date } | null;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft | null {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return null;

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 min-w-[70px]">
            <div className="text-3xl font-bold font-mono text-foreground">
                {String(value).padStart(2, "0")}
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase">
                {label}
            </div>
        </div>
    );
}

export default function EventCountdown({ nextEvent }: EventCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isPast, setIsPast] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!nextEvent) return;

        const targetDate = new Date(nextEvent.event_date);

        const update = () => {
            const remaining = getTimeLeft(targetDate);
            if (remaining) {
                setTimeLeft(remaining);
                setIsPast(false);
            } else {
                setTimeLeft(null);
                setIsPast(true);
            }
        };

        update();
        setMounted(true);

        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [nextEvent]);

    if (!nextEvent) return null;

    const isUpcoming = !isPast && timeLeft !== null;

    return (
        <section className="py-16 px-4">
            <GlassCard
                glow
                hover={false}
                className="max-w-2xl mx-auto p-8 text-center"
            >
                <p className="text-sm text-primary font-medium uppercase tracking-wider">
                    {isUpcoming ? "Next Event" : "Latest Event"}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                    {nextEvent.title}
                </h3>

                {mounted && (
                    <>
                        {isPast ? (
                            <p className="text-lg text-muted-foreground mt-6">
                                Event has started!
                            </p>
                        ) : timeLeft ? (
                            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mt-6">
                                <CountdownBox
                                    value={timeLeft.days}
                                    label="Days"
                                />
                                <CountdownBox
                                    value={timeLeft.hours}
                                    label="Hours"
                                />
                                <CountdownBox
                                    value={timeLeft.minutes}
                                    label="Minutes"
                                />
                                <CountdownBox
                                    value={timeLeft.seconds}
                                    label="Seconds"
                                />
                            </div>
                        ) : null}
                    </>
                )}

                <Link
                    href="/events"
                    className="mt-6 text-primary text-sm font-medium hover:underline inline-block"
                >
                    View Event &rarr;
                </Link>
            </GlassCard>
        </section>
    );
}
