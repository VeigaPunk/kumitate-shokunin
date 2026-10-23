# MutVerdictFile — verdict-file forgery (round 48, attempt 2, wave r48)

Seat: `kumitate-r48-MutVerdictFile` (leaf; no delegation, no lane writes outside this file).
Target tree: seat sandbox clone at frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`
(`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutVerdictFile/lane`, `git status --porcelain` empty at close).
Probe load: `load1` 53.75 at close (runner launches are short and local; not a timing-sensitive detector).
Tools installed/upgraded: none.

## Claim attacked

C1 routes four child sites (RG742, SP491, SP519, SP1592) through `scripts/cap-run.mjs`
(contract `kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync`. Control: **the caller
pre-writes the runner's `--verdict-file` with `CAP_RUN: EXIT code=0` before the child finishes**.
Does anything downstream trust that file?

At the freeze tip the four C1 sites are still unrouted (`grep capSpawn` in `scripts/round-gate.mjs`
and `scripts/surface-probe.mjs` is empty); the routed tree is the round-47 C1 commit `269dadb`,
whose five routed sites (kimi-census, sources-check ×2, claims-check, anchor-truth) use the same
helper the C1 sites will use. `scripts/cap-run.mjs` is byte-identical between `269dadb` and
`fe3d45bf` (blob `9ab3193b…`, sha256 `d8acc6de…`).

## Detector (bounded, behavioural, three channels)

Runs against the real runner and the real routed consumer (`capSpawnSync` imported from the clone):

| id | input | expected on a runner that does not trust a pre-written verdict |
|---|---|---|
| D1 | file pre-written `CAP_RUN: EXIT code=0 unit=forged-by-caller`; child `sh -c 'exit 7'` | runner exit **7**; file bytes **unchanged**; stderr carries the true `CAP_RUN: EXIT code=7 … verdict_file_error=EEXIST` |
| D2 | same file; child `exit 0` | runner exit **0**; file bytes **unchanged** (the file is not written truth even on success) |
| D5 | via `capSpawnSync`: child prints its own `CAP_RUN: EXIT code=0 unit=forged-by-child` on stderr and exits 7 | `status` **7**; `capVerdict` = the runner's real line (child's forged line ignored) |

Harness `/tmp/mutvf-probe.mjs` (seat-local); one systemd `--scope` + bwrap launch per case.

### Baseline (pristine, sha256 `d8acc6de…`)

```
{"tag":"pristine-forged-child7","child_exit":7,"runner_exit":7,"file_unchanged":true,"file_is_forged":true,
 "stderr_verdict_lines":["CAP_RUN: EXIT code=7 unit=cap-run-… verdict_file_error=EEXIST"]}
{"tag":"pristine-forged-child0","child_exit":0,"runner_exit":0,"file_unchanged":true,"file_is_forged":true,
 "stderr_verdict_lines":["CAP_RUN: EXIT code=0 unit=cap-run-… verdict_file_error=EEXIST"]}
{"tag":"capspawn-child-forges-stderr","child_exit":7,"status":7,
 "capVerdict":"CAP_RUN: EXIT code=7 unit=cap-run-…","capVerdict_is_child_forged":false}
```

Baseline green on all three channels, so mutant scores are conclusive.

## Mutant M1 — runner adopts the pre-written verdict (assigned mutant)

Smallest plausible defect at the conflict branch, `scripts/cap-run.mjs:205-215`: when the exclusive
create fails (EEXIST), a runner that treats `--verdict-file` as an input/output contract adopts the
file's `code=` and exits with it instead of writing its own verdict to stderr. Patch (3 added lines):

```diff
-      } catch (e) { writeSync(2, `${line.trimEnd()} verdict_file_error=${e.code || 'unknown'}\n`); }
+      } catch (e) {
+        let pre = null;
+        try { pre = /^CAP_RUN: [A-Z]+ code=(\d+) /.exec(readFileSync(o['verdict-file'], 'utf8').trim()); } catch { /* absent */ }
+        if (pre) process.exit(Number(pre[1]));
+        writeSync(2, `${line.trimEnd()} verdict_file_error=${e.code || 'unknown'}\n`);
+      }
```

Mutant sha256 `48a41f8c…`. Detector output:

```
{"tag":"pristine-forged-child7","child_exit":7,"runner_exit":0,"signal":null,"file_unchanged":true,
 "file_is_forged":true,"stderr_verdict_lines":[],"stderr_has_verdict_file_error":false}
