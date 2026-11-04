# K80CriticClaims — round 80 claim/honesty attack

Seat K80CriticClaims (critic, leaf). Lane HEAD `509afb1d6ec5fc854c1398ae0060d6298ed621d1`
(snapshot 2026-11-04T06:13-03:00); base archive `1968689f`; scaffolding archive `6d03402f`.
Node v24.21.0. No tools installed (nothing needed). Receipts referenced below live in
`.ufo/waves/round-80/w1/K80CriticClaims/`; scratch `/fast/scratch/hyaku/kumitate-r80/K80CriticClaims`
was deleted after the runs (nothing citable lives there).

## Verdict

| object under attack | result |
|---|---|
| C1 claim sentence: `held=13/13` exit 0 at M; base `<13` exit 1 | **HOLDS** (13/13/0; 6/13/1, reproduced) |
| C1 "the split is a semantic move, not a relabel" | **HOLDS** — a conflated implementation that prints both lines (and a self-consistent 28/28 selftest) still scores **10/13**, failing exactly arms 03, 04, 08 |
| C1 "`--adopt` validates its own delta: target resolves, **every other finding unchanged**" | **WEAKENED** — a candidate with the `sameOther` half deleted scores **13/13**; no frozen arm discriminates it. The filter is `!f.includes(key)`, so findings about *other paths* that contain the key are excluded from the comparison |
| C1 "instead of demanding a globally clean map" | **PARTIAL** — true for the uninterrupted `--adopt`, false for crash recovery: `recover()` still rolls back unless `result.clean`; demonstrated on the same red-map state where a direct adopt succeeds |
| C2 claim sentence: `held=12/12` exit 0 at M; base `<12` exit 1 | **HOLDS** (12/12/0; 4/12/1, reproduced) |
| C2 `source=snapshot`/`live` truthfulness, including fail-closed bodies | **HOLDS** by direct run; the fail-closed `source` field is **not asserted by any arm** |
| C2 "snapshot default hides live drift the old default caught" | **YES, by design and disclosed** — default MATCH with `O_findings=0` on a root the old default flagged; the compensating watch is the non-scoring `omp-census --compare` checklist item, which does catch `changed=1` (mode drift) |
| do-nothing control rule (base 6/13 and 4/12 committed before scaffolding) | **HOLDS** — freeze `c6a7ebd3` is the parent of scaffolding `6d03402f` and contains both base receipts; both counts reproduced exactly |
| round honesty (plan record) | **FAIL** — the committed plan (HEAD) says the base archive reads **`0/13`** (actual `6/13`) and cites **`controls/c1-base.txt`** / **`controls/c2-base.txt`**, which do not exist (the receipts are `open/c1-base.txt`, `open/c2-base.txt`). The fixing amendment exists only as an **uncommitted working-tree edit** and does not fix the pointers or the count |

Impacted axes: **operability** (claim holds; recovery-path asymmetry is a real defect inside C1's
scope), **coverage:omp** (claim holds; the scoring surface no longer watches the live root — disclosed
tradeoff, watch is manual/non-scoring; the pinned receipt includes an operator backup), **honesty/freeze**
(plan pointers and count above).

---

## 1. Claim sentences reproduced

Commands run on `git archive` copies in scratch (`--work` always inside scratch).

| run | command | observed | receipt |
|---|---|---|---|
| C1 at M (`6d03402f`) | `node scaff/.ufo/waves/round-80/probe/probe80-c1.mjs --set c1` | `C80_C1: HELD held=13/13`, exit 0; arm 12 selftest 28/28 | `run-c1-scaff.txt` |
| C1 at base (`1968689f`) | same, `--tool base --lane base` | `C80_C1: HELD held=6/13`, exit 1 (passes arms 06,07,09,10,11,12) | `run-c1-base.txt` |
| C1 at live lane HEAD | lane probe, default lane | `held=13/13`, exit 0; `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0`, `MAP: CLEAN` | `run-c1-live-lane.txt` |
| C2 at M | `node scaff/.ufo/waves/round-80/probe/probe80-c2.mjs --set c2` | `C80_C2: HELD held=12/12`, exit 0 | `run-c2-scaff.txt` |
| C2 at base | same, `--tool base --lane base` | `C80_C2: HELD held=4/12`, exit 1 (passes arms 04,06,07,11) | `run-c2-base.txt` |

