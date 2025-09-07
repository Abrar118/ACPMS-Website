import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { Content } from "@tiptap/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateEventAction } from "@/actions/events";
import { Json } from "@/queries/events";

interface UpdateEventDescriptionFormProps {
  state: boolean;
  setState: (state: boolean) => void;
  richText?: Json;
  eventId: string;
}

export function UpdateEventDescriptionForm({
  state,
  setState,
  richText,
  eventId,
}: UpdateEventDescriptionFormProps) {
  // Parse the richText if it's a string, otherwise use it directly
  const initialValue = (() => {
    if (!richText || richText === "null" || richText === "undefined") return "";
    try {
      return typeof richText === "string" ? JSON.parse(richText) : richText;
    } catch {
      return richText;
    }
  })();

  const [value, setValue] = useState<Content>(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting description:", value);

    startTransition(async () => {
      try {
        console.log("Parsed description to be sent:", value);

        const result = await updateEventAction(eventId, {
          description: value,
        });

        if (result.success) {
          toast.success(
            result.message || "Event description updated successfully"
          );
          setState(false);
        } else {
          toast.error(result.error || "Failed to update event description");
        }
      } catch (error: any) {
        toast.error("An error occurred while updating the description");
        console.error("Error updating description:", error);
      }
    });
  };

  return (
    <Dialog open={state} onOpenChange={setState}>
      <form>
        <DialogContent className="min-w-5xl max-h-[80dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Event Description</DialogTitle>
            <DialogDescription>
              Make changes to your event description here. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              className="w-full"
              editorContentClassName="p-5"
              output="json"
              placeholder="Enter your description..."
              autofocus={true}
              editable={true}
              editorClassName="focus:outline-hidden"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} onClick={handleSubmit}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
