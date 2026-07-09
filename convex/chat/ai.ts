import { generateText } from "ai";
import { openai } from "../../ai";

type ChatContext = {
  topic: string;
  title?: string;
  summary?: string;
  mermaid?: string;
};

type ChatHistoryMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(context: ChatContext) {
  return `Tu es un tuteur pédagogique qui aide un utilisateur à apprendre "${context.topic}".

Voici la roadmap qu'il suit :
Titre : ${context.title ?? context.topic}
Résumé : ${context.summary ?? "N/A"}
Structure (mermaid) : ${context.mermaid ?? "N/A"}

Réponds de façon claire, pédagogique et concise, en t'appuyant sur cette roadmap. Reste dans le contexte de cette étape d'apprentissage.`;
}

export async function generateChatReply({
  context,
  history,
}: {
  context: ChatContext;
  history: ChatHistoryMessage[];
}) {
  const { text } = await generateText({
    model: openai("gpt-5-nano"),
    system: buildSystemPrompt(context),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  return text;
}
