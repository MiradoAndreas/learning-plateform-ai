// Zod validation
import { z } from "zod";

export const learningSchema = z.object({
  primaryGoal: z
    .string()
    .min(3, "Primary goal must be at least 3 characters")
    .max(100, "Primary goal must be less than 100 characters"),

  secondaryGoals: z
    .array(z.string())
    .max(5, "Maximum 5 secondary goals allowed")
    .optional(),

  currentLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),

  //Todo: add the require_error if needed

  studyDaysPerWeek: z
    .number()
    .min(0, "Weekly hours must be at least 0")
    .max(40, "Weekly hours cannot exceed 40"),

  hoursPerStudyDay: z
    .number()
    .min(0, "Daily hours must be at least 0")
    .max(8, "Daily hours cannot exceed 8"),

  preferredPace: z.enum(["relaxed", "moderate", "intense"]),

  targetCompletionDate: z.date().optional(),
});

export type LearningSchema = z.infer<typeof learningSchema>;
