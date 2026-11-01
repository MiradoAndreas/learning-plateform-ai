"use client";

import { useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export function useEnsureRoadmapProjects(roadmapId: Id<"roadmaps">) {
  const projects = useQuery(api.roadmap.queries.getRoadmapProjects, {
    roadmapId,
  });
  const generateRoadmapProjects = useAction(
    api.roadmap.action.generateRoadmapProjects,
  );
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (projects === undefined) return; // encore en chargement
    if (projects.length > 0) return; // déjà générés : on fetch juste, comme demandé
    if (hasTriggeredRef.current) return; // déjà déclenché pour ce montage

    hasTriggeredRef.current = true;
    generateRoadmapProjects({ roadmapId }).catch(() => {
      hasTriggeredRef.current = false; // permet un nouvel essai si erreur réseau
    });
  }, [projects, roadmapId, generateRoadmapProjects]);

  return projects;
}
