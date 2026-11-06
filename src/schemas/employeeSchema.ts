import { z } from "zod";

// No password field: new employees get the school's default password from the backend
export const employeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  roleId: z.string().min(1, "Please select a role"),
  isActive: z.boolean(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
