# K80ConnectSiblings — sibling-overlap scan for C1 and C2 (round 80, wave 1)

Seat: connector (leaf, no dispatch). Axes served: **operability + coverage** (adjacency evidence only).
Read-only investigation. No production edits, no sibling execution, no clone, no fixture, no counter run.
Only this file was written in the lane.

Lane observed at `509afb1d6ec5fc854c1398ae0060d6298ed621d1` (`round-80: corpus increment — two
sourced knowledge entries (S233/S234) + captures; r79 lesson erratum (D3/D4); round-s…`).
All sibling references are relative to `/home/vgpnk/Projects/shokunin/`; lane references are relative
to `kumitate-shokunin/`. Current-tree source reads are not sibling green/red receipts.

## Verdicts

| Claim | Same-ground found? | Verdict | Nearest holders |
|---|---|---|---|
| **C1** — two-reading verdicts + scoped writer delta validation | **No** | **adjacent** (6 surfaces) | souji (README map agreement), kotoba (spotcheck-set identity + per-gate battery), kaidoku (bullet-scoped assertion), kasegi (adopt proposal, unlanded), kagi (spotcheck file as pinned subject) |
| **C2** — snapshot-bound O terms, live root behind opt-in | **No** | **clear** (adjacent mechanism only) | kagi (live-host coverage/freshness gate), kotoba (substrate repin, host-census refusal), chousa (receipt-digest-in-tree), mori (`snapshot_tampered`) |

---

## C1 — two-reading verdicts / scoped writer validation

**Verdict: adjacent, not same-ground.** No sibling holds the ground C1 moves: none separates a
*population reading* from a *map reading* of one claim, and none scopes a **writer** to its own delta.

### C1-a. souji — README coverage-map agreement (same substrate, different key, keeps the fold)

`souji-shokunin/tools/souji-coverage-agreement.py:1-20` is a coverage-map agreement instrument over
`corpus/README.md` tables whose first header cell is `ground` and third begins `entries`. It already
splits its findings into named classes rather than one blob:

- `:7` `MISSING-FROM-MAP` — entry with front-matter `ground: F<k>` named by no knowledge path of any F<k> row
- `:8` `DANGLING-MAP-PATH` — knowledge path absent from `corpus/knowledge` at rev
- `:9` `KILL-RULE` — (`--base-rev` only) base-grounded entry lost or re-grounded at rev
- `:17` `Exit 0 iff X == 0 and V == 0, 1 otherwise, 2 refused`

**Relationship.** Same substrate as C1's `MAP:` line — the lane's own `corpus/README.md` index — but a
different key (front-matter `ground: F<k>` versus the spotcheck set) and, decisively, it *retains the
global-clean fold* (`:17`). C1's move is the removal of exactly that fold for its own tool plus a scoped
writer; souji does not supply either. **Adjacent; souji owns its own map, kumitate must not touch it.**

### C1-b. kotoba — `spotcheck-identity` guard (closest single analogue: the spotcheck set *is* read by an instrument)

`kotoba-shokunin/verifiers/check_tip_battery.py:54-59` carries a guard:

> `spotcheck-identity` — every `corpus/lessons/*-verifier-spotcheck.md` present at the base is
> byte-identical (same blob SHA) at `<rev>`. A file *added* at `<rev>` is not a base file and is
> reported as INFO, never a failure.

Implemented at `:340-343` (`failures.append(("spotcheck-identity", "%s absent at %s" …))` /
`"%s differs from the base blob %s"`).

**Relationship.** This is the only sibling instrument that enumerates the fleet's
`*-verifier-spotcheck.md` population. It is an **immutability guard** (base blobs must not move), not a
coverage reading against a map, and it has no adopt writer. Its INFO disposition for a *newly added*
spotcheck file is, however, the same asymmetry kumitate's r80 open drift needs (the drift is an added
`corpus/lessons/round-79-verifier-spotcheck.md`). **Adjacent; prior art on the population, no overlap.**

