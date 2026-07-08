import { createOpenAI } from "@ai-sdk/openai";
const openai_api_key = process.env.OPENAI_API_KEY!;

export const openai = createOpenAI({
  apiKey: openai_api_key,
});
