import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Business name must be at least 2 characters"),
    email: z.string("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;