### C1-c. kotoba — per-surface disclosure with a retained aggregate fold (structural near-miss)

`kotoba-shokunin/verifiers/check_tip_battery.py:30-31`:

> Output: one `gate <path> exit <rc>` line per command, then the frozen line
> `tip battery exit 0: N of 6`. Exit 0 iff N == 6 …

**Relationship.** This is the *display* half of C1 — one reading line per surface plus a summary — but
the exit is still `0 iff N == 6`, i.e. one surface's defect sinks the whole verdict, and there is no
writer. C1's `SPOTCHECK_COVERAGE:` + `MAP:` split differs in that the tool's *own* verdict is the
spotcheck set while the map is a separate disclosed line, and `--adopt` validates its own delta.
**Adjacent; useful contrast to name, not a duplicate.**

### C1-d. kotoba — report-pointer ground (already recorded as kotoba's)

`kotoba-shokunin/PROVINCE.md:31` names `verifiers/check_report_pointers.py` for report pointers
(landed r73). Header `kotoba-shokunin/verifiers/check_report_pointers.py:22-23`:
`prints "report pointers resolved N of M; unresolved U", exit 0 iff U == 0`. Same global-clean exit
shape as C1 removes, different subject (report backticked pointers, not a spotcheck/map pair).
**Confirmed kotoba-owned; not contested by C1.** C1's own `POINTER_DEAD`-family finding is a
*consumer* of this ground, not a second owner of it.

### C1-e. kasegi — `--adopt` exists only as an unlanded proposal

`kasegi-shokunin/.ufo/waves/round-29/wave1/ConnStagedCensus.md:94-100` proposes a
**Staged Adoption Pre-flight Validator** with `--adopt S031,S032,S033`. It was never landed:
`grep -rn -w -i adopt kasegi-shokunin/SKILL.md` returns nothing, and the only two `--adopt` hits in the
fleet outside kumitate are that report and its round-30 successor
(`kasegi-shokunin/.ufo/waves/round-30/wave1/ConnStagedCensus.md:148`).

**Relationship.** Adjacent in vocabulary only: pre-flight *refusal* of staged rows versus C1's
post-write *delta* validation of an adopted key. **No overlap; do not cite kasegi as an adopt
implementation.**

### C1-f. kagi — spotcheck lesson file as a pinned subject

`kagi-shokunin/SKILL.md:751` registers `python3 corpus/closure-dispositions.py` whose input
`corpus/closure-dispositions.json` carries "the source sha256 of
`corpus/lessons/round-22-verifier-spotcheck.md`", exit 2 on "source digest mismatch".

**Relationship.** A spotcheck file as a *pinned digest subject*, not the spotcheck *set* as a reading.
**Adjacent, one file wide.**

### C1-g. kaidoku — bullet-scoped assertion replacing a whole-file fold (same defect class, different subject)

`kaidoku-shokunin/.ufo/waves/round-50/w3/ExecTriageV5.md:57` (F16) records the defect and its repair: a
selftest case "searched the claims file as a WHOLE, so it still PASSED when the 'Counting command'
bullet itself went stale — the frozen-details bullets carry the right strings elsewhere", and the patch
"binds the check to the BULLET". `:58` (F17) lands it standalone at
`kaidoku-shokunin/.ufo/waves/round-50/w3/ExecTriageV5/patches/check-claim-counting-bullet.py`
(exit 0 when the bullet names the declared base and the seat-measured before-state, 1 when the bullet is
stale or names the superseded base, 2 when the claims file cannot be read), because editing the frozen
instrument "would stale every falsify receipt".

**Relationship.** The same *defect class* C1 repairs — a verdict reading more surface than the thing it
validates, so an unrelated region's correctness masks a stale target — and the same repair shape
(scope the assertion to its own subject). It differs in subject (a claims-file bullet, not a
spotcheck/map pair) and in writer (a standalone patch forced by a frozen instrument, not an `--adopt`
path that mutates a map). **Adjacent; the strongest conceptual prior art for C1's scoping idea.**

