/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_learning_profiles from "../ai/learning_profiles.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_helper from "../lib/helper.js";
import type * as lib_validators from "../lib/validators.js";
import type * as onboarding_interests from "../onboarding/interests.js";
import type * as onboarding_learning_goals from "../onboarding/learning_goals.js";
import type * as onboarding_learning_preferences from "../onboarding/learning_preferences.js";
import type * as onboarding_mutations from "../onboarding/mutations.js";
import type * as onboarding_onboarding_data from "../onboarding/onboarding_data.js";
import type * as onboarding_queries from "../onboarding/queries.js";
import type * as profiles_user_profiles from "../profiles/user_profiles.js";
import type * as profiles_user_settings from "../profiles/user_settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/learning_profiles": typeof ai_learning_profiles;
  auth: typeof auth;
  http: typeof http;
  "lib/helper": typeof lib_helper;
  "lib/validators": typeof lib_validators;
  "onboarding/interests": typeof onboarding_interests;
  "onboarding/learning_goals": typeof onboarding_learning_goals;
  "onboarding/learning_preferences": typeof onboarding_learning_preferences;
  "onboarding/mutations": typeof onboarding_mutations;
  "onboarding/onboarding_data": typeof onboarding_onboarding_data;
  "onboarding/queries": typeof onboarding_queries;
  "profiles/user_profiles": typeof profiles_user_profiles;
  "profiles/user_settings": typeof profiles_user_settings;
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
};
