# Changes after the freeze (round 64) — disclosed, append-only

Freeze commit: `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`. The plan's declared ratchet (C1, J64) allows exactly this
kind of change: a lie a wave seat finds that the tool accepts becomes a control with its `expect`, and the tool is
fixed — a strengthening, never a relaxation. **No frozen counter, no frozen probe check, no threshold and no pin
changed**: `probe/receipt64-probe.mjs`, `probe/jj64-probe.mjs`, `probe/make-receipt-controls.mjs` and
`probe/jj-donothing-control.sh` are byte-identical to the freeze (`node scripts/counter-pins.mjs` → CLEAN).

## Why the controls had to grow (a defect of the freeze, not a relaxation)

At the freeze the counter's P2 required `>= 8 distinct finding ids` while the committed 16 controls exercised 6 and the
v1 tool defined 7 ids (HASH_ORPHAN is unreachable from a plain-directory control lane). The frozen counter therefore
could not read `RECEIPT64_HELD` at any revision (found independently by K64ExecReceiptForge-1,
K64ExecReceiptRealRun-1, K64CriticC1Predicate, K64ReviewProbeC1, K64MutateProbes, K64ReviewPlanText,
K64ScribeScorecard, K64ScribeLogSkill — eight seats). The floor stays 8; the ratchet supplies the missing ids. This is
a plan defect the operator may rule on (`.ufo/l0-questions.md`, kumitate round 64).

## What changed (wave 1 landed at `d92cf1ff`, wave 2 landed at the integration commit named in the report)

| change | evidence |
|---|---|
| `scripts/report-receipt-diff.mjs` v1 → v3 (contract `kumitate-report-receipt-diff-v3`): wave 1 closed 20 report lies (K64ExecReceiptForge k1–k20) and ported fixes from K64ExecReceiptRealRun/K64ReviewTool; wave 2 closed 12 more (K64R2CriticForgeV2 f1–f13 less f8, which needs `--fleet`), relative receipt citations (K64R2ScribeReportDraft k21, K64R2ReviewToolV2-7), trailing `..`, multi-word labels, CRLF, hollow and mis-ordered sections (`SECTION_EMPTY`, `SECTION_ORDER`), the git-versus-worktree divergences and fleet validation (K64R2ReviewToolGit), fail-closed on an unwritable TMPDIR (K64R2ExecWorktreeArchive) and a symlinked invocation. Finding ids 7 → 12 (`TALLY_CHECKS_MISMATCH`, `RECEIPT_EMPTY`, `HASH_FOREIGN`, `SECTION_EMPTY`, `SECTION_ORDER` added). Selftest 20 → 125. | `node scripts/report-receipt-diff.mjs --selftest` → `PASS (125/125)`; `build/L1Integrate/m/` (the merge ledger) |
| `controls/receipt/` 16 → 50 cases: + `k1…k20`, `c16` (wave 1) and `f1…f13` less `f8`, `k21` (wave 2); `k19`'s `expect` gained `SECTION_EMPTY` (the empty SHONEN section is now also reported). The 16 frozen cases are untouched. Distinct finding ids exercised by the controls: 9 (`HASH_FOREIGN` needs `--fleet`, which the frozen P2 invocation does not pass; the selftest exercises it). | `ls controls/receipt \| wc -l` → 50; all 50 exit as their `expect` (harness in the report) |
| `scripts/jj-seat-demo.sh` v1 → v3 (contract `kumitate-jj-seat-demo-v2`, 27 outcome keys): hermetic against the caller's `GIT_*`/`JJ_*` environment, TMPDIR ancestry, **cwd** (the demo `cd`s into its own scratch directory: with a cwd inside another jj repository jj probes that repository; K64R2ExecWorktreeArchive-1) and **`VISUAL`/`EDITOR`** (`ui.editor` pinned; K64R2ExecWorktreeArchive-2); every mutating step fail-closed; `jj workspace add --no-colocate` where the flag exists (jj 0.46.0 colocates seats by default: K64R2ExecJjOtherVersion); six keys that falsify the first stale rule ("files on disk equal the new commit's tree") in favour of the recorded snapshot tree (K64R2ReviewEntryLimits); `JJ_SKEW:` diagnostic lines. All 27 `JJ_SEAT:` keys read identically on jj 0.45.1 and 0.46.0. | `bash scripts/jj-seat-demo.sh` (run from `/`, under `env -i`, with `VISUAL=/bin/false`, with a hostile `GIT_DIR`/`JJ_USER`) byte-identical outcome keys |
| `scripts/plan-before-ready.sh`: the readme-map arm (K64ExecReadmeGuard) with an epoch (`PBR_MAP_FROM`, default 65), K64R2ReviewPbr's fixes (the first-add test anchored at `$plan`, node and timeout resolved before the `cd`, `PBR_MAP_FROM` validated) and 19 K64R2MutatePbr killer cases; selftest 10 → 38. | `bash scripts/plan-before-ready.sh --selftest` → `PASS (38/38)` |
| `corpus/knowledge/jj-workspace-seat-containment.md`, rows S198–S200 and `corpus/lessons/round-64.md` corrected in place before landing (the files were first committed this round; corrections after wave 2 are by the author, disclosed here, not rewrites of a filed record). | `git log -p` of those paths in the lane |

