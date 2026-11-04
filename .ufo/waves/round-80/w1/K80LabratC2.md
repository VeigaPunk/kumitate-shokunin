# K80LabratC2 — C2 labrat probe: what the snapshot default hides, and whether the watch is adequate

Seat: K80LabratC2 (role: revenger; leaf, no dispatch). Round 80, lane axes operability + coverage:omp.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, measured at `509afb1d6ec5fc854c1398ae0060d6298ed621d1`
(working tree carried concurrent sibling edits; O inputs were stable — see §6). No git mutation, no
write outside this report directory and `/fast/scratch/hyaku/kumitate-r80/K80LabratC2` (deleted).
Receipts: `.ufo/waves/round-80/w1/K80LabratC2/` (`provenance.txt`, `runs.txt`, `runs2.txt`, `runs3.txt`,
their `*.summary.txt` — transcripts only, by design: a runnable script copied into the lane tree inflates
the proxy's `A` term, see §10).

## 1. Method (bounded: 3 live variants, one command set each)

The committed receipt was **replayed as a real root** (not `--snapshot`, which reads a root and writes a
receipt): a scratch-only script read `.ufo/pins/omp-shape.json` and created each entry with its recorded
kind and mode (recipe in §9) — 65 entries = 57 files (53×`0600`, 4×`0644`: `RULES.md`, `history.db`,
`last-changelog-version`, `models.db`) + 8 dirs (`0755`). Faithfulness is verified, not assumed:

```
MATERIALIZE: OK entries=65 dest=/fast/scratch/hyaku/kumitate-r80/K80LabratC2/live65
OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0   exit 0
```

Three variants from that root, plus the real live root:

| variant | root | delta from receipt |
|---|---|---|
| V1 declared | `live65-declared` (66) | `+config.yml.pre-lab80-1-20261104` mode `0600` (matches chain family `config-pre`) |
| V2 undeclared | `live65-undeclared` (66) | `+zz-undeclared-lab80` mode `0600` (no rule) |
| V3 real live | `$HOME/.omp/agent` (65) | none measured — live equals the receipt |

Command set per variant: `proxy-check` default with `OMP_AGENT_ROOT=<variant>`, `proxy-check --omp-live`
with the same env, `omp-census --compare .ufo/pins/omp-shape.json --root <variant>`; plus the census
`--root <variant>` (the checklist's own census item, needed to answer §4) and `--json` twins to read the
O terms (the plain `PROXY: DRIFT` line does not print them). Two flag-path controls (`--omp-root`,
`--omp-live` on a nonexistent root) and one frozen-tree demo (`--self` = `git archive 6d03402f`) are
labelled controls, not variants (§5, §7).

## 2. Result matrix (measured — `runs.txt` / `runs.summary.txt`)

| root | surface | exit | verdict | O_members / O_findings / O_bound | coverage_omp | source |
|---|---|---|---|---|---|---|
| V1 declared (66) | **proxy default** (scored) | 0 | `PROXY: MATCH` | 65 / 0 / 35 | 10 | snapshot |
| V1 declared (66) | `--omp-live` | 1 | `PROXY: DRIFT (O_MEMBERS_DRIFT declared=65 computed=66 delta=+1)` | 66 / 0 / 35 | 10 | live |
| V1 declared (66) | `--compare` | 1 | `OMP_SHAPE_COMPARE: DRIFT entries=66 receipt=65 added=1 … first=config.yml.pre-lab80-1-20261104` | — | — | — |
| V1 declared (66) | `omp-census --root` | 0 | `OMP_CENSUS: CLEAN (entries=66 findings=0 bound=35/35)` | — | — | — |
| V2 undeclared (66) | **proxy default** (scored) | 0 | `PROXY: MATCH` | 65 / 0 / 35 | 10 | snapshot |
| V2 undeclared (66) | `--omp-live` | 1 | `PROXY: DRIFT (O_MEMBERS_DRIFT …; O_FINDINGS_DRIFT …; COVERAGE_OMP_DRIFT …; AXES_DRIFT coverage:omp)` | 66 / 1 / 35 | 9 | live |
| V2 undeclared (66) | `--compare` | 1 | `OMP_SHAPE_COMPARE: DRIFT entries=66 receipt=65 added=1 first=zz-undeclared-lab80` | — | — | — |
| V2 undeclared (66) | `omp-census --root` | 1 | `UNLISTED zz-undeclared-lab80` → `OMP_CENSUS: DRIFT (entries=66 findings=1)` | — | — | — |
| V3 real live (65) | **proxy default** (scored) | 0 | `PROXY: MATCH (… O_members=65 … coverage:omp=10; …; source=snapshot)` | 65 / 0 / 35 | 10 | snapshot |
| V3 real live (65) | `--omp-live` | 0 | `PROXY: MATCH` | 65 / 0 / 35 | 10 | live |
| V3 real live (65) | `--compare` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65` | — | — | — |
| V3 real live (65) | `omp-census --root` | 0 | `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=65 findings=0 bound=35/35)` | — | — | — |

The baseline and after-run of the scored surface on the lane tree were byte-identical
(`PROXY: MATCH (A=886 C=39 operability=9; C1=19/19 C2=197/197 … O_members=65 …; source=snapshot)`, exit 0).

## 3. The trade in one table (surface × variant)

| surface | V1 declared +1 | V2 undeclared +1 | V3 real live | what it reads |
|---|---|---|---|---|
| **proxy default** (the scored checklist item `proxy-check --strict`) | **no** (MATCH, exit 0) | **no** (MATCH, exit 0) | no churn to catch (MATCH) | pinned receipt only; `OMP_AGENT_ROOT` is inert here |
| **`proxy --omp-live`** (opt-in; no checklist item runs it) | **yes**, via the stanza's `O_members` only (census findings stay 0, `coverage_omp` stays 10) | **yes**, four findings incl. `O_FINDINGS_DRIFT` and `coverage_omp` 10→9 | MATCH, `source=live` | the root named by `--omp-live`/`--omp-root`/env |
| **`omp-census --compare`** (checklist item 753, non-scoring) | **yes** (`added=1`, names the entry) | **yes** (`added=1`) | IN_SYNC | depth-1 name/kind/mode delta vs the receipt; `agent.db-*` transients excluded; content-blind |
| `omp-census --root` (checklist item 734) | **no** (`CLEAN entries=66 findings=0`) | **yes** (`UNLISTED`) | CLEAN | census rules only; **no member-count rule** |

**No variant is invisible to every checklist gate** — V1 and V2 are both caught by the non-scoring
`--compare` row. But V1 (declared churn) is invisible to **every scoring gate** (the proxy default) and to
the census; its only watcher is the one non-scoring compare row, and the opt-in `--omp-live` path that no
checklist item invokes. V2 additionally trips the census. V3 is clean on all four, which is the intended
steady state, not a blind spot in this measurement.

## 4. What the snapshot default hides (quantified)

1. **Live shape deltas of any size are invisible to the scored gate.** Both 66-entry roots — the
   declared one and the *undisputable* undeclared one — read `PROXY: MATCH … O_members=65 … source=snapshot`
   exit 0. The point of the round-80 move is that host churn no longer moves the integer; the price is that
   the scored gate answers a question about the committed receipt, not about this host. The verdict
   discloses `source=snapshot`, so it is disclosed blindness, not silent blindness.
2. **`OMP_AGENT_ROOT` is silently inert on the scored path.** Measured: default run with
   `OMP_AGENT_ROOT=<66-entry root>` → `O_members=65`; default run with `OMP_AGENT_ROOT=/nonexistent/omp-root`
   → O terms still `65/0/35`, exit unchanged (the O half of the plan's after-state; reproduced byte-exactly on
   the frozen tree, §7). The flag path is different: `--omp-root <V1>` reads live (`source=live`) and
   DRIFTs — so the knob that works is the flag, not the environment variable (`runs2.txt`).
3. **Declared churn cannot move the axis integer even when read live.** At 66 members with zero findings,
   `coverage_omp = floor(10 × 1 × 66/66) = 10`. Only the stanza's count assertion reacts
   (`O_MEMBERS_DRIFT declared=65 computed=66`). Undeclared churn is the only member fault that moves the
   integer (10→9), and only on the live path.
4. **The census ignores the env var too**: `env OMP_AGENT_ROOT=<undeclared> node omp-census.mjs` read
   `root=/home/vgpnk/.omp/agent entries=65` (CLEAN) — its root is `--root` or `$HOME/.omp/agent`, never
   `$OMP_AGENT_ROOT`.

## 5. Is the watch adequate? (checklist items that touch OMP)

Checklist rows (`SKILL.md`): 722 `proxy-check --strict` (scored; receipt default), 734 `omp-census` (live
root, rules), 735 `omp-census --selftest` (hermetic), 744 offline shape re-derivation (receipt-only;
root-blind by construction — `proxy-check.mjs:1374` is `shape ? censusEntries(shape) : census(opts.ompRoot)`,
so an offline reading cannot consult any root), 753 `omp-census --compare` (live, non-scoring).

- **Adequate for what it claims**: name/kind/mode deltas versus the committed receipt are caught by the
  compare row for both declared and undeclared churn, the receipt itself is pinned
  (`pin.omp-shape=84e41b9f…` equals the measured receipt sha256 `84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435`),
  and the opt-in path still fails closed — `--omp-live` with `OMP_AGENT_ROOT=/nonexistent/omp-root` →
  `OMP_ROOT_NOT_A_DIR` exit 2, never a silent snapshot fallback.
- **The watch is capture-relative.** The r80 open receipt read
  `OMP_SHAPE_COMPARE: DRIFT … first=config.yml.pre-rebalance2-20261104`; the freeze re-captured at 65
  (that name is entry 1 of the receipt, `grep -c` = 1); today's measurement is `IN_SYNC`. So churn that
  lands *before* a capture is absorbed into the baseline by construction, and churn after it is red only
  while the compare row is actually run. Nothing in the checklist runs the live read on the scoring path.
- **Not covered (design, not a variant)**: content churn — compare is shape-only and the census never
  opens a member (both documented; the `compare-content-blind` selftest case names it). That is the
  unavoidable residue of a shape receipt, stated as a bound rather than measured here.

## 6. Surprises, reported plainly

- The lane moved during the probe: `runs2.txt` (flag controls, a few seconds after the matrix) shows
  `C2_DRIFT declared=197 computed=198` — a sibling seat added a README row between runs. That is *not* an O
  finding: the O findings in `runs2.txt` are exactly the ones in the matrix, and the O inputs were stable
  (`receipt` sha `84e41b9f…` and note sha `05bd041d…` before and after; matrix baseline/after SCORECARD sha
  identical). The matrix in §2 is the attributable reading; `runs2.txt` is the control.
- `--compare` with `--self` is rejected — `omp-census: incompatible modes` + usage, exit 64
  (`runs3.txt` last block, observed) — so the compare diagnostic cannot be pointed at a frozen tree; it
  always compares a root with a receipt file.
- `--omp-root` and `OMP_AGENT_ROOT` are not interchangeable: the flag triggers the live read, the env
  alone does not (`proxy-check.mjs:3371` sets `ompShape` when neither `--omp-shape` nor `--omp-live` nor an
  explicit `--omp-root` is given).
- **A-term interaction (caught by K80ExecC2, fixed and measured — §10)**: three scratch scripts had been
  copied into this report directory as receipts; `walkFiles` (`proxy-check.mjs:755`) walks the whole lane
  tree and `RE_RUNNABLE` is `/\.(?:mjs|js|sh|py)$/`, so they counted: `A=889` vs declared `886`, `A_DRIFT`.

## 7. Frozen-tree demo (control, not a variant)

`git archive 6d03402f` unpacked to scratch (`--self`), which re-derives the round's declared after-state on
committed bytes (`runs3.txt`):

```
env OMP_AGENT_ROOT=/nonexistent/omp-root node scripts/proxy-check.mjs --self <archive> --strict
→ PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35 coverage:omp=10; …; source=snapshot)   exit 0
env OMP_AGENT_ROOT=<V1 declared 66> node scripts/proxy-check.mjs --self <archive> --strict
→ PROXY: MATCH (… O_members=65 …; source=snapshot)   exit 0
env OMP_AGENT_ROOT=<V1 declared 66> node scripts/proxy-check.mjs --self <archive> --strict --omp-live
→ PROXY: DRIFT (O_MEMBERS_DRIFT declared=65 computed=66 delta=+1)   exit 1
```

## 8. Confidence and bounds

- **High** for §2–§4 and §7: deterministic, byte-identical fixtures, exit codes and verdict lines quoted
  verbatim, all inputs hashed in `provenance.txt`.
- **Bounded**: 3 variants, adds only (no removals/mode changes — the census/compare selftests cover those),
  depth-1 shape only, no member content, no cross-host claim.
- `[INFERENCE]` If the stanza were re-measured to `O_members=66`, `--omp-live` would read MATCH at 66
  members: `O_MEMBERS_DRIFT` is a stanza comparison, and the census has no count rule (measured CLEAN at 66).
  Not measured — it needs a doctored scorecard, a fourth fixture outside the bound.
- `[INFERENCE]` `surface-probe --checklists` executes item 753 (it parses and runs GFM task items; the item
  matches the frozen grammar). Not run here — it would run the lane's full 39-item checklist.

## 9. Reproduction

Generator scripts were scratch-only and were deleted with the scratch root; the materialiser is these few
lines (run inside `$S`), and everything else is the command set in §1:

```js
// node materialize.mjs <receipt.json> <dest>
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [receipt, dest] = process.argv.slice(2);
const doc = JSON.parse(readFileSync(receipt, 'utf8')); // contract kumitate-omp-shape-v1
rmSync(dest, { recursive: true, force: true }); mkdirSync(dest, { recursive: true });
for (const e of doc.entries) {
  const p = join(dest, e.name);
  if (e.kind === 'dir') { mkdirSync(p); chmodSync(p, e.mode); }
  else { writeFileSync(p, '', { mode: e.mode }); chmodSync(p, e.mode); } // chmod after write: umask
}
// read back names/kinds/modes and compare to doc.entries; abort on any mismatch (the transcript's
// MATERIALIZE: OK line is that readback, and `--compare` re-checks it independently: IN_SYNC 65/65).
```

```sh
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
S=/fast/scratch/hyaku/kumitate-r80/K80LabratC2
node $LANE/scripts/omp-census.mjs --compare $LANE/.ufo/pins/omp-shape.json --root $S/live65  # IN_SYNC 65/65
node $LANE/scripts/proxy-check.mjs                          # scored default (receipt), no env
env OMP_AGENT_ROOT=$S/live65-declared node $LANE/scripts/proxy-check.mjs            # MATCH, snapshot
env OMP_AGENT_ROOT=$S/live65-declared node $LANE/scripts/proxy-check.mjs --omp-live # DRIFT, O_MEMBERS
env OMP_AGENT_ROOT=$S/live65-undeclared node $LANE/scripts/proxy-check.mjs --omp-live
node $LANE/scripts/omp-census.mjs --compare $LANE/.ufo/pins/omp-shape.json --root $S/live65-undeclared
node $LANE/scripts/omp-census.mjs --root $S/live65-declared                         # CLEAN (blind)
node $LANE/scripts/omp-census.mjs --root $S/live65-undeclared                       # DRIFT UNLISTED
# real live root: drop the OMP_AGENT_ROOT env and pass --root $HOME/.omp/agent
# variants: add one file (mode 0600) to a materialised root: config.yml.pre-lab80-1-20261104 / zz-undeclared-lab80
```

Scratch deleted before yield; every receipt above is copied into this report directory.
No tool installs were needed (node v24.21.0, host toolchain only).

## 10. A-term hygiene (post-probe correction, measured)

The three generator scripts were first copied into this report directory as receipts. That was wrong for
this lane: `proxy-check.mjs` counts runnable files over the whole lane tree (`walkFiles`, line 755;
`RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/`, line 598), so `A` moved 886 → 889 and the lane read
`PROXY: DRIFT (A_DRIFT …)` — K80ExecC2 flagged it (frozen counter `probe80-c2` runs `proxy-check --self
<lane>`, so arms that read the lane would report `A_DRIFT`). Measured and fixed, same minute, same lane:

```
before: node scripts/proxy-check.mjs --json → terms.A=889, verdict=DRIFT, findings=A_DRIFT
rm .ufo/waves/round-80/w1/K80LabratC2/{materialize.mjs,run-matrix.sh,summarize.mjs}
after:  node scripts/proxy-check.mjs --json → terms.A=886, verdict=MATCH, findings=[]
```

The report directory now holds transcripts and provenance only; the scripts lived in scratch (now deleted)
and their exact logic is in §9, so no evidence is lost and no runnable file was left in the lane tree.
