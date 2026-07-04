import AdminPanelLayout from "@/modules/dashboard/ui/layouts/admin-panel-layout";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
};

export default Layout;
