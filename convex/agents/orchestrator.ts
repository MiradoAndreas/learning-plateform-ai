import { Agent, createTool, stepCountIs } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { components } from "../_generated/api";
import { tutorAgent } from "./tutor";
import { roadmapAgent } from "./roadmap";

const askTutor = createTool({
  description:
    "Pose une question pédagogique au Tutor Agent pour obtenir une explication claire sur un concept lié au sujet de la roadmap.",
  inputSchema: z.object({
    question: z.string().describe("La question pédagogique à poser"),
  }),
  execute: async (ctx, { question }): Promise<string> => {
    const result = await tutorAgent.generateText(ctx, {}, { prompt: question });
    return result.text;
  },
});

const askRoadmapAgent = createTool({
  description:
    "Pose une question au Roadmap Agent concernant la progression, l'étape actuelle ou l'organisation du parcours.",
  inputSchema: z.object({
    question: z.string().describe("La question sur le parcours à poser"),
    roadmapId: z.string().describe("L'identifiant de la roadmap concernée"),
  }),
  execute: async (ctx, { question, roadmapId }): Promise<string> => {
    const result = await roadmapAgent.generateText(
      ctx,
      {},
      { prompt: `RoadmapId: ${roadmapId}\nQuestion: ${question}` },
    );
    return result.text;
  },
});

export const chatReplySchema = z.object({
  content: z
    .string()
    .describe(
      "La réponse pédagogique complète en texte, fusionnant les informations obtenues via les outils. Ne mets JAMAIS de code mermaid dans ce champ.",
    ),
  mermaid: z
    .string()
    .describe(
      "Un diagramme mermaid valide (flowchart, mindmap, sequenceDiagram, etc.) qui résume visuellement la réponse. " +
        "Obligatoire, même pour un sujet simple (minimum 2-3 noeuds). Code mermaid brut uniquement, sans balises markdown.",
    ),
});

export const learningOrchestratorAgent = new Agent(components.agent, {
  name: "Learning Orchestrator",
  languageModel: openai.chat("gpt-5-nano"),
  instructions: `Tu es l'orchestrateur d'un système d'apprentissage. Tu ne réponds jamais toi-même sur le fond :
- Question qui demande d'enseigner/expliquer un concept -> utilise askTutor.
- Question sur la progression, l'organisation ou la structure du parcours -> utilise askRoadmapAgent.
- Tu peux appeler plusieurs outils si la question touche aux deux aspects.

Une fois les réponses obtenues, fusionne-les en une réponse structurée cohérente et naturelle. Ne mentionne jamais l'existence de ces outils ou agents internes à l'utilisateur.`,
  tools: { askTutor, askRoadmapAgent },
  stopWhen: stepCountIs(5),
});
