author: kumitate L1 (round 80)
round: 80
lane: kumitate
base: 1968689f9097f839457e242b41f83879e99af58e (round-79 closure)
freeze: c6a7ebd3bd01ec34b2f9349a6756886c5dd85982
scaffolding: 6d03402fddf44cc9797ec590f0f888e933db4677
report: .ufo/reports/round-80/kumitate.md (fleet repo)

# Round 80 — two readings, one snapshot

Two claims, two axes: C1 `operability` (`spotcheck-adopt` v3 — the spotcheck set and the README map
are two readings, and `--adopt` validates its own delta) and C2 `coverage:omp` (the O terms re-derive
from a committed, pinned shape receipt by default; the live root is `--omp-live`). Both integers hold
(operability 9, coverage:omp 10); the moves are surface changes with frozen counters.

## Gate

Candidates considered this round (opened sources; every row that entered was opened this round and its
quote located in the capture):

- **S119 — Kubernetes, *Configure Liveness, Readiness and Startup Probes*** (docs, tier A) — **admit**,
  re-opened this round (the row itself dates from round 57, so no new row was written; `used-by`
  extended to `corpus/knowledge/two-reading-verdicts.md`). URL
  `https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/`,
  accessed 2026-11-04; capture `.ufo/waves/round-80/build/L1/captures/k8s-probes.html` (554,624 bytes,
  sha256 `7545c7b9a5a9…`). Located quote (21 words), readiness-probe example paragraph: "If the
  readiness probe fails, the pod will be marked unready and will not receive traffic from any
  services." Also *What's next*: "Readiness and liveness probes can be used in parallel for the same
  container." Scope: two probe kinds answer two questions; one does not replace the other.
- **S234 — HashiCorp Terraform, *Dependency Lock File (.terraform.lock.hcl)*** (docs, tier A) —
  **admit**. URL `https://developer.hashicorp.com/terraform/language/files/dependency-lock`, accessed
  2026-11-04; capture `.ufo/waves/round-80/build/L1/captures/terraform-dependency-lock.html` (312,690
  bytes, sha256 `b155ff6de625…`). Located quote (24 words), *Introduction*: "Terraform remembers the
  decisions it made in a dependency lock file so that it can (by default) make the same decisions
  again in future." Plus *Lock file location*: "You should include this file in your version control
  repository". Scope: pin a derived decision to committed, checksum-verified bytes.
- **S235 — Command Line Interface Guidelines (clig.dev)** (community, tier C) — **reject**. URL
  `https://clig.dev/`, accessed 2026-11-04; capture `.ufo/waves/round-80/build/L1/captures/clig-dev.html`
  (86,536 bytes). Located quote: "Return zero exit code on success, non-zero on failure." Reason: a
  community style guide is a lead, never sole support for an entry's rule; it says nothing about
  *multiple* status surfaces. Flip: a POSIX/AWG primary document, or a maintained CLI framework's
  normative docs, stating the multi-surface status contract.
- **S233 was written and withdrawn.** The first draft carried the Kubernetes page as a *new* row S233;
  `source-dupes` caught it as `new-duplicate` against S119 (`groups=7 known=6 bad=1`) — the same page
  under a second scope, which CORPUS.md rule 2 and the pin's resolution clause forbid. The row was
  removed, the entry re-pointed to S119, and the `used-by` change logged here (old:
  `corpus/knowledge/worker-heartbeat-liveness.md`; new: `…, corpus/knowledge/two-reading-verdicts.md`),
  `recheck` unchanged (180d). The guard, not the author, caught it — recorded under `## Mistakes`.

Admitted: `corpus/knowledge/two-reading-verdicts.md` (S119) and
`corpus/knowledge/snapshot-bound-derived-scores.md` (S234). Rejected: S235. Registry change:
`used-by` on S119 (logged above); `status` and `recheck` unchanged on every existing row.

## Counters

Measured at the close tip (receipts under `.ufo/waves/round-80/close/`; every receipt carries a `rev=`
line naming the revision it was measured at — the r79 routed defect D6).

