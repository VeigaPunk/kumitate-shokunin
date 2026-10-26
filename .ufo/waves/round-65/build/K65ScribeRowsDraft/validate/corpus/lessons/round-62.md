# Round 62 — lesson

author: kumitate-shokunin
base: `0cbe0d75e5a08718e2256408329692908c837766`
opened source: S195, opened and re-fetched 2026-10-25

## Gate

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| S195 / Temporal Worker Versioning documentation | RE-OPENED; source bytes agree with the committed capture | Re-opened the exact URL; response bytes match the pinned capture and the located quote remains at the same anchor. This validates source integrity only; no round-62 domain claim is admitted from it. | `https://docs.temporal.io/worker-versioning.md`, § Versioning behaviors → § Pinned Workflows, opened 2026-10-25. “A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.” (13 words; line 39; capture `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`, sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`) |
| `exactly-once-attribution.md` in shokuknow package | REJECT; flip condition remains a future one-theme reopen of the paper under the existing document identity | Round-61's duplicate-document and unopened-measurement reasons remain uncleared; this round did not fetch the paper or alter the rejection. | `corpus/lessons/round-61.md:13`; `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/exactly-once-attribution.md`; no source opened for this candidate in round 62. |

S195 registry `used-by` change (append-only allowed field): old `corpus/knowledge/temporal-worker-versioning-pinning.md` → new `corpus/knowledge/temporal-worker-versioning-pinning.md, corpus/lessons/round-62.md`; this lesson cites the reopened source above. No SOURCES rows were added, rejected, or otherwise changed. No package entries were adopted (`Assimilation: none`).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `counter-worktree-read` — a supplied revision is not the only input when sibling checks read the live worktree | `.ufo/waves/round-61/probe/dispatch61-probe.mjs:15-29`; `.ufo/waves/round-61/probe/doctrine61-probe.mjs:20-27`; `.ufo/waves/round-61/controls/ctl-c1-critic-a5-commit-worktree-split.txt`; `.ufo/waves/round-61/controls/ctl-c2-critic-a4-e5-worktree-not-rev.txt` | Q57 and the freeze rule requiring every condition to grade committed revision bytes; the controls show a fixed revision can read HELD when only its worktree changes | Never call a worktree-side result a revision verdict. Preserve a committed red control whose forged/uncommitted worktree bytes disagree with the measured revision; make all measured reads consume `git show <rev>:<path>` or an archive of that revision. The round-61 counter remains unfixed and is not re-claimed here. |
| `counter-row-schema` — a text predicate used a non-JavaScript whitespace class, wrong columns, and no section boundary | `.ufo/waves/round-61/probe/doctrine61-probe.mjs:17`; honest and phantom outcomes `.ufo/waves/round-61/controls/ctl-c2-critic-a0-honest-row-vacuity.txt`, `ctl-c2-critic-a5-full-forgery-held.txt`; durable forgery bundle `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` (fixture rev `4247d2da937842bd6846874d548b7125b356e14c`) | Q57, the 11-cell SOURCES v1 schema, and the documented Registry section boundary; an honest row fails while a phantom lookalike outside Registry reaches HELD | Parse the section and schema used by the source census; use JS `\s` and indices 8/9/11 for status/opened/used-by. Keep the bundled forged commit as a committed negative control and a verified honest-row positive control. No counter rewrite was frozen before the dispatched data; this fix is guidance, not a claimed landed repair. |
| `dispatch-activity-forgeability` — a lane-authored session string and self-authored progress/seat files were treated as proof of dispatch | `.ufo/waves/round-61/controls/ctl-c1-critic-a4-full-fabrication.txt`; `.ufo/waves/round-61/controls/ctl-c1-critic-a2c-one-id-bypass.txt`; `.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt` | Q57; QUALITY Q54's limit explicitly says dispatch evidence must be cross-checked against source records, not just self-consistency | Require the measured revision to bind activity evidence unavailable to the report author, and demonstrate the gate rejects committed do-nothing and forged-session controls before counting any candidate. The round-61 counter still accepts fabrication. |
| `dead-seat-unattacked` — an invalid-prompt refusal left the assigned independent audit unrun | `.ufo/waves/round-61/w2-spec.json:297-304`; `.ufo/waves/round-61/close/w2-results.json`; `.ufo/waves/round-62/w1/Audit19.md` | The round protocol requires every genuine attack item to be completed or reported dead; a dead seat stays dead and its test obligation must be re-queued under a fresh identity | Re-queue the committed Audit19 prompt with a new identity; compare the complete committed input set and preserve every unexecuted check. Its 4 full exhaustive checks are still explicitly pending. |

The table fixes are **not demonstrated able to fail as fixes** in this round: no repaired frozen counter exists, and no red-before → fixed-only-delta → green control pair was committed. Therefore no fix in the table is counted as a repair. The forged C2 bundle is an intact falsifier, not a counter repair. The R60 Audit19 analysis in `w1/Audit19.md` reports counts and sampled integrity checks but itself lists the full no-truncation, exact traceback, and per-row identity tests as unexecuted; it does not close that gap.

## Round status and measurements

The dispatched prompt contains no round-62 plan or frozen claim sentences; `.ufo/waves/round-62/plan/` and `baseline/` were empty when inspected. The round-62 probe copies are byte-identical to the failed round-61 probes. No verifiable round-62 before→after claim was frozen before data seats ran, so this lesson does not invent a target or treat a repair as an admitted claim.

Round-start source census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0; 134 rows, A=111, B=15, C=8, six W04 warnings (captured in the round activity). Round-end registry row count remains 134; tier counts A=111, B=15, C=8. Existing rows touched: S195 `used-by` old→new as recorded above. Rows added: A=0, B=0, C=0. Frontier rows advanced: none. 

SOURCES: no shokuknow package entries adopted. Considerthese proposal handled: none. No tools installed or updated.
