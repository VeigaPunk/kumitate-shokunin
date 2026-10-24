# MutCounters — drop-one-check mutation attack on the frozen round-51 counters (A51, D51)

Seat: `kumitate-r51.PrivateSnipe` (wave 2, band 32-64) · lane `kumitate-shokunin` (READ-ONLY to this seat)
Targets: `.ufo/waves/round-51/probe/attest51-probe.mjs` (rule A51, 9 checks) and
`.ufo/waves/round-51/probe/doctrine51-probe.mjs` (rule D51, 5 checks).
Scored rev: **`7d88faa`** (the assigned lane tip), with the now-closed rev **`fef6707`** measured as a
secondary reference point.

## 0. Verdict summary

| # | Question | Answer |
|---|---|---|
| 1 | Do all 14 single-arm drop-one mutants read UNMET at 7d88faa? | **YES — 14/14 UNMET. No drop-one mutant reads HELD.** No CRITICAL under the assigned criterion. |
| 2 | Are the arms *independent*? | **NO.** A2↔A4 fire on one shared root cause; D1↔D4 fire on one shared root cause. Effective depth **A51 = 1**, **D51 = 2** root causes. |
| 3 | Are any arms load-bearing (sole detector of a real defect class)? | **YES — A2, D2, A3d.** A2 is the *only* arm that detects byte-identical receipt duplication; D2 is the *only* arm that detects a broken provenance binding; A3d is the only arm that detects a disabled inner-digest check. |
| 4 | Does D51 have teeth against a neutered `sources-check.mjs`? | **NO — D51 standalone reads DOCTRINE_HELD 5/5.** Caught only by `proxy-check --strict` (a *different* predicate's arm) → standing wave-1 finding RevCounterD:71, confirmed here with a fresh mutant. |
| 5 | Are all arms rev-scoped? | **NO — D5 and A5's proxy arm score the LIVE repo, not the scored rev.** |

Everything below is measured output, not inference. No lane byte was modified (see §7).

---

## 1. Baselines (pristine counters, unmodified bytes)

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa rule=A51 version=v3 | A1 PASS | A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS
exit=1

$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
exit=1
```

Cross-revs (same counters, pristine):

| rev | A51 | D51 |
|---|---|---|
| `c90b9de9` (round-open base) | `ATTEST_UNMET held=0/9` | `DOCTRINE_UNMET held=0/5` (entry-absent short-circuit) |
| `a476977` (C1/C2 integration) | `ATTEST_UNMET held=6/9` | `DOCTRINE_UNMET held=2/5` |
| `7d88faa` (assigned tip) | `ATTEST_UNMET held=7/9` | `DOCTRINE_UNMET held=2/5` |
| `fef6707` (close, landed later during this seat's run) | `ATTEST_HELD held=9/9` exit 0 | `DOCTRINE_HELD held=5/5` exit 0 |

**Expected reading for the absent-object case (A2 / receipt 3).** At `7d88faa` receipt 3 is not
committed (`git ls-tree 7d88faa .ufo/waves/round-51/receipts/` → run-1, run-2, run-2-replayed only).
A2 therefore *cannot* hold at that rev for any implementation of the instrument: the check iterates
`RECEIPTS = ['attest-run-1.txt','attest-run-2.txt','attest-run-3.txt']` and marks
`attest-run-3.txt:absent`. A4 fails on the same missing file for the same reason. The correct
expected reading at `7d88faa` is therefore `ATTEST_UNMET held=7/9` — which is what the pristine
counter reads. It becomes satisfiable only once receipt 3 exists **and** its `run-at:` is ≥300 s
away from run-1's; `fef6707` (receipt 3 committed) reads `held=9/9`, confirming the ≥300 s span
condition was met in practice.

---

## 2. Method (mutation construction)

Every mutant lives under `/tmp/mut-r51/mut/` — **nothing under the lane tree** was created or edited.
A mutant is the pristine probe with **exactly one** `hold('<ID>', <expr>, …)` call rewritten to
`hold('<ID>', true, …)`, i.e. that one arm's verdict is forced to PASS while every other arm and
every side effect (extraction, subprocess spawning, receipt crafting) runs unchanged.

```
$ python3 /tmp/mut-r51/gen.py          # 14 single-arm mutants
$ python3 /tmp/mut-r51/gen_combo.py    #  6 multi-arm depth mutants
$ bash /tmp/mut-r51/run.sh             # runs every mutant against 7d88faa, parallel
```

Manifest (sha256 of each mutant file; `changed_lines` = diff lines vs the pristine probe, always
exactly one removed + one added line):

| mutant | arm forced PASS | mutant sha256 | changed_lines | reading at 7d88faa | exit |
|---|---|---|---|---|---|
| `attest51-probe-drop-A1.mjs` | A1 | `c10c8ad9cdd6661f` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A2.mjs` | A2 | `367af2af591d1b8f` | 2 | `ATTEST_UNMET held=8/9` | 1 |
| `attest51-probe-drop-A2c.mjs` | A2c | `8fae38bcb5ff03d0` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A3.mjs` | A3 | `fe6fc0c8bcb9d5a0` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A3c.mjs` | A3c | `47e6bdd1ef9c40a0` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A3d.mjs` | A3d | `a8450a2eedb5c63b` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A4.mjs` | A4 | `b59f6583926e56c4` | 2 | `ATTEST_UNMET held=8/9` | 1 |
| `attest51-probe-drop-A4c.mjs` | A4c | `72da71b46aae0447` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `attest51-probe-drop-A5.mjs` | A5 | `018f26418e49310c` | 2 | `ATTEST_UNMET held=7/9` | 1 |
| `doctrine51-probe-drop-D1.mjs` | D1 | `c00affa98e599e2c` | 2 | `DOCTRINE_UNMET held=3/5` | 1 |
| `doctrine51-probe-drop-D2.mjs` | D2 | `57d08e415c8272d7` | 2 | `DOCTRINE_UNMET held=3/5` | 1 |
| `doctrine51-probe-drop-D3.mjs` | D3 | `f1937ecc67ea4ba0` | 2 | `DOCTRINE_UNMET held=2/5` | 1 |
| `doctrine51-probe-drop-D4.mjs` | D4 | `f7576749bdb37ca6` | 2 | `DOCTRINE_UNMET held=3/5` | 1 |
| `doctrine51-probe-drop-D5.mjs` | D5 | `809784337f9d8757` | 2 | `DOCTRINE_UNMET held=2/5` | 1 |

**Result: all 14 drop-one mutants read UNMET. No mutant reading HELD.** The counter survives
single-arm deletion at `7d88faa` — but see §4: that survival is shallower than the `9/9` and `5/5`
denominators suggest.

### Multi-arm depth mutants (this seat's extension beyond the assigned drop-one scope)

| mutant | arms forced PASS | reading at 7d88faa | exit |
|---|---|---|---|
| `attest51-probe-drop-A2+A4.mjs` | A2, A4 | **`ATTEST_HELD held=9/9`** | 0 |
| `attest51-probe-drop-A2+A4+A1.mjs` | A2, A4, A1 | **`ATTEST_HELD held=9/9`** | 0 |
| `doctrine51-probe-drop-D1+D2.mjs` | D1, D2 | `DOCTRINE_UNMET held=4/5` | 1 |
| `doctrine51-probe-drop-D1+D4.mjs` | D1, D4 | `DOCTRINE_UNMET held=4/5` | 1 |
| `doctrine51-probe-drop-D2+D4.mjs` | D2, D4 | `DOCTRINE_UNMET held=4/5` | 1 |
| `doctrine51-probe-drop-D1+D2+D4.mjs` | D1, D2, D4 | **`DOCTRINE_HELD held=5/5`** | 0 |

These three HELD readings are **multi-arm** deletions, outside the assigned drop-one criterion, so
they are not scored as CRITICAL here; they are the mechanism that exposes the correlated-failure
structure in §4. I report them because the drop-one table alone is misleading: it shows redundancy
that does not exist.

---

## 3. Counter-strength: does each arm actually *detect* its defect class?

A drop-one mutant shows what happens when an arm is removed. To show what the arm *buys*, I mutated
the **artifact under test** inside throwaway scratch repos (`git archive <rev> | tar -x`, then
`git init` + commit — never the lane) and re-ran the pristine counter.

### A51 teeth

| scratch mutation | pristine counter reading | arms that fired |
|---|---|---|
| verdict-printing stub `scripts/receipt-attest.mjs` (prints `ATTEST_SELFTEST: PASS` / `RECEIPT: VALID`, never hashes or execs) | `ATTEST_UNMET held=1/9` | A1 PASS (stub) — **A2c, A3, A3c, A4c, A3d all MISS**; A5 MISS (pin drift) |
| inner-digest comparison disabled at the verify site (`if (false && digest !== record.digest)`) | `ATTEST_UNMET held=6/9` | **A3d MISS (`exit=0 last="RECEIPT: VALID"`)** — A3/A3c/A4c still PASS ⇒ **A3d is the sole detector of a disabled digest check** |
| SCORECARD `pin.receipt-attest` zeroed | `ATTEST_UNMET held=8/9` | A5 MISS (`pin 00000000!=44919763`) |
| run-3 `run-at:` prelude re-dated, sidecar refreshed | `ATTEST_UNMET held=7/9` | A2 MISS (`attest-run-3.txt:exit=1 RECEIPT: TAMPERED`), A4 MISS (same) — the instrument still rejects it even with a recomputed sidecar |
| receipt 3 = byte-identical copy of receipt 1 (same nonce, same digest) | `ATTEST_UNMET held=8/9` | **A2 MISS (`nonce-not-distinct;sha-not-distinct;span=236s<300`) — A4 PASS** |

The last row is the sharpest result of this seat's run. **A2 is the only arm that detects a
byte-identical duplicated receipt.** The ledger arm A4 is *by design* blind to it (freeze-repair
addendum item 4: "the target itself and byte-identical duplicates (same digest) are exempt"), so the
R50/M2 forgery class — three receipts with identical bodies — is guarded **only** by A2's
distinctness sub-arms. Dropping A2 on that scratch flips the counter:

```
$ node /tmp/mut-r51/mut/attest51-probe-drop-A2.mjs <scratch> <rev>
ATTEST51: ATTEST_HELD held=9/9 checks=9 ... | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
exit=0
```

whereas dropping A4 on the same scratch still reads `ATTEST_UNMET held=8/9` (A2 fires). **A2 is
load-bearing; A4 is not, for this class.**

### D51 teeth

| scratch mutation | pristine counter reading | arms that fired |
|---|---|---|
| entry head trio lines removed | `DOCTRINE_UNMET held=3/5` | **D1 MISS *and* D4 MISS (`HEADER_INCOMPLETE`)** — correlated, see §4 |
| `corpus/SOURCES.md` row id `S100` → `S100X` | `DOCTRINE_UNMET held=3/5` | **D3 MISS (`rows=1 S100=false S101=true`)** *and* D4 MISS (`ID_FORM`) |
| `scripts/sources-check.mjs` neutered to always print `SOURCES_CHECK: CLEAN` | **`DOCTRINE_HELD held=5/5`** exit 0 | none — **D51 standalone has no teeth against a neutered checker** |
| entry with 13 inline `receipt:` bindings (2 of them pointing at paths absent from that rev) | `DOCTRINE_UNMET held=4/5` | D2 MISS (`clauses=13 bound=13 hash-miss=2`) — the only failing arm |

The neutered-checker row is caught by the **other** predicate's arm, not by D51:

```
$ UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha node scripts/proxy-check.mjs --strict   # in the neutered scratch
PROXY: DRIFT (GATE_PIN_DRIFT term=pin.sources-check declared=5402b2103bb9e3cc… computed=7b189e4a9710f202…)
proxy exit=1
```

So the lane's H3 gate catches the neutered checker, but `DOCTRINE_HELD` **as a standalone reading**
does not contain that mitigation. This independently reproduces wave-1 seat RevCounterD's finding at
line 71 ("D51 never verifies that script's hash; `pin.sources-check` is enforced only by
`proxy-check --strict`, which lives in A5 — a different predicate's arm") with a fresh, executable
mutant. No change to the contract is proposed by this seat; recorded as a coverage finding.

D2 is likewise the **sole** detector of its class: on the scratch where D2 was the only failing arm,
`drop-D2` flips the counter to `DOCTRINE_HELD held=5/5` exit 0, while `drop-D1` and `drop-D4` both
still read `DOCTRINE_UNMET held=4/5`.

---

## 4. Correlated failure — the counter's real depth

The drop-one table says "14/14 UNMET" (looks robust). The depth mutants show the redundancy is
**superficial**: paired arms fire on a *shared* root cause, so deleting both restores a HELD reading.

**A2 ↔ A4.** Both miss at `7d88faa` with the identical detail `attest-run-3.txt:absent`. Deleting
A2 alone leaves A4 firing; deleting A4 alone leaves A2 firing; deleting **both** yields
`ATTEST_HELD held=9/9` exit 0. The A51 counter's UNMET verdict at `7d88faa` therefore rests on
**one** root cause (a missing committed receipt), detected twice — not on two independent facts.

**D1 ↔ D4.** Both miss on the entry's header: D1 on `trio incomplete in first 5 lines`, D4 on
`SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)`. The header-fix scratch confirms the coupling — the
same working-tree entry turns D1 and D4 from MISS to PASS *together*:

```
# scratch: base 7d88faa + working-tree corpus/knowledge/invocation-attestation.md
DOCTRINE51: DOCTRINE_UNMET held=4/5 ... | D1 PASS | D2 MISS clauses=13 bound=2 hash-miss=0 | D3 PASS | D4 PASS | D5 PASS
```

and deleting the header trio breaks them together (`D1 MISS` + `D4 MISS HEADER_INCOMPLETE`).
Deleting D1+D2 → still UNMET; D1+D4 → still UNMET; D2+D4 → still UNMET; **D1+D2+D4 →
`DOCTRINE_HELD held=5/5` exit 0.** So D51's verdict at `7d88faa` rests on **two** independent root
causes (entry-header provenance shape, counted twice by D1+D4; and inline binding coverage, counted
once by D2).

**Effective depth: A51 = 1 root cause, D51 = 2 root causes** — against denominators of 9 and 5.

---

## 5. Rev-scoping defect: D5 and A5's proxy arm score the LIVE repo

`doctrine51-probe.mjs:111` runs the census against the **live** lane checkout, never the extracted
rev tree:

```js
spawnSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate',
                   '--root', '/home/vgpnk/Projects/shokunin', 'kumitate'], …)
```

`grep -n "join(T" doctrine51-probe.mjs` shows the extracted tree `T` is used only for `ENTRY`,
`corpus/SOURCES.md` and `scripts/sources-check.mjs` — D5 never reads it. Symmetrically,
`attest51-probe.mjs:345` runs `proxy-check.mjs --strict` with `UFO_SRC = /home/vgpnk/Projects/ufo-fsd-alpha`
(a live origin checkout), so A5's proxy half scores live-repo state (A5's pin half *is* rev-scoped).
D5 therefore returns PASS at any rev whose entry exists, independent of what that rev contains —
a rev-independent arm inside a rev-scoped counter. Measured live census on the lane today: exit 0.

---

## 6. Secondary coverage findings

1. **D2 measures formatting, not provenance coverage.** `D2` counts a clause as bound only when the
   `receipt:<path>@sha256:<64hex>` binding sits on the *same line* as the `- ` clause marker
   (`/receipt:([^\s@]+)@sha256:([0-9a-f]{64})/` applied to clause lines only). Repo-wide, only
   **6 of 842** `- ` clause lines across 46 `corpus/knowledge` entries carry an inline binding
   (2 of 46 files) — the house style puts the binding on a continuation line, where D2 does not see
   it. At the close rev the new entry has 13 clauses, 13 inline-bound, 23 bindings total, so **10
   bindings are invisible to D2**. D2's "≥12 bound" bar is satisfied by reformatting, and is
   unsatisfiable by the prevailing corpus convention. This corroborates wave-1 RevCounterD's
   "depth-vs-shape" residual (line 95).
2. **A2's ≥300 s span requirement is author-scheduled**, exactly as plan.md § Limits (b) declares;
   the base re-dating test above shows it fires when the span collapses.
3. **A4's nonce-reuse sweep scanned 162 prior-corpus files** at `7d88faa` with zero hits (the probe
   prints `prior-files=162`), i.e. the sweep is not vacuous.
