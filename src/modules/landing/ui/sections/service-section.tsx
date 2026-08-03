"use client";

import { motion } from "framer-motion";
import { MagicBento } from "../components/magic-bento";

const appleEasing = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: appleEasing,
    },
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

export const ServiceSection = () => {
  return (
    <section id="fonctionnalites" className="container mx-auto px-4 py-24">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-6xl"
      >
        <motion.div variants={fadeUp} className="mb-16 text-center">
          <p className="text-sm font-medium text-primary">Fonctionnalités</p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Tout ce qu'il faut pour apprendre efficacement
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            De la génération du parcours jusqu'à la correction de vos projets,
            l'IA vous accompagne à chaque étape.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <MagicBento
            textAutoHide
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt={false}
            enableMagnetism
            clickEffect
            spotlightRadius={300}
            particleCount={12}
            glowColor="99, 102, 241"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
