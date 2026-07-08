import { FormRoadmapSection } from "../sections/form-roadmap-section";
import { HeaderRoadmapSection } from "../sections/header-roadmap-section";
import { ResultRoadmapSection } from "../sections/result-roadmap-section";

export const RoadmapView = () => {
  return (
    <div className="flex w-full flex-col gap-y-4 px-4 pt-6 md:gap-y-6 md:px-6 md:pt-10">
      <HeaderRoadmapSection />
      <FormRoadmapSection />
      {/* todo: we can remove result roadmap section and add a redirection after  */}
      <ResultRoadmapSection />
    </div>
  );
};
