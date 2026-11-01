import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import AdminPanelLayout from "@/modules/dashboard/ui/layouts/admin-panel-layout";
import { ContentLayout } from "@/modules/dashboard/ui/layouts/content-layout";
import { ProgressView } from "@/modules/progress/ui/progress-view";

export default async function ProgressPage() {
  if (!(await isAuthenticated())) redirect("/sign-in");
  return (
    <AdminPanelLayout>
      <ContentLayout title="Progression">
        <ProgressView />
      </ContentLayout>
    </AdminPanelLayout>
  );
}
