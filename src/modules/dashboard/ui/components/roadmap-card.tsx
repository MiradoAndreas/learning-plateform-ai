"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { RoadmapStatusBadge } from "./roadmap-status-badge";

type RoadmapCardProps = {
  roadmap: Doc<"roadmaps">;
};

export const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  const displayTitle = roadmap.title ?? roadmap.topic;
  const isReady = roadmap.status === "completed";

  // Tant que la roadmap n'est pas prête, on renvoie vers la page de suivi
  // de sa génération plutôt que vers l'espace d'apprentissage.
  const href = isReady
    ? `/roadmap/${roadmap._id}/learn`
    : `/roadmap/${roadmap._id}`;

  const formattedDate = new Date(roadmap._creationTime).toLocaleDateString(
    "fr-FR",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <Link
      href={href}
      className="group flex flex-col gap-y-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-x-2">
        <RoadmapStatusBadge status={roadmap.status} />
        <span className="text-[10px] text-muted-foreground">
          {formattedDate}
        </span>
      </div>

      <div>
        <p className="line-clamp-2 text-sm font-semibold">{displayTitle}</p>
        {roadmap.summary && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {roadmap.summary}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-x-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        {isReady ? "Continuer l'apprentissage" : "Reprendre la configuration"}
        <ArrowRightIcon className="h-3 w-3" />
      </div>
    </Link>
  );
};
