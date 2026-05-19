import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, hover = true, glow = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
                    hover &&
                        "hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300",
                    glow &&
                        "shadow-[0_0_30px_-5px_rgba(220,38,38,0.15)]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
