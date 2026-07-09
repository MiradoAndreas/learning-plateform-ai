import Link from "next/link";
import { ArrowRightIcon, CalendarIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoadmapStatusBadge } from "./my-roadmap-status-badge";
import { Id } from "../../../../../convex/_generated/dataModel";

type RoadmapCardProps = {
  roadmapId: Id<"roadmaps">;
  topic: string;
  title?: string;
  summary?: string;
  status:
    | "draft"
    | "generating_questions"
    | "awaiting_answers"
    | "generating_roadmap"
    | "completed"
    | "failed";
  createdAt: number;
};

export const RoadmapCard = ({
  roadmapId,
  topic,
  title,
  summary,
  status,
  createdAt,
}: RoadmapCardProps) => {
  // http://localhost:3000/dashboard/ai/library/roadmap
  return (
    <Link href={`/dashboard/ai/library/roadmap/${roadmapId}`} className="block">
      <Card className="transition-colors hover:border-primary/50 hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="line-clamp-1">{title ?? topic}</CardTitle>
          <CardDescription className="line-clamp-1">
            {summary ?? topic}
          </CardDescription>
          <CardAction>
            <RoadmapStatusBadge status={status} />
          </CardAction>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-x-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {new Date(createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-x-1 text-primary">
            Voir
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};
