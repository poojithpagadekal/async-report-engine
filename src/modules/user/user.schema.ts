import { z } from "zod";

export const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(3, "Name must be atleast 3 charecters").optional(),
  }),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>["body"];
