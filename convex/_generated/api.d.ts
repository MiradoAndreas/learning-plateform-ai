/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_leaningAgent from "../agents/leaningAgent.js";
import type * as agents_orchestrator from "../agents/orchestrator.js";
import type * as agents_roadmap from "../agents/roadmap.js";
import type * as agents_tutor from "../agents/tutor.js";
import type * as ai_learning_profiles from "../ai/learning_profiles.js";
import type * as auth from "../auth.js";
import type * as chat_action from "../chat/action.js";
import type * as chat_ai from "../chat/ai.js";
import type * as chat_chat from "../chat/chat.js";
import type * as chat_mutation from "../chat/mutation.js";
import type * as chat_queries from "../chat/queries.js";
import type * as http from "../http.js";
import type * as lib_helper from "../lib/helper.js";
import type * as lib_validators from "../lib/validators.js";
import type * as onboarding_interests from "../onboarding/interests.js";
import type * as onboarding_learning_goals from "../onboarding/learning_goals.js";
import type * as onboarding_learning_preferences from "../onboarding/learning_preferences.js";
import type * as onboarding_mutations from "../onboarding/mutations.js";
import type * as onboarding_onboarding_data from "../onboarding/onboarding_data.js";
import type * as onboarding_queries from "../onboarding/queries.js";
import type * as playground_agentTest from "../playground/agentTest.js";
import type * as playground_ragTest from "../playground/ragTest.js";
import type * as profiles_user_profiles from "../profiles/user_profiles.js";
import type * as profiles_user_settings from "../profiles/user_settings.js";
import type * as roadmap_action from "../roadmap/action.js";
import type * as roadmap_ai from "../roadmap/ai.js";
import type * as roadmap_generation_choicePass from "../roadmap/generation/choicePass.js";
import type * as roadmap_generation_gapAudit from "../roadmap/generation/gapAudit.js";
import type * as roadmap_generation_merge from "../roadmap/generation/merge.js";
import type * as roadmap_generation_phaseDetails from "../roadmap/generation/phaseDetails.js";
import type * as roadmap_generation_phaseSkeleton from "../roadmap/generation/phaseSkeleton.js";
import type * as roadmap_internal from "../roadmap/internal.js";
import type * as roadmap_mutation from "../roadmap/mutation.js";
import type * as roadmap_queries from "../roadmap/queries.js";
import type * as roadmap_roadmap from "../roadmap/roadmap.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/leaningAgent": typeof agents_leaningAgent;
  "agents/orchestrator": typeof agents_orchestrator;
  "agents/roadmap": typeof agents_roadmap;
  "agents/tutor": typeof agents_tutor;
  "ai/learning_profiles": typeof ai_learning_profiles;
  auth: typeof auth;
  "chat/action": typeof chat_action;
  "chat/ai": typeof chat_ai;
  "chat/chat": typeof chat_chat;
  "chat/mutation": typeof chat_mutation;
  "chat/queries": typeof chat_queries;
  http: typeof http;
  "lib/helper": typeof lib_helper;
  "lib/validators": typeof lib_validators;
  "onboarding/interests": typeof onboarding_interests;
  "onboarding/learning_goals": typeof onboarding_learning_goals;
  "onboarding/learning_preferences": typeof onboarding_learning_preferences;
  "onboarding/mutations": typeof onboarding_mutations;
  "onboarding/onboarding_data": typeof onboarding_onboarding_data;
  "onboarding/queries": typeof onboarding_queries;
  "playground/agentTest": typeof playground_agentTest;
  "playground/ragTest": typeof playground_ragTest;
  "profiles/user_profiles": typeof profiles_user_profiles;
  "profiles/user_settings": typeof profiles_user_settings;
  "roadmap/action": typeof roadmap_action;
  "roadmap/ai": typeof roadmap_ai;
  "roadmap/generation/choicePass": typeof roadmap_generation_choicePass;
  "roadmap/generation/gapAudit": typeof roadmap_generation_gapAudit;
  "roadmap/generation/merge": typeof roadmap_generation_merge;
  "roadmap/generation/phaseDetails": typeof roadmap_generation_phaseDetails;
  "roadmap/generation/phaseSkeleton": typeof roadmap_generation_phaseSkeleton;
  "roadmap/internal": typeof roadmap_internal;
  "roadmap/mutation": typeof roadmap_mutation;
  "roadmap/queries": typeof roadmap_queries;
  "roadmap/roadmap": typeof roadmap_roadmap;
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
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
