"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { RoadmapListSkeleton } from "../components/loading/roadmap-list-skeleton";
import { EmptyRoadmapList } from "../components/empty/empty-roadmap-list";
import { RoadmapCard } from "../components/my-roadmap-card";

export const RoadmapListSection = () => {
  const roadmaps = useQuery(api.roadmap.queries.listMyRoadmaps);

  if (roadmaps === undefined) {
    return <RoadmapListSkeleton />;
  }

  if (roadmaps.length === 0) {
    return <EmptyRoadmapList />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {roadmaps.map((roadmap) => (
        <RoadmapCard
          key={roadmap._id}
          roadmapId={roadmap._id}
          topic={roadmap.topic}
          title={roadmap.title}
          summary={roadmap.summary}
          status={roadmap.status}
          createdAt={roadmap._creationTime}
        />
      ))}
    </div>
  );
};
