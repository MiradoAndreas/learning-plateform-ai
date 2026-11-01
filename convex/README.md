# Convex backend

The backend is organized by domain. Persisted table names and historical function
paths are compatibility contracts, so this refactor keeps them intact.

## Layout

```text
convex/
  schema.ts                  Schema composition only
  tables/                    All application table definitions and indexes
    profiles.ts
    roadmaps.ts
    chat.ts
    progress.ts
    projects.ts
    submissions.ts
  lib/
    auth.ts                  Shared identity check
    documents.ts             Response validators derived from table definitions
  ai/
    constants.ts             Existing model names and embedding settings
    provider.ts              Shared backend OpenAI provider
  agents/
    learning.ts
    projectReview.ts
  profiles/                  Profile and auth response validators
  chat/
    queries.ts               Public reads
    mutation.ts              Public transactional writes (historical API path)
    action.ts                AI calls and title scheduling (historical API path)
    internal.ts              Internal endpoints
    data.ts                  Indexed reads and session ownership checks
    prompts.ts               Existing tutor prompt builder
    constants.ts
    validators.ts
  roadmap/
    queries.ts, mutation.ts, action.ts
    internal.ts              Core lifecycle endpoints and compatibility exports
    access.ts                Roadmap ownership check
    validators.ts            Persisted roadmap structure and status validators
    constants.ts             Stable client imports; re-exports domain constants
    ai.ts                    Existing multi-stage roadmap generation orchestration
    generation/              Skeleton, details, gap audit, choices, pure merge
    questions/               Question generation, prompts, normalization and persistence
    projects/                Project fields, skill levels, generation schema and persistence
    progress/                Quiz fields, generation schema, ordering and unlocking
    submissions/             Submission/batch persistence, review actions and workflow
      constants.ts           Thresholds, archive filters and safety budgets
      files.ts               Archive path selection
      chunking.ts            File batching and formatting, independent of storage/DB
      aiSchemas.ts           AI analysis and synthesis response schemas
      validators.ts          Persisted submission status
      internal.ts            Internal submission and file-batch endpoints
  workflows/                 Workflow manager and concurrency setting
  betterAuth/                Separate Better Auth component and generated schema
  playground/                Existing diagnostic endpoints, retained for compatibility
  tests/                     Local regression tests and pre-refactor contract fixtures
  _generated/                Convex-generated bindings; do not edit manually
```

Tables import validators and constants, never endpoint implementations. Query and
mutation endpoints reuse plain domain helpers; actions keep external I/O outside
transactions. AI schemas and prompts are separate from database validators.

The singular `action.ts` and `mutation.ts` filenames remain because changing them
would rename client-facing functions. `roadmap/internal.ts` re-exports canonical
domain endpoints with their old names. Both historical submission-completion paths
re-export the same registered handler. This also preserves references held by
scheduled work and durable workflows. The aliases contain no copied handlers.

Better Auth's application integration and component/CLI configuration have
intentional differences (including social-provider configuration); they were not
merged. Its generated files and table schema retain their original contents.

## Consolidated and removed code

- One canonical thread table replaces the unused duplicate in `chat/chat.ts`.
- Roadmap tables no longer share files with unrelated validators or submission tables.
- Shared identity, roadmap ownership, session lookup and session ownership checks.
- Shared indexed question/project readers and client quiz projection.
- One workflow completion handler replaces two identical implementations.
- Skill levels now generate the Convex enum directly, eliminating manual synchronization.
- Quiz thresholds, title limits, AI model names, review concurrency and archive budgets
  have dedicated owners. Frontend constant imports remain compatible.
- The active question generator and its exact prompt/schema now live inside Convex;
  the unused alternative generator with an extra category field was removed.
- Unreachable Mermaid chat generation, the unused orchestrator/tutor/roadmap agent
  chain, unused generic helpers/validators, an unregistered learning-profile table,
  and an empty Better Auth users file were removed. Active agents use corrected names.
- ZIP batching, node unlocking and tutor prompt construction are independently testable.

## Verification

```sh
node --test convex/tests/refactor.test.cjs
node node_modules/eslint/bin/eslint.js convex --ignore-pattern '**/_generated/**'
node node_modules/typescript/bin/tsc --noEmit -p convex/tsconfig.json
node node_modules/typescript/bin/tsc --noEmit --incremental false
npx convex codegen --typecheck disable
```

The 24 regression tests pass. Convex lint passes with no warnings, and read-only
Convex code generation/bundling succeeds. The backend typecheck still reports the
pre-existing nullable-note mismatch; the root check reports the same six original
errors, with no new diagnostics. No frontend or dependency files were changed.

Live deployment verification was not performed: automatic approval review rejected
`convex dev --once` because remote deployment updates were not authorized by the
refactoring request. Local tests do not prove deployed component behavior.

Tests compare the complete persisted schema against the pre-refactor snapshot and
check the visibility, function kind and argument validators of all 61 historical
endpoints. They cover ownership refusals, query ordering/scope, quiz scoring and
idempotence, progress, question normalization, submission summaries, workflow
completion/scheduling/retries, real ZIP extraction, batching limits, and chat limits.
Fingerprints captured from the original implementations check exact ZIP processing
and tutor prompt parity. The active old/new question generation schemas, prompts and
model selections are also compared. No tests require credentials or paid AI calls.

The tests run registered handlers with local contexts, and use the real JSZip
parser and installed function-registration libraries. They do not replace deployed
component integration tests, production-data validation, or live model evaluation.
AI SDK message parts and metadata remain extensible payloads inside an explicitly
validated message envelope. Better Auth/RAG return validators reuse component schemas.

## Existing issues intentionally left for separate behavior changes

- `generation/merge.ts` has a pre-existing type error: generated option notes may be
  `null`, whereas persisted/frontend option notes are optional strings. Resolving it
  requires choosing a normalization or schema policy; this refactor preserves the
  existing output and persisted schema.
- The root TypeScript check also has existing failures in the auth client provider,
  a missing Mermaid component import, roadmap node selection types, and missing
  roadmap flow props. They are outside this refactor's scope.
- `generateQuestionsAction` and `submitAnswersAndGenerateRoadmap` lack ownership
  checks. `sendMessage` verifies session ownership but does not verify that its
  supplied roadmap belongs to that session. Address these in an authorization change;
  adding checks here would change existing behavior. Existing unauthenticated auth
  upload/image helpers and playground endpoints are likewise retained.
- Existing indexed list queries still return complete result sets. Pagination or
  caps would change API behavior and should be coordinated with frontend callers.
- The existing tutor preference lookup uses `learning_resource`, while the fixed
  questionnaire key is `preferred_learning_resource`. Prompt behavior is preserved.
- Compatibility exports can be retired in a later API migration after callers and
  durable workflow references have been accounted for.
