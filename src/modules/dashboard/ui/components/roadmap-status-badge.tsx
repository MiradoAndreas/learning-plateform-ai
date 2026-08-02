import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  generating_questions: "Génération des questions...",
  awaiting_answers: "En attente de réponses",
  generating_roadmap: "Génération en cours...",
  completed: "Prête",
  failed: "Échec",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  generating_questions:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  awaiting_answers:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  generating_roadmap:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

type RoadmapStatusBadgeProps = {
  status: string;
};

export const RoadmapStatusBadge = ({ status }: RoadmapStatusBadgeProps) => {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.draft,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};