| item | base `1968689f` | close | receipt |
|---|---|---|---|
| C1 counter (`probe80-c1.mjs --set c1`) | 6/13 (`open/c1-base.txt`; 5 of the 13 pass at base — the discriminating arms are 2, 3, 5, 8, 13) | 13/13 | `close/c1-probe.txt` |
| C1 constant-CLEAN stub | 3/13 (`controls/c1-stub.txt`) | — | `controls/c1-stub.txt` |
| C2 counter (`probe80-c2.mjs --set c2`) | 4/12 (`open/c2-base.txt`; discriminating arms 1, 2, 3, 5) | 12/12 | `close/c2-probe.txt` |
| C2 constant-JSON stub | 1/12 (`controls/c2-stub.txt`) | — | `controls/c2-stub.txt` |
| proxy (`node scripts/proxy-check.mjs`) | `DRIFT (C2_TOTAL_DRIFT 194/195; O_MEMBERS_DRIFT 64/65; AXES_DRIFT coverage 10/9)` exit 1 | `PROXY: MATCH (A=886 C=39 operability=9; C1=19/19 C2=197/197 coverage=10; … O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; source=snapshot)` exit 0 | `open/base-receipts.txt`; `close/proxy-check.txt` |
| spotcheck readings | `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1 first=corpus/lessons/round-79-verifier-spotcheck.md` exit 1 | `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` exit 0 | `open/base-receipts.txt`; `close/spotcheck-check.txt` |
| conflation fixture | `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=0 first=oracle` exit 1; `--adopt` → `REFUSED_ORACLE` | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: DRIFT first=uncovered:knowledge/late.md` exit 0; `--adopt` adopts both halves | `open/conflation.txt`; `close/c1-probe.txt` arm 8 |
| omp shape compare | `DRIFT entries=65 receipt=64 added=1 first=config.yml.pre-rebalance2-20261104` | `IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0` | `open/base-receipts.txt`; `close/census-shape.txt` |
| kimi census | CLEAN 55/55 | CLEAN 55/55 (`chain=22 info=4`) | `open/sources-census.txt`; `close/kimi-census.txt` |
| SOURCES rows / tier A | 171 / 146 | 173 / 147 | `open/sources-census.txt`; `close/sources-census.txt` |
| README map | DRIFT files=195 uncovered=1 (the 9th spotcheck recurrence) | CLEAN files=197 rows=197 covered=197 | `open/base-receipts.txt`; `close/readme-map.txt` |
| checklists | 39/39 pass at the scaffolding (measured at `6d03402f`) | close run in `close/checklists.txt` | `open/checklists-scaffold.txt`; `close/checklists.txt` |
| proxy selftest | — | 163/163 pass (159 carried + 4 default-source arms) | `close/proxy-selftest.txt` |
| spotcheck-adopt selftest | 26/26 | **34/34** pass (two split cases, then six integration cases) | `close/spotcheck-selftest.txt` |

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `reference-drift` (duplicate source row) | `node scripts/source-dupes.mjs` after the first registry append: `SOURCE_DUPES: DRIFT groups=7 known=6 bad=1 first=new-duplicate:kubernetes.io/… ids=S119,S233` | the SOURCES duplicate-URL ratchet (round 56, `kumitate-source-dupes-v1`) — not the author's read; the source was opened this round and still collided with a round-57 row | S233 withdrawn, entry A re-pointed to S119, `used-by` extended and the change logged in this Gate; the `source-dupes` gate now reads `CLEAN groups=6 known=6` |
| `attribution` (a frozen probe's label arms scored as its semantics) | `node .ufo/waves/round-77/probe/probe77.mjs --set c2 --lane .` at the scaffolding → `C77_C2: UNMET held=9/13`; the four failing arms are c2.1 (`kumitate-spotcheck-adopt-v2` in the header) and c2.2–c2.4 (`^SPOTCHECK_MAP:` after recovery), while the semantic arms c2.5–c2.13 pass | `SKILL.md` checklist item 745 ran the probe and the round's own close sweep read 9/13 — the item's expected `C77_C2: HELD held=13/13` would have gone red | the checklist item is repointed to `probe80-c1.mjs` (contract v3, whose `--selftest` carries the same three SIGKILL windows); the r77 probe is kept as history and its label drift is named in `SKILL.md` and here. The counter's ground is unchanged |

| `landing` (a commit message claimed a value its bytes did not carry) | `git show 509afb1d:SCORECARD.md \| grep -E '^C2='` → `C2=195` while the commit subject says "stanza C2 re-measure 197" (the sed ran after the commit); the freeze scout read the mismatch as `w1/K80ScoutFreeze.md` F9 | the close sweep's `rev=`-stamped stanza read, introduced this round for D6 — a receipt, not the message, is the evidence | the stanza was re-measured and committed again (198); this lesson and the report cite the receipt, never the message |
| `scope` (a seat wrote runnables into the lane tree) | `w1/K80LabratC2/{materialize.mjs,run-matrix.sh,summarize.mjs}` existed when the freeze scout read the tree; `A` 886 → 889 (`w1/K80ScoutFreeze.md` F10); the seat removed them at settlement | the wave context's "put every script you write in scratch" rule — the seat's own report discloses the deviation | the scripts were removed by the seat; `A` re-read 886; no rule change (the round's close re-measures `A` after the last file lands) |
| `vacuous` (a plan after-state that its own counter cannot reach) | plan §C1 said `spotchecks=47`; measured 46 at three surfaces (`w1/K80ScribeDocs.md` F1, `K80ScoutFreeze.md` F1) | the freeze review asked for a one-command after-state; the number was written before the count was taken | Amendment 1 (appended) corrects it to 46 and says so |
| `reference-drift` (the repair itself overreached) | `corpus/lessons/round-79.md` Erratum 2 said four close receipts "do not exist at any lane revision"; `close/census.txt` and `close/shape.txt` existed at `357e4e73` and were renamed/deleted at `32620ef5` (`w1/K80ExecRepairs.md` D3) | the appender's own `git log` sweep was run only on the current tree, not `--all` | Erratum 3 (appended) names and corrects the sentence; the four pointers stay void |

## Wave integration (13 seats, all settled; no dead seats)

The wave attacked the claims and found real holes; the tool was deepened once, after the wave, and the
frozen counters re-read 13/13 and 12/12 against the final bytes. Changes (all in
`scripts/spotcheck-adopt.mjs`, disclosed as v3.1 in its header):

- **Recovery applies the delta rule** (scout `K80ScoutOmit` C1-H1, reviewer `K80ReviewSplit` R1, critic
  §3): `recover()` completed an interrupted adoption only when the whole map was clean, so a crash on a
  red map silently rolled back a fully landed, delta-valid adoption (demonstrated with
  `SPOTCHECK_ADOPT_TEST_CRASH=pin`). It now completes iff the manifest's target resolves.
- **The delta filter is subject-exact** (scout C1-L1, reviewer R2, critic §3): `otherFindings` strips
  only `uncovered:<key>` / `unpinned:<key>`, so a near-identical path or another class about the key is
  no longer exempted from the comparison.
- **An empty spotcheck set is `NONE`, exit 1** (reviewer R3, scout C1-H2): a lane that lost its
  artifacts no longer reads a vacuous `CLEAN spotchecks=0`.
- **`--predict` reads the oracle first** (scout C1-M1): a `PENDING` answer is never returned from an
  unevaluable map.
- **A row is refused when the README has no `## Coverage map` heading** (scout C1-M2,
  `REFUSED_NO_MAP_SECTION`) instead of being written above the first heading.
