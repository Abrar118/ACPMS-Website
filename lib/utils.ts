import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const printIfDev = (message: string) => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        console.warn(message);
    }
};

// Utility function for server actions to handle errors
export function handleError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unexpected error occurred";
}
