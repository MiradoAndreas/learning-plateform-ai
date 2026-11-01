# Roadmap backend

Roadmap generation uses one structured-output request to `nvidia/nemotron-3-ultra-550b-a55b`.
The response includes all 6–16 phases, detailed topics, coverage checklist and
technology choices. The prompt combines planning, prerequisite/coverage auditing
and choice selection; no per-phase agents or follow-up model passes run.
Local normalization ensures unique IDs and one recommended option per choice,
then returns the existing title, summary and roadmapData contract. Questionnaire,
project, quiz and submission models remain unchanged.

```text
roadmap/
  action.ts, mutation.ts, queries.ts   Existing public endpoints
  internal.ts                         Core lifecycle and historical internal aliases
  access.ts                           Shared roadmap ownership checks
  constants.ts                        Existing client imports and dashboard limit
  validators.ts                       Persisted roadmap validators
  generation/
    pipeline.ts                       Single-call generation and local normalization
    stages.ts                         Legacy stage helpers (unused by roadmap generation)
    schemas.ts                        Stage response schemas and inferred types
    prompts.ts                        Prompt builders and context formatting
    merge.ts                          Pure merge and unique-ID assignment
    constants.ts                      Professional-domain reference list
  questions/
    generation.ts                     Questionnaire prompt, AI schema and generator
    model.ts                          Indexed reader and key normalization
    internal.ts                       Existing query/mutation registrations
    constants.ts                      Fixed learning-resource question
  projects/
    generation.ts                     Project schema and generation implementation
    model.ts                          Shared indexed reader
    internal.ts                       Existing query/mutation registrations
    validators.ts, constants.ts       Project fields and skill levels
  progress/
    generation.ts                     Quiz schema, cache lookup and generation
    model.ts                          Node ordering, unlocking and quiz projection
    internal.ts                       Existing query/mutation registrations
    validators.ts, constants.ts       Quiz fields and existing scoring settings
  submissions/
    archive.ts                        File selection, batching and formatting
    review.ts                         Analysis/synthesis schemas and implementation
    internal.ts                       Existing persistence endpoints
    mutation.ts, queries.ts           Existing public endpoints
    validators.ts, constants.ts       Submission status and archive/review settings
    submissions*Action.ts             Historical durable-workflow action paths
    submissionsWorkflow*.ts           Existing workflow and completion paths
  tests/                              Generation and structure regressions
```

The root action module owns endpoint registration and roadmap lifecycle transitions.
Existing persistence, status transitions and failure handling remain unchanged.
Legacy stage helpers remain for historical regression coverage.

Run checks from the repository root:

```sh
node --test convex/tests/*.test.cjs convex/roadmap/tests/*.test.cjs
node node_modules/eslint/bin/eslint.js convex/roadmap/generation --max-warnings 0
node node_modules/typescript/bin/tsc --noEmit -p convex/tsconfig.json
```

Tests mock the model to verify call count, model selection, personalization,
response normalization and error propagation without spending inference credits.
Live latency, token cost and educational quality require a representative live
comparison; fewer requests alone do not guarantee lower total token cost.

## Verifying the active model

The browser calls `roadmap/action:submitAnswersAndGenerateRoadmap` on
`NEXT_PUBLIC_CONVEX_URL`; restarting Next.js alone does not update Convex code.
After changing the backend, push to the matching dev deployment with
`npx convex dev --once` (production requires a separate deployment).

Each generation emits `roadmap.generation.started` and
`roadmap.generation.completed` (or `roadmap.generation.failed`) with the requested model, response model,
AI Gateway generation ID, duration and token usage. No prompts or credentials
are logged. Use that generation ID to correlate the request in the Vercel
team's AI Gateway logs; Convex authenticates using its own deployed
`AI_GATEWAY_API_KEY`, independently of the local `.env.local` file.
Questionnaire, tutor, project and review calls intentionally use their other
configured models. The historical frontend helper re-exports the same roadmap
pipeline so it cannot reintroduce the former multi-stage generator.

Nemotron 3 Ultra is eligible for Vercel AI Gateway free credits, subject to the
team's remaining credit balance and free-tier rate limits. This is the Gateway
model, not the OpenRouter `:free` endpoint; requests use the existing deployed
`AI_GATEWAY_API_KEY` and retain structured-output validation.
