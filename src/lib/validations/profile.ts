import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  headline: z.string().max(100, "Headline is too long").optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  location: z.string().max(100, "Location is too long").optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number is too long").optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
