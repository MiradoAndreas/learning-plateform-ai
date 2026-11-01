"use client";

import Link from "next/link";
import { PlusIcon, ArrowRightIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";
import { DASHBOARD_ROADMAP_LIMIT } from "../../../../../convex/roadmap/constants";
import { RoadmapCard } from "../components/roadmap-card";
import { EmptyRoadmapsState } from "../components/empty/empy-roadmap-state";

export const DashboardRoadmapsSection = () => {
  const roadmaps = useQuery(api.roadmap.queries.getRecentRoadmaps, {});

  const isLoading = roadmaps === undefined;
  const hasMore = (roadmaps?.length ?? 0) > DASHBOARD_ROADMAP_LIMIT;
  const displayedRoadmaps = roadmaps?.slice(0, DASHBOARD_ROADMAP_LIMIT) ?? [];

  return (
    <section className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-x-2">
        <div>
          <h2 className="text-lg font-semibold">Vos roadmaps</h2>
          <p className="text-sm text-muted-foreground">
            Reprenez où vous en étiez ou lancez un nouveau parcours
          </p>
        </div>
        <Button asChild size="sm" className="gap-x-1.5">
          <Link href="/dashboard/ai/roadmap">
            <PlusIcon className="h-4 w-4" />
            Nouvelle roadmap
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      ) : displayedRoadmaps.length === 0 ? (
        <EmptyRoadmapsState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap._id} roadmap={roadmap} />
            ))}
          </div>

          {hasMore && (
            <Link
              href="/dashboard/roadmaps"
              className="flex items-center gap-x-1 self-start text-sm font-medium text-primary hover:underline"
            >
              Voir toutes mes roadmaps
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      )}
    </section>
  );
};
