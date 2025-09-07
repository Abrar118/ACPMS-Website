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
import type { Event } from "@/queries/events";
import type { CompetitionRow } from "@/queries/competitions";
import { Loader2, DollarSign } from "lucide-react";

interface EventRegistrationDialogProps {
  event: Event;
  competitions: CompetitionRow[];
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Fill out the form below to register for this event and select the competitions you want to participate in.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
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
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your institution name" {...field} />
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
                      <FormLabel>Education Level</FormLabel>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                        <FormLabel>Class/Year</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class/year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    <FormLabel>Student ID at Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your student ID" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
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
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information that you might want to share"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Competition Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Competition Selection</h3>
              
              <FormField
                control={form.control}
                name="competitions"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Competitions</FormLabel>
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
                                className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg"
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
                                  />
                                </FormControl>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">
                                      {competition.title}
                                    </FormLabel>
                                    {competition.fee > 0 && (
                                      <Badge variant="outline" className="ml-2">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        ${competition.fee}
                                      </Badge>
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
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Total Registration Fee: <span className="text-primary">${totalFee}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            {isPaymentRequired && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="payment_provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
