import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required").max(50, "Section name can be at most 50 characters"),
  description: z.string().trim().max(250, "Description can be at most 250 characters"),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
