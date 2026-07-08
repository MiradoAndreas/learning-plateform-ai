import { Badge } from "@/components/ui/badge";

type Status =
  | "draft"
  | "generating_questions"
  | "awaiting_answers"
  | "generating_roadmap"
  | "completed"
  | "failed";

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: {
    label: "Brouillon",
    variant: "outline",
  },
  generating_questions: {
    label: "Questions en cours",
    variant: "secondary",
  },
  awaiting_answers: {
    label: "En attente de réponses",
    variant: "secondary",
  },
  generating_roadmap: {
    label: "Génération...",
    variant: "secondary",
  },
  completed: {
    label: "Terminé",
    variant: "default",
  },
  failed: {
    label: "Échec",
    variant: "destructive",
  },
};

type RoadmapStatusBadgeProps = {
  status: Status;
};

export const RoadmapStatusBadge = ({ status }: RoadmapStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
