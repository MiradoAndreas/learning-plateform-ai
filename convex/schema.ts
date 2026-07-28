import { defineSchema } from "convex/server";

import { userProfiles } from "./profiles/user_profiles";
import { userSettings } from "./profiles/user_settings";
import { roadmapQuestions, roadmaps, roadmapThreads } from "./roadmap/roadmap";
import { roadmapNodeProgress, roadmapNodeQuizzes } from "./roadmap/progress";

export default defineSchema({
  user_profiles: userProfiles,
  user_settings: userSettings,
  roadmaps: roadmaps,
  roadmap_questions: roadmapQuestions,
  roadmapThreads: roadmapThreads,
  roadmapNodeQuizzes: roadmapNodeQuizzes,
  roadmapNodeProgress: roadmapNodeProgress,
});
