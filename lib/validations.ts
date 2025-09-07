import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be less than 20 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            ),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const resetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

// Event registration validations
export const eventRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    institution: z.string().min(2, "Institution name must be at least 2 characters"),
    level: z.enum(["School", "College", "University"], {
        message: "Please select an education level",
    }),
    class: z.number().min(1).max(24, "Invalid class value"),
    id_at_institution: z.string().min(1, "Student ID is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^[+]?[\d\s-()]+$/, "Please enter a valid phone number"),
    note: z.string().optional(),
    competitions: z.array(z.string()).min(1, "Please select at least one competition"),
    transaction_id: z.string().optional(),
    payment_provider: z.enum(["BKash"]).optional(),
}).refine((data) => {
    // If any selected competitions have fees, payment info is required
    return true; // We'll validate this dynamically in the component
}, {
    message: "Payment information is required for paid competitions",
});
