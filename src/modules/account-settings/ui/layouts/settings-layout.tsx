import React from "react";
import { LinkSettingSection } from "../sections/link-settings-section";
import { Navbar } from "@/modules/dashboard/ui/components/navbar";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <>
      <Navbar title="Settings" />
      <div className="px-4 pt-8 pb-8 sm:px-8">
        <div className="flex flex-col gap-y-5 md:gap-y-7">
          <div className="flex flex-col gap-y-1">
            <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and set e-mail preferences
            </p>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row">
            <LinkSettingSection />
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
