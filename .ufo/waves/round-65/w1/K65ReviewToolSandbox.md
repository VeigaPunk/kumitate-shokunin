VERDICT: harm-matrix v1's sandbox is honestly isolated (every git call is `git -C`, fixtures carry their own identity and signing off) but it has two silent-contract holes that matter for C1: any internal throw — including a full/absent temp dir and a mistyped registry field — exits **1**, which the contract reserves for HARM, and the selftest cannot see a wrong summary counter, a dropped `base=/tip=`, or a duplicated summary line; 8 hardening patches + 8 new cases are drafted and verified (34/34 PASS, and the four counter/summary mutants that pass today now fail).

## Evidence

Fixed tool = `node .ufo/waves/round-65/build/K65ReviewToolSandbox/harm-matrix.mjs`, fixed cases = same dir `harm-cases.json`.
Drafts verified: `PASS (34/34)`, exit 0. Committed tool: `HARM_MATRIX_SELFTEST: PASS (26/26)` with `leftovers=0` (private TMPDIR).

Isolation (clean): every git spawn names `-C` — `harm-matrix.mjs:48` helper, `:75` (fixture `git -C D init`), `:76/78` (clone/checkout), `:117` (rev-parse), `:154` (`g()` = `git(D,[...GIT_ID,...])`); `GIT_ID` (`:43`) is applied to init/add/commit only, so `user.name/email`, `commit.gpgsign=false`, `core.hooksPath=/dev/null` cover every commit. No `process.chdir`. Hostile HOME (`user.name=OUTSIDE`, `commit.gpgsign=true`, `gpg.program=/bin/false`, `init.defaultBranch=outsidebranch`): `--- hostile HOME rc=0 tail=HARM_MATRIX_SELFTEST: PASS (26/26)`. Inherited `GIT_DIR`: `CASE FAIL honest-held threw fixture toplevel  != /tmp/.../harm-fixture.8g311X` — the toplevel guard bites (diagnostic empty, see F11).

Counter blindness (the selftest cannot fail on these):
```
M4b(carried+100, moved<-CARRIED+9, gone+7, new+5) rc=0 tail=HARM_MATRIX_SELFTEST: PASS (26/26) fails=0
M5b(base/tip dropped from summary)               rc=0 tail=HARM_MATRIX_SELFTEST: PASS (26/26) fails=0
M6 (held=${HELD}0) honest-held-only              rc=0 out=CASE ok honest-held|HARM_MATRIX_SELFTEST: PASS (1/1)
M10(a 2nd `HARM_MATRIX: HARM gates=99 harm=99`)  rc=0 tail=HARM_MATRIX_SELFTEST: PASS (26/26)
```
Rows are genuinely pinned (control): suppressing HARM_ROW lines → `FAIL (4/26) fails=22`.

Exit-code contract broken by crashes (committed tool):
```
--- needs-nonstring rc=1  ERR: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received type number (5) at measure (...harm-matrix.mjs:84:30)   OUT: (empty)
--- tmpdir-is-file rc=1  ERR: Error: ENOTDIR: not a directory, mkdtemp '.../tmpfile/harm-matrix.XXXXXX'  OUT: (empty)
--- tmpdir-missing rc=1  ERR: Error: ENOENT: ... mkdtemp ...  OUT: (empty)
```
vs. the sandbox failure the code does handle: `SANDBOX_FAIL rc=2 out=HARM_MATRIX: FAIL_CLOSED reason=SANDBOX_FAILED detail="base: clone: fatal: repository '.../sub' does not exist\n" leftovers=0`.

Silent registry lies, exit 0 (committed tool):
```
--- okexit-strings rc=0  HARM_ROW gate=g1 base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED base_text="G1: CLEAN [exit=0]"
--- verdict-no-capture rc=0  ... id=CARRIED base_text="G1: CLEAN [exit=0]"      (word = whole match, never in clean[])
```

Parser (committed tool): `--- only-empty-string rc=0` (whole registry ran, `gates=2`); `--- only-comma rc=2 reason=NO_GATES`; `--- base-eats-tip-flag rc=2 FAIL_CLOSED reason=REV_UNREADABLE detail="base=--tip"`; `--- dup-base rc=0` (first `--base` silently wins); `--- timeout-plus rc=64` / `--- timeout-zero rc=64` (correct). `--- no-args rc=64` on stderr with empty stdout.

