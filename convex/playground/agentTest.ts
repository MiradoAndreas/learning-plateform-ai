import { AI_MODELS } from "../ai/constants";
// convex/playground/agent-test.ts

import { Agent, createThread } from "@convex-dev/agent";
import { gateway } from "../ai/provider";
import { action } from "../_generated/server";
import { components } from "../_generated/api";
import { v } from "convex/values";

const testAgent = new Agent(components.agent, {
  name: "Test Agent",
  languageModel: gateway(AI_MODELS.generation),
  instructions: "Tu es un assistant de test, réponds brièvement.",
});

export const pingAgent = action({
  args: { message: v.string() },
  returns: v.object({ threadId: v.string(), text: v.string() }),
  handler: async (ctx, { message }) => {
    const threadId = await createThread(ctx, components.agent);
    const result = await testAgent.generateText(
      ctx,
      { threadId },
      {
        prompt: message,
      },
    );
    return { threadId, text: result.text };
  },
});
