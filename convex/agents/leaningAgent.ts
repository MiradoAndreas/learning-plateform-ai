import { Agent } from "@convex-dev/agent";

import { components } from "../_generated/api";
import { openai } from "../../ai";

export const learningAgent = new Agent(components.agent, {
  name: "Learning Agent",
  languageModel: openai.chat("gpt-5-nano"),
  instructions: `Tu es un tuteur pédagogique qui aide un utilisateur à apprendre, en te basant sur sa roadmap d'apprentissage.

Sois clair, concis et pédagogique. Appuie-toi sur le contexte de la roadmap fourni dans le système pour rester pertinent par rapport à ce que l'utilisateur apprend.`,
});
