RESULT SimplifyProbeReuse rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=advise scope=advisory, no lane edit, no patch
# SimplifyProbeReuse — shared core for `scripts/gate-mutants.mjs`, YAGNI list, obsolete code

Advisory item. Nothing in the lane was edited; this file is the only lane write. The
three pre-existing mutant runners were read in full and their common denominator was
rebuilt as a 41-id prototype and run at b237e3f to price every recommendation.

## 1. What the three existing runners are

| Runner | Lines | Target | Manifest | Oracle | Kill rule | Report | Safety |
|---|---|---|---|---|---|---|---|
| `.ufo/waves/round-40/probe/run-mutants-v2.py.txt` | 583 | anchor-truth only (hardcoded) | 26 ids in Python; `mutatorName`, `provenance`, `description`, `equivalentTo` dedup, `extra` flag | `node scripts/anchor-truth.mjs --selftest` in a full-lane `git archive` copy | FAIL `AT\d+` line; non-zero exit without a named case = RuntimeError | MTE-schema JSON ledger + text table, sha256 of ledger | fresh temp tree per mutant, thread pool, 900 s timeouts, no process group |
| `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` | 60 | cite-check only | 16 `[id, from, to]` triples | that copy's `--selftest` | `FAIL ` line, `VERDICT: FAIL`, `p<n`, or non-zero exit; no tally line = crash | one line per mutant + `CITE_MUTANTS` summary | ONE shared temp dir, file rewritten and restored, 600 s per spawn, no group kill, no env scrub, `--lane` required |
| a2-census harness | not committed | wave-census | 25 mutants exist only as prose in the four `.ufo/waves/round-41/final/a2-census-*-mutants.txt` receipts | `--selftest` | FAIL line (the `failing=` field in the receipts is harness-computed from FAIL lines) | `MUTANT <id> killed exit=… <tally> <verdict> failing=…` + `KILLED n/n` | unknown — no file survives |

The census runner is the one the lane needed and the only one with no reusable artifact: its
literals, copy procedure and kill rule are unrecoverable from the receipts alone (prose, not
code). That gap is exactly what C1 closes, and it is why the gate must be the single executable
authority rather than a fourth one-off probe.

## 2. Minimal shared core (must exist)

1. **One manifest row = `{target, id, from, to}`.** No per-target oracle table: all three gates
   are `node <copy>/scripts/<target> --selftest`, and `scripts/` is 714 028 bytes, so one uniform
   loop covers every entry. Target is the file name (`cite-check.mjs`), id is `<target>/<group>/<id>`.
2. **Lane root from the gate's own path** (`dirname(fileURLToPath(import.meta.url))/..`, as
   wave-census does). The cite probe's `--lane` existed only because the probe lives outside the
   repo; a lane script does not need it.
3. **Two staging modes:** `--rev <commit>` → `git -C <laneRoot> archive <rev> scripts | tar -x`;
   no `--rev` → `cpSync(laneRoot/scripts, stage)`. Never touch the measured tree.
4. **Fresh temp copy of the staged `scripts/` per mutant.** 41 × 714 KB. This removes the
   restore bookkeeping (and the crash/timeout-leaves-a-mutated-file bug) the cite probe carries.
5. **Exactly-once literal check** (`split(from).length - 1 !== 1` → `nomatch`, occurrence count
   printed). The applciator is the whole mutation engine; no AST, no multi-edit lists.
6. **Spawn detached in its own process group**, env copy with every `KUMITATE_*` key deleted,
   cwd = the temp copy, per-mutant 60 s cap, on timeout `process.kill(-pid, 'SIGKILL')` in
   try/catch. Measured need: wave-census' WC24 spawns a child `--selftest`, and round 41 already
   produced 46 processes / 3.2 GB in 10 s from a cite-check guard mutant.
7. **One classifier, three signals, per target shape:**
   - `fail_lines = lines starting with "FAIL "` (all three suites use that prefix; cite-check's
     `FAIL  name`, wave-census' `FAIL  WCnn`, anchor-truth's `FAIL ATnn`).
   - tally lines, summed: `/^(?:[A-Z][A-Z0-9_]*: )?(\d+)\/(\d+) (?:pass|cases passed)\b/gm`.
     A naive unprefixed regex silently yields `tally=none` for wave-census — measured.
   - `^VERDICT: (PASS|FAIL)$`.
