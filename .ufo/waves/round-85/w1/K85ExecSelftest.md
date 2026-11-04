# K85ExecSelftest — audit of the v2 candidate's `--selftest` (round 85, C1)

Seat: `K85ExecSelftest` (leaf executor, labrat). Lane: `kumitate-shokunin`.
Role: **lane-author advice** on the `--selftest` capability of the v2 candidate. This is not the
non-author closure, not an integration measurement, and writes no SHONEN box.

## What was audited

| Item | Value |
|---|---|
| Lane revision under audit | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (`git -C <lane> rev-parse HEAD`) |
| Candidate | `.ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs` |
| Candidate identity | `sha256 7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`, 16845 bytes, 258 lines, mtime `2026-11-04 15:57:14 -0300` |
| Method | every run on a **scratch copy** (`/fast/scratch/hyaku/kumitate-r85/K85ExecSelftest/v2/candidate.mjs`); the lane candidate was never edited. Candidate hash re-checked after all mutations: unchanged. |
| v1 comparator | `scripts/counter-receipt.mjs` @ `9db0c6b5` = `sha256 190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0` |

The v2 audit was **run** (the candidate landed at 15:57 during this seat's audit window). The v1
fallback audit was also run and is reported in §5 as the baseline.

## 1. Selftest execution — PASS

```
CMD : node /fast/scratch/hyaku/kumitate-r85/K85ExecSelftest/v2/candidate.mjs \
        --selftest --work /fast/scratch/hyaku/kumitate-r85/K85ExecSelftest/work/v2run
EXIT: 0
ARMS: 60
OUT : COUNTER_RECEIPT_SELFTEST: PASS held=60/60
```

- 60 arms, 0 `FAIL`, exit 0. Re-run on a fresh copy (`v2/restored.mjs`, byte-identical sha) → `PASS held=60/60`, exit 0. Two independent runs, same result.
- No-`--work` path, with `HYAKU_SCRATCH` and `TMPDIR` both redirected into scratch:
  `HYAKU_SCRATCH=<scratch>/work/hyakushu TMPDIR=<scratch>/sentinel-tmp2 node candidate.mjs --selftest`
  → `PASS held=60/60`, exit 0; `work/hyakushu` leftovers = **0**, TMPDIR sentinel leftovers = **0**.
- After every run (run, both mutation reds, HYAKU_SCRATCH run), all listed `--work` roots are empty; `finally { rmSync(root, …) }` at **line 254** holds.

## 2. Scratch / spawn hygiene greps — PASS

Grep over the candidate copy (`v2-greps.txt`):

| Check | Result | Lines |
|---|---|---|
| hardcoded `/tmp` or `/var/tmp` | **NONE** | — |
| `mkdtemp` sites | 1, with explicit root | **24** (import), **157** `mkdtempSync(join(resolve(work), 'counter-receipt-'))` |
| scratch root derivation | `mkdirSync(work, {recursive:true})` then `resolve(work)` | **156**, **157** |
| default scratch (no `--work`) | `process.env.HYAKU_SCRATCH \|\| '/fast/scratch/hyaku'` — no `/tmp` | **122** |
| child-process spawns | 1 only | **25** (import), **238** |
| spawn timeout | present, `timeout: 10000` | **238** |
| filesystem writes | all under the mkdtemp root | **229**, **235** (fixtures), **254** (cleanup) |

No spawn exists without a timeout; no write target is derived from anything other than the explicit `--work` / `HYAKU_SCRATCH` root.

## 3. Selftest re-invokes its own CLI — PASS

- `const script = fileURLToPath(import.meta.url)` at **line 30**; the selftest spawns
  `spawnSync(process.execPath, [script, ...argv], {encoding:'utf8', timeout:10000})` at **line 238**.
  Every arm is a real subprocess of the tool's own entry point, not an in-process call.
- Assertion is **exit + first line**: **line 241**
  `let ok = result.status === entry.code && out[0] === want;` with `want = verdictLine(entry.code, entry.token)` (**line 240**, formatter at **line 105**).
- Internal checker functions (`classifyReceipt`, `classifySource`, `scanReceipt`) are never called by the selftest — no arm can pass on an internal return value.
- Line-count guards: **242** (`USAGE` must be exactly 1 line), **244** (non-USAGE must be 2 lines, or 3 when `--src` is used).
- `SOURCE` line content is asserted when the case declares it — **line 245**, 8 of 60 cases carry a `source:` expectation.
- Contract-token coverage inside the cases table (**lines 163–224**, 60 entries): all 18 contract outcomes appear — `SUMMARY_COUNT` 11, `ARM_MALFORMED` 5, `ARMS_EMPTY` 2, `SUMMARY_ORDER` 2, `RECEIPT_UNREADABLE` 2, `ARMS_TOTAL` 5, `ARM_DUPLICATE` 2, `ARM_PREFIX` 2, `HELD_COUNT` 2, `ARM_FAILED` 2, `VERDICT` 1, `SOURCE_UNREADABLE` 1, `SOURCE_ARMS_EMPTY` 1, `ARM_UNBOUND` 1, `SOURCE_ARITY` 1, `SOURCE_DECLARED` 1, `CLEAN` 10, `USAGE` 9.

## 4. Mutation sensitivity — PASS on the required pair, with one named blind spot

All mutations applied to scratch copies; each measured with the same command shape
`node <copy> --selftest --work <scratch>/work/<name>`.

| Mutant | Edit (candidate line) | Result | Exit |
|---|---|---|---|
| **E — expected token** | **164** `token: 'CLEAN'` → `'CLEANX'` in the `clean` case | `FAIL held=59/60` | **1** |
| **E restored** | fresh copy, sha identical to candidate | `PASS held=60/60` | **0** |
| **F — checker token** | **77** `return { code: 1, token: 'ARMS_TOTAL' }` → `'ARM_TOTAL'` | `FAIL held=55/60` | **1** |
| **D — constant RECEIPT line** | **150** whole `RECEIPT:` template → stub `bytes=0 rows=0 held=0/0 findings=none sha256=000…0` | `PASS held=60/60` | **0** |

Mutant D is the **finding** (F1 below): a candidate that prints the exact stub-control `RECEIPT:`
line still passes `--selftest` 60/60. That same mutant is caught by the frozen probe
(`C85_C1: UNMET held=1/20`, exit 1) and by the content-variation control
(`CONTENT_VARIATION: UNMET held=0/3`, exit 1). So the claim's kill rule is not weakened — the
probe, not the selftest, is what discriminates — but the selftest cannot detect the round-84
`vacuous` class on its own.

## Findings

**F1 (advisory, not a kill) — the selftest never compares the `RECEIPT:` line, only its line count.**
- Evidence lines: **244** `ok = out.length === (entry.src === undefined ? 2 : 3);` — presence only.
  No `out[1]` comparison exists anywhere in the selftest (contrast **245**, which does compare `out[2]`
  for the `SOURCE:` line when a case declares `source`).
- Measured consequence: mutant D (stub `RECEIPT:` at line 150) is green at `60/60`, exit 0,
  while the frozen probe scores it `1/20` and the content-variation control `0/3`.
- Status against the frozen plan: the plan's `--selftest` clause requires "asserts exit + **first line**";
  the candidate satisfies that literally. The gap is depth, not compliance. Recommend L1 record it as
  a round-86 deepening candidate (assert `out[1]` against bytes/rows/held/sha256 derived from the case
  text, as the probe already does) rather than treating `--selftest` as a stand-in for the probe.

**F2 (informational) — `SOURCE` assertions are asymmetric with `RECEIPT` assertions.** All 8 `--src`
cases declare `source:` (line 245), so the source line is pinned in practice; the receipt line is not (F1).

**F3 (informational) — default scratch is a shared root.** Line **122** defaults to `/fast/scratch/hyaku`
(contract-compliant, no `/tmp`). Concurrent runs isolate only by the `counter-receipt-` mkdtemp prefix;
measured clean, no action.

**F4 (informational) — selftest default path is exercised but not gated in CI.** The no-`--work` branch
(line 122) is only covered by my redirect run, not by an arm inside the selftest (it cannot be — it would recurse).

No finding rises to "arm red" under the frozen probe: the candidate's own probe run is `20/20`.

## Advisory measurements for L1 (not the integrated-tree result)

Isolated scratch lane `<scratch>/lane-candidate` containing only `scripts/counter-receipt.mjs` = candidate bytes:

```
node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <scratch>/lane-candidate --work <scratch>/work/probe-candidate
→ C85_C1: HELD held=20/20   EXIT 0            (20/20 arm lines `ok`)

node .ufo/waves/round-85/controls/content-variation.mjs --lane <scratch>/lane-candidate --work <scratch>/work/cv-candidate
→ CONTENT_VARIATION: HELD held=3/3 distinct_sha=true   EXIT 0
```

These are **advisory only**; the frozen predicate is scored by L1 once at the integrated tree.

## 5. v1 fallback audit (baseline, run while the candidate was still absent)

| Check | Result |
|---|---|
| `--selftest --work <scratch>/work/v1` | 50 arms, `PASS held=50/50`, exit 0 |
| hardcoded `/tmp`,`/var/tmp` | NONE (lines 55–56, 115, 124, 129 only reference `work` / `HYAKU_SCRATCH`) |
| `mkdtemp` | **56** `mkdtempSync(join(resolve(work), 'counter-receipt-'))` — explicit root |
| spawn | **115** `spawnSync(process.execPath, [script, …], {timeout: 10000})` — timeout present |
| self-invocation assertion | **117** `result.status === code && output.trim() === expected` — exit + first (only) line |
| TMPDIR sentinel run | exit 0, sentinel dir empty → no `/tmp` use |
| mutation A (expected token, **line 59**) | `FAIL held=49/50`, exit 1 |
| mutation B (checker token, **line 45**) | `FAIL held=46/50`, exit 1 |
| mutation C (exit code only, **line 140** `return code;` → drift returns 0) | `FAIL held=37/50`, exit 1 — the verdict text was still correct, so the selftest does test the exit code, not just text |
| restore fresh copy | `PASS held=50/50`, exit 0 |
| frozen probe vs v1 lane copy | `C85_C1: UNMET held=1/20`, exit 1 — matches `controls/base.txt` |

v1 has no `RECEIPT:` line, so F1 is v2-specific.

## Receipts (all under `.ufo/waves/round-85/build/K85ExecSelftest/`)

| File | Command | Exit | Revision |
|---|---|---|---|
| `v2-identity.txt` | `stat`, `sha256sum` on lane candidate + copy | 0 | `9db0c6b5` |
| `v2-selftest-run.txt`, `v2-selftest-run.full.txt` | `node candidate.mjs --selftest --work <scratch>/work/v2run` | 0 | candidate sha `7659be6e` |
| `v2-greps.txt` | `grep -n` on candidate copy for tmp/mkdtemp/spawn/timeout/scratch | 0 | candidate sha `7659be6e` |
| `v2-mutE-red.txt` | `node v2/mutE.mjs --selftest --work …` | 1 | mutant of `7659be6e` |
| `v2-restored-green.txt` | `node v2/restored.mjs --selftest --work …` | 0 | `7659be6e` (identical sha) |
| `v2-mutF-red.txt` | `node v2/mutF.mjs --selftest --work …` | 1 | mutant |
| `v2-mutD-red.txt` | `node v2/mutD.mjs --selftest --work …` | 0 (blind, F1) | mutant |
| `v2-mutD-probe.txt` | `node probe85-c1.mjs --lane <scratch>/lane-mutD --work …` | 1 (`UNMET 1/20`) | mutant |
| `v2-mutD-cv.txt` | `node content-variation.mjs --lane <scratch>/lane-mutD --work …` | 1 (`UNMET 0/3`) | mutant |
| `v2-probe-candidate.txt` | `node probe85-c1.mjs --lane <scratch>/lane-candidate --work …` | 0 (`HELD 20/20`) | `7659be6e` |
| `v2-cv-candidate.txt` | `node content-variation.mjs --lane <scratch>/lane-candidate --work …` | 0 (`3/3`) | `7659be6e` |
| `v2-hyakushu-default.txt` | `HYAKU_SCRATCH=… TMPDIR=… node candidate.mjs --selftest` | 0 | `7659be6e` |
| `v1-selftest-run.txt`, `v1-restored-green.txt` | `node v1/counter-receipt.mjs --selftest --work …` | 0 | `190a4c1f` |
| `v1-mutA-red.txt`, `v1-mutB-red.txt`, `v1-mutC-red.txt` | mutation runs | 1 | `190a4c1f` + mutants |
| `v1-hermetic-tmpdir.txt` | `TMPDIR=<scratch>/sentinel node v1/counter-receipt.mjs --selftest …` | 0 | `190a4c1f` |
| `v1-probe-base.txt` | `node probe85-c1.mjs --lane <scratch>/lane-v1 --work …` | 1 (`UNMET 1/20`) | `190a4c1f` |
| `audit-driver.sh`, `candidate-copy.mjs`, `cases-table.txt` | method + byte copies | — | — |

## Risks / blockers / contract notes

- **No blocker.** The candidate satisfies every clause of the frozen `--selftest` requirement: hermetic
  self-invocation, exit + first line, explicit scratch root, no `/tmp`, spawn timeout, no lane writes.
- **F1 is the only substantive finding** and it is advisory: `--selftest` depth (line 244) is below the
  probe's oracle depth; do not use `--selftest` as evidence of C1, use the frozen probe. If L1 wants the
  selftest hardened, that is a v3 change, not a round-85 edit — the frozen predicate and controls were
  not touched by this seat.
- **Edits made:** only `.ufo/waves/round-85/build/K85ExecSelftest/**` and this report. No production file,
  no frozen plan/probe/control, no SCORECARD.md / LOG.md / corpus / SKILL.md, no git/jj mutation.
- **Installs:** none (node `v24.21.0` present, no new tooling needed).
- **Scratch:** `/fast/scratch/hyaku/kumitate-r85/K85ExecSelftest/` deleted after the receipts above were
  copied into the build dir.
- Out of scope and unasserted here: the integrated-tree probe result, the three committed control
  receipts, Q78, and the S245/S246 rows — those belong to L1 and the other seats.
