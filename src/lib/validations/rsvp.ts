import { z } from "zod";

export const functionRsvpSchema = z.object({
  status: z.enum(["attending", "not_attending", "maybe"]),
  attendeeCount: z.number().int().min(1).max(20),
});

export const rsvpSubmissionSchema = z.object({
  functionResponses: z.record(z.string(), functionRsvpSchema),
  dietaryPreference: z.enum(["veg", "non_veg", "jain", "other"]),
  dietaryNotes: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
});

export type RsvpSubmissionInput = z.infer<typeof rsvpSubmissionSchema>;
