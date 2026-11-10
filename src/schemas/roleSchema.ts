import { z } from "zod";
import { FULL_ACCESS_ROLE } from "../store/roleStore";

export const roleSchema = z
  .object({
    name: z.string().trim().min(1, "Role name is required").max(50, "Role name can be at most 50 characters"),
    description: z.string().trim().max(250, "Description can be at most 250 characters"),
    // Menu codes this role can open, e.g. ["dashboard", "students"]
    modules: z.array(z.string()),
  })
  // The superadmin role always has full access, so only other roles must pick modules
  .refine((values) => values.name.trim().toLowerCase() === FULL_ACCESS_ROLE || values.modules.length > 0, {
    message: "Select at least one module",
    path: ["modules"],
  });

export type RoleFormValues = z.infer<typeof roleSchema>;
