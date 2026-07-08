import { ContentLayout } from "@/modules/dashboard/ui/layouts/content-layout";
import { MyRoadMapView } from "@/modules/roadmap/ui/views/my-roadmap-view";

const MyRoadmapPage = () => {
  return (
    <ContentLayout title="My Roadmap">
      <MyRoadMapView />
    </ContentLayout>
  );
};

export default MyRoadmapPage;
