// src/modules/my-roadmap/lib/roadmap-node-selection.ts

/**
 * Sous-ensemble de `Node` (@xyflow/react) réellement consommé par le flux
 * "sélection d'un sujet à expliquer dans le chat". Un clic réel sur le
 * graphe ReactFlow fournit un `Node` complet (qui satisfait ce type par
 * structural typing) ; un clic sur "Apprendre" dans la modale ne fournit
 * que ces deux champs, sans avoir à mentir sur `position`/`measured`/etc.
 */
export type RoadmapNodeSelection = {
  id: string;
  data: {
    label: string;
    [key: string]: unknown;
  };
};
