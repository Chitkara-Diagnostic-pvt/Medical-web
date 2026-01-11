import {z} from "zod";

export const LoginSchema = z.object({
    email: z.string().email("PLease enter a valid email address"),
    password: z.string().min(1, "Password is Required"),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>;