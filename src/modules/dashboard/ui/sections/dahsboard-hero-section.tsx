import { SparklesIcon, MessageCircleIcon, FolderCheckIcon } from "lucide-react";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Roadmaps sur mesure",
    description:
      "L'IA transforme n'importe quel sujet en parcours d'apprentissage structuré, adapté à votre niveau et vos objectifs.",
  },
  {
    icon: MessageCircleIcon,
    title: "Tuteur IA intégré",
    description:
      "Posez vos questions directement sur chaque étape de la roadmap et obtenez des explications personnalisées.",
  },
  {
    icon: FolderCheckIcon,
    title: "Projets évalués par IA",
    description:
      "Validez vos acquis avec des quiz et des projets pratiques, corrigés automatiquement avec un retour détaillé.",
  },
];

export const DashboardHeroSection = () => {
  return (
    <section className="flex flex-col gap-y-6 rounded-lg border bg-gradient-to-br from-primary/5 via-background to-background p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Bienvenue sur votre espace d&apos;apprentissage
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Cette plateforme génère des roadmaps d&apos;apprentissage
          personnalisées par IA, vous accompagne avec un assistant dédié à
          chaque étape, et évalue vos projets pratiques pour mesurer votre
          progression réelle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-y-2 rounded-lg border bg-background/60 p-4"
          >
            <feature.icon className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{feature.title}</p>
            <p className="text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
