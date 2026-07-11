import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../ai";

type ChatContext = {
  topic: string;
  title?: string;
  summary?: string;
  mermaid?: string;
};

type ChatHistoryMessage = { role: "user" | "assistant"; content: string };

const chatReplySchema = z.object({
  content: z.string().describe("La réponse pédagogique en texte."),
  mermaid: z
    .string()
    .nullable()
    .describe(
      "Un diagramme mermaid (flowchart, sequenceDiagram, etc.) UNIQUEMENT si le sujet expliqué est complexe (plusieurs étapes, processus, relations entre concepts, architecture). " +
        "Mets null si l'explication est simple, courte, ou qu'un texte suffit largement. Ne force jamais un diagramme artificiel.",
    ),
});

function buildSystemPrompt(context: ChatContext) {
  return `Tu es un tuteur pédagogique qui aide un utilisateur à apprendre "${context.topic}".

Voici la roadmap qu'il suit :
Titre : ${context.title ?? context.topic}
Résumé : ${context.summary ?? "N/A"}
Structure (mermaid) : ${context.mermaid ?? "N/A"}

Réponds de façon claire, pédagogique et concise, en t'appuyant sur cette roadmap.

Concernant le diagramme mermaid : inclue toujours un diagramme pour que l'utilisateur comprend réellement la réponse. Pour une question simple ou une définition courte, laisse le champ mermaid à null — un texte suffit.`;
}

export async function generateChatReply({
  context,
  history,
}: {
  context: ChatContext;
  history: ChatHistoryMessage[];
}) {
  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    system: buildSystemPrompt(context),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    output: Output.object({ schema: chatReplySchema }),
  });

  return output;
}
