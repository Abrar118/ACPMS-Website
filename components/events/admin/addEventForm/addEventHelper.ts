import { EEventMode, EEventType } from "@/components/shared/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const addEventInitialValues = {
  title: "",
  eventStartDateTime: new Date(),
  venue: "",
  eventEndDateTime: new Date(),
  eventMode: EEventMode.InPerson,
  eventType: EEventType.Other,
  registrationDeadline: new Date(),
  posterUrl: "",
  tags: [] as Array<{ label: string; value: string }>,
}

export const addEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
  eventStartDateTime: z.date({}),
  venue: z.string().max(200, "Location must be less than 200 characters"),
  eventEndDateTime: z.date({}),
  eventMode: z.nativeEnum(EEventMode),
  eventType: z.nativeEnum(EEventType),
  registrationDeadline: z.date({}),
  posterUrl: z.string().optional(),
  tags: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const addEventResolver = zodResolver(addEventSchema);

// Transform form data to CreateEventData format
export const transformFormDataToEventData = (formData: z.infer<typeof addEventSchema>) => {
  return {
    title: formData.title,
    event_date: formData.eventStartDateTime.toISOString(),
    end_date: formData.eventEndDateTime.toISOString(),
    venue: formData.venue || undefined,
    registration_deadline: formData.registrationDeadline.toISOString(),
    event_mode: formData.eventMode,
    event_type: formData.eventType,
    poster_url: formData.posterUrl || undefined,
    tags: formData.tags?.map(tag => tag.value) || undefined,
  };
};
