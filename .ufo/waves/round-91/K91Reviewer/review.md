# K91Reviewer — probe & positive-control review, C1 (receipt-bind v5, bounded external reads)

Reviewer: K91Reviewer · 2026-11-05 · REV `0bff4babeec90dd57ea36efeaa94b66db9af381d` (base v4 tip)
Probe sha256 `3bd88e8e…3f4c` verified; ref control `bc3df527…94db` verified; stock v4 `35f4f25e…cc1fce` verified.
All probe runs: `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch>/pX --alt /fast/scratch/hyaku --rev 0bff4bab… --tool <tool>` (frozen predicate, unmodified).

## 1. Control re-runs (Step 3) — both confirmed on this host

| run | tool | verdict | receipt (this dir) |
|---|---|---|---|
| do-nothing (stock v4) | `scripts/receipt-bind.mjs` @ 0bff4bab | `C91_C1: UNMET held=52/56` exit 1 | `p-noret.txt` |
| positive control | `controls/ref-fd-fstat.mjs` | `C91_C1: HELD held=56/56` exit 0 | `p-pos.txt` |

Failing arms of the do-nothing run: ext-zero (`bound=OUT exit=null`), ext-null (CLEAN), ext-fifo (`bound=OUT exit=null`), ext-overcap (CLEAN) — byte-for-byte the committed `controls/table.txt` row. Bound behaviour: the 20 s kill produces `status=null`, no verdict line, arm FAIL (`bound=OUT`) — verified live twice.

## 2. Per-declared-class: does the probe force the behaviour or can a shortcut satisfy it?

| declared class | arm(s) | forced? | shortcut that beats it? |
|---|---|---|---|
| char dev, never-EOF (/dev/zero) | A44 ext-zero | yes — kill/OOM leaves no verdict (`bound=OUT exit=null` in `p-noret.txt`); refused-within-20 s required for PASS | none found |
| char dev, empty read (/dev/null) w/ sha256("") | A45 ext-null | yes — kills "bounded read then hash" | `ctl-cap-notype.mjs` reads 0 bytes → CLEAN → fails (53/56, `sc-ctl-cap-notype.txt`); type check is load-bearing |
| FIFO, no writer | A47 ext-fifo | yes — v4 blocks open (`bound=OUT exit=null`); O_NONBLOCK open + fstat refuses | no-open-shortcut: refusing-all fails A35c/A16 (committed refuse-external 49/56) |
| directory | A48 ext-dir | yes — EISDIR refused | `refuse-empty`-style fails A46 |
| regular > cap (16777217 sparse, correct digest) | A49 ext-overcap | yes — cap decides, not digest | `ctl-type-nocap.mjs` (no cap) reads and CLEANs → fails (55/56, `sc-ctl-type-nocap.txt`); cap is load-bearing |
| regular == cap (16777216 sparse) | A50 ext-atcap | yes — strictly-greater cap | `ctl-atcap-fail.mjs` (`>=`) → fails exactly ext-atcap (55/56, `sc-ctl-atcap-fail.txt`); edge polarity enforced |
| empty regular external w/ sha256("") | A46 ext-empty-twin | yes — kills refuse-empty / refuse-digest-of-empty | `ctl-empty-fail.mjs` (size===0 refuse) → fails exactly ext-empty-twin (55/56, `sc-ctl-empty-fail.txt`) |
| external-by-absolute stays bindable | A16 abs-half, A35c, A46, A50 | yes — refuses-all profiles collapse (committed refuse-external 49/56; my broken `ctl-extrefuse.mjs` 44/56 via FailClosed INTERNAL, receipt `sc-ctl-extrefuse.txt`) | no refuse-flavoured shortcut reaches 56 |
| carried v4 arms unchanged (47) | A1–A43 ×2 contexts | yes — every shim that touched only the external branch kept 47/47; A2 selftest floor 76 enforced (`ctl-extrefuse` selftest 73/76 → arm FAIL) | none found |
| mid-token invisible code point | A51 (+A52 twin) | yes — value-byte semantics; whole-text strip fails A51 (committed r90-global-strip+ref: fails midtoken-invisible) | none found |
| either fixture context | parent merge per arm, A∧B | yes — any context-keyed gate fails the other context (committed r90-tmpdir/roundpath-gated: 47/56) | none found |

Shortcut tools built and scored (all in this dir; frozen predicate, receipts `sc-*.txt`):

| tool | edit vs stock v4 | score | reading |
|---|---|---|---|
| `ctl-fd-fstat-nolstat.mjs` | fd+fstat+cap read block (the ref edit), keeps lstat-symlink check | **HELD 56/56** (`sc-fd-fstat-nolstat.txt`) | the claimed protocol is sufficient — no other v4 check is needed for the probe |
| `ctl-symdrop.mjs` | fd block + ADDITIONAL late lstat after read | **HELD 56/56** (`sc-ctl-symdrop.txt`) | duplicate ordering of the symlink check is invisible (no external-symlink arm exists — see F1) |
| `ctl-type-nocap.mjs` | fd+fstat type check, NO cap | 55/56 (`sc-ctl-type-nocap.txt`) | fails only ext-overcap |
| `ctl-cap-notype.mjs` | fd+fstat cap, NO type | 53/56 (`sc-ctl-cap-notype.txt`) | fails ext-zero/null/fifo |
| `ctl-empty-fail.mjs` | fd protocol + refuse-empty | 55/56 (`sc-ctl-empty-fail.txt`) | fails only ext-empty-twin |
| `ctl-atcap-fail.mjs` | fd protocol + `size>=cap` | 55/56 (`sc-ctl-atcap-fail.txt`) | fails only ext-atcap |
| `ctl-extrefuse.mjs` | read line deleted (broken shim) | 44/56 (`sc-ctl-extrefuse.txt`) | crashes FailClosed INTERNAL on external arms; illustrates refuse-profile collapse (committed refuse-external control is the clean 49/56 variant) |
| `ctx-ast-pass.mjs` | reads `/proc/<ppid>/cmdline`, wrong verdict in ctx B | 2/56 (`sc-ctx-ast-pass.txt`) | see F2 |

