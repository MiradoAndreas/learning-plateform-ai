import { ConvexError, v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { learningAgent } from "../agents/leaningAgent";
import z from "zod";
import { MAX_EXCHANGES_PER_THREAD } from "./constants";

export const sendMessage = action({
  args: {
    threadId: v.string(),
    roadmapId: v.id("roadmaps"),
    content: v.string(),
  },
  handler: async (
    ctx,
    { threadId, roadmapId, content },
  ): Promise<{ text: string }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Non authentifié");
    }

    const session = await ctx.runQuery(
      internal.chat.internal.getSessionByThreadId,
      {
        threadId,
      },
    );

    if (!session || session.userId !== identity.subject) {
      throw new Error("Introuvable");
    }

    if ((session.messageCount ?? 0) >= MAX_EXCHANGES_PER_THREAD) {
      throw new ConvexError({
        code: "THREAD_LIMIT_REACHED",
        message:
          "Cette discussion a atteint sa limite d'échanges. Créez une nouvelle discussion pour continuer.",
      });
    }

    const roadmap = await ctx.runQuery(internal.roadmap.internal.getRoadmap, {
      roadmapId,
    });

    const preferences = await ctx.runQuery(
      internal.roadmap.internal.getRoadmapPreferences,
      {
        roadmapId,
      },
    );

    const learningResource = preferences.learning_resource?.toLowerCase() ?? "";

    let learningResourceInstructions = "";

    if (
      learningResource.includes("youtube") ||
      learningResource.includes("vidéo")
    ) {
      learningResourceInstructions = `
À la fin de la réponse, ajoute UNIQUEMENT cette section :

## Mots-clés YouTube

- 3 à 5 recherches YouTube très précises.

Ne donne jamais de lien.
N'ajoute aucun texte avant cette section.
N'ajoute aucun texte après cette section.
`;
    } else if (
      learningResource.includes("article") ||
      learningResource.includes("blog")
    ) {
      learningResourceInstructions = `
À la fin de la réponse, ajoute UNIQUEMENT cette section :

## Articles à rechercher

- 3 à 5 recherches très précises.

Ne donne jamais de lien.
N'ajoute aucun texte avant cette section.
N'ajoute aucun texte après cette section.
`;
    } else if (
      learningResource.includes("documentation") ||
      learningResource.includes("doc")
    ) {
      learningResourceInstructions = `
À la fin de la réponse, ajoute UNIQUEMENT cette section :

## Documentation officielle

- Nom de la documentation.
- Nom de la rubrique pertinente.

Ne donne jamais de lien.
N'ajoute aucun texte avant cette section.
N'ajoute aucun texte après cette section.
`;
    }

    const system = `
Tu es le tuteur personnel de cet utilisateur.

========================
CONTEXTE DE LA ROADMAP
========================

Sujet :
${roadmap.topic}

Titre :
${roadmap.title ?? "Non renseigné"}

Résumé :
${roadmap.summary ?? "Non renseigné"}

========================
PROFIL DE L'UTILISATEUR
========================

${Object.entries(preferences)
  .map(([key, value]) => `- ${key} : ${value}`)
  .join("\n")}

========================
RÈGLES
========================

Adapte toujours tes réponses au profil de l'utilisateur.

Utilise uniquement les préférences présentes ci-dessus.

Ne suppose jamais des technologies ou outils qui ne sont pas indiqués.

Si une préférence n'existe pas, ignore-la simplement.

Si plusieurs solutions existent, privilégie celles compatibles avec les préférences de l'utilisateur.

Réponds comme un manuel technique.

Commence immédiatement par l'explication.

Ne fais jamais d'introduction.

Ne répète jamais la question.

Ne reformule jamais la demande.

Ne commence jamais par :

- Voici...
- Voici une explication...
- Bien sûr...
- D'accord...
- Je vais...
- Je vais t'expliquer...
- Comme demandé...
- Ci-dessous...
- Cette réponse...
- En résumé...
- Pour conclure...

Commence directement par le contenu.

Exemple :

Mauvais :

"Voici une explication de React."

Bon :

"React est une bibliothèque JavaScript..."

Ne termine jamais par :

- Souhaites-tu...
- Je peux aussi...
- Dis-moi si...
- N'hésite pas...
- Fais-moi savoir...
- J'espère que...
- En conclusion...
- Une formule de politesse.
- Une proposition d'aide.
- Un appel à l'action.

Ne pose jamais de question.

Ne propose jamais spontanément un autre sujet.

N'ajoute jamais de conclusion.

N'ajoute jamais de résumé final sauf si l'utilisateur le demande.

Utilise des titres seulement lorsqu'ils améliorent réellement la lisibilité.

Utilise des listes seulement lorsqu'elles améliorent réellement la compréhension.

${learningResourceInstructions}
`;

    const { thread } = await learningAgent.continueThread(ctx, {
      threadId,
    });

    const result = await thread.generateText({
      system,
      prompt: content,
    });

    await ctx.runMutation(internal.chat.internal.incrementSessionMessageCount, {
      threadId,
    });

    const metadata = await thread.getMetadata();

    console.log("metadata", metadata);

    if (metadata.title === "Nouvelle discussion") {
      await ctx.scheduler.runAfter(
        0,
        internal.chat.action.generateThreadTitle,
        {
          threadId,
          firstMessage: content,
        },
      );
    }

    return {
      text: result.text,
    };
  },
});

const titleSchema = z.object({
  title: z
    .string()
    .describe(
      "Titre court (6 mots maximum), sans guillemets ni ponctuation finale, résumant le sujet de la conversation.",
    ),
});

export const generateThreadTitle = internalAction({
  args: {
    threadId: v.string(),
    firstMessage: v.string(),
  },
  handler: async (ctx, { threadId, firstMessage }) => {
    const { thread } = await learningAgent.continueThread(ctx, { threadId });

    const { object } = await thread.generateObject(
      {
        prompt: `Génère un titre très court résumant ce sujet de discussion : "${firstMessage}"`,
        schema: titleSchema,
      },
      {
        storageOptions: { saveMessages: "none" },
      },
    );

    await thread.updateMetadata({
      title: object.title,
    });

    await ctx.runMutation(internal.chat.internal.patchSessionTitleByThreadId, {
      threadId,
      title: object.title,
    });
  },
});
