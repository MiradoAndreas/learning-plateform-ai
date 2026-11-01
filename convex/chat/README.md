# Tutor retrieval

`sendMessage` verifies the session owner, the session's roadmap, and the roadmap
owner before indexing or searching. The existing agent still handles conversation
history, streaming, titles, and exchange limits. Learning preferences remain in
the system prompt so personalization does not depend on semantic similarity.

`rag.ts` uses the already registered `@convex-dev/rag` component and the existing
Gateway embedding model (`alibaba/qwen3-embedding-0.6b`, 1024 dimensions). The
Convex deployment needs the same `AI_GATEWAY_API_KEY` used by the existing AI
features. No additional provider is required.

Roadmap titles, summaries, sections, topics, and choices are indexed lazily before
the first question. This also covers existing roadmaps without a backfill. A
content hash avoids re-embedding unchanged content; changes replace the keyed
entry and delete the replaced entry. The first question after a change therefore
has additional embedding latency. Namespace isolation includes both the owner
and roadmap ID. A revision filter prevents retrieval from a different content
snapshot during concurrent updates.

Each question retrieves six matches with one neighboring chunk on each side.
Retrieved text is capped at 12,000 characters. The full summary is no longer
inserted into the system prompt. Empty results are explicit, and the prompt asks
the tutor to distinguish general knowledge from roadmap facts. Retrieval failures
propagate instead of silently sending the full document to the language model.

Run the focused tests with `node convex/tests/rag.test.cjs` and backend typechecking
with `npx tsc --noEmit -p convex/tsconfig.json`. These tests mock component calls;
embedding quality and end-to-end streamed answers require a live authenticated
chat session with Gateway credentials.

## Adaptive learning memory

Before answering, the tutor examines the current message and up to four recent
messages using the existing structured-output generation model. It extracts only
explicit understanding, difficulty, pace changes, or requests for deeper explanations, with an
exact supporting quote. Ambiguous feedback is ignored. This adds one model call
before streaming begins; extraction failure is logged and does not block chat.

`learningMemories` stores the latest state per user and normalized topic:
explanation depth (0 foundations, 1 guided practice, 2 advanced, 3 specialized),
pace, latest feedback, evidence, counts, and update time. Understanding or a
request for depth increases the level by one (initial baseline: guided practice).
Difficulty returns to foundations and a slower pace. An explicit pace request
overrides that default. These are explanation preferences and self-reported
signals, not measured mastery or an estimate based on elapsed time.

Feedback is written transactionally, deduplicated by source turn, and scheduled
for indexing under `learner:<userId>`. Each topic has one keyed RAG entry. Current
feedback goes directly into the current reply's context while indexing runs.
Later chats search that user's topic entries (five matches, score threshold
0.35). Matched IDs are loaded from the authoritative database with an ownership
check, so an older index cannot restore outdated levels. Indexing runs as a
scheduled action; failures appear in Convex Logs. Topic recall across later chats
depends on successful indexing and semantic relevance, so it is not guaranteed
for every wording. The most recent 50 topic names help extraction reuse existing
topic labels; older indexed topics remain searchable.

Up to 500 recent completed roadmap quizzes are mapped back to topic names and
included in the roadmap's searchable content. Quiz changes invalidate its content
hash. Quiz progress is evidence for that topic; current requests and newer
difficulty feedback override it. Learning-memory context is capped at 6,000
characters in addition to the existing roadmap context cap. No public API or UI
flow changes are required.

### Try it

1. Ask: `Explique-moi les closures JavaScript.`
2. Reply: `J'ai compris les closures JavaScript, approfondis.`
3. Inspect the new `learningMemories` row in Convex Data: the topic should have
   `feedback: understood` (or `deeper`) and a higher depth. In the `rag` component,
   inspect namespace `learner:<your user id>` after the scheduled action finishes.
4. Start another chat and ask about JavaScript closures again. The tutor should
   use more advanced examples when the relevant memory is retrieved.
5. Reply: `Les closures sont trop difficiles, explique plus simplement et lentement.`
   The row should switch to depth 0 and slow pace; the current answer should
   already become simpler. Asking about an unrelated topic should not inherit
   that difficulty.
6. Pass a roadmap quiz and ask about that node. Its completion becomes searchable
   evidence on the next message without marking unrelated topics as mastered.

Run `node convex/tests/learning.test.cjs` for mocked feedback, persistence,
cross-chat retrieval, failure handling, and ownership coverage. Live extraction
and explanation quality need the manual conversation above.
