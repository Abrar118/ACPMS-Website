import React from "react";
import { TabsContent } from "../ui/tabs";
import { ArrowRight, Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { motion } from "framer-motion";
import createClient from "@/utils/supabase/supabase-browser";
import { toast } from "sonner";

// Animation variants
const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

// Define the form schema with Zod
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
});

// Define the form type from the schema
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = ({
    setActiveTab,
}: {
    setActiveTab: (tab: string) => void;
}) => {
    const supabase = createClient();
    const [loading, setLoading] = React.useState(false);

    // Initialize the form with default values and the zod resolver
    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    // Handle form submission
    async function onSubmit(data: ForgotPasswordFormValues) {
        setLoading(true);
        const { email } = data;

        try {
            // Call the Supabase function to send the reset email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                throw error;
            }

            toast.success("Reset link sent successfully!", {
                description:
                    "A reset link has been sent to your email address. Please check your inbox.",
            });

            form.reset();
            setActiveTab("login");
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            toast.error(error?.message || "Failed to send reset link", {
                description:
                    "Please try again or contact support if the problem persists.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <TabsContent value="forgot-password" className="mt-0 outline-none">
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
                key="forgot-password-form"
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground mb-4">
                                Enter your email address and we'll send you a
                                link to reset your password.
                            </p>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                "Sending..."
                            ) : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("login")}
                                className="text-sm text-primary hover:underline"
                            >
                                Back to login
                            </button>
                        </div>
                    </form>
                </Form>
            </motion.div>
        </TabsContent>
    );
};

export default ForgotPassword;
