import { v } from "convex/values";

/**
 * Generate a timestamp for now
 */
export const now = (): number => Date.now();

/**
 * Check if a value is within a range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Safely parse a JSON string
 */
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Create a slug from a string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