After-state spot checks at `6d03402f` (receipt `c2-attacks.txt`):

```
OMP_AGENT_ROOT=/nonexistent node scaff/scripts/proxy-check.mjs --self scaff
PROXY: MATCH (... O_members=65 O_findings=0 O_bound=35 coverage:omp=10; ...; source=snapshot)  exit=0
node scaff/scripts/proxy-check.mjs --self scaff --omp-live
PROXY: MATCH (... O_members=65 ...)                                                          exit=0
node scaff/scripts/omp-census.mjs --compare scaff/.ufo/pins/omp-shape.json   # live root 65
OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0     exit=0
```

The C2 claim sentence's "at the base tree … held below 12 and exits 1" is true (4/12, exit 1).

## 2. C1 — the split is a real move; a relabel does not score 13/13

Counterexample attempt (`cand-fold/`): the v3 `--check` two lines are kept, but the exit stays the
old conflated verdict (`result.clean ? 0 : 1`) and `--adopt` keeps the old global gate
(`if (!after.clean) throw`). Its own selftest was made self-consistent (28/28 PASS), so the only
differences from v3 are the two conflated decisions.

Observed (`run-c1-fold.txt`):

```
C80_C1 arm 03 map-only-drift-green-coverage: FAIL exit=1
C80_C1 arm 04 map-orphan-row-green-coverage: FAIL exit=1
C80_C1 arm 08 adopt-on-red-map: FAIL exit=2
C80_C1: HELD held=10/13
```

So the frozen counter **does** discriminate the fold: it cannot reach 13/13 by printing the two lines
while keeping the conflated logic. The plan's kill rule ("a tool that still folds the map fails 3, 4
and 8") reproduces exactly. A variant that folds only the adopt path (`cand-adoptfold/`) fails arm 08
(`held=11/13`, the extra selftest failure is an artifact of the unpatched mutant selftest).

Conclusion: the split changes verdict semantics (exit 0 on a green spotcheck set with a red map;
adopt proceeds on a red map), not just labels. I could not build a relabel scoring 13/13.

## 3. C1 — the delta rule's second half is not discriminated, and is narrowed

### 3.1 The counter cannot see `sameOther`

`cand-nodelta/` is the shipped v3 with one line changed:

```js
- if (!after.valid || target.row || target.pin || !sameOther) throw new Error('oracle refused');
+ if (!after.valid || target.row || target.pin) throw new Error('oracle refused');
```

