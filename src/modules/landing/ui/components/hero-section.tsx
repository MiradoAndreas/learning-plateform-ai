import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export const HeroSection = () => {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          {/* Titre principal */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-foreground">Power IA Assisant</span>
            <br />
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              AITutor customizable
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            La seule intelligence tutor qui vous permette d&apos;apprendre avec
            votre <span className="text-primary">rythme</span> et bien evidement
            votre <span className="text-primary">préference</span>
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <InteractiveHoverButton className="py-4">
              Obtenir mon roadmap
            </InteractiveHoverButton>
          </div>
        </div>
      </div>
    </section>
  );
};
