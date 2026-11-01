"use client";

import { DashboardHeroSection } from "../sections/dahsboard-hero-section";
import { DashboardRoadmapsSection } from "../sections/dashboard-roadmaps-section";

export const DashboardView = () => {
  return (
    <div className="flex flex-col gap-y-8 p-4 sm:p-6">
      <DashboardHeroSection />
      <DashboardRoadmapsSection />
    </div>
  );
};
