import { RoadmapListSection } from "../sections/roadmap-list-section";

export const MyRoadMapView = () => {
  return (
    <div className="flex w-full flex-col gap-y-6 px-4 py-6 md:py-10">
      <div>
        <h1 className="text-2xl font-semibold">Mes roadmaps</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez toutes les roadmaps que vous avez générées
        </p>
      </div>
      <RoadmapListSection />
    </div>
  );
};