4. **The A2c/A3c/A4c/A3d challenge arms are the load-bearing ones.** A verdict-printing stub
   clears A1 only (`held=1/9`); every behavioural arm catches it. The v3 challenge arms do what
   addendum items 3/7/8 intended.

---

## 7. Restoration / lane-integrity evidence

The lane was never edited. Both frozen probes are byte-identical before and after this seat's work:

```
$ sha256sum .ufo/waves/round-51/probe/attest51-probe.mjs .ufo/waves/round-51/probe/doctrine51-probe.mjs
73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c  attest51-probe.mjs
f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0  doctrine51-probe.mjs
# identical to the pre-run hashes recorded in /tmp/mut-r51/pristine-hashes-before.txt
$ git status --porcelain .ufo/waves/round-51/probe/     # (empty — probe dir pristine)
```

Mutants and transcripts live only under `/tmp/mut-r51/` (`mut/` = 20 mutant files, `out/` = 20
per-mutant transcripts, `scratch-*/` = throwaway scratch repos). `git status --porcelain` on the lane
shows **no** new `.mjs/.js/.sh/.py` file from this seat (the only lane-tree changes visible are other
seats' `w2/*.md` reports and the L1's own close commits, which landed under `3304a56 → fef6707`
while this seat ran). No `git`/`jj` mutation, no edit to counters, plan.md, scripts/, corpus/,
SCORECARD.md or SKILL.md; no pacman transaction; no tool installation was needed.

