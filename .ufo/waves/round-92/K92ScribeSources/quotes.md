# Quotes — S266, S267, S268

Verbatim, ≤25 words each, located by capture line. Captures under `.ufo/waves/round-92/open/`
are byte-identical to the pinned raw files (see `fetch.txt`). Format inside each fence:
`<line><TAB><exact text>`; the text is a substring of that line unless the range is noted.

## S266 — docs/session.md (sha256 6a7a2375879cd113c651975fee27f61b7b3eec7d34f745074059ac3e466f4e29)

```
216	Records model calls outside the conversation transcript.
218	These records contribute usage accounting, not model
235	`role` is optional; missing is treated as `default` in context reconstruction.
236	`resolvedModelIsFallback` optionally marks a retry-fallback transition.
237	reserved role `fallback` is ephemeral: model restoration prefers the configured
238	default instead of restoring that role's temporary model.
339	append a synthetic assistant message with `stopReason: "aborted"`
425	rather than guessing from the historical-display `resolvedModel`
524	model map from `model_change` entries (`role ?? "default"`); assistant-message inference is legacy fallback only until an explicit default is seen
```

## S267 — packages/coding-agent/src/session/session-entries.ts (sha256 4035dad36878c19d14aa4cdfd0e6de3c3ccbcb86cf3c280228e3c70b1128f29e)

```
37	export const EPHEMERAL_MODEL_CHANGE_ROLE = "fallback";
148	export interface ModelChangeEntry extends SessionEntryBase {
150	/** Model in "provider/modelId" format */
152	/** Role: "default", "smol", "slow", etc. Undefined treated as "default" */
154	/** True when this transition selected a retry-fallback model rather than the configured model. */
299	Subagent's `subagent:<id>` retry fallback role as installed at spawn
```

## S268 — packages/ai/src/types.ts (sha256 22ea739a7175ddd97b2f17a54fa9f876d17b972dc15e3a190848a5a358d5b95c)

```
1081	export type StopReason = "stop" | "length" | "toolUse" | "error" | "aborted";
1335	Concrete model that produced this turn when it is knowable independently
1336	of the requested id: reported by a router that selected one, or recovered
1338	model). Compared against `model` to notice a gateway serving something
1358	stopReason: StopReason;
1360	errorMessage?: string;
```
