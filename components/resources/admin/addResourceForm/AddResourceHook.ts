import { useForm, type UseFormReturn } from "react-hook-form";
import {
  addResourceInitialValues,
  addResourceResolver,
  addResourceSchema,
} from "./AddResourceHelper";
import { z } from "zod";
import { Dispatch, SetStateAction, useTransition } from "react";
import { createResource } from "@/actions/resources";
import { toast } from "sonner";

export type TAddResourceFormValues = z.infer<typeof addResourceSchema>;

export const useAddResourceForm = (
  setIsOpen: Dispatch<SetStateAction<boolean>>
) => {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<TAddResourceFormValues>({
    defaultValues: addResourceInitialValues,
    resolver: addResourceResolver,
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const result = await createResource(data);
        
        if (result.success) {
          toast.success(result.message || "Resource created successfully");
          form.reset();
          setIsOpen(false);
        } else {
          toast.error(result.error || "Failed to create resource");
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
