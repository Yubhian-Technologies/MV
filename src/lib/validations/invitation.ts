import { z } from "zod";

export const invitationCustomizationSchema = z.object({
  customMessage: z.string().max(500, "Message must be under 500 characters"),
  customTagline: z.string().max(120, "Tagline must be under 120 characters"),
  language: z.enum(["en", "hi"]),
  showVenueMap: z.boolean(),
  showDressCode: z.boolean(),
  showRsvpButton: z.boolean(),
});

export type InvitationCustomizationInput = z.infer<typeof invitationCustomizationSchema>;
