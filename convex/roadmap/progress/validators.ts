import { v } from "convex/values";

export const quizQuestionValidator = v.object({
  question: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
});