Observed (`run-c1-nodelta.txt`): `C80_C1: HELD held=13/13`. No arm exercises "every other finding
unchanged"; arm 08's unrelated `uncovered:knowledge/late.md` is identical before and after, so it
would pass with or without the comparison. The claim sentence and SKILL row 631 ("every other finding
is unchanged") are therefore only half-checked by the frozen instrument.

### 3.2 The filter drops other paths' findings

`scaff/scripts/spotcheck-adopt.mjs:40-41`:

```js
function otherFindings(result, key) {
  return [...new Set(result.findings.filter((f) => !f.includes(key)))].sort();
}
```

`includes` is a substring test on the whole finding string. A finding for a **different path** that
contains the target key is silently excluded from the delta. Fixture (`c1-substring.txt`): README has
an orphan row ``| `lessons/round-75-verifier-spotcheck.md.orig` | Ghost | fixture |``; the oracle reports
`first=orphan-row:lessons/round-75-verifier-spotcheck.md.orig`; `otherFindings` for that set is `[]`;
`--adopt` the target exits 0 with the red finding still present:

```
README_MAP: note uncovered:lessons/round-75-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-75-verifier-spotcheck.md
README_MAP: DRIFT files=2 rows=2 covered=1 bad=3 first=orphan-row:lessons/round-75-verifier-spotcheck.md.orig
...
SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md wrote=both
README_MAP: DRIFT files=2 rows=3 covered=2 bad=1 first=orphan-row:lessons/round-75-verifier-spotcheck.md.orig
adopt_exit=0
```

The output does disclose the DRIFT line, so this is a narrowed guarantee rather than a silent write:
"every other finding byte-identical" is implemented as "every other finding **not containing the key
as a substring**". A finding about `lessons/round-75-verifier-spotcheck.md.orig` is "other" but is not
compared.

### 3.3 New-defect attempts: closed

I could not construct a state where `--adopt` **creates** a defect that the delta rule cannot see:

- target must exist and be a regular file in `corpus/lessons` (`lstat` check, else `REFUSED_ABSENT`/
  `REFUSED_OUT_OF_SCOPE`), so no new `orphan-row:<key>` can be produced;
- a duplicate row for the target is refused **before** the write (`format-unmapped`/`duplicate-row`
  scanned on the pre-image oracle), so no new `duplicate-row:<key>`;
- any new `format-unmapped` after the write makes the after-oracle `FAIL-CLOSED` (exit 2), so
  `after.valid` is false and the journal rolls back;
- the only post-write findings that can name the key are `uncovered:<key>` / `unpinned:<key>`, both
  checked by `missing(after, key)`.

### 3.4 Crash recovery still demands a globally clean map (counterexample)

`scaff/scripts/spotcheck-adopt.mjs:140-141`:

```js
let outcome = 'complete';
if (!result.clean) {
  // Validate both images before restoring either destination.
```

`recover()` decides complete vs rolled-back on `result.clean`, the criterion v3 removed from
`--adopt`. Fixture `fx-crash` (`c1-crash-recovery.txt`): target spotcheck uncovered; `knowledge/late.md`
uncovered and unpinned (unrelated red map).

1. Direct adopt: `SPOTCHECK_ADOPT: ADOPTED ... wrote=both`, exit 0.
2. Same fixture reset; `SPOTCHECK_ADOPT_TEST_CRASH=row` kills the process after the README replacement
   (journal published with valid pre-images).
3. Next `--check`: `RECOVERED corpus/lessons/round-75-verifier-spotcheck.md rolled-back`; the target row
   and pin entry are gone.
4. Retry `--adopt`: `ADOPTED ... wrote=both`, exit 0.

So the same valid adoption succeeds when uninterrupted and is rolled back after a crash, because the
recovery path still folds the map. This is a real asymmetry inside C1's operability scope. The round
already knows it: SCORECARD round-81 pre-registration candidate 2 names exactly this ("`recover()`
still completes an interrupted adoption only when the whole map is clean (`result.clean`), the
criterion v3 removed from `--adopt`"). The frozen arm 11 (`rollback-clean`) does **not** test it: its
journal pre-images are corrupt (`sha256: 'deadbeef'`) so recovery throws on the pre-image check before
reaching `!result.clean`.

## 4. C2 attacks

### 4.1 The snapshot default hides live drift; the watch is the non-scoring compare

Fixture root materialised from the 65-entry receipt with `mcp.json` mode changed to `0644`
(receipt `c2-attacks.txt`):

```
new default (no flags):      source=snapshot ok=True  verdict=MATCH O_findings=0 kinds=[]
new --omp-live same root:    source=live     ok=False verdict=DRIFT O_findings=1 kinds=[O_FINDINGS_DRIFT, COVERAGE_OMP_DRIFT, AXES_DRIFT]
old default (base proxy):    ok=False verdict=DRIFT O_findings=1 kinds=[C2_TOTAL_DRIFT, O_MEMBERS_DRIFT, O_FINDINGS_DRIFT, COVERAGE_OMP_DRIFT, AXES_DRIFT, ...]
omp-census --compare same:   OMP_SHAPE_COMPARE: DRIFT entries=65 receipt=65 added=0 removed=0 changed=1 first=mcp.json transient=0  exit=1
```

So `yes`: the new default hides a live drift the old default caught, including a **finding/mode** drift,
not only a member-set drift. The mitigation exists and works: `omp-census --compare` counts
`changed`, and it is a named checklist item (`SKILL.md:753`, "OMP shape receipt live comparison …
non-scoring"). It is manual and non-scoring; a close that runs only `proxy-check` no longer notices
live churn. The plan discloses this ("the live root keeps its watch through the non-scoring
`omp-census --compare` checklist item"); I could not falsify the sentence, but the tradeoff is real:
the scoring surface is now a statement about committed bytes only.

### 4.2 `source` labels: truthful, including fail-closed

```
--omp-live with /nonexistent root   -> source=live     verdict=FAIL-CLOSED  (OMP_ROOT_NOT_A_DIR)
default, empty --self (no receipt)  -> source=snapshot verdict=FAIL-CLOSED  (OMP_SHAPE_NOT_FOUND)
default with OMP_AGENT_ROOT=/nonexistent but receipt present -> source=snapshot, MATCH
--omp-live + --omp-shape            -> exit 64 (mutually exclusive)
```

`--omp-live` is never reported as `snapshot`: the default assignment is guarded by
`!opts.ompLive` (`proxy-check.mjs:3371`) and both bodies use `opts.ompShape ? 'snapshot' : 'live'`.
The text verdict appends `; source=snapshot` only for the snapshot path; live is disclosed in the JSON
body only. Gap: arms 5 and 6 assert exit 2 + token but **not** `json.source`, so a fail-closed body
mislabeling the source would still score 12/12.

### 4.3 Receipt pin, one derivation, offline re-derivation

```
sha256sum scaff/.ufo/pins/omp-shape.json = 84e41b9f…0c435 = pin.omp-shape (SCORECARD.md:331)
proxy default terms 65/0/35 == omp-census --shape on the same receipt (arm 09 PASS)
offline: HOME empty + --kimi-root fixture + OMP_AGENT_ROOT=/nonexistent -> MATCH source=snapshot (arm 03 PASS)
```

`proxy-check.mjs:330` imports `census`, `censusEntries`, `shapeFromFile` from `omp-census.mjs`, so
"one derivation" is genuine (not a duplicated reader). `pin.omp-shape` maps to
`.ufo/pins/omp-shape.json` (`proxy-check.mjs:552`) and a tampered receipt fires `GATE_PIN_DRIFT`
(selftest case at :2647; arm 04 PASS).

Note on the receipt content: the 65th member is the operator backup
`config.yml.pre-rebalance2-20261104` (the scaffolding diff adds only that entry). The axis integer is
now deterministic, but it is host-bound: the committed receipt freezes one host's backup habit into
the committed bytes. Disclosed in the plan's open state; not a claim falsification, but the canonical
judge should see it as a tradeoff, not a neutral refactor.

## 5. Do-nothing control and arm reachability

- Freeze `c6a7ebd3` is the parent of scaffolding `6d03402f` (`git rev-parse 6d03402f^`), and the
  freeze commit contains `open/c1-base.txt` + `open/c2-base.txt` (git show --stat). The base receipts
  therefore predate the scaffolding; the rule holds.
- Reproduced: C1 base `6/13` exit 1; C2 base `4/12` exit 1. Committed receipts match
  (`open/c1-base.txt`, `open/c2-base.txt`).
- Arms reachable without the claimed work: C1 base passes arms 06,07,09,10,11,12 (six pre-existing
  behaviors); C2 base passes 04,06,07,11 (round-77/78 behaviors). The flipping arms are exactly the
  new semantics: C1 arms 01–05, 08 (+13 depending on lane state); C2 arms 01,02,03,05,08,09,10,12.
  Arm 13 (C1 live-lane-clean) is also passed by the committed constant stub, so it is a
  line-shape/lane check, not a discriminator.
- Stub controls committed: `controls/c1-stub.txt` `held=3/13` and `controls/c2-stub.txt` `held=1/12`
  (read, matching the plan). Their stub **sources are not committed** (the wave dir contains only the
  two receipts), so these two control receipts are not re-derivable from repo bytes — provenance is
  the receipt alone.

Minor plan/counter mismatch: the plan says selftest `n ≥ 25`; the frozen counter requires
`Number(m[2]) >= 26` (`probe80-c1.mjs` arm 12). Actual is 28/28, so nothing fails, but the plan text
understates the implemented threshold.

## 6. Round honesty — the committed plan re-commits the class it says it mined

The plan's own mistake statement (plan :130-133): "a dead pointer in a filed record is a
`reference-drift` mistake … fixed by resolving every new pointer this round." The committed plan at
HEAD (`git show HEAD:.ufo/waves/round-80/plan.md`) contains:

```
47: `held=13/13`; the live lane after adoption reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=47
48: uncovered=0` + `MAP: CLEAN` exit 0; a `git archive` of the base tree reads 0/13 on the same counter
49: (`controls/c1-base.txt`); `node scripts/spotcheck-adopt.mjs --selftest` exits 0.
...
71: tree `1968689f` → held < 13 (`controls/c1-base.txt`); (b) a stub ...
...
120: tree → held < 12 (`controls/c2-base.txt`); (b) a stub ...
```

Facts (receipt `plan-freeze.txt`, `run-c1-base.txt`):

1. `controls/c1-base.txt` and `controls/c2-base.txt` **do not exist**. The freeze commit put the base
   receipts in `open/c1-base.txt` and `open/c2-base.txt`; `controls/` contains only the two stub
   receipts. The round-80 SCORECARD rows cite `open/…` correctly (lines 561, 563) — the plan is the
   only mis-citing record.
2. "reads 0/13" is false: the base archive reads `held=6/13` (reproduced; `open/c1-base.txt` agrees).
3. The correction lives in **Amendment 1**, which is an **uncommitted working-tree edit**:
   `git status --porcelain .ufo/waves/round-80/plan.md` → ` M`; `git show HEAD:…plan.md | grep -c
   "Amendment 1"` → `0`; the diff is 17 added lines. The amendment fixes the spotcheck count (47→46)
   and predicts a stanza reading, but it **does not** fix the two dead `controls/` pointers or the
   `0/13` sentence. A closure that reads the committed tree (as the base-tree counter does) still sees
   the stale values.
4. The amendment's predicted close stanza is already superseded by the working tree:
   `git status --porcelain` shows ` M SCORECARD.md` and the diff sets `C2=198` / `C2_total=198`
   (the amendment says 197) — `lane-worktree.txt`, 2026-11-04T06:16:57-03:00. The lane tree is a
   moving target during the wave; the close must re-measure rather than paste the amendment's
   predicted line. Not a claim falsification (no arm reads `C2`), but it is the same provenance risk.

Net: the round's two **claim sentences** survive; the round's **record** does not yet: its committed
plan carries a false count and two dead pointers, and the correction is neither committed nor complete.

## 7. Claims I could not falsify (stated plainly)

- C1 claim sentence, both directions, at the scaffolding archive and at live HEAD.
- C1 "the split is a semantic move" — every relabel/fold candidate I built scored below 13/13.
- C2 claim sentence, both directions.
- C2 "`source=snapshot` is truthful", including the fail-closed bodies (manually verified; not
  arm-asserted).
- C2 offline re-derivation (`HOME`/`OMP_AGENT_ROOT` absent, `--kimi-root` fixture → MATCH
  `source=snapshot`), receipt pin and `GATE_PIN_DRIFT`, `--omp-live` 68-member fixture → DRIFT
  `O_members=68` `source=live`, `--omp-live` on the real 65-member root → MATCH `source=live`,
  `omp-census --compare` live → `IN_SYNC 65/65`.
- The do-nothing control ordering and both base counts.
- No path found where `--adopt` writes while a defect **it creates** is invisible.

## 8. Impacted axes

- **operability** (claim holds). Residual defects inside scope: (a) `sameOther` is unexercised and
  shortened by the substring filter; (b) `recover()` still applies the old global-clean criterion, so
  a crash turns a valid adoption into a rollback. (b) is already filed as round-81 candidate 2; (a) is
  not filed anywhere.
- **coverage:omp** (claim holds). The scoring surface no longer watches the live root; the watch is the
  non-scoring `omp-census --compare` checklist item (verified to catch mode drift). The pinned receipt
  encodes an operator backup (`config.yml.pre-rebalance2-20261104`), so `O_members=65` is
  deterministic but host-derived.
- **honesty/freeze**. Committed plan: `0/13` (actual 6/13) and two dead `controls/` pointers; fixing
  amendment uncommitted and silent on both; stub control instruments uncommitted.

## 9. Smallest safe corrections

1. **Plan record** (no counter change): commit Amendment 1 and extend it to name the three defects —
   `controls/c1-base.txt` → `open/c1-base.txt`, `controls/c2-base.txt` → `open/c2-base.txt`, `0/13` →
   `6/13`. Alternatively edit the plan and record the erratum in the round lesson; either way resolve
   them before the close commit so the committed record stops asserting a dead pointer and a false
   count.
2. **C1 delta precision** (`scripts/spotcheck-adopt.mjs`): compare the target's own findings
   exactly (`f === 'uncovered:'+key` / `f === 'unpinned:'+key`) instead of `f.includes(key)`, so a
   finding for `…md.orig` is not silently excluded; and either add an arm that fires `sameOther`
   (requires a test seam or a crafted state; none exists today) or remove "every other finding
   unchanged" from the plan/SKILL/SCORECARD prose so the claim matches what the counter can see.
3. **C1 recovery** (`recover()`): apply the v3 delta criterion (complete when the target half-state
   matches the pre-image plus the target's own findings, else roll back), or explicitly scope the
   "instead of demanding a globally clean map" sentence to the uninterrupted path and keep the
   round-81 candidate as the named debt.
4. **C2 fail-closed discipline**: assert `json.source` in arms 5/6 and add a `--omp-live`
   fail-closed arm; the code is correct today, the arms do not pin it.
5. **Controls provenance**: commit the stub instruments (or a hash of them) beside
   `controls/c1-stub.txt` / `controls/c2-stub.txt`; today the receipts are not re-derivable from repo
   bytes.

## Evidence index (this directory)

```
run-c1-scaff.txt       C1 at 6d03402f: held=13/13, exit 0, selftest 28/28
run-c1-base.txt        C1 at 1968689f: held=6/13, exit 1
run-c1-live-lane.txt   C1 at live HEAD: held=13/13, exit 0
run-c2-scaff.txt       C2 at 6d03402f: held=12/12, exit 0
run-c2-base.txt        C2 at 1968689f: held=4/12, exit 1
run-c1-fold.txt        conflated fold candidate: held=10/13; FAIL 03,04,08
run-c1-adoptfold.txt   adopt-only fold candidate: held=11/13; FAIL 08 (+ selftest artifact)
run-c1-nodelta.txt     sameOther deleted: held=13/13  (discrimination gap)
run-c2-snaponly.txt    --omp-live ignored: held=8/12; FAIL 02,12 (clean discriminators)
c2-attacks.txt         live-drift hiding, old-vs-new default, compare changed=1, source labels
c1-substring.txt       substring-filter fixture: other path's finding excluded, adopt exit 0
c1-crash-recovery.txt  direct adopt vs crash+recover (rolled-back) vs retry (adopted)
plan-freeze.txt        plan working-tree diff, HEAD bytes lack Amendment 1, dead pointers
lane-worktree.txt      plan and SCORECARD modified in the working tree (C2=198, not the amendment's 197)
```
