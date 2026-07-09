import { RoadmapLearnView } from "@/modules/my-roadmap/ui/views/my-roadmap-view";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Navbar } from "@/modules/dashboard/ui/components/navbar";

interface RoadmapIdProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: RoadmapIdProps) => {
  const { id } = await params;
  return (
    <>
      <Navbar title="Workspace Learning" />
      <RoadmapLearnView roadmapId={id as Id<"roadmaps">} />
    </>
  );
};

export default Page;
