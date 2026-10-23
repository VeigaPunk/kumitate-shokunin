# ReviewIntegration — the integrated C1+C2 diff at `ce9aee5daf71004a5890134f9526cc6fe424b206`

Seat: kumitate-r48-close-ReviewIntegration-2 · 2026-10-23 · Residual falsify call (item ReviewIntegration).
Method: full diff of the commit (`git show ce9aee5d --stat` + per-file diffs), committed blobs re-read from
`git show ce9aee5d:<path>` (worktree HEAD = ce9aee5d, 13 dirty untracked-path entries ignored — all reading was
from the commit objects, not the worktree), acceptance signed against `.ufo/waves/round-48/r48/ReviewRouteSpec.md`
and the plan § C1 / attempt-2 addendum § C2 / § A48 predicate sentences. Runtime sign-off is cited from committed
receipts, not re-run here (leaf bounds). No `lsp` device exists in this leaf's tool inventory — caller/definition
checks are textual on the committed blobs; the per-exec ancestry/environment judgment is the counter's runtime
proof and is cited, never substituted.

## Commit surface (6 files, +665/−20 — nothing else)

| File | Δ | Verdict |
|---|---|---|
| `scripts/round-gate.mjs` | +24/−2 | **PASS** — RG742 routed, allowances untouched, no other refactor |
| `scripts/surface-probe.mjs` | +35/−4 | **PASS** — SP491/SP519/SP1592 routed, allowances untouched |
| `scripts/cap-spawn.mjs` | +3/−0 | **PASS with finding F1** — out-of-spec-surface leak fix, behavior-invariant |
| `scripts/counter-rerun.mjs` | +542 new | **PASS with finding F2** — matches the C2 sentence; one documented interpretation |
| `.ufo/waves/round-48/probe/caproute48-probe.mjs` | +26/−12 | **PASS** — exactly the A48 amendment + S098 source note; stricter-only |
| `.ufo/waves/round-48/plan.md` | +43/−0 | **PASS** — purely additive addendum (attempt-2 tail + A48 + named-limit); zero frozen lines touched |

## Per-site diff acceptance (ReviewRouteSpec)

**RG742** (`round-gate.mjs`, `runGate` at 751–763 post-shift): `spawnSync(process.execPath, [SELF, ...args], …)` →
`capSpawnSync(process.execPath, [SELF, ...args], …)`. Timeout 120_000 (runner budget; spawnSync shape restored by
the contract), UTF-8, maxBuffer 16 MiB preserved. `extraEnv` spread retained last; env is explicit
(`HOME`, `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null` + call overrides) — the planted `KUMITATE_CAPROUTE_CANARY_<hex>`
cannot pass (no ambient spread). `bind: [tmp]` binds the selftest's own mkdtemp fixture root (line 719) — fixtures
stay visible. The observed target exec is still `node round-gate.mjs <args>` (probe site matcher `!a.includes('--selftest')`),
count 116/116/116 = base_n 116 in every receipt cited below. **Conforms.**

