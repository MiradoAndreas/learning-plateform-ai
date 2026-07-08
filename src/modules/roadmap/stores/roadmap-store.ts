import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

type RoadmapState = {
  roadmapId: Id<"roadmaps"> | null;
  setRoadmapId: (roadmapId: Id<"roadmaps">) => void;
  reset: () => void;
};

export const useRoadmapStore = create<RoadmapState>((set) => ({
  roadmapId: null,
  setRoadmapId: (roadmapId) => set({ roadmapId }),
  reset: () => set({ roadmapId: null }),
}));
