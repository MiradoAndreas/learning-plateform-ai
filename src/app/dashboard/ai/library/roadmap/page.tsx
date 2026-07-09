import { ContentLayout } from "@/modules/dashboard/ui/layouts/content-layout";
import { MyRoadMapView } from "@/modules/my-roadmap/ui/views/all-my-roadmap-view";

const Page = () => {
  return (
    <ContentLayout title="My Roadmap">
      <MyRoadMapView />
    </ContentLayout>
  );
};

export default Page;
