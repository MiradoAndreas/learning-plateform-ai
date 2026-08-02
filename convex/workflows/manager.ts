import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "../_generated/api";

export const workflow = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    // Limite le nombre de lots analysés en parallèle par soumission,
    // pour éviter qu'une seule soumission n'accapare tous les appels LLM.
    maxParallelism: 4,
  },
});
