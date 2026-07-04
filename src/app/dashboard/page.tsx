import { isAuthenticated } from "@/lib/auth-server";
import { ContentLayout } from "@/modules/dashboard/ui/layouts/content-layout";
import { redirect } from "next/navigation";

const Page = async () => {
  const hasToken = await isAuthenticated();
  if (!hasToken) {
    redirect("/sign-in");
  }

  return (
    <ContentLayout title="Dashboard">
      <div>Hello World</div>
    </ContentLayout>
  );
};

export default Page;