### C1-h. A sibling already scanned this exact instrument and found nothing

`kama-shokunin/.ufo/waves/round-75/w1/CON01Overlap.md:92` classifies
`kumitate-shokunin/scripts/spotcheck-adopt.mjs:3` as **`I` = incidental policy prose/helper, "not a
duplicate r75 instrument"**, inside a bounded fleet scan (its legend: `I = incidental policy prose,
helper, or process-survivor meaning, not a duplicate r75 instrument`).

**Relationship.** Independent prior evidence that a sibling connector seat inspected this file and did
not find an equivalent. It is a round-75 classification of a different claim set, not a green verdict
on C1's ground — but it is the strongest single corroborator of "no same-ground holder".

### C1-i. The `conflat` sweep (explicitly requested) — domain and record prose only

`grep -rn -i conflat` over every sibling lane (`--include=*.md`, excluding `.git`/`node_modules`,
`head -40`) returns matches in **audio** and **chousa** only. Every match is domain or record prose about
conflating two *measured things* in that lane's own subject — fork-kind classes
(`audio-shokunin/LOG.md:1241`), code-work versus receipt-carrying revision
(`audio-shokunin/corpus/lessons/round-101.md:32`), declared claim axes
(`audio-shokunin/reports/round-68/r68-author.md:80`), evidence *of* a round versus artifacts *from* it
(`chousa-shokunin/.ufo/waves/round-40/w1/CriticC1Scope.md:45`), and a receipt count that double-counted
echoes (`chousa-shokunin/.ufo/waves/round-32/w2/ReviewRepairs32.md:28`). **None** describes a *verdict*
that folds two readings of one claim into one exit, and none names an instrument. This is a **bounded
absence**: the sweep was `head -40`-limited and not paged to completion.

---

## C2 — snapshot-bound derived scores (`O_members`, `O_findings`, `O_bound`, `coverage_omp`)

**Verdict: clear.** The O terms are kumitate-only.

### C2-a. Fleet uniqueness of the O vocabulary

`grep -rn -E "O_members|coverage_omp|coverage:omp|omp-shape"` over the whole fleet root excluding
`kumitate-shokunin/` returns **no sibling lane hit**. The only matches are the fleet-root reports of
kumitate's own prior rounds (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-75/kumitate.md:10,77,173,194`,
`round-76/kumitate.md:3,5,28,83,86,109,140`, `round-77/kumitate.md:1,5,6,7,25,27,28,82`) and one
`.jj` operation-log blob. No sibling declares, derives or scores an OMP agent-root term.
**No same-ground holder; no ownership contest.**

### C2-b. kagi — a scored axis derived from a live host surface (the anti-pattern, held as debt)

- `kagi-shokunin/SCORECARD.md:65` — coverage `6 → **8**` row, cell cites
  `bash corpus/surface-census.sh` ⇒ `SURFACE_CENSUS: CLEAN (assets=20 runtime=15 scanned=4 ok=34
  absent=2 skipped=0)` and names `~/.config/opencode` (20 children) / `~/.local/bin` / `~/.agents`
  among the deliberately-unenumerated surfaces.
- `kagi-shokunin/corpus/surface-census.sh:10` — "v1 compares **the live host** against two committed
  data files and exits non-zero on any change."
- `kagi-shokunin/SCORECARD.md:328` — coverage `9`: "on the round-18 host three of the four pinned dirs
  are absent and the fourth (`~/.config/opencode`) shrank 20→3 children, **so the live claim is
  carried debt, not current evidence**."
- `kagi-shokunin/SCORECARD.md:112` — freshness `8 → 8`: a symbol pin on
  `$HOME/.local/bin/the-janitor` L248, "the probe turns the whole `op`-behaviour contract into a drift
  verdict."