No seat-built or committed tool reaches 56/56 while mis-scoring a declared class. The kill rule does not fire on my constructions.

## 3. Parent-merge robustness (Step 2)

- **Different output per context**: merge is per-arm A∧B with fixed 56-arm set asserted (`CTX_ARMSET` fail-closed); a context-conditional tool must satisfy both contexts' identical expectations. My live test `ctx-ast-pass.mjs` (detects `--ctx B` via `/proc` and mis-answers) scored **2/56** — no gain.
- **`--ctx` visibility**: plan.md says the candidate "cannot see it — verify". **It can**: the tool's parent is the probe child, and `/proc/<ppid>/cmdline` contains `--ctx A|B` (proven with `snooptest/` harness; `ctx-ast-pass.mjs` reacts to it). Harmless for scoring (per-arm A∧B + arm-invariant verdicts), but the plan's parenthetical is factually wrong on this host → F2, informational.
- **Exit before bounded arms / bound timing**: arms are independent invocations; a tool cannot skip later arms. `bound=OUT` is red-only (kill ⇒ `status=null` ⇒ no verdict ⇒ arm fails); it cannot produce a false green. `inBound` uses `Date.now()` wall time around `spawnSync` with `timeout: 20000, killSignal: SIGKILL` — verified live: v4's hangs are killed (`p-noret.txt`), ref control's refusals are in-bound (`p-pos.txt`).
- **2 GiB prlimit**: `prlimit --as=2147483648` bites on this host (allocation test → `RangeError: Failed to allocate memory`); v4's `/dev/zero` behaviour matches the r90 sentinel claim (no verdict, killed — not a graceful ENOMEM catch), receipt `p-noret.txt`.

## 4. Findings

**F1 — [out-of-class gap, LOW, routed not kill]** No probe arm names an EXTERNAL instrument whose leaf is a symlink; the external-symlink refusal (v3/v4 contract text: "an external disk instrument whose named path is a symlink (lstat), is fail-closed") is enforced only inside the candidate's own selftest (ref arm `symlink-instrument-external`), and A2 only checks held==total, so a candidate that silently drops that check keeps 56/56 (`ctl-symdrop.mjs`, `sc-ctl-symdrop.txt` — HELD with the check duplicated, and any variant without it is behaviourally identical to `ctl-fd-fstat-nolstat.mjs` on all arms). Not a declared class (plan: "a char device reachable without a /dev/ spelling" and TOCTOU are routed; external-symlink is neither a declared class nor a carried arm), so per the kill rule this is a routed observation: the v5 integration must keep the lstat-symlink check even though the probe cannot see its absence. Evidence: `d-nolstat-vs-ref.txt` (shim ≡ ref control modulo block braces/finally-close), `sc-fd-fstat-nolstat.txt` (HELD).

**F2 — [probe-fact correction, INFO]** `--ctx` is readable by the candidate via `/proc/<ppid>/cmdline` on this host (plan.md's "(it cannot see it — verify)" is wrong as stated). Scoring is unaffected: context knowledge cannot satisfy any arm's expectation, per-arm merge is A∧B, and the live cheat scored 2/56 (`sc-ctx-ast-pass.txt`). No change to the probe required; keep the fact in the plan's threat model.

**F3 — [integration guidance, INFO]** fd discipline asymmetry: my `ctl-fd-fstat-nolstat.mjs` (no `finally { closeSync }`) still scores HELD 56/56, while the committed ref control closes the descriptor in a `finally`. For the v5 integration keep the ref control's shape (`finally`-close on both the receipt fd and the external fd); the probe cannot distinguish, so this is a code-review item, not a scoring item.

**F4 — [bound/pseulimits verification, INFO, no defect]** Both bounds are real on this host: kill-at-20 s leaves no verdict (`p-noret.txt` ext-zero/ext-fifo `bound=OUT exit=null`); prlimit 2 GiB converts over-allocation into a caught-or-killed failure. No false green and no false red observed across 9 probe runs (~50 s each, sequential).

**Residual risk**: (a) external-symlink leaf coverage (F1) is unprobed — mitigated by keeping the ref control's check verbatim; (b) TOCTOU between lstat and open remains probabilistic and declared out-of-class (RD-3/RD-4); (c) `/proc`/`/sys` regular files with `st_size==0` that read large (ReviewProc's hypothesis) are out-of-class per plan — my review did not exercise them, since no declared class includes them; note `O_NONBLOCK` does not bound a *read* on such files, only the open, so the fstat `isFile()+size` gate is what actually bounds them and `st_size==0` files pass the gate with an unbounded read — flagged here for the integration review only, out-of-class for C1.

## 5. Verification summary

- Frozen artifacts verified by sha256 before use; probe never edited/moved.
- 9 frozen-predicate runs on this host: 2 controls (Step 3) + 7 constructed tools; receipts in this directory.
- Kill rule: does not fire on any reviewed tool. C1 review verdict: **no in-class hole found; probe and positive control are sound for the declared classes; F1/F2/F3 routed observations.**
