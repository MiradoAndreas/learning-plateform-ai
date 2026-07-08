import { inngest } from "@/inngest/client";
import { processTask } from "@/inngest/function";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask],
});
