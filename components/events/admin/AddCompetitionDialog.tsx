'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { Content } from "@tiptap/react";
import { toast } from "sonner";
import { createCompetitionAction } from "@/actions/competitions";

const competitionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.any().optional(),
  fee: z.number().min(0, "Fee must be non-negative"),
  is_published: z.boolean(),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

interface AddCompetitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export default function AddCompetitionDialog({
  open,
  onOpenChange,
  eventId,
}: AddCompetitionDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [editorValue, setEditorValue] = useState<Content>("");
  const router = useRouter();

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      description: "",
      fee: 0,
      is_published: false,
    },
  });

  const onSubmit = (data: CompetitionFormValues) => {
    startTransition(async () => {
      try {
        const displayOrder = 999;

        const competitionData = {
          title: data.title,
          description: editorValue || null,
          fee: data.fee,
          is_published: data.is_published,
          event_id: eventId,
          display_order: displayOrder,
        };

        const result = await createCompetitionAction(competitionData);

        if (result.success) {
          toast.success(result.message || "Competition created successfully");
          form.reset();
          setEditorValue("");
          onOpenChange(false);
          
          // Force router refresh to refetch server data
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create competition");
        }
      } catch (error: any) {
        toast.error("An error occurred while creating the competition");
        console.error("Error creating competition:", error);
      }
    });
  };

  const handleCancel = () => {
    form.reset();
    setEditorValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Competition</DialogTitle>
          <DialogDescription>
            Create a new competition for this event. You can set the title, description, fee, and publication status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competition Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter competition title..." 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <div className="space-y-2">
              <FormLabel>Description</FormLabel>
              <MinimalTiptapEditor
                value={editorValue}
                onChange={setEditorValue}
                className="w-full"
                editorContentClassName="p-5"
                output="json"
                placeholder="Enter competition description..."
                autofocus={false}
                editable={!isPending}
                editorClassName="focus:outline-hidden"
              />
            </div>

            {/* Fee Field */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Fee</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Publish Switch */}
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Competition</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this competition visible to participants
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Competition"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
