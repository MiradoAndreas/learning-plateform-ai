import Link from "next/link";
import { MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptyRoadmapList = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-3 rounded-lg border border-dashed py-16 text-center">
      <MapIcon className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Vous n'avez pas encore créé de roadmap
      </p>
      <Button asChild size="sm">
        <Link href="/roadmap/new">Créer ma première roadmap</Link>
      </Button>
    </div>
  );
};
