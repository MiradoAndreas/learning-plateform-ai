import { generateText, Output } from "ai";
import { gateway } from "../../ai/provider";
import { AI_MODELS } from "../../ai/constants";
import type {
  RoadmapData,
  RoadmapEntry,
} from "@/modules/roadmap/lib/roadmap-data-types";
import { completeRoadmapSchema } from "./schemas";
import { buildRoadmapPrompt } from "./prompts";

export async function generateRoadmap({
  topic,
  answers = [],
}: {
  topic: string;
  answers?: { key: string; value: string }[];
}) {
  const startedAt = Date.now();
  console.info("roadmap.generation.started", {
    provider: "vercel-ai-gateway",
    requestedModel: AI_MODELS.roadmap,
  });
  const { output, response, providerMetadata, totalUsage } = await generateText(
    {
      model: gateway(AI_MODELS.roadmap),
      output: Output.object({ schema: completeRoadmapSchema }),
      prompt: buildRoadmapPrompt({ topic, answers }),
    },
  ).catch((error: unknown) => {
    const generationId =
      error && typeof error === "object" && "generationId" in error
        ? error.generationId
        : undefined;
    console.error("roadmap.generation.failed", {
      requestedModel: AI_MODELS.roadmap,
      errorName: error instanceof Error ? error.name : "UnknownError",
      generationId: typeof generationId === "string" ? generationId : undefined,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  });

  console.info("roadmap.generation.completed", {
    requestedModel: AI_MODELS.roadmap,
    responseModel: response?.modelId,
    generationId: providerMetadata?.gateway?.generationId,
    durationMs: Date.now() - startedAt,
    inputTokens: totalUsage?.inputTokens,
    outputTokens: totalUsage?.outputTokens,
    sections: output.sections.length,
  });

  // Normalize IDs and nullable notes without another model call.
  const seen = new Set<string>();
  function uniqueId(id: string) {
    let value = id;
    let suffix = 2;
    while (seen.has(value)) value = `${id}-${suffix++}`;
    seen.add(value);
    return value;
  }
  function normalizeEntry(
    entry: (typeof output.sections)[number]["leftNodes"][number],
  ): RoadmapEntry {
    const id = uniqueId(entry.id);
    if (entry.kind === "topic") return { ...entry, id };
    // Keep choices usable even if the model marks multiple recommendations.
    const recommended = Math.max(
      0,
      entry.options.findIndex(
        (option) => option.recommendation === "recommended",
      ),
    );
    return {
      ...entry,
      id,
      options: entry.options.map((option, index) => ({
        ...option,
        id: uniqueId(option.id),
        recommendation:
          index === recommended
            ? "recommended"
            : option.recommendation === "recommended"
              ? "none"
              : option.recommendation,
        note: option.note ?? undefined,
      })),
    };
  }
  const roadmapData: RoadmapData = {
    title: output.title,
    sections: output.sections.map((section) => ({
      ...section,
      id: uniqueId(section.id),
      centerNodes: section.centerNodes.map((node) => ({
        ...node,
        id: uniqueId(node.id),
      })),
      leftNodes: section.leftNodes.map(normalizeEntry),
      rightNodes: section.rightNodes.map(normalizeEntry),
    })),
  };
  const summary = `Roadmap complète couvrant ${output.sections.length} phases : ${output.domainCoverageChecklist.join(", ")}.`;
  return { title: output.title, summary, roadmapData };
}
