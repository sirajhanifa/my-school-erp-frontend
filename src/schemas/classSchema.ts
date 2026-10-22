import { z } from "zod";

export const classSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").max(50, "Class name can be at most 50 characters"),
  description: z.string().trim().max(250, "Description can be at most 250 characters"),
});

export type ClassFormValues = z.infer<typeof classSchema>;
