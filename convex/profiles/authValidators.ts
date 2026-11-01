import { v } from "convex/values";
import { tables } from "../betterAuth/schema";

export const currentUserValidator = v.union(
  v.null(),
  v.object({
    ...tables.user.validator.fields,
    _id: v.string(),
    _creationTime: v.number(),
    id: v.string(),
    userId: v.string(),
  }),
);