## What did not change, and is declared as a limit instead

- The J64 counter reads `JJ64_HELD` on forgeries (K64CriticC2Predicate, K64R2CriticJjForge, K64R2MutateEntry: two entry mutants — a swapped
  `source:` URL and a used-by pollution with a real path — still read 8/8), has a porous archive boundary (`../` pin paths, committed symlinks,
  caller cwd, env-overridable census: K64ReviewProbeC2), and hands the measured tree operator privileges (K64SentinelDemoHost). The counter is frozen and pinned;
  the round's supplementary independent checks (`close/supplementary-c2.txt`, K64R2ExecSupplementaryC2's six arms) close what a counter cannot.
- The R64 counter's P5 reads CLEAN on a report that has the six headings and nothing under five of them (K64R2CriticForgeStruct); the compatible
  structure arms (`SECTION_EMPTY`, `SECTION_ORDER`) are in the tool, the others (`CITE_ABSENT`, `TREND_MISSING`, `SHONEN_NO_POINTER`, …) would turn the
  frozen honest control `c0-honest` DRIFT and are not adopted. A hand-written receipt that carries the false tally stays CLEAN (f14, inherent:
  nothing binds a receipt to a counter run).
- Over all 24 real reports of rounds 40–63 the tool reads 13 CLEAN and 11 DRIFT (`controls/real-reports-v2.txt`, measured with the wave-1 build; the
  re-derivation with the final tool is in the report): only r60 is a true DRIFT; the other ten are the false-positive classes K64ExecReceiptRealRun
  classified — unresolvable hashes of read-only clones, scratch repositories and bundles, receipts filed outside `base/`/`close/` or in another round's
  directory. Fixing them by adjacent-word heuristics ("scratch", "fixture") would hand a lying report a way to excuse a dead hash.
- The kimi-layer degraded record (K64ExecKimiDegraded, K64R2ExecKimiApply) lands as a SCORECARD note only: the patch that restores `K_members=53` makes
  `proxy-check` read DRIFT for as long as the four host members are missing, which is the honest reading but not a repair; whether to retire the four
  members is an operator question (`.ufo/l0-questions.md`).
- An unidentified action removed the fleet repository's `.git` at about 21:02 on 2026-10-25, during wave 2; the orchestrator restored it from origin
  (reported to this lane by message). The lane did not establish the cause. Its leads — the demo run with a cwd inside the fleet, jj 0.46.0 seat colocation —
  led to the cwd, editor and `--no-colocate` hardening above; none is proven.
