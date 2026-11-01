"use client";

import { FAQ, type FAQCategories, type FAQData } from "@/components/faq-tabs";
import { LiquidEther } from "../components/liquid-either";

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

const CATEGORIES: FAQCategories = {
  roadmaps: "Roadmaps",
  tutor: "Tuteur IA",
  progress: "Progression",
  projects: "Projets",
};

const FAQ_DATA: FAQData = {
  roadmaps: [
    {
      question: "Comment fonctionne la génération d'une roadmap ?",
      answer:
        "Décrivez le sujet que vous voulez apprendre. L'IA vous pose une série de questions sur votre niveau, vos objectifs et vos préférences, puis génère un parcours d'apprentissage structuré en sections, adapté spécifiquement à votre profil.",
    },
    {
      question: "Puis-je avoir plusieurs roadmaps en même temps ?",
      answer:
        "Oui, vous pouvez créer autant de roadmaps que vous le souhaitez, sur des sujets différents, et y accéder à tout moment depuis votre tableau de bord.",
    },
    {
      question: "Que faire si la roadmap générée ne me convient pas ?",
      answer:
        "Vous pouvez répondre différemment aux questions de personnalisation ou créer une nouvelle roadmap sur le même sujet pour obtenir un parcours différent.",
    },
  ],
  tutor: [
    {
      question: "Comment poser une question sur un sujet précis ?",
      answer:
        "Cliquez sur n'importe quel sujet de votre roadmap : un assistant dédié s'ouvre dans un chat, avec le contexte complet de votre roadmap et de vos préférences, pour vous donner des explications personnalisées.",
    },
    {
      question: "Puis-je avoir plusieurs conversations sur le même sujet ?",
      answer:
        "Oui, vous pouvez créer plusieurs discussions distinctes par roadmap, chacune renommée automatiquement selon son contenu, et les retrouver dans l'historique.",
    },
    {
      question: "Y a-t-il une limite au nombre de messages par discussion ?",
      answer:
        "Chaque discussion a une limite d'échanges raisonnable pour garder les réponses pertinentes. Une fois la limite atteinte, vous pouvez simplement démarrer une nouvelle discussion en un clic.",
    },
  ],
  progress: [
    {
      question: "Comment débloquer les sujets suivants de ma roadmap ?",
      answer:
        "Un seul sujet est débloqué au départ. Pour passer au suivant, vous devez valider un quiz généré automatiquement à partir du contenu du sujet en cours.",
    },
    {
      question: "Que se passe-t-il si je rate un quiz ?",
      answer:
        "Vous pouvez le retenter autant de fois que nécessaire. Le sujet suivant reste verrouillé jusqu'à ce que le quiz soit validé.",
    },
  ],
  projects: [
    {
      question: "Comment fonctionnent les projets pratiques ?",
      answer:
        "Chaque roadmap propose un projet par niveau de compétence, du débutant complet à l'expert, avec une description, des objectifs pédagogiques et une durée estimée.",
    },
    {
      question: "Comment soumettre mon projet pour évaluation ?",
      answer:
        "Compressez votre projet en fichier .zip et soumettez-le directement depuis la page du projet. L'IA analyse l'intégralité du code soumis, sans se limiter à un échantillon de fichiers.",
    },
    {
      question: "Comment est calculée la note de mon projet ?",
      answer:
        "L'IA évalue votre projet sur 10 en tenant compte du niveau de compétence visé. Une note de 5/10 ou plus valide le projet comme réussi, avec un résumé détaillant les points forts et les pistes d'amélioration.",
    },
  ],
};

export const FaqSection = () => {
  return (
    <section className="relative overflow-hidden rounded-t-4xl">
      <div className="absolute inset-0" aria-hidden="true">
        <LiquidEther
          colors={["#6366F1", "#818CF8", "#C7D2FE"]}
          mouseForce={14}
          cursorSize={110}
          resolution={0.5}
          autoDemo
          autoSpeed={0.3}
          autoIntensity={1.4}
          takeoverDuration={0.3}
          autoResumeDelay={2500}
          autoRampDuration={0.6}
        />
        {/* Superposition renforcée : le FAQ contient beaucoup de texte dense,
            contrairement au hero, donc le fluide doit rester en arrière-plan discret. */}
        {/* <div className="absolute inset-0 bg-background/85" /> */}
      </div>

      <div className="relative z-10 mt-5 mb-15">
        <FAQ
          className="bg-transparent"
          title="Tous votre question avec les réponses qui vous aide "
          subtitle="Des nombreux messages arrivent sur nous et on a essayé au maximum de regrouper tous les questions fréquents avec des categories"
          categories={CATEGORIES}
          faqData={FAQ_DATA}
        />
      </div>
    </section>
  );
};
