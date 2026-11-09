import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(50, "Role name can be at most 50 characters"),
  description: z.string().trim().max(250, "Description can be at most 250 characters"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