Leaks (committed tool): fixture throw → `leftovers=1` (`one.json` case, `PATH` without git: `CASE FAIL honest-held threw fixture init`); hung case killed at the parent's 180 s `spawnSync` cap → `CASE FAIL hang ... in 3m0s`, `leftover_sandboxes=2 leftover_fixtures=0`, and the gate process survived: `1583677 timeout -k 2 1000 bash scripts/g1.sh` (I killed it). Clean paths leak nothing: exit-2 sandbox failure `leftovers=0`, normal selftest `leftovers=0`.

Traversal (committed tool): case with `tip_delete:["../../sentinel/target.txt"]` and `base:{"../../sentinel/written.txt":"w"}` → `CASE ok trav`, `sentinel=DELETED`, `written=CREATED`.

Non-vacuity of three cases (each fails when its rule is broken; mutants = copies): M1 drop `okExit`: `CASE FAIL harm-exit-code-with-clean-line exit=0 want=1 rows=["g1 HELD"]`; M2 fold CARRIED_MOVED: `CASE FAIL carried-moved-line ... rows=["g1 CARRIED"]`; M3 first verdict wins: `CASE FAIL last-verdict-wins exit=0 want=1 rows=["g1 HELD"]`.

Hardened drafts: `HARM_MATRIX_SELFTEST: PASS (34/34)`; against the same mutants `N1/N2/N3 rc=1 FAIL (13/34) fails=21`, `N4(usage→stdout) rc=1 FAIL (30/34) fails=4`; no-git run cleans up (`orphan fixtures=0`), traversal now `CASE FAIL trav threw case path escapes the fixture: ../../sentinel2/target.txt` with `sentinel2=present`, and `TMPDIR`=file → `rc=2 HARM_MATRIX: FAIL_CLOSED reason=SANDBOX_FAILED detail="base: mkdtemp: ENOTDIR"`. Real-lane smoke (hardened draft, `--base HEAD --tip HEAD`): `HARM_ROW gate=readme-map base=CLEAN tip=CLEAN id=HELD`, `gate=proxy-check ... id=CARRIED`, `HARM_MATRIX: CLEAN gates=2 ... base=2ca91a0c8154 tip=2ca91a0c8154`, exit 0. Registry compatibility: `registry gates=20 rejected_by_new_rules=0`.

## Findings

**K65ReviewToolSandbox-1 — HIGH — every internal throw exits 1, which the contract defines as HARM.** `sandbox()` (`harm-matrix.mjs:75`) calls `mkdtempSync` outside any guard, `measure()` (`:84`) trusts `g.needs` to be a string, and `main` (`:206`) has no try/catch; uncaught → node exit 1, empty stdout, no `HARM_MATRIX:` line. A full `/tmp` (ENOSPC) or a mistyped registry therefore reads as "a gate harmed the lane" to anything that trusts the exit code. Repro: `TMPDIR=$(mktemp); : >$TMPDIR/f; TMPDIR=$TMPDIR/f node scripts/harm-matrix.mjs --lane <fixture> --base HEAD --tip HEAD --gates <fixture>/gates.json; echo $?` → 1. Fix (patch R2/R3/R6): reject non-string `needs`, wrap `mkdtempSync`, wrap `runMatrix` → `FAIL_CLOSED reason=INTERNAL`, exit 2 (verified: `rc=2 ... mkdtemp: ENOTDIR`).

**K65ReviewToolSandbox-2 — HIGH — the selftest does not pin the summary counters.** `expect.summary` is optional and matched with `includes` (`:187-188`), and 15 of 26 cases carry none; `carried=`, `moved=`, `gone=`, `new=`, `base=`, `tip=` are named by no case, and `honest-held`/`mixed-three` accept an inflated `held=10` because `"gates=1 held=1"` is a prefix of `"gates=1 held=10"`. Repro: `cp scripts/harm-matrix.mjs /tmp/m.mjs`, replace `carried=${n('CARRIED')}` with `carried=${n('CARRIED') + 100}` (plus the moved/gone/new edits in `evidence-falsifiers.txt`), `node /tmp/m.mjs --selftest --cases $PWD/scripts/harm-cases.json` → `PASS (26/26)`. Fix (patch R5 + regenerated `harm-cases.json`): every case carries the full line with `{B12}`/`{T12}`, compared for equality, `summary:null` meaning "no summary line at all"; `N1` then `FAIL (13/34)`.

