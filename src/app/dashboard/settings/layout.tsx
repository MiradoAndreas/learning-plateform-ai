import React from "react";
import { SettingsLayout } from "@/modules/account-settings/ui/layouts/settings-layout";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <SettingsLayout>{children}</SettingsLayout>;
};

export default Layout;
