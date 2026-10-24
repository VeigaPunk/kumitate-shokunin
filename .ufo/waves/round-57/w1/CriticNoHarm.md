# CriticNoHarm — round-57 harm audit (no-axis-harmed bar)

Seat: critic, wave `kumitate-r57-w1`. Scope: enumerate everything the round
touched vs "no axis harmed" — registry churn, pin growth, proxy stanza re-pin,
the checklist 27th item, SCORECARD edits — hunting silent regressions in counts
other claims depend on. Audited span: base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`
→ lane tip `8c6f5b017d149b18134917378cdbed3b492d8e89` (5 commits; R1 =
`f0dc6d1160e66af65355bd353665adac22bbf4a9`). Evidence under
`.ufo/waves/round-57/build/CriticNoHarm/`.

## Verdict summary

**No silent regression found in the committed integration.** Every touched
artifact was planned, additive, and re-verified; deletions anywhere in the
span are exactly five SCORECARD stanza literals (`A`, `C`, `C2`, `C2_total`,
`pin.proxy-check` self-hash). Two findings follow — one real stale-literal
defect inside SKILL.md prose, one live (non-committed) gate-drift item the
next round will inherit — plus confirmations the close battery got right.

## Findings

### F1 — SKILL.md "all sixteen" gates literal left stale by the 17th gate row
(real defect, low severity)

`SKILL.md:595` reads "Verdict map for **all sixteen**" and `:598` reaffirms
"\"all sixteen\" above still counts the gates only". The registry table now
carries **17 `| gate |` rows** (verified: `grep -c '| gate |' SKILL.md` → 17;
the readme-map row landed this round — the same pattern used in r55/r56 for
source-capture/source-dupes). Sixteen was correct at base; the round grew the
table and did not re-express the prose literal.

This is exactly the R56-V2 defect class the plan claims to have *answered*:
"a growth literal can only be re-expressed" — the A57 B7 arm was amended to
freeze `items === 27` AND the full 24→27 item→gate binding, but B7 scopes the
**checklist** items only. The registry-table prose literal one section above
is unguarded by any counter arm, and it silently went stale in the same commit
that fixed the previous stale-literal class. Named obsolescence was recorded
for A54/A55/A56 counter literals; this doc literal got no such record.

Impacted axis: operability (documentation fidelity inside the capability
surface the claim extends; no gate/counter miscomputes from it — the "verdict
map" semantics are unchanged). Fixable defect, smallest safe correction: amend
`SKILL.md:595,598` "all sixteen" → "all seventeen" (or drop the numeral).
Same shape as the accepted convention: re-express or unbind the numeral.

### F2 — fleet report cites the synthetic scratch-HELD rev `1cd6d667`; round-gate
reads COMMIT_CITED_UNRESOLVED on the live tree (report-side defect, watch item)

`/home/vgpnk/Projects/shokunin/.ufo/reports/round-57/kumitate.md` contains the
40-hex token `1cd6d667e20075fd2e77e6e655bc755f95e3d940` (1 occurrence; also
inside seat reports `w1/MutA57DropCheck.md`, `w1/ReviewD57Predicate.md`,
`w1/ScribeScorecardAudit.md` and the committed
`build/MutCounter57/counter-mutant.txt`). It is the **synthetic** scratch
post-state the freeze witness was run against (`witness/scratch-held-*.txt`
print `HELD rev=1cd6d667…`), intentionally absent from lane history
(`git cat-file -t` → "could not get object info"; `MutA57DropCheck.md` itself
notes it is absent).

`node scripts/round-gate.mjs` (round=57, live) emits
`ROUND_GATE error COMMIT_CITED_UNRESOLVED cited=14 unresolved=1 [1cd6d667…]`
→ `ROUND_GATE: DRIFT`, real exit 1. The citation collector scopes only the
fleet report (`<reports>/round-<N>/<lane>.md`), so the committed transcript +
seat reports are inert — this is a **report-file defect, not an integration
defect**: the judged rev's H2 selftest (`VERDICT: PASS`) is unaffected, and
round 58 (`--round 58`) will scan a different report file. But `round-gate`
re-run against round 57's report stays DRIFT forever, and the correction is
free: write the synthetic rev elided (`1cd6d667…`, as the committed witness
and SCORECARD already do) rather than as a full 40-hex token in the report.
Impacted axis: operability (checklist item "Round-close artifact audit" reads
DRIFT whenever round 57 is re-audited live).

### F3 — transient mid-dispatch live-tree DRIFTs (informational, NOT harm)

Live (working tree, wave in flight): `proxy-check --strict` →
`A_DRIFT declared=90 computed=5828` — term `A` = `walkFiles(self)` over
`RE_RUNNABLE` (`.mjs|.js|.sh|.py`) and in-flight seat build dirs hold ~5,015
`.mjs` scratch extractions under `.ufo/waves/round-57/build/`. `cite-check` →
DRIFT exit 1 for the same reason; `surface-probe --checklists` → 25/27 FAIL.
**At the judged rev (committed bytes via `git archive`) all three are green**
(close transcripts: `PROXY: MATCH`, `CHECKLIST: 27/27`, H2 `VERDICT: PASS`;
my live re-runs of readme-map/counter-pins/source-capture/source-dupes/
kimi-census/sources-check/claims-check are all CLEAN/MATCH). The live-tree
sensitivity is pre-existing tool semantics (A counts the live tree by design),
not a round-57 regression; flagged only because any *committed* seat-scratch
`.mjs` payload in a future round would permanently inflate `A` — the R56-V3
repair gate covers rows/files, not runnable-file ingress.

## Confirmations (harm battery independently corroborated)

- **Deletions/renames:** `git diff --diff-filter=D,R 7178bfd..8c6f5b0` → none.
  65 files changed, all additions or planned stanza edits.
- **Checklist 27th item:** base 26 → tip 27 items (`grep -c '^- \[ \]'`),
  appended at tail, no renumbering; B7's binding holds (item24→counter-pins,
  25→source-capture, 26→source-dupes, 27→readme-map). Prior probes A54/A55/A56
  read `9/10 B7 MISS` at R1 — **named counter-obsolescence per the frozen
  convention** (plan §Harm H5 + `close/prior-probes.txt`), not hidden: the
  miss is the intended cost of capability growth, recorded in LOG/report.
  A53/D53/A56-other/D54/D55/D56 all re-HELD at R1.
- **Pin growth:** `counter-pins.json` 11→14 entries, zero removed/changed
  (deep-compared; added attest57/doctrine57/readme-map, hashes = my
  sha256sums of the frozen bytes). `source-captures.json` 9→13, appended only.
  `source-dupes.json` byte-identical (no new dup groups — SOURCES grew 4 rows
  without creating a W04). `readme-map.json` v1 new: covered=135 = live file
  set, 0 dupes, 0 stale, 0 outside-scope.
- **Proxy stanza re-pin:** `pin.proxy-check` self-hash updated to
  `816a8650…` = sha256 of the new script; script diff is a single
  `GATE_PINS` line — no scoring logic weakened, re-pin is honest.
  `pin.readme-map=058e5033…` matches `sha256sum scripts/readme-map.mjs`.
- **SCORECARD counts:** A=87→90 exact (+1 script `readme-map.mjs`, +2 probe
  `.mjs` under `.ufo/waves/round-57/probe/` — both counted by `walkFiles`
  since `self` = lane root); C=26→27 exact; C2/C2_total=132→135 exact
  (+2 files `worker-heartbeat-liveness.md`, `round-57.md`, +3 rows incl. the
  R56-V3 backfill row; my recompute: `find corpus/knowledge corpus/lessons
  -name '*.md'` = 135, README rows = 135 → `README_MAP: CLEAN files=135
  rows=135 covered=135`). S/R/K layer terms unchanged (88/92/53) — the new
  script lives in the lane, not the origin pin `31c465f1`.
- **SCORECARD deletions:** exactly the five stanza literals above; all other
  edits are appends (2 move-log rows, capability row, Round-57 section).
  LOG.md: 0 deleted lines — append-only preserved.
- **Probes frozen:** no commits touched `.ufo/waves/round-57/probe/` after
  R1 (`git log f0dc6d1..HEAD -- probe/` empty); base transcripts show
  UNMET 0/10 + 2/5 (K1 do-nothing killed honestly).
- **Receipts:** wall_start span 326.2 s ≥ 300 s across runs 1–3; doctored
  control excluded by name per plan.
- **Wave spec:** `w1-validate.json` totalSeats=64, attackShare=0.375
  (19x/13r/8s/7c/6crit/5mut/2simpl/2sent/1rev/1conn = 64), distinctItems,
  leafOnly — matches policy v2 band.

## Non-issues observed

- Uncommitted working-tree churn (`w1/swarm-registry.json` rewritten to a
  schema `ufo-swarm-registry-v1` wrapper + untracked `…legacy-wave-v1.json`)
  is dispatch-side bookkeeping outside the committed span; statuses at R1
  were `prepared`×64.
- `b3bd063` re-edited `build/MutCounter57/counter-mutant.txt` post-R1 —
  build-artifact bookkeeping, contents still cite the same mutant story.

## Correction ranking

1. F1: re-express "all sixteen" → "all seventeen" (or drop the numeral) —
   same class the round fixed; cheapest possible repair, do at next touch.
2. F2: elide `1cd6d667` to non-token form in the round-57 report (and teach
   report authors: synthetic revs are citations that cannot resolve).
3. F3: none required; consider a future gate for runnable-file ingress into
   committed `.ufo/waves/*/build/` payloads if seats ever commit scratch.

Trailer: `.ufo/waves/round-57/w1/CriticNoHarm.md` — evidence:
`build/CriticNoHarm/{git-invariants,counts-and-hashes,live-gates,live-checklist-gates,scorecard-log-audit}.txt`.
No installs performed; read-only audit, no lane mutation.