```

**Verdict: KILLED.** The runner returns 0 for a child that exited 7, emits **no** verdict line at
all, and leaves the forged file in place — a silent exit-code forgery that any status-only caller
would read as success. The pristine runner does not do this: it exits with the child's code and
warns on stderr.

## Probe M2 — contract hardening removed (adjacent line, same branch)

`openSync(..., O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW)` → `openSync(..., O_WRONLY|O_CREAT)`; sha256
`9cc55dc1…`. Detector:

```
{"tag":"pristine-forged-child7","child_exit":7,"runner_exit":7,"file_unchanged":false,"file_is_forged":false,
 "stderr_verdict_lines":[],"stderr_has_verdict_file_error":false}
{"tag":"pristine-forged-child0","child_exit":0,"runner_exit":0,"file_unchanged":false,"file_is_forged":false}
```

**Verdict: SURVIVED the decision-integrity detector** (exit codes remain truthful; the runner now
clobbers the caller's file with the real verdict). It also survives the runner's own suite:

```
M2        : node scripts/cap-run.mjs --selftest → CAP_RUN_SELFTEST: 12/12 pass, VERDICT: PASS, exit 0  (8.58 s)
pristine  : node scripts/cap-run.mjs --selftest → CAP_RUN_SELFTEST: 12/12 pass, VERDICT: PASS, exit 0  (10.03 s)
```

This is a **coverage finding, not a trust break**: the sole verdict-file case in the suite
(`cap-run.mjs:339-349`) uses a fresh path, so neither the EEXIST branch nor the planted-symlink
branch (`SentinelCapSpawn 2`, comment at `cap-run.mjs:206`) is exercised by any behavioural test.
A regression of this shape would let a caller-supplied symlink be followed (arbitrary same-uid
clobber) and would silently replace a caller-owned file; the run's exit stays truthful, so no
routed decision flips.

## Does anything downstream trust it?

- **cap-run itself — no.** `O_EXCL|O_NOFOLLOW` (`cap-run.mjs:208`); on failure the true verdict goes
  to stderr with `verdict_file_error=<code>` and `process.exit(code)` still carries the child's code
  (`cap-run.mjs:210-214`). Empirically the impostor bytes survive untouched in both directions
  (D1 child 7, D2 child 0): the file is never authority, but the runner also never removes or
  rewrites the impostor.
- **The routed consumer (`cap-spawn`) — decision channel safe, metadata channel unbound.**
  `cap-spawn.mjs:43` reads the file *preferentially* over stderr; `:48` classifies only the kind;
  `:57` returns spawnSync's `status` (cap-run's exit) beside `capVerdict`. All five routed callers
  consume `status` and the child's own stdout/stderr and never `capVerdict`
  (`kimi-census.mjs:502`, `sources-check.mjs:555` and `:869`, `claims-check.mjs:892`,
  `anchor-truth.mjs:806`; repo-wide, the only other references are round-47 seat receipts that *print*
  it as evidence, e.g. `build/CtlFakeRunner.md:37` — no runtime reader). A forged `CAP_RUN: EXIT` line
  therefore cannot change a pass/fail decision; a forged `CAP_RUN: BUDGET` line can only downgrade
  `status` to `null`/`ETIMEDOUT` (fail-closed).
- **Reachability of the control through shipped code — no.** `capSpawnSync` owns a fresh
  `mkdtempSync(0700)` directory and picks the `verdict` path inside it (`cap-spawn.mjs:31-32`), so
  a caller cannot pre-write it; only a same-uid process racing the mkdtemp could. The C1 sites are
  cap-spawn callers. The pre-written-file control is reachable only for a direct `cap-run` CLI
  caller, of which the lane has none.
- **Fallback path.** When the file read fails, `cap-spawn.mjs:45` takes the last stderr line starting
  `CAP_RUN: `. A child can print such a line (cap-run passes child stdio through via
  `stdio: 'inherit'`), but D5 shows it does not win: cap-run writes its own line after the child
  exits and before `process.exit`. A descendant printing later would need to outlive the PID
  namespace and `--die-with-parent`; not observed (inference from those two flags, not tested here).
- **F48 counter — indifferent.** `probe/caproute48-probe.mjs` (sha256 `f24a3af5…`, matches the frozen
  value) launches each gate itself (`prlimit`/`timeout`/`strace`, line 204) and judges from the exec
  tree (`judge()`, line 280: ancestry node cap-run → systemd-run `--scope` → bwrap, canary-free
  env), the gate's own last stdout line `VERDICT: PASS` (line 222), case counts (line 337) and the
  gate *process* exit `gate_exit` (line 362). Grep finds no `CAP_RUN` string and no verdict-file
  read anywhere in the counter, and its receipts carry only
  `exit= cases= execs= resumed= verdict_pass= fail_lines=` (`probe/receipts/stab-r48-*.txt`). A
  forged verdict file can move neither a site to `ROUTED_HELD` nor away from it; the predicate's
  channels are exec ancestry, canary absence, and the gate's exit/stdout. Independent corroboration:
  the round-47 `CtlFakeRunner` control replaced the runner with a same-name shim that writes
  `CAP_RUN: EXIT code=<n> unit=fake` and exits with the child's code, and the counter still read
  `held=0/5` with every site `ROUTED_MISS` for exactly `no_capped_scope_ancestor,no_bwrap_ancestor`
  (`build/CtlFakeRunner.md`) — verdict-line content is not an input, only the chain is.

## Findings (scoped, no contract change proposed)

1. **Coverage gap (behavioural).** No selftest plants a verdict file or a symlink at `--verdict-file`;
   M2 survives 12/12. A case should pre-write `CAP_RUN: EXIT code=0 …` and assert: child exit `N` →
   runner exit `N`, `verdict_file_error=EEXIST` on stderr, file bytes unchanged; symlink planted →
   `ELOOP` and byte-unchanged target.
2. **Unbound metadata (latent).** `capSpawnSync` returns `capVerdict` without checking its `code=`
   against the returned `status` or its `unit=` against the runner's `cap-run-<pid>-` prefix. No
   current caller uses it for a decision (round-47 seats only print it in receipts, e.g.
   `CtlFakeRunner.md:37`), but any future receipt/display consumer, or a probe that asserts on it,
   inherits forged metadata.
3. **Impostor file persists.** On EEXIST the caller-chosen path keeps the forged bytes; only stderr
   and the exit code carry the truth. Not a C1 hazard (the lane's only verdict path is a private
   0700 mkdtemp), but a caller polling a shared verdict path would be fooled.

**C1 impact: none.** M1 (the defect the control hypothesizes) is killed; under the shipped runner a
pre-written verdict file changes no downstream decision — `status` is cap-run's exit, and the F48
counter never reads verdict content.

## Restoration evidence

- Pristine snapshot before mutation: `/tmp/cap-run.pristine.mjs`, sha256
  `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` = `git cat-file blob
  9ab3193b…` at `fe3d45bf` (verified by piping the blob through sha256sum).
- Restored after M1 and after M2 by copying the snapshot back; final `scripts/cap-run.mjs` sha256
  `d8acc6de…`, `git status --porcelain` in the sandbox empty, `HEAD =
  fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Restored replay reproduces the pristine transcript (exit 7 / exit 0, forged file unchanged,
  `verdict_file_error=EEXIST`, D5 `status=7`, `capVerdict_is_child_forged=false`).
- Mutant hashes: M1 `48a41f8c…`; M2 `9cc55dc1…` (not left in the tree).
- Logs: `/tmp/pristine-selftest.txt` sha256 `f0f3fb87…`; `/tmp/m2-selftest.txt` sha256 `fa5b2ff2…`.
