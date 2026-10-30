# K70ScribeScorecard — draft blocks for the round-70 SCORECARD append (round 70, C1 operability)

Draft only. Nothing here is applied to production. `⟨PENDING …⟩` tokens are draft-time slots:
each MUST be replaced with a value observed from a committed receipt (or the sentence deleted)
before the scored commit lands. No unresolved token may survive into SCORECARD.md
(R60 `__MEASURED__` precedent — corrected append-only in round 61, never repeated).

Observed anchors used below (all read this seat, see the report for commands):
- Frozen plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` (object type `commit`; plan.md and
  probe/replay70-probe.mjs byte-identical to it; `base/band-control.json` + `base/source-counts.json`
  added after that commit, +14 lines each — recorded, not hidden).
- Base B `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`.
- Counter pin: `.ufo/pins/counter-pins.json` entry `replay70-probe`, sha256
  `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (equals the working-tree sha256sum, observed).
- Base receipt `.ufo/waves/round-70/base/replay70-base.txt`:
  `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d762ccf3e3a0961f94c4042eaabd2bcb706 rule=R70 live=no-live(vacuous-declared)`
  — R1 PASS, R9 PASS, R2–R8/R10 MISS — `exit=1`.
- `base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, `exit=0`.
- `base/band-control.json` → round-70 `total=64 verdict=PASS`, `dispatch_observed=false`;
  red-before round-65 `total=45 verdict=FAIL`.
- `base/source-counts.json` → rev `78b98d76…`, rows=155, tier A=132 B=15 C=8, mined=123 queued=13 rejected=19.
- `base/sources.txt` → `ok` … `corpus/SOURCES.md`, `exit=0`, six carried W04 duplicate-URL warnings.

---

## 1. Capabilities-table row (one row; the frozen counter R10 requires the literal substring `| control-replay |` in SCORECARD.md)

Insert as the last row of `## Capabilities`, directly after the `routed-ledger` row
(SCORECARD.md ~line 1808, before the italic historical notes). Keep EXACTLY ONE such row —
K70ScribeRegistry drafted a shorter description cell for the same row; do not land both.

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `control-replay` | Replay ONE frozen round-69 control per run (c1 `donothing`/`autoledger`; c2 `donothing`/`autoorigin`/`forgecapture`) from a versioned private script copy (LANE/PROBE/W/S substituted exactly once, the unused fixed `/tmp/forge-sed.txt` write removed, inherited repository environment scrubbed, explicit fixture-root `git -C` arguments) into a new exclusive `--out` file inside a unique `mkdtemp` child of `--work`; unexpected frozen source bytes are refused, prior round-69 receipt digests are preserved, the work child is reclaimed, originals are never executed (contract `kumitate-control-replay-v1`). Replay match is not forgery resistance, not proof the frozen control executed (the counter is a text predicate), and the live `forgecapture` arm is network-dependent: failure is reported, never waived. | ⟨PENDING-EVIDENCE: fill only from committed receipts after `scripts/control-replay.mjs` lands — selftest receipt ⟨path⟩; counter receipt ⟨path⟩. Round-69 precedent: `build/L1LedgerDraft/integrated-selftest.txt` was citable as a committed artifact.⟩ | 70 ⟨contingent — the row enters only through a demonstrated passing run recorded in `## Round 70`; AXES.md §Capabilities: a capability without a passing demonstration is pre-claiming⟩ |

R10 note: the name cell is the bare word `control-replay`, no backticks — the frozen counter tests
the substring `| control-replay |` (a backticked name fails it). The row must be in the scored
commit together with `scripts/control-replay.mjs` and its `counter-pins.json` entry, or R10 reads MISS.

---

## 2. Append-only `## Round 70` section (append at EOF, after the Round-69 proxy-refresh paragraph, current line 3043)

```markdown
## Round 70 — claims, verdicts, limits (2026-10-30)

Freeze `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; base B `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`;
measured revision M ⟨PENDING: 40-hex of the committed REV measured at close⟩. No axis integer
changes: operability 9→9 (terminal under `f_O`; the `## Axes` operability row's rationale stands
unchanged), coverage retired at 10, successors 10/10. ⟨PENDING-CONFIRM: `git diff B <tip> -- SCORECARD.md`
shows no `## Axes` integer edit — record the observed empty/absent axis diff⟩. Freeze receipts:
`plan.md` and `probe/replay70-probe.mjs` byte-identical to the freeze commit; `base/band-control.json`
and `base/source-counts.json` were committed after it (recorded, not hidden). Counter pin
`replay70-probe` sha256 `63f52b75…c1` matches the pinned bytes.