**Relationship.** This is the *exact failure mode* C2 removes — a scored axis whose value moves with
operator-owned host churn — and kagi names it as carried debt rather than repairing it. kagi has **no
snapshot-receipt default and no live opt-in**; its committed TSVs are the *expected* side, not the
*scored* side. **Adjacent mechanism, opposite repair; kagi is not a second owner of C2.**

### C2-c. kotoba — snapshot-bound re-derivation of host substrate (closest mechanism analogue)

`kotoba-shokunin/verifiers/check_substrate_repin_v2.py:1-30`: "the host substrate is re-derived and
re-pinned. The omp half is a path move onto `~/.local/bin/omp.real` … the opencode half is a new binary
lineage (v2.1.4 at `~/.opencode/bin/opencode`)"; the counter extracts `git archive <rev> -- verifiers
corpus` and runs the tree's own default paths and baselines.

**Relationship.** Snapshot-bound re-derivation of a host surface from committed bytes — the same
*shape* as C2 (committed receipt is the arbiter, host is read only on demand). It pins **substrate
bytes**, not a **derived score**, and it has no `--live` opt-in because it never scores the live root.
**Adjacent; cite as prior art for revision-extracted re-derivation.**

### C2-d. kotoba — explicit refusal to pin a host surface (a stance contradiction, not an overlap)

`kotoba-shokunin/verifiers/check_host_skill_surfaces.py:18-20`: "expected identity is **not pinned
anywhere**, so this instrument guards measurability, not expected bytes. … drift is a finding, not an
instrument failure."

**Relationship.** kotoba deliberately leaves its installed-copy surface unpinned because no pin exists;
C2 creates the pin it would need for the OMP root. Different surface, and kotoba's refusal is
*principled* (no expected bytes are known), not a claim that pinning is wrong. **Adjacent; must be
stated so C2 is not read as contradicting kotoba's census.**

### C2-e. chousa — receipt-bound digest re-derivation with an out-of-tree refusal

`chousa-shokunin/SCORECARD.md:3176` — `tools/digest-in-tree.py`: "verify that every sha256 a receipt
pins re-derives from committed blob bytes … with per-digest `OUT_OF_TREE` naming and fail-closed
`NO_DIGESTS`; rejects the recorded r66 scratch-clone receipt 0/2 while committed-fixture receipts pass
in both modes."

**Relationship.** The closest precedent for C2's *refusal* arm: a receipt whose bytes are not in the
tree is named and refused rather than silently accepted. C2 arm 5 (`receipt-absent` →
`OMP_SHAPE_NOT_FOUND` exit 2, "never a silent live fallback") is the same disposition applied to a
shape receipt instead of a digest receipt. **Adjacent; different subject (digests vs O terms).**

### C2-f. mori — snapshot-tamper refusal

`mori-shokunin/SKILL.md:811` — "a changed input is `snapshot_tampered` (exit 2) before any run. The arm
runs the pinned copy." Related: `mori-shokunin/tools/mori-pin-check.py:1-14` re-measures SKILL gate
pins against a baseline and refuses a moved pinned command.

**Relationship.** Tamper detection on a pinned snapshot ≈ C2 arm 4 (`pin.omp-shape` hash in
`kumitate-gate-pins-v1`; tampering fires `GATE_PIN_DRIFT`). **Adjacent; no score derivation.**

### C2-g. kama — pin-file discipline over upstream releases

`kama-shokunin/tools/pin-watch.py:5` ("Pins file (TSV, `registry/engine-pins.tsv`), header then one row
per pin") and `:42` (`pin-watch.py check --pins registry/engine-pins.tsv [--tags-dir DIR]`).

**Relationship.** Committed pin file plus an offline comparison path — the same "committed bytes decide,
network optional" shape. Subject is upstream release tags, not a derived axis. **Adjacent.**

### C2-h. revenger — a live re-probe explicitly demoted from scoring (precedent for the non-scoring checklist item)

`revenger-shokunin/SCORECARD.md:728` — freshness row: "engine-record currency (**re-verification, not a
scored criterion**) — ida, jadx, binwalk/unblob, pwntools re-probed 2026-11-01 with the wider probe
(PATH + `~/tools` + `/Program Files` + python imports)".

**Relationship.** C2 demotes the live OMP root to the non-scoring `omp-census --compare` checklist item;
revenger already holds exactly that separation for engine records. **Adjacent precedent; useful to cite
so the non-scoring live watch reads as fleet practice, not a kumitate invention.**

### C2-i. Other lanes with `~/` in SCORECARD — mentions, not derivations

Counts of `~/` per lane `SCORECARD.md`: kake 20, kengaku 19, kasegi 18, kagi 15, kaidoku 8, mado 8,
tabi 4, lore 2, revenger 2, tameshi 1, chousa 0, souji 0, kotodama 0, mori 0, audio 0, game-dev-2d 0,
game-dev-3d 0. Spot-checked in derivation position (backticked command cells): kake `:60,62,66,67`
(project-tree provenance), kengaku `:64,65` (working commands lived outside the repo; endpoint
re-verification), kasegi `:9,15,16` (removed source trees), kaidoku `:288-291` (version pins read from
`~/.config/devin/mcp_config.json:7`, `~/.omp/agent/mcp.json:8`), mado `:503`, tabi `:1956,1958`
(engine install paths), lore `:568,569`, tameshi `:2729`. **None derives a scored axis from a live
root by formula except kagi (C2-b).** kumitate's `coverage:omp` has no sibling formula analogue.

---

## Contradictions (stated, not smoothed)

1. **tsukuroi vs C2 — opposite disposition for a host snapshot.** `tsukuroi-shokunin/SKILL.md:41`
   labels its host snapshot "(2026-10-14, host `plazir27`)** — re-measure; **never quote it as current
   state**." C2 promotes a host-shape receipt to the *default scoring source*. Both are defensible for
   their subjects (tsukuroi: package/host state that decays; C2: a shape receipt re-derived at a named
   member count and pinned), but the fleet now holds two opposite rules for "host snapshot". C2's
   report must say *why* its receipt is not a perishable host snapshot (it is a committed, pinned,
   re-derivable shape with a disclosed `source=snapshot`, and the live root keeps a non-scoring watch) —
   otherwise a reviewer can cite tsukuroi against it.
2. **kotoba vs C2 — pinned versus deliberately unpinned.** `check_host_skill_surfaces.py:13-19` refuses
   to pin its surface for lack of expected bytes; C2 pins. Not a conflict of policy, but a reader
   comparing the two will see one lane pinning what another declines to pin. Name the difference in
   subject and in what grounds the expectation.
3. **kagi vs C2 — kagi keeps the anti-pattern.** If C2 lands, `kagi-shokunin/SCORECARD.md:65,112,328`
   remain live-host-derived. Kumitate's green is **not** fleet-wide evidence, and this round does not
   repair kagi.
4. **souji vs C1 — souji keeps the global fold.** `souji-coverage-agreement.py:17` (`Exit 0 iff X == 0
   and V == 0`) is exactly the shape C1 removes for `spotcheck-adopt`. C1 must not be described as a
   fleet-wide verdict-design change; it is one tool's split.
5. **C1's own evidence base is a fleet convention, not a lane asset.** 198 sibling
   `corpus/knowledge/*.md` files mention `spotcheck`/`spot-check`; almost all are prose references to
   `corpus/lessons/round-NN-verifier-spotcheck.md` closure lessons. The *population* is fleet-wide; the
   *reading* is kumitate's. Do not let the population's breadth imply shared ground.

---

## Overlap reporting (report, never absorb)

- **C1 — no overlap report is owed.** No sibling holds scoped-writer delta validation. The round report
  owes **prior-art credit** to `souji-shokunin/tools/souji-coverage-agreement.py:1-20` (README-map
  agreement on the same substrate, retaining the fold C1 removes), `kotoba-shokunin/verifiers/
  check_tip_battery.py:54-59,340-343` (the only instrument that enumerates the spotcheck population)
  and `:30-31` (per-surface lines with a retained aggregate), and
  `kaidoku-shokunin/.ufo/waves/round-50/w3/ExecTriageV5.md:57-58` (the same whole-file-versus-subject
  defect class, repaired by scoping the assertion), and must not claim the two-reading *display* or the
  scoping idea as novel. Nothing is routed to souji, kotoba or kaidoku; no lane's tool is edited or
  invoked.
- **C2 — no overlap report is owed and no lane is a second owner.** The O vocabulary is kumitate-only
  (C2-a). `kagi` holds the *anti-pattern* rather than the ground; the only thing owed to kagi is a
  **disclosure** that its live-host coverage/freshness rows are unaffected by this round, and that
  observation is filed here, not sent as a repair request. Prior-art credit is owed to
  `kotoba-shokunin/verifiers/check_substrate_repin_v2.py:1-30` (revision-extracted re-derivation),
  `chousa-shokunin/SCORECARD.md:3176` (`OUT_OF_TREE` refusal), `mori-shokunin/SKILL.md:811`
  (`snapshot_tampered`), and `revenger-shokunin/SCORECARD.md:728` (live re-probe demoted from scoring).

## One bounded connector move (proposal only — no code, counter, freeze or gate change)

**Add one `prior-art` line to each claim's report section that names the sibling instrument holding the
adjacent ground and the one sentence of how it differs, and keep every sibling verdict at "adjacent" —
never "duplicate", never "cleared by".** This is a report-presentation move only.

Affected axes: **adjacency** improves (the round's novelty claim becomes falsifiable against a named
instrument instead of an unqualified "new"); **operability** and **coverage** are unchanged — same
commands, inputs, exit maps and populations. The no-harm assessment is an inference, not a measured
promotion.

Second-order effects. *Runtime*: no sibling tool is executed or imported; no new runner. *Contract*:
C1's and C2's kill rules and arms are untouched; the prior-art line cannot rescue a failed arm.
*Substrate*: the cited sibling files are read at their current trees, so the line is only as fresh as
this scan — it must carry `lane@HEAD` if the closure re-cites it, or the pointer goes stale the way the
r79 lesson's dead pointers did. *Verification*: a reviewer can open each cited `file:line` and check
the "differs by" sentence without trusting this seat.

Risk: naming a sibling instrument invites the opposite error — a reader concluding the sibling
*vouches* for the claim. Every line must state "adjacent; not a duplicate, not a green verdict", and
none may be written as a comparison of counts (kagi's 20→3 and kumitate's 64→65 are different
populations and are not comparable).

## Custody

- Commands executed (all read-only; no git/jj mutation anywhere): `git -C
  /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` → `509afb1d6ec5fc854c1398ae0060d6298ed621d1`
  exit 0; `git -C … log -1 --format='%s'` exit 0; `ls -d`/`grep -rn`/`sed -n`/`wc -l` over the fleet
  root and all 20 sibling lane roots (21 `*-shokunin` roots including kumitate), exit 0. No process
  exit code is claimed for a grep/sed observation.
- No clone, fixture, worktree, counter, selftest, build or test was run. No sibling command was
  executed. No sibling pass/fail is measured or implied.
- Scratch `/fast/scratch/hyaku/kumitate-r80/K80ConnectSiblings` created with `mkdir -p` and removed with
  `rmdir` (unused); nothing written under `/tmp`.
- Tools installed or updated: **none**.
- Report path: written at the seat trailer path `.ufo/waves/round-80/w1/K80ConnectSiblings.md`; the
  seat's directory clause (`w1/<seat name>/`) was not used, to avoid a second findings artifact. Only
  this file was created in the lane.
