"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { eventRegistrationSchema } from "@/lib/validations";
import { registerForEventAction } from "@/actions/registration";
import type { Event } from "@/lib/db/events";
import type { Competition } from "@/lib/db/competitions";
import { Loader2, DollarSign } from "lucide-react";

interface EventRegistrationDialogProps {
  event: Event;
  competitions: Competition[];
  children: React.ReactNode;
}

type FormData = z.infer<typeof eventRegistrationSchema>;

// Helper function to get class options based on level
const getClassOptions = (level: string) => {
  switch (level) {
    case "School":
      return Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `Class ${i + 1}`,
      }));
    case "College":
      return [
        { value: 11, label: "1st Year" },
        { value: 12, label: "2nd Year" },
      ];
    case "University":
      return [
        { value: 21, label: "1st Year" },
        { value: 22, label: "2nd Year" },
        { value: 23, label: "3rd Year" },
        { value: 24, label: "4th Year" },
      ];
    default:
      return [];
  }
};

export default function EventRegistrationDialog({
  event,
  competitions,
  children,
}: EventRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      name: "",
      institution: "",
      level: undefined,
      class: 1,
      id_at_institution: "",
      email: "",
      phone: "",
      note: "",
      competitions: [],
      transaction_id: "",
      payment_provider: undefined,
    },
  });

  const selectedLevel = form.watch("level");
  const selectedCompetitions = form.watch("competitions");

  // Calculate total fee for selected competitions
  const totalFee = selectedCompetitions.reduce((total, competitionId) => {
    const competition = competitions.find(c => c.id === competitionId);
    return total + (competition?.fee || 0);
  }, 0);

  // Check if payment information is required
  const isPaymentRequired = totalFee > 0;

  const onSubmit = async (data: FormData) => {
    try {
      // Validate payment information if required
      if (isPaymentRequired && (!data.transaction_id || !data.payment_provider)) {
        toast.error("Payment information is required for paid competitions");
        return;
      }

      setIsSubmitting(true);

      const result = await registerForEventAction(event.id, {
        ...data,
        note: data.note || "",
      });

      if (result.success) {
        toast.success(result.message || "Registration successful!");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Glass input classes
  const glassInputClass = "bg-white/[0.04] border-white/[0.08] rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f10] border border-white/[0.08] rounded-2xl [&_[data-slot=dialog-overlay]]:bg-black/60 [&_[data-slot=dialog-overlay]]:backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Register for {event.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill out the form below to register for this event and select the competitions you want to participate in.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-foreground">Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your institution name" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-foreground">Education Level</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset class when level changes
                          const options = getClassOptions(value);
                          if (options.length > 0) {
                            form.setValue("class", options[0].value);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={glassInputClass}>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#141415] border-white/[0.08]">
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="University">University</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedLevel && (
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-foreground">Class/Year</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className={glassInputClass}>
                              <SelectValue placeholder="Select class/year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#141415] border-white/[0.08]">
                            {getClassOptions(selectedLevel).map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="id_at_institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-foreground">Student ID at Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your student ID" className={glassInputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" className={glassInputClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-foreground">Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information that you might want to share"
                        className={`resize-none ${glassInputClass}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-white/[0.08]" />

            {/* Competition Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Competition Selection</h3>

              <FormField
                control={form.control}
                name="competitions"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm text-foreground">Select Competitions</FormLabel>
                    <div className="space-y-3">
                      {competitions.map((competition) => (
                        <FormField
                          key={competition.id}
                          control={form.control}
                          name="competitions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={competition.id}
                                className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(competition.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, competition.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== competition.id)
                                          );
                                    }}
                                    className="border-white/[0.2] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </FormControl>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                      {competition.title}
                                    </FormLabel>
                                    {competition.fee > 0 && (
                                      <span className="inline-flex items-center bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                                        <DollarSign className="h-3 w-3 mr-0.5" />
                                        ${competition.fee}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {totalFee > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <p className="text-sm font-medium text-foreground">
                    Total Registration Fee: <span className="text-primary">${totalFee}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            {isPaymentRequired && (
              <>
                <Separator className="bg-white/[0.08]" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="payment_provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-foreground">Payment Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={glassInputClass}>
                                <SelectValue placeholder="Select payment provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#141415] border-white/[0.08]">
                              <SelectItem value="BKash">BKash</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transaction_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-foreground">Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID" className={glassInputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
