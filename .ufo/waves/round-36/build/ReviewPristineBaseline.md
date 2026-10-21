REVIEW baseline files=26 mismatches=0
REVIEW baseline env_dependent_lines=6 unverifiable=1 verdict_terms_mismatched=0

# ReviewPristineBaseline — .ufo/waves/round-36/baseline honesty

Pristine lane tree: `git archive 0614092e0804aaca06642cb3a263a05c1cacc98e | tar -x`
→ `/fast/scratch/kumitate-r36/w/KumitateR36.ReviewPristineBaseline/pristine` (no `.git`, no `.ufo`).
Pin clone `src=/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (HEAD re-read after all runs).
Baseline has **no argv/command log**; commands below were reconstructed from each capture's header
(`src=`, `self=`, `fleet=`) and each script's usage block. `PR` = pristine tree, `LANE` = lane repo,
`SRC` = pin clone, `SBHOME` = sandbox HOME containing a writable copy of SRC (see finding 2).

## Reproduction table

| # | baseline file | re-run command (cwd) | capture says | re-run says | non-reproducing lines |
|---|---|---|---|---|---|
| 1 | surface-pin.txt | `node scripts/surface-probe.mjs --src SRC` (PR) | DRIFT errors=3 exit 1 | same | 0 (byte-identical incl. EXIT) |
| 2 | proxy-pin.txt | `node scripts/proxy-check.mjs --src SRC` (PR) | DRIFT C2_TOTAL/AXES/PIN_UNPINNED exit 1 | same | 0 (identical) |
| 3 | claims-pin.txt | `node scripts/claims-check.mjs --src SRC` (PR) | MATCH rows=19 adv=6 exit 0 | same | 0 (identical) |
| 4 | claims-default.txt | same, no `--src`, `HOME=SBHOME`, `UFO_OMP_GLOBAL_CONFIG_PATH` real | MATCH exit 0 | same | 1 label (`EXIT=0` vs my `claims_exit=0`); **content 0** |
| 5 | proxy-default.txt | same, no `--src`, `HOME=SBHOME` | DRIFT exit 1 | same | 1 label; **content 0** |
| 6 | surface-default.txt | same, no `--src`, `HOME=SBHOME` | `src=/home/vgpnk/Projects/ufo-fsd-alpha`, DRIFT errors=2 exit 1 | `src=<SBHOME>/Projects/ufo-fsd-alpha`, DRIFT errors=2 exit 1 | 1 content line: `src=` (env leak, finding 1) |
| 7 | checklists.txt | `UFO_SRC=SRC node scripts/surface-probe.mjs --checklists` (LANE) | 11/13, 620+625 FAIL, exit 1 | same, every line identical | 0 (captured `EXIT=1` reproduced) |
| 8 | kimi.txt | `node scripts/kimi-census.mjs` (PR, HOME real) | CLEAN members=51 exit 0 | same | 0 (identical) |
| 9 | sources.txt | `node scripts/sources-check.mjs` (PR) | CLEAN rows=28 exit 0 | same | 0 (identical) |
| 10 | roundgate35.txt | `node scripts/round-gate.mjs --round 35 --repo LANE --main-repo …/shokunin --reports-dir …/.ufo/reports` (PR) | CLEAN round=35 checks=10 exit 0 | same | 0 (identical) |
| 11 | roundgate-tracked.txt | same with `--tracked` | CLEAN mode=tracked checked=18 exit 0 | same | 0 (identical) |
| 12 | cite-pin.txt | `node scripts/cite-check.mjs --src SRC` (LANE; self=lane, fleet=shokunin) | DRIFT files=84 tokens=8477 errors=467 warnings=447 pins ok=71 exit 1 | same verdict/terms | 1 content line: `fleetIndexFiles=272076` → `272889` (unpinned live fleet) |
| 13 | claims-rows.txt | `node scripts/claims-check.mjs --src SRC --row R5 --row R7 --row R9` (PR) | ROWS 3 YES 3 adv=5 exit 0 | same | 0 (identical) |
| 14 | rows.json | `claims-check --json` (PR) projected to `{id,form,sections:len,files:distinct,notes}` | 19 rows | equal after projection | 0 (projection-equal) |
| 15 | selftest-claims.txt | `node scripts/claims-check.mjs --selftest` (PR) | 39/39 PASS exit 0 | same | 0 |
| 16 | selftest-cite.txt | `node scripts/cite-check.mjs --selftest` (PR) | 62/62 PASS exit 0 | same | 4 lines: 3 mkdtemp paths + fixture git SHA (9b21fc93…→ab1b7585…; non-deterministic by construction) |
| 17 | selftest-kimi.txt | `node scripts/kimi-census.mjs --selftest` (PR) | 48/48 PASS exit 0 | same | 0 |
| 18 | selftest-proxy.txt | `node scripts/proxy-check.mjs --selftest` (PR) | 109/109 PASS exit 0 | same | 12 lines: mkdtemp paths only |
| 19 | selftest-roundgate.txt | `node scripts/round-gate.mjs --selftest` (PR) | 60/60 PASS exit 0 | same | 9 lines: mkdtemp paths only |
| 20 | selftest-sources.txt | `node scripts/sources-check.mjs --selftest` (PR) | 46/46 PASS exit 0 | same | 0 (identical) |
| 21 | selftest-surface.txt | `node scripts/surface-probe.mjs --selftest` (PR) | 42/42 PASS exit 0 | same | 4 lines: mkdtemp paths only |
| 22 | fidelity-prototype-v0.txt | — no implementation retained | nonok=554 | not re-runnable | file unverifiable (no code, no EXIT) |
| 23 | fidelity-prototype-v1.txt | `node fidelity-prototype-v1.mjs` (baseline copy, self=lane, src=SRC) | TOTAL anchors=1530 nonok=588 | byte-identical TOTAL/per-note | 0 (EXIT absent in file; run exits 0) |
| 24 | fidelity-prototype-v1.mjs.txt | source executed (above) | — | produced #23 exactly | 0 |
| 25 | fidelity-reference.txt | `node fidelity-reference.mjs PR SRC` | TOTAL nonok=577 | byte-identical | 0 (EXIT absent in file; run exits 0) |
| 26 | fidelity-reference.mjs.txt | source executed (above) | — | produced #25 exactly | 0 |

`files=26` = every file in the baseline directory (25 .txt + rows.json). Every verdict/summary/count term of
the 20 command captures reproduces exactly; no capture is a fabrication.

## Findings (severity order)

1. **HIGH — environment leak: default-mode captures measured the operator checkout, and never say so.**
   `surface-default.txt:2` records `src=/home/vgpnk/Projects/ufo-fsd-alpha`; that is the default resolution
   (`claims-check.mjs:79-80`, `proxy-check.mjs:265-266`, `cite-check.mjs:107-108`, `surface-probe` candidate
   list) when `$UFO_SRC` is unset. `claims-default.txt`, `proxy-default.txt` and checklist items
   `SKILL.md:618,620,625,627` are bare commands of the same class, and none of those artifacts records a
   `src=` or a revision. Consequence: the record cannot attribute those numbers to `31c465f…`; they were
   measured on the mutable operator tree. At capture time that tree was at `31c465f…` (verified now:
   `git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD` = `31c465f1566…`), but no capture-time proof exists.
   I reproduced them against a writable copy of SRC at the same revision, which is why the verdicts match;
   the `src=` line cannot match by construction. Fix for the round: the PIN v1 `src-rev=` verdict segment is
   the right closure; re-capture defaults under the pin or attach argv+`src-rev` provenance.

2. **MEDIUM — `surface-default.txt`'s 2-error verdict is not a property of the revision; it needs a writable tree.**
   The dispatcher status verb creates its state dir in the tree it reads:
   `node /fast/scratch/kumitate-r36/src/scripts/fleet-dispatcher.mjs status` →
   `{"code":"EACCES","command":"status","error":"EACCES: permission denied, mkdir '/fast/scratch/kumitate-r36/src/.ufo'","kind":"dispatcher_crash"}` `EXIT=1`
   (why `surface-pin.txt` has `SURFACE_UNREACHABLE` / 3 errors). On the writable copy the same call exits 0
   and leaves `<copy>/.ufo/cache/node-compile`. So the default arm's 2 errors vs the pin arm's 3 is a
   writability artifact, and the baseline text does not mark it. This is exactly the "gate writes into the
   tree it reads" defect the round targets, captured only indirectly.

3. **MEDIUM — no captured argv anywhere in `baseline/`.** The 26 files contain no README/command log; the
   commands above are reconstructions. Two captures were only reproducible after inferring flags:
   `claims-rows.txt` = `--row R5 --row R7 --row R9` (verified exact), `rows.json` = `--json` projected to
   `{id,form,sections,files,notes}` (verified projection-equal). `cite-pin.txt` also embeds `self=`/`fleet=`
   lane paths but no `--self/--fleet` argv, and depends on the live fleet index.

4. **LOW — `cite-pin.txt:1048` no longer reproduces** (`fleetIndexFiles=272076` → `272889`) because the
   fleet tree is a live, unpinned input. All verdict terms reproduce (`files=84 tokens=8477 errors=467
   warnings=447 pins ok=71 mismatch=7 untyped=62 revUnknown=32`; `selfIndexFiles=208` matches). The
   `indexFiles=1103` pin-clone count matches.

5. **LOW — selftest captures are not byte-reproducible by design.** 4 files differ only in `mkdtemp` paths;
   `selftest-cite.txt:7` carries the SHA of a freshly `git init`+commit fixture (`cite-check.mjs:1668-1679`),
   so its value changes every run. All PASS counts and verdicts reproduce exactly (62/62, 109/109, 60/60,
   42/42, 46/46, 48/48, 39/39); compare verdict lines, not bytes.

6. **LOW — fidelity artifacts.** `fidelity-prototype-v0.txt` has no retained implementation and cannot be
   re-run (its 554 is not load-bearing; the frozen contract cites v1's 588). `fidelity-prototype-v1.txt`
   and `fidelity-reference.txt` reproduce byte-for-byte when their `.mjs` sources are executed (588 / 577),
   but neither the outputs nor the sources carry an `EXIT=` line.

7. **INFO — missing exit codes:** every one of the 20 command captures (all named in this item) plus
   `claims-rows.txt` carries `EXIT=`; the only files without one are the 5 fidelity artifacts (3 outputs,
   2 sources). `rows.json` is data, not a run.

8. **INFO — no operator-path leak in the pin-mode captures:** `surface-pin.txt:2` = `src=/fast/scratch/kumitate-r36/src`;
   `proxy-pin`/`claims-pin` print no path; `cite-pin.txt:2-3` = pin src + expected lane/fleet paths;
   `kimi.txt:1` = `/home/vgpnk/.kimi-code` (declared gate input); selftest paths are `/tmp` fixtures.

## Read-only integrity (after all runs)

- Pin clone: HEAD still `31c465f1566…`; `/fast/scratch/kumitate-r36/src/.ufo` absent; no file under it newer
  than the clone's 02:21 mtime (writes refused by `chmod a-w`, proven by the EACCES above).
- Operator checkout `/home/vgpnk/Projects/ufo-fsd-alpha`: HEAD `31c465f1566…`; `.ufo` and root mtimes unchanged
  (`2026-10-20 07:12`), i.e. never reached by a gate in this review. Never passed as `--src`.
- Lane: `git status --porcelain` still only `?? .ufo/waves/round-36/`; no git/jj mutation.
- Scratch only: `/fast/scratch/kumitate-r36/w/KumitateR36.ReviewPristineBaseline/` (pristine archive, sandbox
  HOME/copy, outputs, copied fidelity sources). No package/system changes; no tool installs.

## Residual risk / verification gaps

- Default-mode reproductions used `HOME=<sandbox>` + `UFO_OMP_GLOBAL_CONFIG_PATH=/home/vgpnk/.omp/agent/config.yml`
  (the dispatcher refuses a symlinked config and needs it to resolve `l1Alias m_strong`) and a writable copy of
  SRC at `31c465f…`. A bare run against the operator checkout was deliberately not performed, so the `src=`
  line and any capture-time operator state are unverified. [INFERENCE] the operator tree was at `31c465f…`
  during capture (it is now; no capture-time record exists).
- No write fingerprint of the operator checkout was taken during baseline capture: the write *attempt* by
  `status` is proven (EACCES at the pin, `.ufo` creation on a fresh writable copy); mutation of the operator
  checkout by the baseline checklist item is [INFERENCE], not observed.
- Exact argv of each capture (esp. `cite-pin` `--self/--fleet`, `claims-rows` row flags) is unrecorded and
  was reconstructed; reproductions used flags that reproduce the captured bytes.
