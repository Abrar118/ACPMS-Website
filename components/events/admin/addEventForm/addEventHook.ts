import { useForm, type UseFormReturn } from "react-hook-form";
import {
  addEventInitialValues,
  addEventResolver,
  addEventSchema,
  transformFormDataToEventData,
} from "./addEventHelper";
import { z } from "zod";
import { Dispatch, SetStateAction, useTransition } from "react";
import { createEventAction } from "@/actions/events";
import { toast } from "sonner";

export type TAddEventFormValues = z.infer<typeof addEventSchema>;

export const useAddEventForm = (
  setIsOpen: Dispatch<SetStateAction<boolean>>
) => {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<TAddEventFormValues>({
    defaultValues: addEventInitialValues,
    resolver: addEventResolver,
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const eventData = transformFormDataToEventData(data);
        const result = await createEventAction(eventData);
        
        if (result.success) {
          toast.success(result.message || "Event created successfully");
          form.reset();
          setIsOpen(false);
        } else {
          toast.error(result.error || "Failed to create event");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred");
      }
    });
  });

  return {
    form,
    onSubmit,
    isPending,
  };
};
