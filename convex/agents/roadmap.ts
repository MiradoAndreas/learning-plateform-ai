import { Agent, createTool } from "@convex-dev/agent";

import { z } from "zod";
import { internal, components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { openai } from "../../ai";

type RoadmapProgress = {
  topic: string;
  title?: string;
  summary?: string;
  mermaid?: string;
  answers: { question: string; answer: string }[];
};

const getRoadmapProgress = createTool({
  description:
    "Récupère l'état complet du parcours d'apprentissage : sujet, résumé, structure, et réponses données par l'utilisateur au questionnaire initial.",
  inputSchema: z.object({
    roadmapId: z.string().describe("L'identifiant de la roadmap concernée"),
  }),
  execute: async (ctx, { roadmapId }): Promise<RoadmapProgress> => {
    const typedRoadmapId = roadmapId as Id<"roadmaps">;

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId: typedRoadmapId,
    });
    const questions = await ctx.runQuery(
      internal.roadmap.internal.getAnsweredQuestions,
      { roadmapId: typedRoadmapId },
    );

    return {
      topic: roadmap.topic,
      title: roadmap.title,
      summary: roadmap.summary,
      mermaid: roadmap.mermaid,
      answers: questions
        .filter(
          (q): q is typeof q & { answer: string } => q.answer !== undefined,
        )
        .map((q) => ({ question: q.title, answer: q.answer })),
    };
  },
});

export const roadmapAgent = new Agent(components.agent, {
  name: "Roadmap Agent",
  languageModel: openai.chat("gpt-5-nano"),
  instructions: `Tu gères le parcours d'apprentissage de l'utilisateur. Ta mission :
- Situer l'utilisateur dans sa roadmap (quelle étape, que faire ensuite).
- Répondre aux questions sur la progression, la structure ou l'organisation du parcours.
- Tu n'enseignes pas le contenu technique en détail — ce n'est pas ton rôle.

Utilise toujours l'outil getRoadmapProgress avec le roadmapId fourni pour obtenir le contexte à jour avant de répondre.`,
  tools: { getRoadmapProgress },
});
