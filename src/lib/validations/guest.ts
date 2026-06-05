import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[+\d\s\-()]{7,20}$/.test(v),
      "Enter a valid phone number"
    ),
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  side: z.enum(["bride", "groom", "mutual"]),
  invitedFunctions: z.array(z.string()),
  seatCount: z.number().int().min(1, "At least 1 seat").max(20, "Max 20 seats"),
  notes: z.string().max(300).optional().or(z.literal("")),
});

export type GuestInput = z.infer<typeof guestSchema>;