- **A non-regular spotcheck entry is named in the coverage line** (reviewer R5): counted but
  unadoptable, the DRIFT now says so.
- **`sourceRead` in both JSON bodies** (scout C2-M2): a fail-closed body no longer implies a snapshot
  was read (`source` stays the configured source; `sourceRead: false` says the bytes were never parsed).

Rejected after the wave: promoting an absent census member to a finding (scout C2-H1) — the live root
legitimately lacks `mcp.json.rea.backup`, so the promotion would flip the axis reading; the receipt is a
deliberate re-capture, watched by the non-scoring compare row.

## Limits

- **The frozen counters do not test the delta rule's refusal branches.** Mutation `m04` (skip the
  post-write target check), `m05` (skip the collateral-finding comparison), `m06` (return `[]` from the
  `otherFindings` filter) and `m12` all survive at 13/13 (`w1/K80MutC1.md`); the critic's candidate with
  `sameOther` deleted also scores 13/13. The refusal branch is exercised by the tool's own suite
  (`adopt-duplicate-refused`, `no-map-section`, `rollback-clean`) but not by the frozen counter.
- **C1 arms 9 and 11 are preservation arms** — they pass at the base tree because the duplicate guard and
  journal recovery predate v3. Discriminating arms: C1 2/3/5/8/13, C2 1/2/3/5 (scout `K80ScoutFreeze` F5).
- **C2 arm 12 is synthetic** (`live-opt-in-clean`: a 65-member root materialised from the receipt), not
  the plan's real-live-root reading; the real root is measured at `close/omp-live-real.txt`
  (`source=live`, `O_members=65`) but by no frozen arm.
- **The base-control counts are lane-state dependent**: the C2 fixtures are materialised from the lane's
  receipt, so `--lane <base>` reads 4/12 while `--tool <base>` reads 5/12 today (the lane receipt is 65).
- **`A` counts every runnable file under `--self`**, including seat artifacts: the `K80LabratC2` seat put
  three scripts in the wave dir (A 886 → 889) and removed them at settlement (A back to 886). A late
  removal after a stanza measure re-opens `A_DRIFT` (scribe `K80ScribeDocs` F4, scout F10).
