import { MagicBento } from "../components/magic-bento";

export const ServiceSection = () => {
  return (
    <section
      className="mt-3 flex flex-col items-center gap-y-10 px-4 py-16 sm:py-24 md:mt-10"
      id="#services"
    >
      <div className="max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Fonctionnalités</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Tout ce qu&apos;il faut pour apprendre efficacement
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          De la génération du parcours jusqu&apos;à la correction de vos
          projets, l&apos;IA vous accompagne à chaque étape.
        </p>
      </div>

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
    </section>
  );
};
