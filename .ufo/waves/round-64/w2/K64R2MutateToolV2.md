VERDICT: 96 single-literal mutants of the integrated `report-receipt-diff.mjs` v2 were run against the 52-case selftest and all 37 frozen controls (baseline green 52/52 + 37/37): 51 die (48 selftest, 3 controls), 45 survive, and a verified 40-case selftest addition kills 36 of those 45 — leaving 9 argued-equivalent survivors — so of K64ExecReceiptMutants' 33 wave-1 survivors v2 now kills 6 outright and 20 more with the patch (6 equivalent, 1 not applicable).

## Evidence

Subject: `scripts/report-receipt-diff.mjs` at integrated tree `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; sha256 of worktree copy, `git show 2ed8a5f8:...` copy, and my pristine copy all `faca709960bd9c132c78abf6e0f075944d3a7d35a29104cb7203802c3ca58e83`.

```
$ node work/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (52/52)                     exit=0
$ node mutants.mjs work <controls/receipt> <scratch>      # 96 mutants x (selftest + 37 controls)
BASELINE GREEN: selftest 52/52, controls 37/37 parity
TOTAL 96 | KILLED-SELFTEST 48 | KILLED-CONTROLS 3 | SURVIVOR 45 | BUILD-ERROR 0
EQUIVALENT (survivor, no case): M02,M06,M52,M60,M61,M62,N01,N39,N41
PLUS-PRISTINE selftest GREEN 92/92
PLUS-PRISTINE controls parity: 37/37
V1-REMAP 32: killed-now 6 (M16,M31,M39,M44,M47,M67), killed-by-plus 20
 (M03,M04,M08,M09,M10,M12,M13,M15,M17,M25,M29,M43,M45,M46,M48,M63,M64,M68,M69,M70),
 still-uncovered 6 (M02,M06,M52,M60,M61,M62)
