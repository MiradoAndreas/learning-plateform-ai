import { z } from "zod";

export const interestItemSchema = z.object({
  domain: z
    .string()
    .min(2, "Domain must be at least 2 characters")
    .max(50, "Domain must be less than 50 characters"),

  subdomain: z
    .string()
    .max(50, "Subdomain must be less than 50 characters")
    .optional(),

  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters")
    .max(50, "Topic must be less than 50 characters"),

  technologies: z.array(z.string()).max(10, "Maximum 10 technologies allowed"),

  proficiency: z.enum([
    "exploring",
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ]),
});

export const interestsSchema = z.object({
  interests: z
    .array(interestItemSchema)
    .min(1, "Please add at least one interest")
    .max(10, "Maximum 10 interests allowed"),
});

export type InterestItemSchema = z.infer<typeof interestItemSchema>;
export type InterestsSchema = z.infer<typeof interestsSchema>;
