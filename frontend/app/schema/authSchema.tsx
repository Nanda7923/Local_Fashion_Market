import {z} from "zod";

export const LoginSchema = z.object({

    email: z.string().email("Invalid email address"),

    password: z.string()
                .min(8, "Password must be at least 8 characters")
                .max(16, "Password can not be longer than 16 characters")
});

export const RegisterSchema = z.object({
    name : z.string()
            .trim()
            .min(1, "Name is required")
            .max(18, "Name can not be longer than 18 characters"),

    email: z.string().email("Invalid email address"),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password can not be longer than 16 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    profilePic: z.string().url("Invalid profile picture URL").optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type RegisterData = Omit<RegisterFormData, "confirmPassword">;
