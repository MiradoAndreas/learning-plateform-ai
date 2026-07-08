import { Navbar } from "@/modules/dashboard/ui/components/navbar";

import { RoadmapView } from "@/modules/roadmap/ui/views/roadmap-view";

const Page = () => {
  return (
    <div>
      <Navbar title="Roadmap" />
      <RoadmapView />
    </div>
  );
};

export default Page;
