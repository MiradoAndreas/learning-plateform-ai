// Footer.tsx (version avec animations)
"use client";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

import { motion } from "framer-motion";

// Animation easing style Apple
const appleEasing = [0.16, 1, 0.3, 1] as const;

// Variants pour les animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: appleEasing },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: appleEasing },
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

export const Footer = () => {
  const footerNavs = [
    {
      label: "AI Tutor",
      items: [
        { href: "/about", name: "À propos d'AI Tutor" },
        { href: "/how-it-works", name: "Comment ça marche" },
        { href: "/pricing", name: "Tarifs" },
        { href: "/contact", name: "Contact" },
      ],
    },
    {
      label: "Produit",
      items: [
        { href: "/#fonctionnalites", name: "Roadmaps générées par IA" },
        { href: "/#fonctionnalites", name: "Tuteur IA intégré" },
        { href: "/#fonctionnalites", name: "Quiz de progression" },
        { href: "/#fonctionnalites", name: "Projets corrigés par IA" },
      ],
    },
    {
      label: "Ressources",
      items: [
        { href: "/blog", name: "Blog & Conseils" },
        { href: "/#faq", name: "FAQ" },
        { href: "/support", name: "Support" },
      ],
    },
    {
      label: "Légal",
      items: [
        { href: "/terms", name: "Conditions d’utilisation" },
        { href: "/privacy", name: "Politique de confidentialité" },
      ],
    },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
      className="relative z-100 rounded-t-4xl border-t border-border/40 bg-background pt-16 pb-16 dark:bg-gray-950/95"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Newsletter */}
        <motion.div
          variants={fadeUp}
          className="items-center justify-between gap-10 md:flex"
        >
          <div className="max-w-xl">
            <motion.h3
              variants={fadeUp}
              className="text-2xl font-bold text-foreground"
            >
              Reçois des conseils pour apprendre plus efficacement
            </motion.h3>
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.05 }}
              className="mt-2 text-muted-foreground"
            >
              Astuces d'apprentissage, nouveautés produit et ressources
              gratuites directement dans ta boîte mail.
            </motion.p>
          </div>

          <motion.form
            variants={scaleIn}
            transition={{ delay: 0.1 }}
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex gap-3 md:mt-0"
          >
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Input
                type="email"
                required
                placeholder="Ton adresse email"
                className="h-full w-full rounded-lg border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <InteractiveHoverButton className="w-[230px] md:w-[300px]">
                S'inscrire
              </InteractiveHoverButton>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Navigation */}
        <motion.div
          variants={staggerContainer}
          className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {footerNavs.map((section, sectionIdx) => (
            <motion.ul
              key={section.label}
              variants={fadeUp}
              custom={sectionIdx}
              className="space-y-4"
            >
              <motion.h4
                variants={fadeUp}
                className="font-semibold text-foreground"
              >
                {section.label}
              </motion.h4>
              {section.items.map((item, itemIdx) => (
                <motion.li
                  key={item.name}
                  variants={fadeUp}
                  custom={sectionIdx * 10 + itemIdx}
                >
                  <Link
                    href={item.href}
                    className="inline-block text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/50 py-8 md:flex-row"
        >
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Tutor. Apprendre aujourd’hui,
            réussir demain.
          </motion.p>

          {/* <motion.div variants={scaleIn}>
            <FooterLink />
          </motion.div> */}
        </motion.div>

        {/* Logo géant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="pointer-events-none inset-x-0 mt-20 bg-linear-to-b from-muted-foreground/20 via-muted-foreground/10 to-transparent bg-clip-text text-center text-5xl font-bold text-transparent uppercase select-none md:text-9xl lg:text-[12rem] xl:text-[13rem] dark:from-gray-800 dark:via-gray-800/50 dark:to-transparent">
            AI Tutor
          </h1>
        </motion.div>
      </div>
    </motion.footer>
  );
};
