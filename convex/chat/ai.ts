import { generateText, Output } from "ai";
import { z } from "zod";
import { openai } from "../../ai";

type ChatContext = {
  topic: string;
  title?: string;
  summary?: string;
  mermaid?: string;
};

type ChatHistoryMessage = { role: "user" | "assistant"; content: string };

const chatReplySchema = z.object({
  content: z.string().describe("La réponse pédagogique en texte."),
  mermaid: z
    .string()
    .nullable()
    .describe(
      "Un diagramme mermaid (flowchart, sequenceDiagram, etc.) UNIQUEMENT si le sujet expliqué est complexe (plusieurs étapes, processus, relations entre concepts, architecture). " +
        "Mets null si l'explication est simple, courte, ou qu'un texte suffit largement. Ne force jamais un diagramme artificiel.",
    ),
});

function buildSystemPrompt(context: ChatContext) {
  return `
Tu es un expert en pédagogie et en création de diagrammes Mermaid.

Tu aides un utilisateur à apprendre :

${context.topic}

Roadmap :

Titre : ${context.title ?? context.topic}

Résumé :

${context.summary ?? "N/A"}

Diagramme global :

${context.mermaid ?? "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIF

Retourne :

1. une explication pédagogique dans "content"

2. un diagramme Mermaid dans "mermaid" UNIQUEMENT lorsqu'il améliore réellement la compréhension.

Le diagramme doit représenter la logique du concept.

Ne crée jamais un diagramme juste pour décorer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STYLE DES DIAGRAMMES

Pour les sujets simples :

- 3 à 6 nœuds

Pour les sujets intermédiaires :

- 6 à 12 nœuds

Pour les sujets complexes :

- 12 à 20 nœuds

Le diagramme doit montrer :

- les relations
- les dépendances
- les branches
- les décisions
- les sous-processus
- les chemins alternatifs

Privilégie une structure arborescente riche plutôt qu'une simple chaîne linéaire.

Évite les diagrammes du type :

A --> B --> C --> D

Préfère :

flowchart TD

A["Concept principal"]

A --> B["Étape 1"]
A --> C["Étape 2"]
A --> D["Étape 3"]

B --> E["Détail"]

B --> F["Alternative"]

C --> G["Résultat"]

C --> H["Exception"]

D --> I["Optimisation"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYNTAXE OBLIGATOIRE

Toujours commencer par :

flowchart TD

Utiliser uniquement :

A
B
C
D
E
F
G
H
I
J
K
L
M
N
O
P
Q
R
S
T

Tous les textes doivent être entre guillemets.

Toujours écrire :

A["Texte"]

Jamais :

A[Texte]

Les relations autorisées sont uniquement :

A --> B

ou

A -->|"Texte"| B

Ne jamais utiliser :

subgraph

style

classDef

click

linkStyle

HTML

Markdown

\`\`\`

Commentaires

init

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUALITÉ

Le diagramme doit être lisible.

Équilibrer les branches.

Éviter les croisements inutiles.

Limiter à 20 nœuds.

Toujours préférer plusieurs branches plutôt qu'une longue ligne verticale.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXEMPLE 1

flowchart TD

A["Fine-Tuning"]

A --> B["Préparer les données"]

A --> C["Choisir une méthode"]

C --> D["LoRA"]

C --> E["QLoRA"]

C --> F["Adapters"]

D --> G["Entraînement"]

E --> G

F --> G

G --> H["Évaluation"]

H --> I["Déploiement"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXEMPLE 2

flowchart TD

A["Transformer"]

A --> B["Embedding"]

A --> C["Position Encoding"]

B --> D["Attention"]

C --> D

D --> E["Feed Forward"]

E --> F["Output"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avant de retourner le diagramme, vérifie mentalement que :

- tous les crochets sont fermés
- tous les guillemets sont fermés
- chaque nœud possède un identifiant unique
- chaque relation référence un identifiant existant
- le diagramme est compatible Mermaid Flowchart.
`;
}
export async function generateChatReply({
  context,
  history,
}: {
  context: ChatContext;
  history: ChatHistoryMessage[];
}) {
  const { output } = await generateText({
    model: openai("gpt-5-nano"),
    system: buildSystemPrompt(context),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    output: Output.object({ schema: chatReplySchema }),
  });

  return output;
}
