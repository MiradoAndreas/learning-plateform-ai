// convex/agents/projectReviewAgent.ts
import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const projectReviewAgent = new Agent(components.agent, {
  name: "Project Review Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions:
    "Tu es un correcteur technique rigoureux et bienveillant. Tu évalues des projets de programmation soumis par des apprenants, en tenant toujours compte du niveau de compétence annoncé pour ce projet. Tu bases ton jugement uniquement sur le code fourni, sans jamais inventer de contenu absent.",
});