---

## 8. Transcripts

Per-mutant transcripts (verbatim counter output + exit code) are in `/tmp/mut-r51/out/*.txt`
(20 files, one per mutant, e.g. `/tmp/mut-r51/out/attest51-probe-drop-A2.txt`). Scratch-rev
transcripts for the teeth tests are quoted inline in §3–§4. Generation scripts:
`/tmp/mut-r51/gen.py`, `/tmp/mut-r51/gen_combo.py`, `/tmp/mut-r51/run.sh`.

## 9. What this seat does and does not claim

- **Claimed (measured):** all 14 drop-one mutants read UNMET at `7d88faa`; the counter's effective
  root-cause depth is 1 (A51) and 2 (D51); A2, A3d and D2 are each the sole detector of their
  defect class; D51 standalone does not detect a neutered `sources-check.mjs`; D5 and A5's proxy
  arm are rev-independent; D2 counts only inline bindings (6/842 corpus-wide).
- **Not claimed:** no contract change is proposed, no counter was edited, and no claim is made about
  the truth of any receipt or entry — this seat tested *counter coverage*, not artifact truth.
- **Open for the L1 (informational, not a request):** the round's stated reading at the assigned rev
  (`ATTEST_UNMET 7/9`, `DOCTRINE_UNMET 2/5`) is expected — receipt 3 is scheduled pre-close and the
  entry header/binding repair landed in the close commit; both counters read HELD at `fef6707`.

Report: .ufo/waves/round-51/w2/MutCounters.md
