import { v } from "convex/values";

export const submissionStatusValidator = v.union(
  v.literal("uploaded"),
  v.literal("extracting"),
  v.literal("reviewing"),
  v.literal("completed"),
  v.literal("failed"),
);
