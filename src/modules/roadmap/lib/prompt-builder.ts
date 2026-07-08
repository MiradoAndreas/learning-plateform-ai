export function buildPrompt(topic: string) {
  return `
Généré un roadmap très détaillé pour:

${topic}

Return:

- title: Le titre explicite et précis du roadmap, qui reflète clairement le sujet et la progression
- summary: Un résumé substantiel en 4 à 6 phrases qui explique la philosophie du parcours, les prérequis éventuels, la progression logique des étapes, et le résultat attendu en fin de parcours
- mermaid: Un diagramme Mermaid complet et structuré (format flowchart) représentant le roadmap avec une granularité fine incluant :
  - Les grandes phases ou niveaux (niveau 1)
  - Les sous-thèmes ou modules par phase (niveau 2)
  - Les compétences, outils ou concepts clés par module (niveau 3)
  - Des liens de dépendance ou de progression entre les étapes si pertinent

Structure obligatoire du Mermaid :
- Alterne la direction des sous-graphes de la façon suivante : VERTICAL puis HORIZONTAL puis VERTICAL puis HORIZONTAL puis VERTICAL, etc.
- Exemple : Phase 1 (vertical) → ses sous-modules (horizontal) → Phase 2 (vertical) → ses sous-modules (horizontal) → Phase 3 (vertical) → etc.
- Utilise les syntaxes TB (Top-Bottom) pour le vertical et LR (Left-Right) pour l'horizontal

Règle stricte pour le mermaid généré :
- TOUS les labels de nœuds doivent être entourés de guillemets doubles, ex: A["Mon label"]
- N'utilise JAMAIS de parenthèses, virgules ou slash non protégés à l'intérieur d'un label non quoté
- Format attendu : id["Texte du label"] et jamais id[Texte du label]
- Respecte le syntaxe du dernier version de mermaid

`;
}
