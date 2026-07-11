import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";

const app = defineApp();

app.use(betterAuth);
app.use(agent);
app.use(rag);

export default app;
