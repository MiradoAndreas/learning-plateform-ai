// Stable imports for existing clients. Domain modules own the definitions.
export {
  LEARNING_RESOURCE_QUESTION_KEY,
  LEARNING_RESOURCE_OPTIONS,
  LEARNING_RESOURCE_QUESTION,
} from "./questions/constants";
export { SKILL_LEVELS, type SkillLevel } from "./projects/constants";
export {
  SUBMISSION_PASS_THRESHOLD,
  BATCH_CHAR_BUDGET,
  MAX_SINGLE_FILE_CHARS,
  MAX_BATCHES,
} from "./submissions/constants";
export { isRelevantFile } from "./submissions/archive";

export const DASHBOARD_ROADMAP_LIMIT = 5;
