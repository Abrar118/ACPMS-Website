"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    align?: "left" | "center";
}

export function SectionHeader({
    title,
    subtitle,
    className,
    align = "center",
}: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                align === "center" && "text-center",
                align === "left" && "text-left",
                className
            )}
        >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {title}
            </h2>
            {subtitle && (
                <p
                    className={cn(
                        "mt-3 text-muted-foreground text-lg max-w-2xl",
                        align === "center" && "mx-auto"
                    )}
                >
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
}
