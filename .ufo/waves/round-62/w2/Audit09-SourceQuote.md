# Audit09 — Source-Quote (S195 Temporal capture) verification

Task: reopen the committed Temporal capture and verify the quote in SOURCES row S195 and the knowledge entry byte-for-byte; report exact line/hash.

## Verdict

PASS — the S195 quote is byte-for-byte identical across the committed Temporal capture, the SOURCES S195 row, and the knowledge entry. The pinned capture hash matches the committed blob and the working tree.

## Evidence

### 1. Committed capture identity

- Capture file (lane repo, relative): `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
- Committed at: `15084153a0227554bd20d4dbf82bc730f596a511` (round-61 commit, "S195 Temporal Worker Versioning entry, registry row, map/pins, Q52-Q57, lesson, build captures")
- Pin (`.ufo/pins/source-captures.json` S195 entry):
  - `sourceId`: `S195`
  - `path`: `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
  - `sha256`: `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
  - `bytes`: 9645
  - `captured`: 2026-10-25
- Measured:
  - Working tree `sha256sum`: `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, 9645 bytes
  - Committed blob (`git show 15084153a0227554bd20d4dbf82bc730f596a511:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum`): `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, 9645 bytes

→ Pin hash == committed blob hash == working-tree hash (no drift; capture intact).

### 2. The quote, byte-for-byte

Quote text (verbatim): `A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.`

Python check on exact bytes (no normalization, exact substring):

| Location | Exact bytes | Result |
|---|---|---|
| Capture `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` — line 39, offset 2178, len 86 | `'A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.'` | present |
| SOURCES row S195 — `corpus/SOURCES.md` line 147, guarantee-sentence cell | identical string | `capture==SOURCES: True` |
| Knowledge entry — `corpus/knowledge/temporal-worker-versioning-pinning.md` line 15 | identical string | `capture==know: True` |

- Capture occurrence: exactly 1 (regex `A \*\*Pinned\*\* Workflow is guaranteed to complete on a single Worker Deployment Version\.` → 1 match; note `**` is literal markdown-bold in the raw capture).
- Section context in capture: line 37 `### Pinned Workflows`; the sentence is the first sentence of that section (body.md:39) — consistent with the SOURCES locator "§ Versioning behaviors → § Pinned Workflows, guarantee sentence".
- Knowledge entry line 29 states the quote sits at `body.md:39` — confirmed (offset 2178; line 39).
- Knowledge entry recheck command greps `guaranteed to complete on a single Worker Deployment Version` expecting 1 — the capture contains that substring exactly once (line 39).

### 3. Cross-references

- SOURCES S195 row (corpus/SOURCES.md:147) carries capture sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` and cites `corpus/knowledge/temporal-worker-versioning-pinning.md` — both match.
- Knowledge entry header (lines 1-2) cites S195, URL `https://docs.temporal.io/worker-versioning.md`, verified-at 2026-10-25, and capture sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` — all match the capture and the pin.

## Residual risk / verification gaps

- This is a byte-level internal consistency check (capture ↔ registry ↔ entry). It does not re-fetch the live URL; the HTTP 200 and quote currency at 2026-10-25 are taken from the lane's own record, not re-verified here.
- The knowledge entry's derived statements (inheritance rules, UNKNOWN case) were not re-derived from the full capture text; only the source-grounding quote was verified byte-for-byte.