- **`source` in a fail-closed body is the configured source, not a read** — `sourceRead` carries the
  distinction; no arm asserts it (`w1/K80ScoutOmit.md` C2-M2).
- **The plan's prose needed two amendments** (appended, naming the superseded text): `spotchecks=47` vs
  the measured 46, the `controls/*-base.txt` pointers, the sources census's late capture, the recovery
  arm's "journal retired" wording, the `n ≥ 25` vs `≥ 26` floor, and the post-freeze `A` move.

- **The split does not make the map optional.** A red map is printed on every `--check`, and
  `readme-map.mjs` remains the map's gate. `--adopt` still refuses when its own delta cannot be proven
  (duplicate row, corrupt pre-image, a changed other finding), and `recover()` — the crash path — still
  completes an interrupted adoption only on a globally clean map; that criterion is now stricter than
  `--adopt`'s and is pre-registered as round-81 candidate 2, not fixed here.
- **`otherFindings` filters by substring.** A finding whose text merely *contains* the target key would
  be stripped from the comparison; no oracle finding today can, and the reviewer seat is asked to try.
- **Snapshot-bound scores can go stale.** The O integer no longer reacts to a live member that appears
  between re-captures; the watch is the non-scoring `omp-census --compare` item. The receipt carries no
  age field (round-81 candidate 5).
- **The C2 counter's live arms read a fixture root**, not the host's `~/.omp/agent`: a closure on
  another host re-derives arms 1–11 and arm 12 unchanged; arm 12 is the only host-independent live
  reading and it materialises the receipt itself.
- **The C1 counter's fixtures are minimal lanes** (oracle + corpus + pins), not full trees; a defect
  that needs a real 197-file corpus is covered by arm 13 only.
- **`A` in the stanza counts every runnable file in the tree**, including the two new `.ufo/waves`
  counters (884 → 886). Future rounds must re-measure `A` after adding probes; the operability integer
  is terminal at 9 regardless.
- **The r77 probe's label arms are red** (9/13) at this round's bytes; that is recorded history, not a
  regression of behavior (c2.5–c2.13 pass).

## Errata (round 81; append-only; supersede only the named text)

R80-1 … R80-12 are answered here or in the round-81 lesson (`corpus/lessons/round-81.md`).
Where a file is not an append-only round record the repair is in place; where it is, the
correction is named here and the original bytes are not rewritten.

1. **R80-1 — `open/checklists-scaffold.txt` does not exist.** The "39/39 at the scaffolding
   `6d03402f`" reading has no committed receipt. The measured reading is the close run in
   `.ufo/waves/round-80/close/checklists.txt`; the scaffolding-time claim is withdrawn.
2. **R80-2 — README-map close value.** The §Counters row that reads `CLEAN files=197 rows=197
   covered=197` is superseded by `README_MAP: CLEAN files=198 rows=198 covered=198`
   (`.ufo/waves/round-80/close/readme-map.txt`, rev `6cbd6750`).
3. **R80-3 — C1 base pass count.** "6/13 (5 of the 13 pass at base)" is superseded: six arms
   pass at base (6, 7, 9, 10, 11, 12) — `.ufo/waves/round-80/open/c1-base.txt`.
4. **R80-4 — mis-cited conflation transcript.** The base `--adopt` → `REFUSED_ORACLE` receipt
   is `open/c1-base.txt` arm 08, not `open/conflation.txt` (which shows `ALREADY_ADOPTED`).
5. **R80-5 — S119 quote word count.** The Gate's "21 words" is superseded by 19 (`wc -w`);
   the gate-side fix is `corpus/QUALITY.md` Q74 (round 81).
8. **R80-8 — LOG selftest value.** The LOG entry's "spotcheck-adopt selftest 26 → 28" is
   superseded by 26 → 34 (`close/spotcheck-selftest.txt`); 28 is the scaffolding reading.
9. **R80-9 — "final tip".** The report's receipt row is measured at `6cbd6750`; `01d12789`
   changes only close-receipt bytes.
10. **R80-10 — base receipts lack the process exit code.** The probes return 1 on a shortfall;
    the receipt should carry `exit=1`. Round 81's counters append the exit line to every
    control receipt.
11. **R80-11 — adoption stdout uncommitted.** Round 81 commits its own adoption transcript at
    `.ufo/waves/round-81/open/spotcheck-adopt.txt`; the round-80 transcript is not
    reconstructable and stays void.
12. **R80-12 — duplicate-gate red-before uncommitted.** Same disposition: the failing run is
    not on record; the S233 withdrawal is re-derivable from the registry at `509afb1d` vs
    `6cbd6750`, and no receipt is fabricated for it.
