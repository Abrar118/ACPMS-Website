"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactSubmissionSchema } from "@/lib/validations";
import { submitContactFormAction } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type FormData = z.infer<typeof contactSubmissionSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormData) {
    const result = await submitContactFormAction(data);

    if (result.success) {
      setIsSubmitted(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
    } else {
      toast.error(result.error || "Failed to send message");
    }
  }

  const inputClass =
    "bg-white/[0.04] border-white/[0.08] rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50";

  if (isSubmitted) {
    return (
      <GlassCard className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Message Sent!
          </h3>
          <p className="text-muted-foreground mb-6">
            We&apos;ll get back to you as soon as possible.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (!cooldown) {
                setIsSubmitted(false);
                form.reset();
              }
            }}
            disabled={cooldown}
            className="bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] rounded-xl"
          >
            {cooldown ? "Please wait..." : "Send Another Message"}
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-foreground">Subject</FormLabel>
                <FormControl>
                  <Input placeholder="What's this about?" className={inputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-foreground">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 w-full md:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </GlassCard>
  );
}
