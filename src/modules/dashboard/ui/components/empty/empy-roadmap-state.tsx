import Link from "next/link";
import { CompassIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptyRoadmapsState = () => {
  return (
    <div className="flex flex-col items-center gap-y-3 rounded-lg border border-dashed p-10 text-center">
      <CompassIcon className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Aucune roadmap pour le moment</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Décrivez ce que vous voulez apprendre, l&apos;IA construit un parcours
          sur mesure pour vous.
        </p>
      </div>
      <Button asChild size="sm" className="gap-x-1.5">
        <Link href="/dashboard/ai/roadmap">
          <PlusIcon className="h-4 w-4" />
          Créer ma première roadmap
        </Link>
      </Button>
    </div>
  );
};
