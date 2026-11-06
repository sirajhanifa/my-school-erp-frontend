import { z } from "zod";

export const academicYearSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Academic year name is required")
    .max(50, "Academic year name can be at most 50 characters"),
  description: z.string().trim().max(250, "Description can be at most 250 characters"),
  // Status: true = Inactive, false = Active
  deleted: z.boolean(),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
