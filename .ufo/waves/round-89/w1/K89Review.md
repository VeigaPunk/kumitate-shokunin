# K89Review — adversarial review of the frozen counter `probe89-c1.mjs` (round 89, C1 `receipt-bind` v3)

Seat K89Review, leaf reviewer. Lane `kumitate-shokunin`, rev `a5d2503393fc5646acb6468888d8b12a445bf62d`
(`rev.txt`). Build dir `.ufo/waves/round-89/build/K89Review/`. Probe not edited, moved or re-timed.

## Bottom line

**The frozen kill rule fires.** Two seat-constructed controls reach `C89_C1: HELD held=30/30`:

1. `cand-skip-mode.mjs` — `base-v2` plus three edits (a BOM strip, a textual `/proc/self/root` prefix
   strip, and a blob-*shape* test in place of git's mode-120000 check). It skips the claimed
   SYMLINK_INSTRUMENT behaviour (mode, not text shape) and the claimed realpath membership. Score
   **30/30** (`probe-cand-skip-mode.txt`). Under the plan's kill rule, C1 is **UNMET**.
2. `cand-probe-keyed.mjs` — computes nothing: it reads the probe's own fixture directory name
   (`<arm>-<12 hex>`, passed as `--dir`) and prints the expected verdict line. Score **30/30**
   (`probe-cand-probe-keyed.txt`). This is an oracle exercise, not an instrument; it is recorded as the
   proof that the probe is an output-text oracle keyed on arguments the tool receives.

The plan's limit (a) says "an implementation that prints a verdict it did not compute is out of its
reach". That is false: (2) is exactly such an implementation and it reaches the terminal score.

The lane's uncommitted v3 candidate (`scripts/receipt-bind.mjs`, sha256 `70dbcd5d…`, snapshot
`snap-lane-worktree-70dbcd.mjs`) also scores **30/30** at the rev. It is a real implementation and it
also gets the unprobed inputs right (D1, D3 below). The probe's terminal score therefore does not
separate it from the constructions; it only separates them on the arms the constructions were told about.

## Runs (own receipts, all at `a5d2503`, own scratch; scratch removed after copying)

| run | tool (sha256) | result | receipt |
|---|---|---|---|
| base v2 | `git show a5d2503:scripts/receipt-bind.mjs` (`1f11f124…`, = freeze `adfc2f5` copy) | `C89_C1: UNMET held=27/30`, fails `alias-proc-root`, `bom-rev`, `symlink-instrument` — matches `controls/table.txt` row `base-v2-at-rev` exactly | `probe-base-v2.txt`, `snap-base-v2-a5d2503.mjs` |
| lane worktree v3 | `scripts/receipt-bind.mjs` as on disk (`70dbcd5d…`, `M` in `git status`; `K89ExecInst/receipt-bind-v3.mjs` does not exist, so this is the candidate I used) | `C89_C1: HELD held=30/30` | `probe-worktree.txt`, `snap-lane-worktree-70dbcd.mjs` |
| cand-skip-mode | base v2 + 3 edits (`cand-skip-mode.mjs`, `f976e065…`) | `HELD held=30/30` — **kill rule** | `probe-cand-skip-mode.txt` |
| cand-probe-keyed | probe-keyed oracle (`cand-probe-keyed.mjs`, `91fe5505…`) | `HELD held=30/30` — **kill rule** | `probe-cand-probe-keyed.txt` |
| cand-dotdot-ban | cand-skip-mode + textual `..` ban (`cand-dotdot-ban.mjs`, `ab9a4880…`) | `UNMET held=29/30`, the lone failure is the probe's own `selftest` arm (`RECEIPT_BIND_SELFTEST: FAIL held=58/59`) | `probe-cand-dotdot-ban.txt` |
| mut-readfirst | base v2 with the size check moved after the read (`mut-readfirst.mjs`, `a7a33a63…`) | `UNMET held=26/30`; `limit-before-read` fails with `RECEIPT_UNREADABLE … (EACCES)` | `probe-mut-readfirst.txt` |
| unprobed-input demos | `demos.sh` (D1–D3, three fixtures created at run time) | see §3 | `demos.txt` |

Host: uid 1000, Linux, node v24.21.0, `/proc/self/root` present. No installs; no git mutation in the lane;
all fixture repos were `git init`ed in scratch with `rev-parse --show-toplevel` asserted first.

