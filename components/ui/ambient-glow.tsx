import { cn } from "@/lib/utils";

interface AmbientGlowProps {
    className?: string;
    color?: string;
    size?: "sm" | "md" | "lg";
    position?:
        | "top-left"
        | "top-right"
        | "center"
        | "bottom-left"
        | "bottom-right";
}

const sizeMap = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[32rem] h-[32rem]",
};

const positionMap = {
    "top-left": "-top-32 -left-32",
    "top-right": "-top-32 -right-32",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "-bottom-32 -left-32",
    "bottom-right": "-bottom-32 -right-32",
};

export function AmbientGlow({
    className,
    color = "rgba(220, 38, 38, 0.15)",
    size = "md",
    position = "top-right",
}: AmbientGlowProps) {
    return (
        <div
            className={cn(
                "absolute pointer-events-none blur-3xl animate-glow-pulse",
                sizeMap[size],
                positionMap[position],
                className
            )}
            style={{
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
        />
    );
}
