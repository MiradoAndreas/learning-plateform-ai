import { streamText, Output } from "ai";
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
  onProgress,
}: {
  topic: string;
  answers?: { key: string; value: string }[];
  onProgress?: (data: RoadmapData) => Promise<void>;
}) {
  const startedAt = Date.now();
  console.info("roadmap.generation.started", {
    provider: "vercel-ai-gateway",
    requestedModel: AI_MODELS.roadmap,
  });
  let result;
  let output;
  try {
    result = streamText({
      model: gateway(AI_MODELS.roadmap),
      output: Output.object({ schema: completeRoadmapSchema }),
      prompt: buildRoadmapPrompt({ topic, answers }),
    });
    let publishedSections = 0;
    for await (const partial of result.partialOutputStream) {
      // A following section proves the preceding JSON object is complete.
      // Publish immutable prefixes so existing node IDs and positions stay stable.
      const count = Math.max(0, (partial.sections?.length ?? 0) - 1);
      if (!onProgress || count <= publishedSections) continue;
      const sections = completeRoadmapSchema.shape.sections.element
        .array()
        .parse(partial.sections!.slice(0, count));
      await onProgress(
        normalizeRoadmap({ title: partial.title ?? topic, sections }),
      );
      publishedSections = count;
    }
    // Await the validated final output: truncated/failed streams never complete a roadmap.
    output = await result.output;
  } catch (error) {
    console.error("roadmap.generation.failed", {
      requestedModel: AI_MODELS.roadmap,
      errorName: error instanceof Error ? error.name : "UnknownError",
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
  const [response, providerMetadata, totalUsage] = await Promise.all([
    result.response,
    result.providerMetadata,
    result.totalUsage,
  ]);

  console.info("roadmap.generation.completed", {
    requestedModel: AI_MODELS.roadmap,
    responseModel: response?.modelId,
    generationId: providerMetadata?.gateway?.generationId,
    durationMs: Date.now() - startedAt,
    inputTokens: totalUsage?.inputTokens,
    outputTokens: totalUsage?.outputTokens,
    sections: output.sections.length,
  });

  const roadmapData = normalizeRoadmap(output);
  const summary = `Roadmap complète couvrant ${output.sections.length} phases : ${output.domainCoverageChecklist.join(", ")}.`;
  return { title: output.title, summary, roadmapData };
}

function normalizeRoadmap(
  output: Pick<
    import("zod").infer<typeof completeRoadmapSchema>,
    "title" | "sections"
  >,
): RoadmapData {
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
  return roadmapData;
}