8. **Header:** `GATE_MUTANTS rev=<rev|working-copy> target=<path> sha256=<staged pristine bytes>`
   once per target, then per mutant `MUTANT <target>:<id> killed|survived|nomatch|crash|timeout`
   with `exit=`, `tally=`, `fail_lines=`. Digest the pristine input, not the mutated copy, so the
   header is comparable across mutants and an R41-7 receipt can name it.
9. **One control run per target before its mutants** (unmutated copy): its total is the reference
   for A1's `DRIFT = PASS with a total different from the control's`, and a failing control is
   exit 2. Measured controls at b237e3f: cite-check 75/75, wave-census 26/26.
10. **Exit map and hermetic `--selftest`:** CLEAN 0 / SURVIVED 1 / nomatch, crash, timeout or bad
    control 2 / usage 64, `--help` prints USAGE exit 0 (sources-check convention), verdict line
    carries `frozen=<k>/41`. The selftest must test the *functions* (classifier fixture table,
    exactly-once applicator, manifest shape: unique ids, target exists, `from` non-empty,
    `from !== to`, all 41 present) and must never spawn gate-mutants or a real gate; apply each
    manifest literal to the staged bytes in a temp copy to prove the 41 apply (`nomatch` red-before).

## 3. Leave out (YAGNI), with the measured reason

| Feature present in an existing runner | Why not in gate-mutants |
|---|---|
| MTE JSON ledger, `schemaVersion`, `thresholds`, `files[].source`, `location`, `replacement` | No consumer in the lane; the C1 counter and the receipts read the verdict/exit contract, not a schema. The lane already has frozen-snapshot replay (round 38) for that job. |
| `mutatorName`, `provenance`, `description`, `equivalentTo` dedup | The `from`/`to` literals are self-describing; provenance belongs in the lesson, once, not 41 times. |
| `--jobs` / ThreadPool | 41 mutants serially took **61.1 s** end to end (copy + selftest). Concurrency buys nothing and makes group-kill cleanup and temp naming harder. |
| `--out-dir`, `--json-out`, `--table-out`, `--keep-temp`, `--only`, `--include-extras`, `--list`, `--strict` | Debug path is `--selftest`; a single survivor is found by reading 41 lines. Every flag is a tested surface the round cannot afford. |
| Whole-lane `git archive` (run-mutants-v2) | The frozen 41 need only `scripts/`; all three selftests create their own `mkdtemp` fixtures. 714 KB instead of the whole tree per mutant. |
| Shared temp dir with restore (cite probe) | A timeout or crash leaves mutated bytes for the next mutant and poisons its control. Fresh copy per mutant is cheaper than the bookkeeping. |
| `--lane` argument (cite probe) | Superseded by self-location (item 2). |
| 600 s / 900 s per-mutant timeouts, unlimited stderr buffers | 60 s is ~35× the slowest measured selftest; cap `maxBuffer` and keep the first line of stderr only. |
| `anchor-truth` in the manifest | Not in the frozen 41; adding it now would drag four exact duplicate literal pairs (R39-MutIdentityNoPath≡C2-M11, R39-MutIdentityNoOccurrence≡C2-M12, R39-MutTokenForgedDelete≡C2-M01, R39-MutTokenForgedNullSkip≡C2-M13) and an `extra` red-before entry into a frozen set. |

## 4. Falsifier: the narrow kill sentence, and A1's rule

The b237e3f plan said `killed = exit non-zero with a VERDICT: FAIL line`. Measured on the frozen
41 at b237e3f, **34/41** satisfy it; the other 7 are: cite `suite-group-verdict`, `suite-any-fail`,
`suite-exit-text`, `V382-pass-count`, `V385-verdict-const`, `V387-exit-const`, `M19-selftest-exit-const`
(six distinct mutations, because `V387` and `M19` are the same literal pair). A1 at HEAD `a0a07ba`
already supersedes the sentence and names the same six mutations; my run is an independent
confirmation, not a new defect.

One residual hole in A1: it keeps the round-41 disjunction `(exit != 0 or any FAIL line or
VERDICT: FAIL or passed < total)`. Round 41's verify seat MutCiteCounterSkip defeated exactly that
disjunction with a mutant that produced **zero** `FAIL ` lines, and the lesson's own remedy is
"a round-42 counter should require `fail_lines > 0`". At b237e3f every one of the 41 measured
mutants prints at least one `FAIL ` line, so requiring one costs nothing and closes the hole.
Recommended final rule: **killed = parseable tally and at least one `FAIL ` case line**; survived =
parseable tally, `p == n`, no FAIL line, `VERDICT: PASS`, exit 0, total equal to the control;
crash = no tally, or non-zero exit with no FAIL line, or `p < n` with no FAIL line; timeout apart.

## 5. Frozen manifest at b237e3f: 41/41 apply once

All 16 cite-check triples apply exactly once (verbatim from the probe). All 25 census ids apply
exactly once, but **six of them have no literal in the receipts** — the receipts record prose
(`:122 drop the resume arm`, `:136 resumed seats leave the report-dir set`, `:122 d.counts && (...)`,
`main: non-FailClosed errors rethrown`, `:156 if (!hits.length) {...}`, and the truncated
`if (tc.tasks.some((t) => !t || typeof t.name ...))`). The following reconstructions each matched
exactly one site; ExecGateMutants can embed them without re-deriving:

- `repair/string-agent-check-dropped`: `if (tc.tasks.some((t) => !t || typeof t.name !== 'string' || typeof t.agent !== 'string')) {` → `if (false) {`
- `repair/read-error-rethrown`: `return 2;` → `throw e;` (main's catch)
- `survivor/M10-unknown-wave-zero`: `if (!hits.length) {` → `if (!hits.length && ex.n !== 0) {`
- `findings/F-M20`: ` || (d.counts.resume ?? 0) !== resumes.length` → ``
- `findings/F-M22`: `[...tasks, ...resumes].map((t) => t.report` → `[...tasks].map((t) => t.report` (the bare `[...tasks, ...resumes]` occurs twice; the longer anchor is unique)
- `findings/F-M23`: `if (d.counts && (d.counts.spawn !== tasks.length || (d.counts.resume ?? 0) !== resumes.length)) {` → `if (d.counts?.spawn !== tasks.length || (d.counts.resume ?? 0) !== resumes.length) {`

`V387-exit-const` and `M19-selftest-exit-const` are byte-identical literal pairs (40 distinct
mutations under 41 ids); A1 already records this, so keep both ids for provenance and expect one
redundant run. Provenance is checkable without a runner: the b237e3f `wave-census.mjs` content
sha256 `d6068d1b…` equals the digest the four census receipts name.

## 6. Obsolete code the new gate produces

- **Deletions made: none.** This item is advisory and the lane is read-only for the seat.
  Callers of both candidates were checked textually: the only references are prose citations
  (`corpus/lessons/round-40.md:71`, `corpus/lessons/round-41.md:21`, `SKILL.md:599`,
  `SCORECARD.md:399`, `LOG.md:1822`); no code imports or executes either file. The `lsp` device
  is not applicable — both artifacts carry the `.txt` extension, so no server produces
  `references` for them; this is recorded as a textual result, not as semantic proof.
- **Deletion candidate (conditional): `.ufo/waves/round-40/probe/run-mutants-v2.py.txt`.** Its
  harness (archive → temp → mutate → selftest → ledger, 583 lines with thread pool, MTE schema,
  dedup, five flags) is fully superseded for any target the manifest covers. Its catalogue is not
  in the frozen 41, so it remains the only anchor-truth mutation authority **until** the manifest
  absorbs those 26 ids; at that point the file has no remaining job. Do not port its ledger,
  concurrency, dedup or flags.
- **`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` — runner superseded, bytes preserved.**
  Its 16 triples move into the manifest, so after C1 the same literals exist in two places and its
  runner (single shared temp dir, restore-on-crash, no env scrub, no group kill, 600 s) is a weaker
  duplicate. It is cited provenance (`SKILL.md:599`, `SCORECARD.md:399`, `corpus/lessons/round-41.md:21`),
  so the bytes stay and must be frozen; the manifest is the only executable authority, and this file
  must not be updated to track gate changes.
- **The a2-census harness has no file to delete** (only receipts). Nothing to remove; the gate
  replaces an unrecoverable procedure.
- **Pointer to move in the same commit:** `SKILL.md:599` (cite-check row) and the round-41 move-log
  row cite the probe path as the `--selftest` counter. The cite-check row should cite
  `node scripts/gate-mutants.mjs` (frozen 41) and keep the probe path only as the round-41 record;
  otherwise the registry points at a runner the lane no longer uses.
- **Do not make the gate a target of its own manifest.** `gate-mutants.mjs` has no suite of its own
  beyond `--selftest`; a mutant of itself would need a second gate to judge it (infinite regress).

## 7. Preserved contract

`kumitate-gate-mutants-v1` verdict/exit map (0/1/2/64), one line per mutant with the target-prefixed
id, `nomatch` on a non-unique or empty literal, a crash or timeout never counted as a kill, a
scrubbed `KUMITATE_*` environment (`SCORECARD.md:399` measured an inherited value reading
`survived=4/16` instead of `0/16`), group cleanup, a revision/digest header (R41-7), and a hermetic
`--selftest`. The 41 ids and their literals stay frozen; the manifest is the single authority.

## 8. Tradeoff

Serial execution is ~61–64 s per full run: acceptable as a standing gate but noticeable if it joins
a pre-commit chain. Adding `--jobs` later is a local change; adding it now would be an untested
surface. Keeping the cite probe as provenance means the 16 literals live in two files; the
alternative (rewriting a round-41 receipt source to a pointer) edits historical evidence, which is
worse than one frozen duplicate. `fail_lines > 0` as the kill rule makes a future mutant whose only
symptom is a dropped case read as crash (exit 2) rather than survived; that is deliberate — an
incomplete suite is not a trustworthy oracle.

## Evidence (commands and observed output; lane read-only throughout)

1. `git -C <lane clone> rev-parse HEAD` → `b237e3f09c9559e130c7367bd2efa981c4ea516f`; working tree clean (`0` lines) — clone made per contract with `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset.
2. `git log -1 --stat b237e3f` → plan + open receipts only; `git rev-parse b237e3f:scripts/{wave-census,cite-check}.mjs` equals `dfabe92:…` — the measured bytes are the round-open bytes.
3. `sha256sum scripts/wave-census.mjs scripts/cite-check.mjs` at b237e3f → `d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204`, `896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e`; the first equals the digest named in all four a2-census receipts.
4. `node check-literals.mjs` (41 literals vs `git archive b237e3f scripts`) → `TOTAL applies=41 not-applies=0 of 41`, `DUPLICATE LITERAL PAIRS: survivor/V387-exit-const == exits/M19-selftest-exit-const`.
5. `node proto-gate-mutants.mjs` (minimal core, per-case rule, serial) → `PROTO killed=41 survived=0 nomatch=0 crash=0 timeout=0 of 41 wall=61.1s rev=b237e3f…`, exit 0; second run `wall=64.1s`, same counts, exit 0.
6. Same prototype with the plan's narrow sentence computed per row → `PLAN_RULE_OK=34/41`; the 7 rows read e.g. `MUTANT cite-check.mjs:cite/suite-group-verdict killed exit=0 verdict=PASS tally=73/75 fail_lines=2 plan_rule=not-killed`.
7. `node probe-predicate2.mjs` (cite-check at b237e3f) → `suite-any-fail exit=0 verdict=PASS tally=73/75 fail_lines=2`, `suite-exit-text exit=0 verdict=FAIL tally=74/75 fail_lines=1`, both `PER_CASE_PREDICATE:killed`, `PLAN_PREDICATE:survived`.
8. `node probe-predicate.mjs` (wave-census at b237e3f) → `V382 exit=0 verdict=PASS tally=26/26 fail_lines=1`, `V385 exit=1 verdict=PASS tally=25/26 fail_lines=1`, `V387 exit=0 verdict=FAIL tally=25/26 fail_lines=1`; all three `CASE_PREDICATE:killed`, `PLAN_PREDICATE:survived` (V385 `CRASH/not-killed`).
9. `timeout --kill-after=5 --signal=KILL 60 node scripts/<gate>.mjs --selftest` in the clone, twice each → anchor-truth `exit=0` 3486 ms / 3318 ms; cite-check `exit=0` 943 ms / 896 ms (`75/75 cases passed (hermetic)`, `VERDICT: PASS`); wave-census `exit=0` 1659 ms / 1684 ms (`WAVE_CENSUS_SELFTEST: 26/26 pass`).
10. `ls -l scripts | awk '{s+=$5} END {print s}'` → `714028` bytes; `du -sh scripts` → `720K` — the per-mutant copy cost.
11. Uniform tally regex vs the four real shapes → `WAVE_CENSUS_SELFTEST: 26/26 pass → 26/26`, `ANCHOR_TRUTH_SELFTEST: 42/42 pass → 42/42`, `75/75 cases passed (hermetic) → 75/75`, `26/26 pass → 26/26`; the prototype's unprefixed form returned `tally=none` for wave-census mutants.
12. `grep -n` in `scripts/wave-census.mjs` → WC24 spawns `spawnSync(process.execPath, [SELF, '--selftest'], … env: {…, KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL: '1'})` — one bounded nesting level per wave-census run, so group-kill is required and serial cost doubles for that target.
13. Leftover check after every run: `pgrep -fc 'seats/SimplifyProbeReuse.*(cite-check|wave-census)'` → `0`; `pgrep -fc 'check-literals.mjs'` → `0`. No background job remains (`bg_3158` completed).
14. Lane tree untouched: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain` → only `??` entries of other seats' round-42 build artifacts (`build-dispatch.json`, `build-spec.json`, `build/`, `evidence-seat-gate.txt`); no tracked byte changed; HEAD `a0a07ba` (plan amendments A1–A4, `git diff --stat b237e3f..HEAD -- scripts` empty).
15. Plan at HEAD read: A1 supersedes the narrow kill sentence and names the same six distinct mutations; A1 keeps the round-41 disjunction that `corpus/lessons/round-41.md` (MutCiteCounterSkip bullet) records as fooled with zero `FAIL ` lines and recommends `fail_lines > 0`.
16. Tooling: none installed or upgraded; no tool else needed.
17. Reference check for the two deletion candidates: `grep -rn "run-mutants-v2\|cite-verdict-mutants" --include=*.md --include=*.mjs --include=*.json .` → five prose hits (`corpus/lessons/round-40.md:71`, `corpus/lessons/round-41.md:21`, `.ufo/waves/round-41/verify/MutCiteCounterSkip.md`-class cites, `SKILL.md:599`, `SCORECARD.md:399`, `LOG.md:1822`) and no import or exec site; no `lsp` server answers a `.txt` probe artifact, so no `references` request was possible and the check is textual by necessity.
18. Shared-tree state, honestly recorded: at 17:02Z the lane showed only untracked round-42 build artifacts and no tracked change; at 17:03:37Z (between my last read and my report write) `SCORECARD.md` and `scripts/proxy-check.mjs` gained uncommitted edits (a `kumitate-gate-pins-v1` block plus stanza keys — concurrent ExecProxyPins work on R41-2/A4, not mine). My only lane write is this file (17:03:49Z). My clone stayed clean and detached at b237e3f (`git status --porcelain` = 0 lines, `HEAD` = b237e3f); none of the two edited paths is in the frozen 41's targets.
19. Scratch artifacts (outside the lane, kept for the executor): `/fast/scratch/hyaku/kumitate-r42/seats/SimplifyProbeReuse/` — `check-literals.mjs` (41-literal applicability), `proto-gate-mutants.mjs` (minimal core + the 41-row manifest table, ready to lift), `probe-predicate.mjs`/`probe-predicate2.mjs` (kill-rule probes), `proto2.out` (all 41 rows with exit, verdict, tally, fail_lines). No patch file: this item changes no lane code.
