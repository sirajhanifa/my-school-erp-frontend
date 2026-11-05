import { z } from "zod";
import { getTodayDateString } from "../utils/date";

// The gender options shown in the form (the backend accepts the same values)
export const GENDERS = ["Male", "Female", "Other"];

export const studentSchema = z.object({
  admissionNo: z.string().trim().min(1, "Admission number is required").max(20, "Admission number can be at most 20 characters"),
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name can be at most 50 characters"),
  lastName: z.string().trim().max(50, "Last name can be at most 50 characters"),
  gender: z.string().min(1, "Please select a gender"),
  // "YYYY-MM-DD" from the date input; comparing the strings works because of that format
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => value <= getTodayDateString(), "Date of birth cannot be in the future"),
  classId: z.string().min(1, "Please select a class"),
  sectionId: z.string().min(1, "Please select a section"),
  guardianName: z.string().trim().max(100, "Guardian name can be at most 100 characters"),
  phone: z
    .string()
    .trim()
    .max(15, "Phone number can be at most 15 characters")
    .regex(/^[0-9+\-\s]*$/, "Phone number can only contain digits, spaces, + and -"),
  address: z.string().trim().max(250, "Address can be at most 250 characters"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
