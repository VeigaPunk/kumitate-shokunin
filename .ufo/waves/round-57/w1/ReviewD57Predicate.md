# ReviewD57Predicate — round 57

Scope: verify the frozen D57 probe's E1..E5 mirror the entry contract (provenance trio,
>=12 distinct receipt-bound clauses, mined rows + captures, sources-check, live census).
Review-only seat. No production edit, no commit. Lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89`
(tip was `c42afe1c`+bookkeeping during work); judged close rev R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9`.

## Verdict: CORROBORATED — E1..E5 mirror the contract; no actionable defect

## Mirror check, E-by-E (probe body vs. header contract vs. committed bytes at R1)

- **E1 — trio.** Code (probe:87-94): regex `source:…S117…docs\.temporal\.io…S118…S119` +
  `verified-at:` + `recheck:` all within first five lines, order-sensitive. Contract in
  header says exactly this ("`source:` citing S117 with a docs.temporal.io URL and the
  companion rows S118/S119"). Entry head (lines 1-3) satisfies it; order enforcement is a
  *stricter* reading (safe direction). PASS confirmed.
- **E2 — clauses.** Code (probe:97-114): >=12 `- ` lines; every such line carries >=1
  `receipt:<path>@sha256:<64hex>` (`bound === lines.length` — stricter than "each
  carrying a binding", safe); first-token paths distinct; each bound blob exists at rev
  with matching sha256. My independent recount at R1: 13 clause lines, 15 receipt tokens,
  13 distinct paths, 0 hash misses across **all 15** tokens (e2-independent.txt).
- **E3 — rows + captures.** Code (probe:117-139): SOURCES.md row `| Sid |`, cells[8]
  `mined`, cells[11] contains entry path; registry `.ufo/pins/source-captures.json`
  pins S117..S120 **and** each pinned blob sha256-verifies (stronger than "pins").
  Verified: S117/S118/S119 `mined` + used-by names the entry; S120 `rejected` (contract
  requires the pin, not the status — correct); all four capture blobs hash-match
  (e3-independent.txt).
- **E4 — sources-check.** Literal: runs `scripts/sources-check.mjs` on the extracted
  tree, requires `SOURCES_CHECK: CLEAN` + exit 0. My run on extracted R1: CLEAN
  (rows=120), exit 0 (e4-sources-check.txt).
- **E5 — census.** Literal: fleet-root `sources-census.sh validate kumitate`, exit 0,
  flagged live-only in the header. My run: exit 0, 4 pinned W04 dup-url warnings —
  same class the plan recorded before the round (e5-census.txt).

## Committed-byte discipline and guards

- Reads `git archive <rev> | tar -x` into a fresh tmpdir — never the worktree
  (probe:76-83). Worktree-vs-R1 entry bytes: identical anyway (diff clean).
- Usage → 64 (both arg-count and rev-regex arms, verified by execution); unreadable
  extraction → `FAIL-CLOSED` exit 2, never a score; `hold-call-deleted` guard emits
  `held=0/0` UNMET if checks vanish (probe:160-163).
- Frozen bytes: worktree sha256 `8837a090…0d53` == R1 blob == counter-pins.json
  round-57 entry. Byte-identical.
- D56→D57 diff: header ids (S113-S116→S117-S120, temporal URL replaces cloud.google.com),
  `RULE`/`ENTRY`, tmpdir prefix, log strings. Zero stale literals (full diff reviewed).

## Discrimination evidence (committed receipts)

- Base `7178bfd3`: `DOCTRINE57_UNMET held=2/5` — E1/E2 `entry-absent`, E3 all rows+pins
  missing; E4/E5 PASS. Entry-specific checks discriminate; environmental checks pass
  honestly (base/doctrine57-base.txt).
- Scratch-HELD witness: `HELD 5/5` at synthetic rev `1cd6d667` — 5/5 reachable
  (witness/scratch-held-doctrine.txt, lesson M5).
- FINAL receipts: `HELD 5/5` at `f0dc6d11` (R1) and `b3bd0633` (close receipts commit).
- My re-run at R1: `DOCTRINE57_HELD held=5/5 checks=5` exit 0 (probe-at-R1.txt).

## Findings

- **F1 (minor, coverage gap within contract):** E2's `l.match()` lacks `/g` — only the
  *first* receipt token per clause line is bound/checked. The "Observed revisions" clause
  carries 3 tokens; 2 (ScoutKafka, ScoutK8s source-metadata) are unverified by the probe.
  Both hash-verify at R1 (my check, 15/15), so no live defect — but a tampered 2nd+
  token on any line would not be caught. The literal contract ("each carrying a
  binding") is still met; worth a `/g` if D58 clones this shape.
- **F2 (accepted limit):** E5 is non-hermetic by design — sibling-lane SOURCES drift
  could flip it independent of this rev's bytes. Named as live-only in the probe header;
  consistent with R51-4 convention.
- **F3 (informational):** E3 hard-codes columns cells[8]/cells[11]; a SOURCES.md column
  reshuffle silently misreads. Same convention as D56; the schema is frozen in practice.
- **F4 (fails safe):** `git archive | tar -x` has no pipefail; a failed archive with tar
  exit 0 would score an empty tree → UNMET 1/5. Cannot produce a false HELD.

## Residual risk

Low. The one real coverage seam (F1) is inside the contract's letter, all bindings at
R1 verify anyway, and the probe cannot false-positive through it — a missing/forged
binding could only *evade* detection, not fabricate a pass.

## Verification gaps

Did not re-fetch S117/S118/S119 content (peer seats own source admission); pins and
captured blob hashes verified, fidelity-to-URL not re-judged. Did not run the mutant
battery (separate seats). Probe executed once at R1 by me; committed idempotence
transcripts cover R2/tip re-runs.

## Evidence files (build/ReviewD57Predicate/)

`probe-at-R1.txt`, `e2-independent.txt`, `e3-independent.txt`, `e4-sources-check.txt`,
`e5-census.txt`, `entry-at-R1.md`, plus the extracted R1 tree (git archive, scratch).
