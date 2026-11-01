import { RAG, contentHashFromArrayBuffer } from "@convex-dev/rag";
import { components } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { AI_MODELS, EMBEDDING_DIMENSION } from "../ai/constants";
import { gateway } from "../ai/provider";

const rag = new RAG<{ revision: string }>(components.rag, {
  textEmbeddingModel: gateway.embeddingModel(AI_MODELS.embedding),
  embeddingDimension: EMBEDDING_DIMENSION,
  filterNames: ["revision"],
});

export const MAX_RETRIEVED_CONTEXT_CHARS = 12_000;

export function roadmapKnowledge(
  roadmap: Doc<"roadmaps">,
  progress: string[] = [],
): string {
  return [
    `Sujet : ${roadmap.topic}\nTitre : ${roadmap.title ?? roadmap.topic}`,
    roadmap.summary ? `Résumé :\n${roadmap.summary}` : "",
    ...progress,
    ...(roadmap.roadmapData?.sections ?? []).map((section) =>
      [
        `Section : ${section.title}`,
        ...section.centerNodes.map((node) => `Étape : ${node.label}`),
        ...[...section.leftNodes, ...section.rightNodes].map((node) =>
          node.kind === "choice"
            ? `Choix : ${node.label}\n${node.options
                .map(
                  (option) =>
                    `- ${option.label} (${option.recommendation})${option.note ? ` : ${option.note}` : ""}`,
                )
                .join("\n")}`
            : `Notion : ${node.label}`,
        ),
      ].join("\n"),
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Called only after the action verifies both roadmap and session ownership.
// Lazy indexing also covers existing roadmaps without a backfill or schema change.
export async function retrieveTutorContext(
  ctx: ActionCtx,
  roadmap: Doc<"roadmaps">,
  question: string,
  progress: string[] = [],
): Promise<string> {
  const text = roadmapKnowledge(roadmap, progress);
  const revision = await contentHashFromArrayBuffer(
    new TextEncoder().encode(text).buffer,
  );
  const namespace = `tutor:${roadmap.userId}:${roadmap._id}`;
  const key = "roadmap";
  const existing = await rag.findEntryByContentHash(ctx, {
    namespace,
    key,
    contentHash: revision,
  });
  if (existing?.status !== "ready") {
    const added = await rag.add(ctx, {
      namespace,
      key,
      text,
      title: roadmap.title ?? roadmap.topic,
      contentHash: revision,
      filterValues: [{ name: "revision", value: revision }],
    });
    if (added.replacedEntry) {
      await rag.delete(ctx, { entryId: added.replacedEntry.entryId });
    }
  }
  const result = await rag.search(ctx, {
    namespace,
    query: question,
    filters: [{ name: "revision", value: revision }],
    limit: 6,
    chunkContext: { before: 1, after: 1 },
  });
  return result.text.slice(0, MAX_RETRIEVED_CONTEXT_CHARS);
}