- C1, operability / capability `control-replay` acquisition (routed defects r69-verifier-spotcheck
  items 2–3: the unused `/tmp/forge-sed.txt` write and the fixed-output replay that temporarily
  overwrote two frozen r69 receipts; `corpus/lessons/round-69.md` §Freeze errata).
  Base (committed receipt): `TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1 node .ufo/waves/round-70/probe/replay70-probe.mjs
  /home/vgpnk/Projects/shokunin/kumitate-shokunin 78b98d762ccf3e3a0961f94c4042eaabd2bcb706` →
  `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d76… rule=R70 live=no-live(vacuous-declared)`,
  R1/R9 PASS, others MISS, exit 1 (`.ufo/waves/round-70/base/replay70-base.txt`).
  Close: same command at M ⟨PENDING: paste the observed final line verbatim — `REPLAY70_HELD
  held=10/10 … live=…` exit 0 only if actually observed; preserve every R# MISS line exactly;
  the predicate is never amended after scoring⟩ (receipt ⟨PENDING: `.ufo/waves/round-70/close/<name>.txt⟩`).
  Selftest: `node scripts/control-replay.mjs --selftest` ⟨PENDING: observed tally + committed receipt path⟩.

Admission limits, disclosed: the frozen counter is a text predicate — a non-executing stub that
writes the expected receipt text reaches HELD (attack evidence `.ufo/waves/round-70/w1/K70AttackPrintStub.md`
F2–F4, as reported by that seat; not re-run here); `live=` is printed, never required; the R10 pin is
self-authenticating (tool, pin and both rows must land in the same scored commit; the pin proves
self-consistency, not provenance). No semantic-remediation or universal forgery-resistance claim is
made; the live `forgecapture` arm stays network-dependent and its failure is reported, never waived.

Wave: one v2 wave of 64 prepared (`base/band-control.json` `total=64 verdict=PASS`,
`dispatch_observed=false` at base). ⟨PENDING after WAVE-DONE: settled/dead counts, missing/empty
reports enumerated in `.ufo/waves/round-70/close/wave-reconciliation.json`; no dead=0 assertion
without evidence; no replacements or residual wave.⟩

Sources: S217 opened own-work (the frozen r69 c2 control at B; replay mechanics only). Base census
receipt `base/source-counts.json` rows=155 (A=132 B=15 C=8; mined=123 queued=13 rejected=19) at B;
`base/sources.txt` exit 0 with six carried W04 warnings; `base/freeze-map.txt`
`README_MAP: CLEAN files=169 rows=169 covered=169` exit 0. ⟨PENDING: close-time census delta, if any⟩.

Proxy refresh ⟨PENDING: `close/final-gates.txt` observed PROXY verdict and A — A will differ from
the round-69 687 because the round adds runnable files under the frozen `RE_RUNNABLE` walk; record
the observed value, never a forecast; Kimi-census host drift carried if still present⟩.

Next-round candidates (not frozen): ⟨PENDING: L1 drafts at close; per plan §Wave no replacements or
residual wave is intended; keep future claims distinct from the unchanged L69/M69 predicates⟩.
```

---

## 3. Move log row (OPTIONAL — decision for L1)

Observed precedent conflict: rounds 59–69 appended **no** Move log rows (`grep -c` for `^| 59 |`…`^| 69 |`
→ no matches); the last rows are 54–58. If L1 keeps the Move log current, insert directly ABOVE the
`| 50 |` row (the current first data row, ~line 448); if L1 follows the 59–69 precedent, omit the row —
the `## Round 70` section alone carries the claim. Draft if used:

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 70 | operability (lowest non-retired axis; score 9 held at terminal; capability acquisition `control-replay`, routed defects r69-spotcheck items 2–3) | `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d76… rule=R70 live=no-live(vacuous-declared)` exit 1 at B (`base/replay70-base.txt`; R1/R9 PASS, others MISS) | ⟨PENDING: same command at measured M — paste the observed final line verbatim; `REPLAY70_HELD held=10/10` exit 0 only if observed; `live=` recorded honestly; misses preserved⟩ | `.ufo/waves/round-70/plan.md`; `.ufo/waves/round-70/base/replay70-base.txt`; close receipt ⟨PENDING path⟩; measured commit ⟨PENDING hash⟩ |

---

## 4. Append-only structure rules the landed text must satisfy

1. New text only: one Capabilities row (after `routed-ledger`), the `## Round 70` section at EOF,
   optionally one Move log row. NO edit to `## Axes` integers, NO rewrite of any earlier section
   (operability stays integer 9 — the integer-remains-9 statement lives in the round section and,
   if used, the Move log row).
2. Placeholder discipline: every `⟨PENDING …⟩` is draft-time only. Replace from committed receipts
   or delete the sentence before the scored commit; never ship a token that reads like a measurement.
3. Every number carries its command; receipts are committed before SCORECARD cites them
   (report-receipt-diff cross-checks report vs receipts at close).
4. Misses preserved verbatim: if the final pass is not 10/10, the observed line is quoted as-is;
   counter/plan bytes stay frozen; "never amend predicate after scoring".
5. Post-filing corrections are named appends (`## Round 70 correction … supersedes …`), never
   in-place edits (round-37/46/52 precedent).