**K65ReviewToolSandbox-3 — MEDIUM-HIGH — a duplicated/contradictory summary line is accepted.** `lines.find` (`:187`) takes the first `HARM_MATRIX:` line and nothing checks the count, so a tool that also prints `HARM_MATRIX: HARM gates=99 harm=99` (which `tail -1`/`grep`-style readers would read) passes. Repro: append `out(\`HARM_MATRIX: HARM gates=99 harm=99\`);` to `render()` in a copy → `PASS (26/26)`. Fix (R5): exactly one summary line required; `N3` then `FAIL (13/34) fails=21`.

**K65ReviewToolSandbox-4 — MEDIUM — `--only` with an empty list silently widens to the whole registry.** `:203` uses `opt('--only') ? ... : null`, so `--only ""` is falsy → `only=null` → every gate runs, exit 0 (`gates=2` observed). A caller that computed an empty id list gets 20 gates run and a CLEAN verdict it did not ask for. Repro: `node scripts/harm-matrix.mjs --lane <fixture> --base $B --tip $T --gates <fixture>/gates.json --only ""` → rc 0. Fix (R7): `onlyRaw === undefined ? null : split/trim/filter`, empty → usage 64; new cases `only-empty-string`, `only-empty-list` (both `want=64` today fail: `rc=0` / `rc=2`).

**K65ReviewToolSandbox-5 — MEDIUM — the registry is coerced, never validated, where it matters.** `ok_exit:["0"]` (string) makes every gate permanently NOT_CLEAN with exit 0 and no diagnostic (`id=CARRIED`), and a `verdict` without a capture group silently degrades the "word" to the whole matched line (`:92-93`), likewise permanent NOT_CLEAN; `timeout:"10"` silently becomes 60 s. All three are registry typos that read as honest drift. Repro: the `okexit-strings` / `verdict-no-capture` / `gates-timeout-string` fixtures in `evidence-args.txt`. Fix (R2/R2b): require a capture group, string `clean[]`, integer `ok_exit[]`, integer `timeout`, string `needs` → `GATES_INVALID` exit 2; 3 new cases added.

**K65ReviewToolSandbox-6 — MEDIUM — fixture temp dirs leak exactly on the throw path, and a hung case leaks its sandboxes plus its gate process.** `buildFixture` (`:152`) creates `D` then throws (init/toplevel/commit) before `selftest`'s `fx` is assigned, so the `finally` (`:196`) has nothing to remove: `PATH` without git → `leftovers=1`. And when a case exceeds the parent's 180 s cap, the child tool is SIGTERMed inside `runMatrix`'s `finally`, so both clones leak and the `timeout … bash scripts/g1.sh` grandchild is orphaned (`leftover_sandboxes=2`, `1583677 timeout -k 2 1000 bash scripts/g1.sh` still alive; I killed it). Repro: `PATH=<dir with only node> node scripts/harm-matrix.mjs --selftest --cases one-case.json`, count `$TMPDIR/harm-fixture.*`. Fix (R4): `buildFixture` wraps its body and `rmSync(D)` on throw (verified `orphan fixtures=0`). The SIGTERM orphan is unaddressed by design — the case cap should be lowered or `timeout` given `--foreground`; noted as residual.

**K65ReviewToolSandbox-7 — MEDIUM — the fixture builder has no containment, so a case file writes/deletes outside the fixture.** `put` (`:158`) and `tip_delete` (`:165`) pass case-supplied paths straight to `join(D, p)`: `tip_delete:["../../sentinel/target.txt"]` deleted a file outside, `base:{"../../sentinel/written.txt":"w"}` created one — inside `/tmp` here, but the doc's claim is that the lane worktree is never touched and the builder trusts `--cases`. Repro: `node scripts/harm-matrix.mjs --selftest --cases trav2.json` → `CASE ok trav`, `target=DELETED`. Fix (R4): `inside()` guard (`resolve(D,p)` must be `D` or `D + sep`); verified `threw case path escapes the fixture` with the sentinel intact.

