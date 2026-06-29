"use client";
import Hyperspeed from "@/components/hyper-speed";
import { useMemo } from "react";
import { NavBar } from "../components/navbar";
import { HeroSection } from "../components/hero-section";

export const HeroView = () => {
  const effectOptions = useMemo(
    () => ({
      // Distortion settings
      distortion: "turbulentDistortion",
      length: 600,
      roadWidth: 12,
      islandWidth: 3,
      lanesPerRoad: 4,

      // Camera settings
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,

      // Car light settings
      carLightsFade: 0.4,
      carLightsLength: [12, 80],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],

      // Side stick settings
      totalSideLightSticks: 20,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],

      // Speed settings
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],

      // Colors adaptés au thème global
      colors: {
        // Utilisation des couleurs du thème
        roadColor: 0x1a1a2e, // Correspond au background dark
        islandColor: 0x16213e, // Version légèrement plus claire
        background: 0x0a0a0a, // Fond noir
        shoulderLines: 0xffffff, // Blanc pur
        brokenLines: 0xffffff, // Blanc pur
        leftCars: [
          0xd856bf, // Primary color (votre --primary)
          0x6750a2, // Secondary color (votre --secondary)
          0xc247ac, // Accent color
        ],
        rightCars: [
          0x03b3c3, // Bleu cyan
          0x0e5ea5, // Bleu profond
          0x324555, // Bleu-gris
        ],
        sticks: 0x03b3c3, // Cyan pour les sticks
      },
    }),
    [],
  );
  return (
    <>
      {/* Effet Hyperspeed en arrière plan */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Hyperspeed effectOptions={effectOptions} />
      </div>

      <NavBar />
      <HeroSection />

      <div className="h-100" />
    </>
  );
};