## 1. Per-arm table (30 arms)

Observed = base v2 / lane v3 / `cand-skip-mode` where it matters. Verdicts: **G** fixture-gated (the
fixture's path, name, shape or content is predictable and a one-line construction keys on it);
**T** tautological (a tool with no behaviour can pass it); **H** host- or lane-state-dependent;
**—** a genuine, non-gated discriminator for the behaviour it names.

| # | arm | observed (base / v3) | verdict | note |
|---|---|---|---|---|
| 1 | usage | exit 64 + `USAGE` / same | **T** | any tool that prints `USAGE` with exit 64 passes; the arm is a stub check |
| 2 | selftest | tool's own `RECEIPT_BIND_SELFTEST: PASS` / PASS 59/59 | **T** | checks only the PASS string and exit 0. Plan claims it kills "a no-op selftest": false. `cand-probe-keyed` passes it with no selftest |
| 3 | detect-r86 | `DRIFT 1/9/0` on `round-86/close` as on disk / same | **H** | reads lane *worktree* receipts, not the rev; counts pinned to current files |
| 4 | detect-r86-renamed | `DRIFT 1/9/0` / same | — | name-blind copy of #3; genuine |
| 5 | clean-r87 | `CLEAN matched=11 external=0` / same | **H** | worktree files; a constant "CLEAN matched=11" tool passes (killed elsewhere) |
| 6 | unchecked | `DRIFT 0/0/1 first=u.txt` / same | — | genuine (receipt with no cmd=) |
| 7 | unresolved | `FAIL-CLOSED UNRESOLVED` (absent file) / same | G (weak) | "missing file → refuse" is the whole check; any existence check passes |
| 8 | dir-missing | `DIR_UNREADABLE` / same | G (weak) | existence check only |
| 9 | rev-bad | `REV_UNRESOLVED` for all-f / same | G (weak) | one literal (all-f) |
| 10 | symlink-receipt | `SYMLINK_RECEIPT a.txt` / same | — | genuine; fixed name `a.txt` sorted before `b.txt` |
| 11 | rev-receipt-wins | rev=A, digest A, `--rev` C → CLEAN / same | — | kills ignore-`rev=`; genuine |
| 12 | worktree-forgery | digest of W, judged B → `DRIFT 0/1/0` / same | — | kills worktree hashing; genuine |
| 13 | default-rev | no rev=, digest B at `--rev` B → CLEAN / same | — | B ≠ HEAD(D=body C) ≠ index(S); kills HEAD/index default |
| 14 | rev-receipt-negative | rev=A, digest B, at C → DRIFT / same | — | genuine |
| 15 | untracked-instrument | worktree-only file → `UNRESOLVED` / same | — | kills worktree fallback; genuine |
| 16 | escape-relative | relative `../outside/…` → `ESCAPES_LANE`; absolute twin → CLEAN external=1 | **G** | the `../` prefix is literal; `startsWith('..')` passes; absolute twin is genuine |
| 17 | symlink-dir | link dir → `SYMLINK_DIR`; real dir CLEAN / same | — | only the final path component is tested (declared limit); no ancestor-symlink arm |
| 18 | oversize | 2 MiB → `RECEIPT_TOO_LARGE`; 512 KiB CLEAN / same | — | a 2,000,000 limit also refuses 2 MiB; `limit-edge` (#24) carries the limit |
| 19 | duplicate-field | 4 unequal dup forms → `AMBIGUOUS_FIELD`; single CLEAN / same | — | genuine |
| 20 | sweep | `CLEAN` over 33 `scripts/*.mjs` at rev; flip index 33 mod 7 = 5 → `DRIFT first=` that file / same | **H** (weak G) | uses lane `scripts/` at rev (needs ≥10 non-symlink `.mjs`; none are symlinks now) |
| 21 | default-rev-not-head | no rev=, judged A, HEAD = body C → CLEAN / same | — | genuine (kills HEAD default) |
| 22 | index-not-judged | no rev=, judged B, index = body S → CLEAN / same | — | genuine (kills index default) |
| 23 | abs-in-lane-at-rev | absolute in-lane token, dirty W, judged A → CLEAN / same | — | genuine (kills disk-hashing of in-lane absolute tokens) |
| 24 | limit-edge | 1048576 CLEAN, 1048577 `RECEIPT_TOO_LARGE` / same | — | genuine exact edge |
| 25 | limit-before-read | 1 GiB sparse, mode 0000 → `RECEIPT_TOO_LARGE` / same | **H** | verified on uid 1000: read-first mutant fails with EACCES. As root, DAC does not block the read [INFERENCE, not run]. Header's "256 MiB address-space cap" is not in the code (stale) |
| 26 | escape-inner-dotdot | `scripts/../../<outside>` → `ESCAPES_LANE` / same | **G** | no positive in-lane `..` twin exists, so a textual `..` ban passes this arm; see §3 D2 |
| 27 | dup-equal-field | equal dup rev=/tool_sha256= → `AMBIGUOUS_FIELD` / same | — | genuine |
| 28 | alias-proc-root | base: `CLEAN … external=1` (FAIL) / v3: DRIFT 0/1/0 external=0 | **G**, **H** | literal `/proc/self/root` prefix; `cand-skip-mode`'s textual strip passes it while the symlinked-ancestor alias (§3 D3) it does not model diverges. Absent `/proc/self/root`, a correct tool cannot HOLD [INFERENCE, not run] |
| 29 | bom-rev | base: `DRIFT` (BOM hides rev=) / v3: CLEAN / skip: CLEAN | **G** | literal U+FEFF at byte 0; one `replace(/^\uFEFF/,'')` passes. Plan limit (b) already concedes the behaviour choice |
| 30 | symlink-instrument | base: CLEAN (claim missing) / v3: `SYMLINK_INSTRUMENT` / skip: `SYMLINK_INSTRUMENT` | **G** | the only symlink in the fixture has a bare-filename target `tool-<nonce>.mjs`. Shape test passes it; §3 D1 shows the escape |

Summary: tautological (T) #1, #2. Gated (G) #16, #26, #28, #29, #30 (the v3 additions #28–#30 test only the literal shape of their fixture) and weak existence-only G #7, #8, #9. Host- or lane-state-dependent (H) #3, #5, #20, #25, and #28 on hosts without `/proc/self/root`. The remaining arms (#4, #6, #10–#15, #17–#19, #21–#24, #27) are genuine discriminators for the behaviour they name, subject to the notes in the table.

## 2. Constructions and scores

| construction | diff from base v2 | skipped behaviour | score |
|---|---|---|---|
| `cand-skip-mode.mjs` | (a) `readFileSync(...).replace(/^\uFEFF/,'')`; (b) `resolve(instrument).replace(/^\/proc\/self\/root(?=\/)/,'')`; (c) `if (!bytes.includes(10) && /^[\w.\-\/]+$/.test(bytes)) throw SYMLINK_INSTRUMENT` | mode-120000 refusal (by mode), realpath lane membership | **30/30 — kill rule fires** |
| `cand-probe-keyed.mjs` | none; keyed on `--dir` basename `<arm>-<nonce>` | everything | **30/30 — kill rule fires** (oracle, not an instrument) |
| `cand-dotdot-ban.mjs` | cand-skip-mode + `if (instrument.includes('..')) throw ESCAPES_LANE` | — | 29/30; only the probe's `selftest` arm catches it, via the instrument's own selftest (58/59). A ban that the instrument's selftest does not carry would reach 30/30 |

## 3. Unprobed inputs (`demos.txt`, reproducible via `demos.sh`)

| case | base v2 | cand-skip-mode | lane v3 | claimed behaviour |
|---|---|---|---|---|
| D1 committed mode-120000 symlink whose target has a space | CLEAN (digest = sha256 of link text) | CLEAN | `SYMLINK_INSTRUMENT` | the v3 claim; skip-mode loses it on any target outside the bare-name shape |
| D2 in-lane token `scripts/../scripts/alpha.mjs` | CLEAN | CLEAN | CLEAN | a textual `..` ban refuses this (false ESCAPES_LANE) |
| D3 in-lane instrument via a symlinked ancestor, dirty worktree, judged at A | `DRIFT external=1` (reads W from disk) | same as base | CLEAN (digest of A) | real-path lane membership; the probe has no such arm |

So v3 is strictly stronger than the constructions on inputs the probe never drew. That is the defect:
the probe's terminal score cannot tell them apart on those inputs, and the plan's kill rule is written
against the probe's score, not against the behaviour.

## 4. Probe defects (findings; the probe is not edited)

Ordered by how much they change the verdict.

1. **Output-text oracle, fixture names visible to the candidate (decisive).** `runTool` passes `--dir`
   whose basename is `<arm>-<12 hex>` (`mk(name)`), and the probe reads only stdout/exit. Any tool that
   prints the expected line for its `--dir` basename holds 30/30 (`cand-probe-keyed`). The plan's limit
   (a) is wrong: this is within reach, not out of it.
2. **`symlink-instrument` (#30) is shape-gated.** The only symlink target is `tool-<nonce>.mjs` (bare
   name, no newline). Text-shape classification passes it (`cand-skip-mode`). The mode check is never
   exercised by a non-bare target (D1).
3. **`alias-proc-root` (#28) is prefix-gated.** It only models the literal `/proc/self/root` prefix; no
   symlinked-ancestor alias arm exists (D3). A textual prefix strip passes it.
4. **`bom-rev` (#29) is byte-gated.** One literal U+FEFF at offset 0, one repair asserted. Plan limit
   (b) covers the behaviour choice, not the gating.
5. **Escape arms have no in-lane `..` twin (#16, #26).** A textual `..` ban passes all escape arms
   (`cand-dotdot-ban`), and the only thing that catches it is the instrument's own selftest, which the
   probe trusts by its PASS string.
6. **`selftest` (#2) and `usage` (#1) are text stubs.** The plan's "a no-op selftest" kill is false.
7. **`limit-before-read` (#25) is host-dependent.** Verified on uid 1000 only. Under root the mode-0000
   file is readable, so the arm's discrimination then rests on V8's string-length limit [INFERENCE, not
   run]. The header's "256 MiB address-space cap" is not present in the code (stale docstring).
8. **`alias-proc-root` (#28) fails closed on hosts without `/proc/self/root`** [INFERENCE, not run]: the
   alias path does not resolve, the arm cannot HOLD for any tool. This is plan limit (e), stated as
   inert in the plan; it is a false UNMET, not an inert arm.
9. **Lane-state dependencies.** #3 and #5 read `round-86/close` and `round-87/close` from the lane's
   worktree directory, not from the rev; #20 needs ≥10 `scripts/*.mjs` at rev with no symlinks.
   Changing those files moves the arms with no change to the instrument.
10. **Stale docstring.** It says "three commits (A, B, C=HEAD)". The fixture has four: A, B, body-C
    (overwritten as `C`), and the symlink commit D, which is HEAD and is assigned to `C`. The arms compute
    the right thing, but the description is wrong.
11. **Symlink-dir (#17)** checks only the final path component. Declared as a limit, but no arm checks
    an ancestor symlink, so the limit is never observed.

## 5. Residual risk and verification gaps

- I did not run a root-uid probe, a host without `/proc/self/root`, or any mutation seat; the statements
  marked [INFERENCE] above are reasoning, not receipts.
- The lane `scripts/receipt-bind.mjs` was uncommitted (`M`) during my runs (sha `70dbcd5d…`, unchanged
  across my runs). I did not verify it against the frozen predicate at any other rev.
- `K89ExecInst/receipt-bind-v3.mjs` does not exist; I scored the lane worktree file in its place.
- I did not run H1–H5 harm rules; this review is a C1 predicate review only.

## 6. Recommendation to L1

- Per the frozen kill rule, C1 is **UNMET** as the probe stands. The honest disposition is
  rejected-honest-stop for this round, the third in a row for this capability, with the same root cause
  (the scorer, not the instrument) and this time the scorer's own oracle is the defect.
- Any v4 scorer must (i) not hand the candidate its fixture's arm name (no `--dir` basename that encodes
  the arm), (ii) carry a positive twin for every G arm: a symlink with a non-bare target at a committed
  mode 120000 (D1), an in-lane `..` that stays inside (D2), and an in-lane alias through a symlinked
  ancestor (D3), and (iii) fix the `selftest` and `usage` arms to check behaviour, not a PASS string.
- The round-89 frozen probe itself should not be edited; the defects above are findings to carry forward.
