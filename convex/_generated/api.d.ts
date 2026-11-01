/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_learning from "../agents/learning.js";
import type * as agents_projectReview from "../agents/projectReview.js";
import type * as ai_constants from "../ai/constants.js";
import type * as ai_provider from "../ai/provider.js";
import type * as auth from "../auth.js";
import type * as chat_action from "../chat/action.js";
import type * as chat_constants from "../chat/constants.js";
import type * as chat_data from "../chat/data.js";
import type * as chat_internal from "../chat/internal.js";
import type * as chat_learningMemory from "../chat/learningMemory.js";
import type * as chat_learningRetrieval from "../chat/learningRetrieval.js";
import type * as chat_mutation from "../chat/mutation.js";
import type * as chat_prompts from "../chat/prompts.js";
import type * as chat_queries from "../chat/queries.js";
import type * as chat_rag from "../chat/rag.js";
import type * as chat_validators from "../chat/validators.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_documents from "../lib/documents.js";
import type * as playground_agentTest from "../playground/agentTest.js";
import type * as playground_ragTest from "../playground/ragTest.js";
import type * as playground_validators from "../playground/validators.js";
import type * as profiles_authValidators from "../profiles/authValidators.js";
import type * as profiles_validators from "../profiles/validators.js";
import type * as roadmap_access from "../roadmap/access.js";
import type * as roadmap_action from "../roadmap/action.js";
import type * as roadmap_constants from "../roadmap/constants.js";
import type * as roadmap_generation_constants from "../roadmap/generation/constants.js";
import type * as roadmap_generation_merge from "../roadmap/generation/merge.js";
import type * as roadmap_generation_pipeline from "../roadmap/generation/pipeline.js";
import type * as roadmap_generation_prompts from "../roadmap/generation/prompts.js";
import type * as roadmap_generation_schemas from "../roadmap/generation/schemas.js";
import type * as roadmap_generation_stages from "../roadmap/generation/stages.js";
import type * as roadmap_internal from "../roadmap/internal.js";
import type * as roadmap_mutation from "../roadmap/mutation.js";
import type * as roadmap_progress_constants from "../roadmap/progress/constants.js";
import type * as roadmap_progress_generation from "../roadmap/progress/generation.js";
import type * as roadmap_progress_internal from "../roadmap/progress/internal.js";
import type * as roadmap_progress_model from "../roadmap/progress/model.js";
import type * as roadmap_progress_validators from "../roadmap/progress/validators.js";
import type * as roadmap_projects_constants from "../roadmap/projects/constants.js";
import type * as roadmap_projects_generation from "../roadmap/projects/generation.js";
import type * as roadmap_projects_internal from "../roadmap/projects/internal.js";
import type * as roadmap_projects_model from "../roadmap/projects/model.js";
import type * as roadmap_projects_validators from "../roadmap/projects/validators.js";
import type * as roadmap_queries from "../roadmap/queries.js";
import type * as roadmap_questions_constants from "../roadmap/questions/constants.js";
import type * as roadmap_questions_generation from "../roadmap/questions/generation.js";
import type * as roadmap_questions_internal from "../roadmap/questions/internal.js";
import type * as roadmap_questions_model from "../roadmap/questions/model.js";
import type * as roadmap_submissions_archive from "../roadmap/submissions/archive.js";
import type * as roadmap_submissions_constants from "../roadmap/submissions/constants.js";
import type * as roadmap_submissions_internal from "../roadmap/submissions/internal.js";
import type * as roadmap_submissions_mutation from "../roadmap/submissions/mutation.js";
import type * as roadmap_submissions_queries from "../roadmap/submissions/queries.js";
import type * as roadmap_submissions_review from "../roadmap/submissions/review.js";
import type * as roadmap_submissions_submissionsAnalyseBatchAction from "../roadmap/submissions/submissionsAnalyseBatchAction.js";
import type * as roadmap_submissions_submissionsExtractAction from "../roadmap/submissions/submissionsExtractAction.js";
import type * as roadmap_submissions_submissionsSynthesizeAction from "../roadmap/submissions/submissionsSynthesizeAction.js";
import type * as roadmap_submissions_submissionsWorkflow from "../roadmap/submissions/submissionsWorkflow.js";
import type * as roadmap_submissions_submissionsWorkflowComplete from "../roadmap/submissions/submissionsWorkflowComplete.js";
import type * as roadmap_submissions_validators from "../roadmap/submissions/validators.js";
import type * as roadmap_validators from "../roadmap/validators.js";
import type * as tables_chat from "../tables/chat.js";
import type * as tables_learning from "../tables/learning.js";
import type * as tables_profiles from "../tables/profiles.js";
import type * as tables_progress from "../tables/progress.js";
import type * as tables_projects from "../tables/projects.js";
import type * as tables_roadmaps from "../tables/roadmaps.js";
import type * as tables_submissions from "../tables/submissions.js";
import type * as workflows_constants from "../workflows/constants.js";
import type * as workflows_manager from "../workflows/manager.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/learning": typeof agents_learning;
  "agents/projectReview": typeof agents_projectReview;
  "ai/constants": typeof ai_constants;
  "ai/provider": typeof ai_provider;
  auth: typeof auth;
  "chat/action": typeof chat_action;
  "chat/constants": typeof chat_constants;
  "chat/data": typeof chat_data;
  "chat/internal": typeof chat_internal;
  "chat/learningMemory": typeof chat_learningMemory;
  "chat/learningRetrieval": typeof chat_learningRetrieval;
  "chat/mutation": typeof chat_mutation;
  "chat/prompts": typeof chat_prompts;
  "chat/queries": typeof chat_queries;
  "chat/rag": typeof chat_rag;
  "chat/validators": typeof chat_validators;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/documents": typeof lib_documents;
  "playground/agentTest": typeof playground_agentTest;
  "playground/ragTest": typeof playground_ragTest;
  "playground/validators": typeof playground_validators;
  "profiles/authValidators": typeof profiles_authValidators;
  "profiles/validators": typeof profiles_validators;
  "roadmap/access": typeof roadmap_access;
  "roadmap/action": typeof roadmap_action;
  "roadmap/constants": typeof roadmap_constants;
  "roadmap/generation/constants": typeof roadmap_generation_constants;
  "roadmap/generation/merge": typeof roadmap_generation_merge;
  "roadmap/generation/pipeline": typeof roadmap_generation_pipeline;
  "roadmap/generation/prompts": typeof roadmap_generation_prompts;
  "roadmap/generation/schemas": typeof roadmap_generation_schemas;
  "roadmap/generation/stages": typeof roadmap_generation_stages;
  "roadmap/internal": typeof roadmap_internal;
  "roadmap/mutation": typeof roadmap_mutation;
  "roadmap/progress/constants": typeof roadmap_progress_constants;
  "roadmap/progress/generation": typeof roadmap_progress_generation;
  "roadmap/progress/internal": typeof roadmap_progress_internal;
  "roadmap/progress/model": typeof roadmap_progress_model;
  "roadmap/progress/validators": typeof roadmap_progress_validators;
  "roadmap/projects/constants": typeof roadmap_projects_constants;
  "roadmap/projects/generation": typeof roadmap_projects_generation;
  "roadmap/projects/internal": typeof roadmap_projects_internal;
  "roadmap/projects/model": typeof roadmap_projects_model;
  "roadmap/projects/validators": typeof roadmap_projects_validators;
  "roadmap/queries": typeof roadmap_queries;
  "roadmap/questions/constants": typeof roadmap_questions_constants;
  "roadmap/questions/generation": typeof roadmap_questions_generation;
  "roadmap/questions/internal": typeof roadmap_questions_internal;
  "roadmap/questions/model": typeof roadmap_questions_model;
  "roadmap/submissions/archive": typeof roadmap_submissions_archive;
  "roadmap/submissions/constants": typeof roadmap_submissions_constants;
  "roadmap/submissions/internal": typeof roadmap_submissions_internal;
  "roadmap/submissions/mutation": typeof roadmap_submissions_mutation;
  "roadmap/submissions/queries": typeof roadmap_submissions_queries;
  "roadmap/submissions/review": typeof roadmap_submissions_review;
  "roadmap/submissions/submissionsAnalyseBatchAction": typeof roadmap_submissions_submissionsAnalyseBatchAction;
  "roadmap/submissions/submissionsExtractAction": typeof roadmap_submissions_submissionsExtractAction;
  "roadmap/submissions/submissionsSynthesizeAction": typeof roadmap_submissions_submissionsSynthesizeAction;
  "roadmap/submissions/submissionsWorkflow": typeof roadmap_submissions_submissionsWorkflow;
  "roadmap/submissions/submissionsWorkflowComplete": typeof roadmap_submissions_submissionsWorkflowComplete;
  "roadmap/submissions/validators": typeof roadmap_submissions_validators;
  "roadmap/validators": typeof roadmap_validators;
  "tables/chat": typeof tables_chat;
  "tables/learning": typeof tables_learning;
  "tables/profiles": typeof tables_profiles;
  "tables/progress": typeof tables_progress;
  "tables/projects": typeof tables_projects;
  "tables/roadmaps": typeof tables_roadmaps;
  "tables/submissions": typeof tables_submissions;
  "workflows/constants": typeof workflows_constants;
  "workflows/manager": typeof workflows_manager;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
