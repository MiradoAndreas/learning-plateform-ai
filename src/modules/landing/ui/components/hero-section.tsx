"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Silk } from "../components/silk";
import { CardNav, type CardNavItem } from "../components/card-nav";

// Animation easing style Apple — cohérent avec le Footer
const appleEasing = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: appleEasing },
  },
};

const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: appleEasing },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const NAV_ITEMS: CardNavItem[] = [
  {
    label: "Produit",
    bgColor: "#1B1722",
    textColor: "#fff",
    links: [
      {
        label: "Roadmaps IA",
        href: "#fonctionnalites",
        ariaLabel: "Roadmaps générées par IA",
      },
      {
        label: "Tuteur intégré",
        href: "#fonctionnalites",
        ariaLabel: "Tuteur IA intégré",
      },
      {
        label: "Projets & quiz",
        href: "#fonctionnalites",
        ariaLabel: "Projets et quiz de progression",
      },
    ],
  },
  {
    label: "Ressources",
    bgColor: "#2F293A",
    textColor: "#fff",
    links: [
      { label: "Tarifs", href: "/pricing", ariaLabel: "Voir les tarifs" },
      { label: "FAQ", href: "/#faq", ariaLabel: "Questions fréquentes" },
    ],
  },
  {
    label: "Compte",
    bgColor: "#2F293A",
    textColor: "#fff",
    links: [
      { label: "Se connecter", href: "/sign-in", ariaLabel: "Se connecter" },
      {
        label: "Créer un compte",
        href: "/sign-up",
        ariaLabel: "Créer un compte",
      },
    ],
  },
];

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      <motion.div initial="hidden" animate="show" variants={fadeDown}>
        <CardNav
          brandName="AI Tutor"
          logoSrc="/icon.svg"
          items={NAV_ITEMS}
          ctaLabel="Commencer"
          ctaHref="/sign-up"
          baseColor="#ffffff"
          menuColor="#111111"
          buttonBgColor="#6366F1"
          buttonTextColor="#ffffff"
        />
      </motion.div>

      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full bg-background" />}>
          <Silk
            speed={4}
            scale={1}
            color="#6366F1"
            noiseIntensity={1.2}
            rotation={0}
          />
        </Suspense>
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="relative z-10 mx-auto my-38 flex max-w-2xl flex-col items-center gap-y-6 px-4 text-center md:my-40"
      >
        <motion.h1
          variants={fadeUp}
          className="text-3xl font-semibold tracking-tight sm:text-5xl"
        >
          Un parcours sur mesure pour maîtriser n'importe quel sujet.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          Décrivez ce que vous voulez apprendre. L&apos;IA construit votre
          roadmap, vous accompagne avec un tuteur intégré, et valide votre
          progression grâce à des quiz et des projets corrigés automatiquement.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="gap-x-1.5">
            <Link href="/sign-up">
              Commencer gratuitement
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Se connecter</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};
