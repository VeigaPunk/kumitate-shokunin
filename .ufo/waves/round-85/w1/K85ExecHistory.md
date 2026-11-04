# K85ExecHistory — historical-receipt battery for C1 (round 85)

Seat: executor (leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Revision measured: `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (freeze; lane `HEAD`), measurements 16:00–16:03 local.
Base: `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`. Repair: `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`.
No installs. No git/jj mutation, no commit/push, no production/plan/probe/control/`SCORECARD.md`/`LOG.md`/`corpus/`/sibling-lane edit, no delegation or background jobs. Scratch under `/fast/scratch/hyaku/kumitate-r85/` removed; only this seat's subtree was touched.

This is lane-author advice. It is **not** a `C85_C1` measurement: the frozen probe was not run by this seat.

## Deliverables

| file | sha256 |
|---|---|
| `build/K85ExecHistory/history.mjs` | `142a6cb05189a89225d5953b1f841627d04bdcbe21c0c5b34e19efb3f46a9961` |
| `build/K85ExecHistory/receipts.txt` | `e003fe3d89755b9ff06d326252ff5abeca78bb8b36372208d097ba86acb7c6d3` |
| `build/K85ExecHistory/history-v1-baseline.txt` | `ff300c06eac6c45c9198b07eca83be5906dbf39821ed9d02470cfafe1ec5d737` |
| `build/K85ExecHistory/history-v1-vs-candidate.txt` | `8296850d9fd9c8bef3eb4828550db9d24e0432b395b6c1bddd4caeb3adf1af67` |
| `build/K85ExecHistory/history-v1-vs-standin.txt` | `9212df111abb22bd650b8d88bff1eb16d833bb22c6342f6c71ead3b45ff39d1a` |
| `build/K85ExecHistory/history-control-stub.txt` | `5d82216706bf6e223aff4420f7c30558f2a78f22ad13ded7fec1ebbb59d776f9` |
| `build/K85ExecHistory/history-control-noreader.txt` | `fdc245401c3e5a8bbf851466d86b8ef8b35643c9670ebd588822b54a7623f0f1` |
| `build/K85ExecHistory/history-control-absent-candidate.txt` | `74ca9461ed0d47e6e705f62e4e4582bf09e2c833883aa156a4e1e9a444c5b337` |
| `build/K85ExecHistory/selftest-standin-v2.mjs` | `9a655b1b1a9402c8b325132b8d993d24728bd5ca33d9bd47faa068c0011e1e85` |

`selftest-standin-v2.mjs` is a **battery self-test fixture, not the C1 candidate** (deliberately incomplete: no `--selftest`, no full fail-closed coverage). It must never be measured with `probe85-c1.mjs` nor cited as `C85_C1` evidence; it exists so the battery's positive `RECEIPT:`/`SOURCE:` branch is exercised by a tool that demonstrably reads the bytes.

## What was measured against what

- **v1 reference**: `scripts/counter-receipt.mjs` at base `a5d3e754…` = `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0`. The working-tree file is byte-identical (`git show` of base and of `9db0c6b5…` both hash to it), so the mnemonic is unchanged.
- **v2 candidate**: no v2 exists in `scripts/`. A mid-wave candidate snapshot exists at `build/K85ExecGate/counter-receipt.mjs` (16845 B, mtime 15:57:14, sha256 `7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`); `build/K85ExecSelftest/candidate-copy.mjs` is byte-identical. It was copied into scratch and measured as that snapshot only — it is not the integrated tool and may have been superseded.
- **Inputs** (read-only; copied to scratch before each run): the five committed receipts plus `round-83/probe/probe83-c1.mjs`.

## Battery

`node history.mjs --tool [LABEL=]FILE [--tool ...] --work DIR [--lane DIR] [--src FILE]` → 0 `HELD`, 1 `UNMET`, 64 `USAGE`.

- Copies every input into a `mkdtemp` under `--work`, checks the copy's sha256 against the committed bytes, runs each tool on the copy only (10 s timeout), re-hashes the committed file afterwards. Writes only under `--work`; temp dir removed in `finally`. All other paths are read-only.
- Asserts, per tool × input: historical **exit + first line**; when a `RECEIPT:` line exists, that it describes the bytes read — `bytes` = file length, `sha256` = committed sha256, `rows` = independently counted arm rows, `findings` = verdict token (`none` for CLEAN), and `held` for the three r83 inputs. A constant printer fails this without any golden value.
- Independently re-derives and asserts the byte shape each run (arm rows, FAIL rows, summary count under the frozen metadata-skip grammar), so the r83 claims are grounded in the bytes, not in v1's output.
- With two tools, `agree:` asserts equal exit and equal verdict per input; `receipts=` reports `both-absent|equal|differ|mixed` (v1 emits no `RECEIPT:` line, so `mixed` is the expected v1/v2 state).
- Source case (`--src`, over `c1-repair.txt`): asserts `SOURCE: sites=28 declared=27 receipt=28`, exit 1, finding `SOURCE_DECLARED`, plus a consistent `RECEIPT:` line (`bytes`, sha256, `findings` = the final token); a tool without `--src` support must print `USAGE`. Preceded by `src-bound`: all 28 receipt arm names have a source call site, so `ARM_UNBOUND` cannot preempt.

## Results

| command | exit | transcript |
|---|---|---|
| battery, v1 only | **0** (`HISTORY: HELD held=27/27 tools=1 inputs=5`) | `history-v1-baseline.txt` |
| battery, v1 + candidate snapshot | **0** (`HISTORY: HELD held=44/44 tools=2 inputs=5`) | `history-v1-vs-candidate.txt` |
| battery, v1 + fixture | **0** (`HISTORY: HELD held=44/44 tools=2 inputs=5`) | `history-v1-vs-standin.txt` |
| battery vs frozen `controls/stub` | **1** (`UNMET 18/27`) | `history-control-stub.txt` |
| battery vs frozen `controls/noreader` | **1** (`UNMET 18/27`) | `history-control-noreader.txt` |
| battery vs absent candidate path | **1** (`UNMET 16/22`; `tool-absent` on all five + `src`) | `history-control-absent-candidate.txt` |
| v1 CLI `--receipt c1-probe.txt` | **1** `COUNTER_RECEIPT: DRIFT ARMS_TOTAL` | `receipts.txt` |
| v1 CLI `--receipt c1-repair.txt` | **0** `COUNTER_RECEIPT: CLEAN` | `receipts.txt` |
| v1 CLI `--receipt c2-probe.txt` | **0** `COUNTER_RECEIPT: CLEAN` | `receipts.txt` |
| v1 CLI `--receipt history-red.txt` | **2** `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT` | `receipts.txt` |
| v1 CLI `--receipt history-repair.txt` | **2** `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT` | `receipts.txt` |
| v1 CLI `c1-repair.txt --src probe83-c1.mjs` | **64** `COUNTER_RECEIPT: USAGE` (no source reader in v1) | `receipts.txt` |

**v1/v2 agreement over the historical bytes: 5/5 inputs, exit and verdict identical**, candidate `RECEIPT:` line truthful on all five. Candidate source case: `DRIFT SOURCE_DECLARED`, exit 1, `SOURCE: sites=28 declared=27 receipt=28`, `RECEIPT: bytes=5729 rows=28 held=28/28 findings=SOURCE_DECLARED sha256=2a327c1d…d063`.

## Per-input record (exact candidate `RECEIPT:` lines; v1 emits none)

| input | bytes | sha256 | rows / FAILs | headline | v1 exit · verdict | v2 (snapshot) `RECEIPT:` |
|---|---|---|---|---|---|---|
| `round-83/close/c1-probe.txt` | 5573 | `07690bffa7037c4f266d253bed4f76e6553a61f8991850b3e139135275cbdc20` | 28 / **1** | 27/27 | 1 · `DRIFT ARMS_TOTAL` | `RECEIPT: bytes=5573 rows=28 held=27/27 findings=ARMS_TOTAL sha256=07690bff…` |
| `round-83/close/c1-repair.txt` | 5729 | `2a327c1d08201ad02a0c2ac565f79bbe8a5f591af03be25582cfb7187842d063` | 28 / 0 | 28/28 | 0 · `CLEAN` | `RECEIPT: bytes=5729 rows=28 held=28/28 findings=none sha256=2a327c1d…` |
| `round-83/close/c2-probe.txt` | 2678 | `ad43c857728b1c6ef1f73e089033cc4457479c29f0a4c2008caa7d2b45355933` | 16 / 0 | 16/16 | 0 · `CLEAN` | `RECEIPT: bytes=2678 rows=16 held=16/16 findings=none sha256=ad43c857…` |
| `round-84/close/history-red.txt` | 224 | `78729d6f4001c6021853ef2fe5654f972f77ce46c49b5f431f1f916e4c05c7b9` | 0 / 0, 0 summaries | — | 2 · `FAIL-CLOSED SUMMARY_COUNT` | `RECEIPT: bytes=224 rows=0 held=-/- findings=SUMMARY_COUNT sha256=78729d6f…` |
| `round-84/close/history-repair.txt` | 214 | `1878cabc56e8fe2153ad79b193beb1eb393da9e85f67efd7cb02bf75d8b1e5e0` | 0 / 0, 0 summaries | — | 2 · `FAIL-CLOSED SUMMARY_COUNT` | `RECEIPT: bytes=214 rows=0 held=-/- findings=SUMMARY_COUNT sha256=1878cabc…` |

All copies re-hashed to the committed value (`copy:`), and every committed file re-hashed identically after every run (`immutable:`). `git hash-object` for the five inputs and `probe83-c1.mjs` equals `HEAD:<path>`. No historical byte was modified.

## r83 source case — the named finding is `SOURCE_DECLARED`

`round-83/probe/probe83-c1.mjs` sha256 `5da10098b192a728be87b0cb676eacdd49e4163c0822dcfa6b53ad9b2b064301`: one declaration, `const ARMS = 27;` (line 21), and **28** literal `arm('<name>'` call sites. The 28 arm names in `c1-repair.txt` are exactly those 28 sites (`src-bound receipt-arms=28 source-sites=28 unbound=0`).

Over the 28/28 clean receipt, a byte-reading v2 must therefore print:

```
COUNTER_RECEIPT: DRIFT SOURCE_DECLARED
RECEIPT: bytes=5729 rows=28 held=28/28 findings=SOURCE_DECLARED sha256=2a327c1d08201ad02a0c2ac565f79bbe8a5f591af03be25582cfb7187842d063
SOURCE: sites=28 declared=27 receipt=28
```
exit 1. The finding is that the source **declares `ARMS = 27` while having 28 `arm()` call sites** — not `SOURCE_ARITY`, because the source's 28 sites match the receipt's 28 rows, so the arity comparison does not fire. That mapping is pinned by the frozen table itself: `src-arity` (`sites=4`, `declared=4`, `receipt=3`) requires `SOURCE_ARITY` when call sites differ from receipt rows, which **refutes** mapping `SOURCE_ARITY` onto declared-vs-receipt (in `src-declared`, `declared=2`, `receipt=3`, that mapping would have preempted the expected `SOURCE_DECLARED`). I initially expected `SOURCE_ARITY` in the battery and corrected it after this derivation; the candidate snapshot's `SOURCE_DECLARED` is the consistent answer. v1 has no source reader and answers `USAGE`/64.

## Findings for L1 (advice only; nothing frozen was edited)

**F1 — v2 is not integrated; the measured v2 is a mid-wave snapshot.** `scripts/counter-receipt.mjs` is still base v1 (`190a4c1f…`, no `RECEIPT:` line, `--src` → `USAGE`). The agreement record above is against `build/K85ExecGate/counter-receipt.mjs` at sha256 `7659be6e…` (mtime 15:57:14), which may be superseded before integration. The battery must be rerun at the integrated tree; command below. A red there is a real divergence, not a battery defect.

**F2 — the two r84 files are saved answers, not receipts.** `round-84/close/history-red.txt` / `history-repair.txt` follow the lane's `rev=/command=/<verdict>/exit=` transcript convention (22 of 25 r84 `close/*.txt` start with `rev=`) and contain no arm rows or `HELD|UNMET held=N/D` summary. Fed to `--receipt`, both fail closed `SUMMARY_COUNT` exit 2 under v1 **and** under the candidate — the plan's `DRIFT`/`CLEAN` parenthetical is the answer *recorded inside* each file, which the battery prints as `HISTORY prior=… recorded="DRIFT ARMS_TOTAL" exit=1` / `recorded="CLEAN" exit=0` and labels `plan_label=DRIFT|CLEAN`. This is consistent: the v2 contract keeps the v1 grammar unchanged, so a v2 that answered `DRIFT`/`CLEAN` on those bytes would be a grammar regression. Nothing frozen scores this case; it is a wording question, not a claim risk.

**F3 — `held=` for a zero-summary fail-closed is unpinned by the frozen table.** The battery asserts bytes/sha256/rows/findings on those two inputs and skips `held` (candidate prints `-/-`). Do not treat `-/-` as a pinned contract value.

**F4 — the positive `RECEIPT:` branch needs a fixture to be exercised.** v1 cannot. `selftest-standin-v2.mjs` reproduces the frozen table's three source cases (`sites=declared=receipt` CLEAN; `4/4/3` → ARITY; `3/2/3` → DECLARED) and yields `SOURCE_DECLARED` here, but it is not contract-complete and must stay out of `scripts/` and out of any `C85_C1` run.

**F5 — the battery is itself negative-controlled.** Frozen `stub` and `noreader` controls go `UNMET 18/27` (exit 1) because their zeroed `RECEIPT:` lines contradict the committed bytes and their verdicts miss the r83/r84 exits; an absent tool path goes `UNMET 16/22` (exit 1). The oracle does not pass a tool that does not read the bytes.

## Rerun at the integrated tree (L1)

```
S=$HYAKU_SCRATCH/kumitate-r85/L1/history
mkdir -p "$S"
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show \
  a5d3e7549501ae76dbd86a6f81c5e858f1f92446:scripts/counter-receipt.mjs > "$S/v1.mjs"
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85ExecHistory/history.mjs \
  --tool v1="$S/v1.mjs" \
  --tool v2=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-receipt.mjs \
  --src /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/probe/probe83-c1.mjs \
  --work "$S/battery"
```

Expected: exit 0, `HISTORY: HELD held=44/44 tools=2 inputs=5`, five `agree=… exit=yes verdict=yes receipts=mixed`, `src-bound` ok, and `src:v2 ok … token=SOURCE_DECLARED line="SOURCE: sites=28 declared=27 receipt=28"` plus `src-receipt:v2 ok`.

## Evidence and hygiene

- Direct command/exit/stdout receipt for every run above, bound to lane `HEAD` `9db0c6b5…`, the v1 and candidate sha256 values, and the five input sha256 values: `receipts.txt`.
- Scratch `/fast/scratch/hyaku/kumitate-r85/K85ExecHistory/` (and a transient second dir of the same prefix) removed; sibling scratch roots were not touched.
- No build/lint/test on the shared tree; only the bounded node probes above. Lane tracked changes present in the working tree (`.ufo/pins/readme-map.json`, `SCORECARD.md`) are not this seat's; this seat added only `build/K85ExecHistory/` and this report.