```
Mutant application: each `find` literal asserted to occur exactly N times (N=1 except M45=2, I04=4) in the pristine source, then split/join applied — no multi-site ambiguity; 0 build-errors.
Control kills (the 21 post-freeze ratchet cases earning their keep): N11 `fenced=!fenced`→`true` via `c13-placeholder-in-fence:1/PLACEHOLDER,SECTION_MISSING,SHONEN_COUNT`; N21 worktree `lstatSync().isFile()`→`existsSync()` via `k15-receipt-symlink:0/CLEAN`; N47 `process.exit(r.code)`→`exit(0)` via `c1-placeholder-measured:0/PLACEHOLDER` (+3 more DRIFT cases).
Every kill verdict line above is the runner's verbatim stdout; full per-mutant reasons in `work/mutant-results.json` and `work/mutant-table.md` (96 rows: id, src, mutation, verdict, killed-by).

## Findings

**K64R2MutateToolV2-1 — medium (coverage), attacks the tool's falsifier surface.** 45/96 mutants survive the integrated tree's own falsifiers (52-case selftest + 37 controls). Surviving classes: every REQUIRED-heading weakening (M02/M06/M08/M09/M10, N13), every regex-boundary drop (M12/M13/M15/M25/M70), the exit-code arms (M46/M48, N45/N46), tip resolution (M43), hash classes (M45/M63/M64), the checks=-null arm (N36), glob escaping/crossdir (N28/N29), and the case-folding key (N12). The 10 finding-id renames (I01–I10) all die at the selftest. A tool that exits 1 where the contract says 64/2, resolves blob hashes, and lets `x9_held` labels mismatch pass is certified by the current selftest. Reproduce: `node .ufo/waves/round-64/build/K64R2MutateToolV2/work/mutants.mjs <work> .ufo/waves/round-64/controls/receipt <scratch>` (baseline-green preconditions included).

**K64R2MutateToolV2-2 — patch (strengthening), verified.** `work/report-receipt-diff.selftestplus.mjs` = pristine + 3 fixture lines (nested receipt `close/sub/deep.receipt`, second commit `c2`, `blobSha`) + 40 cases; it reads `REPORT_RECEIPT_SELFTEST: PASS (92/92)` exit 0 and keeps 37/37 controls parity, and each of the 36 targeted survivors run against it fails exactly its named case (`KILLED-BY-PLUS via <case>` above; results in `work/plus-kill-results.json`, diff in `work/selftest-additions.patch`). Selftest-only text — no behaviour change, so P1–P5 are unaffected; the L1 integrates.

**K64R2MutateToolV2-3 — v1→v2 cross-answer (the tasked comparison).** Of K64ExecReceiptMutants' 33 wave-1 survivors: v2's existing falsifiers now kill 6 — M16 (tab separator, via `tally-spaced-eq`+scan), M31 (box-scan slice, via honest-clean), M39 (round-scoped case now sees the noise), M44 (crashes: `headRes` is null when `--rev` given), M47/M67 (new `cli-rev-*-bad-rev` exit-2 cases); the proposed patch kills 20 more (incl. M17, which no symmetric case can kill — truncation `10/10`→`10/1` is identical on receipt and claim sides — via the asymmetric `tally-detail-two-digit` on the rendered finding detail); 6 are argued equivalent (below); 1 (M34) is not applicable — v2 deleted the v1 `line()` matcher. Net: 26/33 killable, +6 equivalent +1 N/A. Wave 1's counter-only kill of M17 is superseded by the patch.

**K64R2MutateToolV2-4 — low (carried, structural), attacks the control set.** The 37 controls exercise 8 of the 9 contract ids — `HASH_ORPHAN` is unreachable because every control lane is a non-repo (`cat …/controls/receipt/*/expect | tail -n+2 | grep -v CLEAN | tr ',' '\n' | sort -u` → the 8 ids; census in evidence above) — and killed only 3/96 mutants. Controls are a parity harness, not a killer; the selftest must carry the behavioural weight, which finding -2 supplies.

**K64R2MutateToolV2-5 — low, selftest CLI arm cannot kill main-exit mutants.** The v2 selftest's CLI exit assertions are 2/2/0; `cli-rev-space-form-bad-rev` reaches exit 2 through the early fail-closed literal, never through `process.exit(r.code)` — N47 (main exit→0) passed the whole selftest and died only at controls. One added case (`cli` over a finding-bearing report expecting status 1) would close this; proposed but intentionally not run — patch -2 already kills N47 via controls. Reproduce: `--only N47` in the battery command.

**K64R2MutateToolV2-6 — equivalences (the 9 final survivors), reasoned, no case possible/needed.** M02/M06: REQUIRED regexes are end-unanchored, so `Landed change`/`Trend verdict` match every real heading — prefix-equal on all inputs. M52: P1 reads the `PASS (N/N)` line; a red run prints `FAIL` and fails P1 regardless of exit code. M60: fleet is consulted only for hashes the lane cannot resolve; fleet=lane degenerates to the same checks. M61: `--rev` is pre-verified by `rev-parse`, so `ls-tree` on it exits 0. M62: `ls-tree -r` lists blobs (readable by `git show`) — carried caveat: a submodule entry under the receipt tree would register as empty, unreachable in any fixture. N01: `[A-Za-z]` + `{1,}` ≡ `{2,}` — both floor at 2 inner chars. N39: `headRes` is computed but unused when `--rev` is given (pure query, no behaviour change). N41: the `bytes=` meta is printed, never parsed by selftest/controls/P1–P5.

## Artifacts

- `.ufo/waves/round-64/build/K64R2MutateToolV2/work/report-receipt-diff.mjs` — pristine copy (sha256 above, byte-identical to lane and integrated tree).
- `.../work/mutants.mjs` — the 96-mutant battery + plus-draft builder/verifier (rerunnable; baseline-red abort).
- `.../work/mutant-results.json`, `.../work/mutant-table.md` — full 96-row results (id, mutation, killed-by, verdict).
- `.../work/report-receipt-diff.selftestplus.mjs` + `.../work/selftest-additions.patch` — the verified 40-case selftest addition (92/92, parity 37/37).
- `.../work/plus-kill-results.json` — per-survivor kill proofs (36 KILLED-BY-PLUS, named case each).
- Scratch `/tmp/kumitate-r64/K64R2MutateToolV2/` — empty at finish (mutant copies deleted per run). Build dir holds 3 script files (gate ≤15).
- Tooling: none installed; `node v24.21.0`, `git` present. No pacman touched.

## Limits

- Only `scripts/report-receipt-diff.mjs` mutated; `jj-seat-demo.sh` (C2) and the frozen counters were not mutated. The frozen `receipt64-probe.mjs` was used only as the definition of the P2 invocation and was not re-executed this seat.
- M44's semantic "tip ignores rev" form requires a 2-literal change (unguard `headRes` + swap tip); my single-literal remap is a crash mutant (killed) and the contract is pinned instead by the plus case `tip-honours-rev`.
- Equivalences are arguments over reachable inputs (per-mutant reasoning in -6), not exhaustive proofs; M61/M62 rest on measured `git ls-tree`/`rev-parse` behaviours.
- Controls were read and run, never edited; all proposed strengthening is selftest text in my build directory for L1 integration.