**SP491** (`readSightingSurface`, 498–509): exact `bash <host> surface --json` command routed; `cwd: src`,
`NODE_COMPILE_CACHE: cacheRoot`, UTF-8, `SPAWN_TIMEOUT_MS`, `MAX_BUFFER` retained; `bind: [cacheRoot]` (the base
code's own throwaway root, line 490). The former `{...process.env, …}` spread — the canary leak the spec names —
is replaced by `gitEnv({PATH: <nodedir>:/usr/bin, NODE_COMPILE_CACHE})`; `gitEnv` allowlist keeps PATH/HOME/LANG/
TMPDIR/GIT_\* only. **Conforms.**

**SP519** (`readDispatcherStatus`, 534–548): exact `node <src>/scripts/fleet-dispatcher.mjs status` routed; `cwd: src`,
`UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH`/`UFO_PROJECT_ROOT` retained verbatim, UTF-8, `SPAWN_TIMEOUT_MS`,
`MAX_BUFFER` retained; `bind: [stateRoot]` (base code's own root, 528); env `{...gitEnv(), UFO_*}` — no canary.
Throwaway-state creation and `finally` cleanup untouched. **Conforms.**

**SP1592** (`spawnSelf`, 1614–1617): every invocation routed via `capSpawnSync(process.execPath, [selfPath, ...args], …)`;
120_000 timeout; default maxBuffer behavior identical (base passed none; `capSpawnSync` default `maxBuffer` is
undefined → same spawnSync 1 MiB default); per-call env overrides preserved (`HOME`, `UFO_SRC` + caller keys);
`bind: [tmp]` = the selftest's mkdtemp root (line 1200) — fake-HOME/`--self` fixtures visible. Site count
14/14/14 = base_n 14 in every receipt. **Conforms.**

**Allowances kept raw (verified in committed blobs, only line-shifted):** RG1409 nested `--selftest` still
`spawnSync` with `{...cleanEnv()…}` (1429–1432, args unchanged; `cleanEnv` remains live — no dead code);
SP1766 nested `--selftest` still raw `spawnSync` (1789–1790); SP1049 `bash -c <item.command>` still raw
(1065–1067). No new uncapped direct child introduced: `uncapped_direct=0,0,0` on all four sites in every cited
receipt. **Conforms.**

## C2 — `counter-rerun.mjs` vs the predicate sentence

- `--selftest` → `COUNTER_RERUN_SELFTEST: PASS`, exit 0 (observed: `r48/…`/`close/ReviewC2Agree-selftest.txt`, exit 0). ✓
- `--probe <abs> --lane <abs> --rev <rev> [--runs K] -- …`: runs `node <probe> <lane> <rev> <args>` K times
  (convention proven by the `argv` fixture case); `COUNTER_RERUN: AGREE (runs=K)` exit 0 iff every run exit 0 and
  every final summary line byte-identical (latin1 roundtrip is byte-exact; last non-empty line, one trailing CR
  stripped — documented); else `COUNTER_RERUN: DISAGREE` exit 1. ✓
- Exit 2 fail-closed on unreadable probe (stat+R_OK), lane (dir + `rev-parse --git-dir`), rev
  (`rev-parse --verify --end-of-options <rev>^{commit}`, read-only), unparsable output, and counter exit 2 (F2). ✓
- Usage 64 (unknown flag, bad `--runs`, missing `--`, missing required option, non-absolute probe/lane). ✓
- Kill-rule mutation control present: flake-injection case + two seam flips (`AGREE_ALWAYS`, `PASS_STUB`), each
  mutant required to FAIL its own selftest with the named killing case; seam-uniqueness asserted before patching. ✓
- Real AGREE over the frozen F48 probe committed: `r48/ExecCounterRerun-agree.txt` (rev f00cf278, set r47,
  identical summary sha across runs, AGREE runs=2, exit 0). A fourth receipt, `close/ReviewC2Agree-agree.txt`, is a
  seat invocation error (extra positionals after `--`) that correctly produced exit 2 with no AGREE/DISAGREE —
  recorded, never scored; it incidentally demonstrates the fail-closed arm in production.

## Findings (severity-ordered)

**F1 — LOW (spec-surface conformance).** The commit modifies `scripts/cap-spawn.mjs` (+3: `rmSync` of the verdict
dir after the verdict is read, before result construction). ReviewRouteSpec § "Diff must not touch" names
"scripts/cap-run.mjs or scripts/cap-spawn.mjs contracts/implementation", and neither the plan addendum nor the spec
records an exception — only the commit message ("verdict-dir leak fix (delta=0)", citing CriticHarm r48 #2) and
`r48/L1-leakfix-delta.txt` (`leak-delta-at-ce9aee5d=13` residual vs the measured 12,801-dir leak). Source review:
`rmSync` is already imported; it runs after the verdict read on every path where `vd` exists (the only skip path is
a throw from `mkdtempSync` itself, where no dir was created); returned values are unchanged, so the "delta=0"
claim holds at source level. Recommendation: the closure record should note this as an authorized exception
(harm-repair, behavior-invariant) against the ReviewRouteSpec text, which was left unamended in the commit.

**F2 — LOW (literal-sentence deviation, documented, safe direction).** The C2 sentence's else-branch reads
"else `COUNTER_RERUN: DISAGREE` exit 1"; the instrument propagates a counter's own exit 2 to exit 2 (ERROR line,
no DISAGREE). This is documented in the instrument header/EXIT MAP and is the reading the round rule requires
("an exit-2 run is recorded and is never a score" — scoring a cannot-evaluate run as a measured DISAGREE would
violate it). Not a code defect; recorded so the closure rules on the interpretation knowingly.

**F3 — INFO (stale cross-references, no code defect).** ReviewRouteSpec still pins counter SHA `f24a3af5…` and the
`rule=F48` target line; the integrated counter is SHA `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`
(L1-score and ReRunCounter48-2 receipts) printing `rule=F48+A48`, and plan § C1's frozen "Before → target" line
still reads `rule=F48`. The A48 addendum supersedes both (same sentence, stricter conjunct, new rule label); the
closure record should cite the post-A48 SHA and label.

**F4 — INFO (reviewed, accepted).** The four routed sites now pass strictly narrower child environments than base
(explicit env replaces `{...process.env}` / `cleanEnv()` spreads; RG742 additionally pins
`GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`, which base did not set). This is what the canary conjunct requires; observed
behavior parity is in the receipts: suite summaries 61/61 and 46/46 equal to base at rev, site exec counts exactly
116/2/2/14 = base in all three runs of every cited receipt, H1 base-vs-tip checklist rule available at
`r48/L1H1Base-f00cf278-run1-2.txt` + `close/H1Tip-run1-2.txt`.

## A48 amendment check (counter diff)

Every hunk maps to A48 or the S098 source note: header predicate sentence rewritten to the addendum wording
(conjunct-for-conjunct identical, including "the per-case line count equals m and the passing per-case line count
equals n"), `CASELINES` set with the vacuous-for-kimi-census/claims-check note, `caseLines`/`passLines` counted as
`/^(PASS|FAIL|SKIP)\s/` and `/^PASS\s/`, threaded through `runGate`→`measure`→per-site result, new miss reason
`summary_uncorroborated`, output label `rule=F48+A48`. Stricter-only: no existing conjunct relaxed; the clause can
only add a miss. Line formats verified textually: round-gate per-case `PASS/FAIL  name` + `ROUND_GATE_SELFTEST:
n/m pass` (1561), surface-probe `${PASS|FAIL|SKIP}  name — detail` (1809) + `n/m cases passed` (1810) — both match
the SUMMARY regexes and the counting regex (`/^FAIL\b/` does not match `CHECKLIST: FAIL-CLOSED…`, so no false
failLines). Chronology in receipts is amendment-first: commit 18:44Z → A48 re-scores 18:46:56–18:49:58Z (stab-r48
0/4 at freeze `fe3d45bf`; stab-r47 5/5 at `f00cf278` = H2; forgery M2′ at `905f848` ROUTED_MISS
`summary_uncorroborated` at RG742 only, 3/4 exit 1; CtlEnvCaps `d4423b2c` 0/4) → first candidate score
`L1-score-ce9aee5d.txt` 18:52:59Z. The pre-data amendment condition holds.

## Runtime sign-off (cited, per ReviewRouteSpec; not re-run by this seat)

`held=4/4 runs=3 rule=F48+A48` exit 0 at `ce9aee5d`: L1 score (`r48/L1-score-ce9aee5d.txt`, counter_sha
3ed305f2…) + committed re-runs (`close/ReRunCounter48-1-receipt.txt`, `close/ReRunCounter48-2-receipt.txt`) —
kill rule (≥2 re-runs, same commit, same command) satisfied; all SITE lines `ROUTED_HELD`, counts 116/2/2/14,
`uncapped_direct=0`, cases equal to base, exit 0. C1 and C2 kill rules both evidenced.

## Residual risk / verification gaps

- No `lsp` server in this leaf's toolset — caller/definition claims are textual on committed blobs; the semantic
  proof of routing remains the counter's strace ancestry/environment judgment (cited receipts), not re-derived here.
- cap-spawn's delta-0 is source-verified plus the residual-leak receipt; no A/B behavioral receipt exists (the fix
  is inside the candidate commit; constructing one would require a revert clone — out of this seat's bounds).
- strace never dropping a traced record under load remains the round's open source (S098/plan note) — upstream of
  this diff, unchanged by it.
- `counter-rerun.mjs` accepts a duplicated `--runs` (last wins) — harmless usage laxity, outside the sentence.
- This seat did not execute the counter or the instrument; exit-2 arm demonstrated only via the ReviewC2Agree
  artifact and fixture selftests.
