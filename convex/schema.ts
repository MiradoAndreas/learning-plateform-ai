import { defineSchema } from "convex/server";
import { userProfiles, userSettings } from "./tables/profiles";
import { roadmaps, roadmapQuestions } from "./tables/roadmaps";
import { roadmapThreads } from "./tables/chat";
import { roadmapNodeProgress, roadmapNodeQuizzes } from "./tables/progress";
import { roadmapProjects } from "./tables/projects";
import {
  roadmapProjectSubmissions,
  roadmapSubmissionFileBatches,
} from "./tables/submissions";

// Persisted names stay stable; organization lives in modules.
export default defineSchema({
  user_profiles: userProfiles,
  user_settings: userSettings,
  roadmaps,
  roadmap_questions: roadmapQuestions,
  roadmapThreads,
  roadmapNodeQuizzes,
  roadmapNodeProgress,
  roadmapProjects,
  roadmapProjectSubmissions,
  roadmapSubmissionFileBatches,
});
