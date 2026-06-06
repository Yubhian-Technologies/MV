import { z } from "zod";

export const createEventSchema = z.object({
  brideName: z
    .string()
    .min(2, "Bride's name must be at least 2 characters")
    .max(50, "Name is too long"),
  groomName: z
    .string()
    .min(2, "Groom's name must be at least 2 characters")
    .max(50, "Name is too long"),
  weddingDate: z
    .string()
    .min(1, "Wedding date is required")
    .refine((v) => !isNaN(Date.parse(v)), "Enter a valid date"),
  city: z.string().min(2, "City is required").max(60),
  state: z.string().max(60).optional().or(z.literal("")),
  country: z.string().min(2, "Country is required").max(60),
});

export const FUNCTION_PRESETS = [
  { value: "Mehndi", label: "💚 Mehndi / Mehendi" },
  { value: "Haldi", label: "💛 Haldi / Pithi" },
  { value: "Sangeet", label: "🎵 Sangeet / Garba" },
  { value: "Engagement", label: "💍 Engagement / Ring Ceremony" },
  { value: "Wedding", label: "🙏 Wedding Ceremony" },
  { value: "Reception", label: "🎉 Reception" },
  { value: "Custom", label: "✏️ Custom Function" },
] as const;

export const addFunctionSchema = z.object({
  name: z.string().min(1, "Please select a function type"),
  customName: z.string().max(80).optional().or(z.literal("")),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((v) => !isNaN(Date.parse(v)), "Enter a valid date"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional().or(z.literal("")),
  venueName: z.string().min(2, "Venue name is required").max(100),
  venueAddress: z.string().min(5, "Address is required").max(200),
  venueCity: z.string().min(2, "City is required").max(60),
  mapsURL: z.string().max(500).optional().or(z.literal("")),
  dressCode: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const editEventSchema = createEventSchema;

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type AddFunctionInput = z.infer<typeof addFunctionSchema>;
export type EditEventInput = z.infer<typeof editEventSchema>;
