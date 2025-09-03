import {
  EResourceCategory,
  EResourceLevel,
  EResourceStatus,
  EResourceType,
} from "@/components/shared/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const addResourceInitialValues = {
  title: "",
  description: "",
  category: EResourceCategory["Reference Material"],
  resourceType: EResourceType.Link,
  resourceUrl: "",
  isFeatured: false,
  status: EResourceStatus.Pending,
  levels: [] as Array<{ label: string; value: EResourceLevel }>,
  author: "",
  tags: [] as Array<{ label: string; value: string }>,
};

export const addResourceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z.nativeEnum(EResourceCategory),
  resourceType: z.nativeEnum(EResourceType),
  resourceUrl: z.string().min(1, "Resource URL is required").url("Please enter a valid URL"),
  isFeatured: z.boolean(),
  status: z.nativeEnum(EResourceStatus),
  levels: z.array(
    z.object({
      label: z.string(),
      value: z.nativeEnum(EResourceLevel),
    })
  ).min(1, "At least one level must be selected"),
  author: z.string().min(2, "Author must be at least 2 characters").max(100, "Author must be less than 100 characters"),
  tags: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const addResourceResolver = zodResolver(addResourceSchema);
