'use client';

import { useState, useTransition, useEffect } from "react";
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
import { updateCompetitionAction } from "@/actions/competitions";
import { type CompetitionRow } from "@/queries/competitions";

const competitionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.any().optional(),
  fee: z.number().min(0, "Fee must be non-negative"),
  is_published: z.boolean(),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

interface EditCompetitionDialogProps {
  competition: CompetitionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedCompetition: CompetitionRow) => void;
}

export default function EditCompetitionDialog({
  competition,
  open,
  onOpenChange,
  onUpdate,
}: EditCompetitionDialogProps) {
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

  // Update form when competition changes
  useEffect(() => {
    if (competition) {
      form.reset({
        title: competition.title,
        fee: competition.fee,
        is_published: competition.is_published,
      });
      
      // Handle description safely
      let initialDescription: Content = "";
      try {
        if (competition.description) {
          if (typeof competition.description === 'string') {
            initialDescription = competition.description;
          } else if (typeof competition.description === 'object') {
            initialDescription = competition.description as Content;
          } else {
            initialDescription = "";
          }
        }
      } catch {
        initialDescription = "";
      }
      
      setEditorValue(initialDescription);
    }
  }, [competition, form]);

  const onSubmit = (data: CompetitionFormValues) => {
    if (!competition) return;

    startTransition(async () => {
      try {
        const competitionData = {
          title: data.title,
          description: editorValue || null,
          fee: data.fee,
          is_published: data.is_published,
        };

        const result = await updateCompetitionAction(competition.id, competitionData);

        if (result.success && result.data) {
          toast.success(result.message || "Competition updated successfully");
          onUpdate?.(result.data);
          onOpenChange(false);
          
          // Refresh router to refetch server data
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update competition");
        }
      } catch (error: any) {
        toast.error("An error occurred while updating the competition");
        console.error("Error updating competition:", error);
      }
    });
  };

  const handleCancel = () => {
    if (competition) {
      form.reset({
        title: competition.title,
        fee: competition.fee,
        is_published: competition.is_published,
      });
      
      // Handle description safely
      let initialDescription: Content = "";
      try {
        if (competition.description) {
          if (typeof competition.description === 'string') {
            initialDescription = competition.description;
          } else if (typeof competition.description === 'object') {
            initialDescription = competition.description as Content;
          } else {
            initialDescription = "";
          }
        }
      } catch {
        initialDescription = "";
      }
      
      setEditorValue(initialDescription);
    }
    onOpenChange(false);
  };

  if (!competition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Competition</DialogTitle>
          <DialogDescription>
            Make changes to the competition details. Click save when you're done.
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
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
