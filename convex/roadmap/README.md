# Roadmap backend

This folder groups code by responsibility. The refactor changes organization only:
public/internal function paths, schemas, prompts, model choices, thresholds,
ordering, workflow references, and business behavior stay unchanged.

```text
roadmap/
  action.ts, mutation.ts, queries.ts   Existing public endpoints
  internal.ts                         Core lifecycle and historical internal aliases
  access.ts                           Shared roadmap ownership checks
  constants.ts                        Existing client imports and dashboard limit
  validators.ts                       Persisted roadmap validators
  generation/
    pipeline.ts                       Multi-stage generation orchestration
    stages.ts                         Stage functions and shared AI request setup
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

The root action module owns endpoint registration and roadmap lifecycle transitions;
project and quiz implementation lives with its domain. Plain model functions are
shared by endpoint handlers. Generation stages share one AI request implementation,
while prompt construction, response validation, and pure merging remain separate.
Small single-function question/helper and archive files were consolidated. Unused
generation schemas and the repeated left/right topic-list schema were removed.

The longer historical submission filenames remain because renaming a Convex module
changes its function address, including references already stored by durable
workflows. Review action files are now thin registrations that delegate to one
implementation module. The refactor registers no additional endpoints.

Only necessary surrounding references were updated: imports in the existing
frontend generator, paths in the existing regression suite, and generated Convex
API bindings. No frontend behavior, tables, auth policy, or dependency configuration
was changed.

Run checks from the repository root:

```sh
node --test convex/tests/refactor.test.cjs convex/roadmap/tests/structure.test.cjs
node node_modules/eslint/bin/eslint.js convex/roadmap --max-warnings 0
node node_modules/typescript/bin/tsc --noEmit -p convex/tsconfig.json
```

Request fingerprints were captured before this refactor and verify exact model,
prompt, response-schema and output parity for every generation stage. Additional
checks cover parallel phase generation, merge ordering, unchanged endpoint inventory,
ownership failures and cached results. The broader existing suite verifies database
schema and historical endpoint contracts, submissions, ZIP processing and chat.

The existing nullable-option-note type mismatch in `generation/merge.ts` is
intentionally preserved; correcting its data policy would change behavior. Root
TypeScript checks also contain previously identified frontend errors. Deployment
is outside the scope of this structural cleanup.

Verification result: all 33 regression tests pass; ESLint and read-only Convex
code generation/bundling pass. Production TypeScript modules decreased from 44 to 39.
The backend typecheck reports only the pre-existing nullable-note mismatch.
