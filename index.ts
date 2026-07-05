import { streamText } from "ai";
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("AI_GATEWAY_API_KEY", process.env.AI_GATEWAY_API_KEY);
  const result = streamText({
    model: "openai/gpt-5-nano",
    prompt: "Invent a new holiday and describe its traditions.",
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log("Token usage:", await result.usage);
  console.log("Finish reason:", await result.finishReason);
}

main().catch(console.error);
