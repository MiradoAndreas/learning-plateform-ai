import { RoadmapLearnView } from "@/modules/my-roadmap/ui/views/roadmap-learn-view";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Navbar } from "@/modules/dashboard/ui/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant de roadmap",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Navbar title="My Roadmap" />
      <RoadmapLearnView roadmapId={id as Id<"roadmaps">} />
    </>
  );
}