**K65ReviewToolSandbox-8 — LOW-MEDIUM — the stdout/stderr contract is not pinned by any case.** `usage-missing-base` passes with the usage text on **stdout** (`M8 ... PASS (1/1)`), so a regression moving usage off stderr is invisible. Fix (R5): `expect.stdout_empty` + `expect.stderr_re` on that case; `N4` then `FAIL (30/34) fails=4`.

**K65ReviewToolSandbox-9 — LOW — flag parsing is positional-first and silently lossy.** `opt` (`:40`) takes `indexOf`, so `--base --tip X` sets `base="--tip"` (exit 2 `detail="base=--tip"` instead of 64) and `--base A --base B` silently keeps `A`. Repro: both lines in `evidence-args.txt`. Fix (R1): reject duplicate flags and a value that is another flag → usage 64; new cases `duplicated-base-flag`, `base-eats-flag` (both `want=64` today fail: `rc=0`, `rc=2`).

**K65ReviewToolSandbox-10 — LOW — an unchecked tip `git add` degrades into "tip == base".** `:166` ignores the add status and `:168` commits with `--allow-empty`, so a failed add yields a tip commit identical to base and the case passes vacuously. Fix (R4b): check the status → `fixture tip add`. (No passing reproduction was constructed; the failure needs a filesystem-level add error — marked inference.)

**K65ReviewToolSandbox-11 — LOW — the toplevel guard's diagnostic drops git's stderr.** On `GIT_DIR` set, `rev-parse --show-toplevel` writes nothing to stdout, so the error is `fixture toplevel  != /tmp/...` with an empty left side; combined with F6 the fixture is also leaked. Fix: include `r.stderr` in the message (patch R4 keeps the message but should append stderr — see `harm-matrix.patch` context).

## Artifacts

- `.ufo/waves/round-65/build/K65ReviewToolSandbox/harm-matrix.mjs` — full hardened draft (241 lines; R1/R2/R2b/R3/R4/R4b/R5/R6/R7 applied; `PASS (34/34)`).
- `.../harm-cases.json` — 34 cases (26 tightened to exact full-summary equality + 8 new falsifiers: `only-empty-string`, `only-empty-list`, `duplicated-base-flag`, `base-eats-flag`, `gates-needs-nonstring`, `gates-ok-exit-strings`, `gates-verdict-no-capture`, `gates-timeout-string`).
- `.../harm-matrix.patch` (125 lines) and `.../harm-cases.patch` (524 lines) — both verified with `patch -p1` to reproduce the drafts byte-for-byte.
- `.../falsify.sh`, `args-test.sh`, `mut-test.sh`, `mut2.sh`, `env-test.sh`, `evidence-falsifiers.txt`, `evidence-args.txt`.

## Limits

- H2/H3/H5 were not re-run: this seat reviewed the tool and its selftest, not the frozen counter (untouched; `probe/harm65-probe.mjs` and `controls/harm/` read only).
- The tip-`add` defect (F10) is code-read, not reproduced; the SIGTERM orphan needs an external killer to reproduce deterministically (one 3-minute run observed it).
- `process.stdout` truncation under `process.exit` was probed (200 gates, 90 638 bytes, slow reader): 201 lines both piped and file — not observed, no finding.
- Global git config is still inherited by the fixture builder (`core.excludesFile`, `commit.template`); identity/signing were verified neutralised, exclusions were not.
- The hardened cases pin `gates-file-malformed`'s detail string, which is node's JSON message and therefore node-version sensitive.
- No tools were installed; no repo, index, jj state or frozen file was modified (scratch only under `/tmp/kumitate-r65/K65ReviewToolSandbox/`, ~1.2 MB; the 288 KB fixture the committed tool abandoned on the hang test was deleted after it was counted).
