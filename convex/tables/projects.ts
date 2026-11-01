import { defineTable } from "convex/server";
import { v } from "convex/values";
import { projectFields } from "../roadmap/projects/validators";

export const roadmapProjects = defineTable({
  roadmapId: v.id("roadmaps"),
  ...projectFields,
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_and_order", ["roadmapId", "order"]);
