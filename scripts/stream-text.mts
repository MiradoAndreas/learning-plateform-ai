import { config } from "dotenv";
import { createGateway, streamText } from "ai";

// Keep exported environment variables authoritative; reuse local secrets otherwise.
config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("Set AI_GATEWAY_API_KEY in the environment or .env.local.");
  }

  const prompt =
    process.argv.slice(2).join(" ").trim() ||
    "Explain spaced repetition to a student in three concise sentences.";

  const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });
  const model = "google/gemini-2.5-flash-lite";
  const result = streamText({
    model: gateway(model),
    prompt,
    maxOutputTokens: 512,
    maxRetries: 0,
    onError: () => {},
    abortSignal: AbortSignal.timeout(120_000),
  });

  let receivedText = false;
  for await (const part of result.fullStream) {
    if (part.type === "error") {
      // Avoid logging SDK error objects that may contain request credentials.
      throw new Error(
        "AI Gateway generation failed. Check credentials, credits, and model access.",
      );
    }
    if (part.type === "text-delta") {
      receivedText = true;
      process.stdout.write(part.text);
    }
  }

  if (!receivedText) throw new Error("AI Gateway returned no generated text.");
  process.stdout.write("\n");
  const usage = await result.totalUsage;
  console.error(
    `Model: ${model} | Tokens: ${usage.inputTokens ?? "unknown"} input, ${usage.outputTokens ?? "unknown"} output`,
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Text generation failed.",
  );
  process.exitCode = 1;
});
