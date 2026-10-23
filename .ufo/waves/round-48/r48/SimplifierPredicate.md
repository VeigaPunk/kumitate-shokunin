# SimplifierPredicate — is there a strictly smaller predicate equivalent to F48's ROUTED_HELD?

Seat: SimplifierPredicate (kumitate r48 attempt 2, wave `r48`). 2026-10-23. **Advisory only** — the
predicate, counter, site list, allowances and target are frozen; nothing here amends them and no lane
byte outside this file was written. No tools were installed. No git/jj writes anywhere; the lane repo
was read read-only; no sandbox clone or counter run was needed (all evidence below is attempt-1
receipts plus the frozen counter source).

Inputs (verified):
- Counter `probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`
  — re-hashed this session, matches the freeze value in plan.md and the goal.
- Attempt-1 control corpus: `.ufo/waves/round-48/build/Ctl*-receipt.txt` / `Ctl*.md` (17 controls, all held=0/4).
- Reason distribution over all build receipts: `grep -rhoE 'reason=[^ ]*' build/ | sort | uniq -c` (36
  `no_child_exec` occurrences, 4 sole-`uncapped_direct_children` occurrences — see below).

## Verdict

**Yes, exactly one strictly smaller sentence is equivalent — and it buys nothing.** The clause
"the site's child is exec'd … **(at least once)**" (reason `no_child_exec`) is *implied* by
"exec'd exactly as many times as in the base run" (`exec_count_ne_base`) given the counter's own
base-validity precondition, so a future round may drop it from the sentence. **No other clause can be
removed**: every remaining clause either has a uniquely-killed control class in the attempt-1 corpus
or is the unique net over a reachable cheat class no surviving clause covers (table below). The
predicate as frozen is therefore minimal up to one derived clause; this finding changes nothing for
round 48.

## Clause inventory as implemented (`caproute48-probe.mjs`, set r48)

Per site s, per tip run t, all must hold in **each of 3 runs** (`judge` + final loop; `why` accumulates):

| # | sentence fragment | implemented check | reason string(s) |
|---|---|---|---|
| 0 | trace parses completely; invalid base | fail-closed `die()` → **exit 2, never a score** (not part of the scored conjunction) | `unparsed trace line`, `unparsed return`, `never resumed`, `created twice`, `base run invalid` |
| 1 | the gate exits 0 | `t.status === 0` | `gate_exit=` |
| 2 | child exec'd at least once | `t.n >= 1` | `no_child_exec` |
| 3 | child exec'd exactly base's count | `t.n === b.n` | `exec_count_ne_base` |
| 4 | every exec under the ordered chain cap-run → systemd-run --scope (MemorySwapMax=0, MemoryMax≤1024M, TasksMax≤256) → bwrap (--unshare-pid --clearenv --die-with-parent), r's own cap-run.mjs | `t.capped === t.n` | `no_cap_run_ancestor`, `no_capped_scope_ancestor`, `no_bwrap_ancestor`, `uncapped_exec` |
| 5 | no canary variable in the child's environment | `!e.envp.some(v => v.startsWith(canaryKey+'='))` (inside `capped`) | `canary_in_env` |
| 6 | no uncapped direct child outside named allowances | `uncappedDirect() === 0` | `uncapped_direct_children=N` |
| 7 | no successful execveat | `t.execveat === 0` | `execveat=` |
| 8 | final line is `VERDICT: PASS` | `verdictPass` | `no_final_verdict_pass` |
| 9 | no FAIL line | `failLines === 0` | `fail_lines=N` |
| 10 | line before it is the owning gate's own summary, n=m, m ≥ base | `SUMMARY[gate].exec(lines.at(-2))`, `pass===total`, `total ≥ b.total` | `selftest_cases_below_base` |
| 11 | allowances (RG1409/SP1766 nested `--selftest`, SP1049 `bash -c`) + MACHINE/FIXTURE_TOOLS execs | `SET.allowDirect`, `MACHINE`, `FIXTURE_TOOLS` | (tolerance side of #6) |

## The one reduction (document for a future round)

The counter dies (exit 2) unless the **base** run itself has `b.status===0 && b.total≥1 &&
b.pass===b.total && b.verdictPass && b.n≥1` (`base run invalid for <site>`). On every input that
yields a score at all, `b.n ≥ 1`, hence `t.n === b.n  ⟹  t.n ≥ 1`: clause 2 is a **derived clause**,
not an independent constraint. Equivalent smaller sentence: *"the site's child is exec'd exactly as
many times as in the base run"* (drop the parenthetical).

Evidence that nothing is lost: across **all** attempt-1 receipts, `no_child_exec` occurs 36 times and
**always** co-fires with `exec_count_ne_base` (CtlDodge, CtlStubChild, CtlSummaryForge,
CtlNestedAllowance, CtlJunk — see the `uniq -c` table; zero occurrences alone). The implication
direction is strict: `exec_count_ne_base` fires in classes clause 2 never sees alone, so the smaller
sentence classifies every observed input identically. Cost of adopting it in a future freeze: one
reason string of triage information; gain: none in discriminating power. That is why it is recorded
here and not proposed as an amendment — the frozen sentence stays as-is for r48.

## Why every other clause stays (clause → killed class → evidence)

| clause | unique/reachable killed class | pinned by (receipts under `build/`) |
|---|---|---|
| 1 gate exit 0 | prints `VERDICT: PASS` then exits nonzero | CtlJunk (`gate_exit=1`, co-fired); no receipt isolates it — residual class is print-PASS-then-crash, not covered by 8–10, which read stdout only |
| 3 exec count = base | stub the child out of the selftest and shrink the suite (61→58, 46→40); hide sites from the trace; route only the first exec (2/116) | CtlStubChild, CtlDodge, CtlSummaryForge, CtlNestedAllowance, CtlFirstCallOnly, CtlJunk, CtlEnvPassthrough (RG742 60/61 → 0/116) |
| 4 cap-run leg (r's own file) | launch systemd-run+bwrap **directly**, no cap-run → `no_cap_run_ancestor` fires **alone** (`reason=no_cap_run_ancestor`, 6×); fake a different runner file → same leg fails | CtlDirectSystemd, CtlFakeRunner (mutants a/b) |
| 4 scope properties | bwrap present, `systemd-run` scope missing/loose (MemoryMax>1024M etc.) → `no_bwrap_ancestor` absent, `no_capped_scope_ancestor` fires | CtlLooseCaps, CtlEnvCaps (mutant; its pristine/restored reads 4/4 — the comparator is sound) |
| 4 bwrap leg + flags | capped scope present, no bwrap → `no_bwrap_ancestor` | CtlScopeOnly, CtlBwrapOnly (mutant shows scope+bwrap without cap-run: only `no_capped_scope_ancestor,no_cap_run_ancestor`) |
| 4 every-exec (not first only) | route only the site's first exec (RG742 2/116 capped) | CtlFirstCallOnly |
| 5 canary absent | chain complete but env passed through → `canary_in_env,uncapped_exec` — proves envp is checked, not the `--clearenv` flag | CtlEnvPassthrough (sole control with `canary_in_env`) |
| 6 no uncapped direct children | route the four sites **and** leave 6 stray raw direct children → `reason=uncapped_direct_children=6` as the **only** reason (4 receipt lines) — judge's ancestor check cannot see these | CtlFirstCallOnly (SP491/SP519) |
| 7 no execveat | no control pins it. Residual class: an uncapped helper launched via `execveat`/memfd is invisible to `judge` (iterates execve records) **and** `uncappedDirect` (same) — only the count in clause 7 sees it; for the site's own child, clauses 2/3 would catch the swap | none — flagged as the corpus gap; a future `CtlExecveatHelper` control, **not** a deletion |
| 8 final VERDICT: PASS | gate swallows its verdict / trailing noise after PASS | CtlJunk (co-fired); residual class is post-PASS output, not covered by 9/10 |
| 9 no FAIL lines | FAIL lines scrolled under a lying `VERDICT: PASS` + valid summary | CtlEnvPassthrough RG742 (`fail_lines=1` — the leaked canary failed one case honestly) |
| 10 own-gate summary n=m, m≥base | forge the tail (execs=1 stub printing `46/46 cases passed` / `VERDICT: PASS`); shrink the suite | CtlSummaryForge, CtlStubChild (`selftest_cases_below_base`) |
| 11 allowances | removing them makes ROUTED_HELD **unsatisfiable**, not smaller: the base gate always spawns RG1409/SP1766/SP1049 raw (all receipts: `uncapped_direct_children=9/58` at base), and routing the nested selftest means systemd-run inside bwrap (fresh /run tmpfs). Abusing the allowance instead of routing the claimed sites is still killed by 2/3 (n=0) | CtlNestedAllowance (`no_child_exec,exec_count_ne_base` on RG742/SP1592), plan §C1 "not routed" list |

Reason co-occurrence also settles the merge question: **`judge` (4/5) and `uncappedDirect` (6) are
neither implied by the other.** CtlFirstCallOnly shows clause 6 firing with clauses 4/5 fully
satisfied (SP491/SP519 `capped/n=2/2`), and CtlDirectSystemd shows clause 4 firing with
`uncapped_direct=0` after the dodge exemptions — two orthogonal nets, both required.

## Rejected reductions (would change the extension)

- **RUNS 3 → 1.** The predicate is over a run ensemble; run-to-run variance under load is the
  measured phenomenon (R47-1: 3/5, 3/5, 4/5 at `f00cf278`, load1 22→54 — `build/a2-rerun-*.txt`;
  stab receipts at load1 35–59). A 1-run version is a different, weaker experiment, not a smaller
  equivalent.
- **Loosen the chain to "any bwrap ancestor"** or drop the cap-run leg / property checks — killed
  class for each weakening exists above (CtlBwrapOnly, CtlScopeOnly, CtlLooseCaps, CtlDirectSystemd,
  CtlFakeRunner).
- **Trust `--clearenv` instead of the canary** — CtlEnvPassthrough is precisely the class where the
  flag is present and the env leaks.
- **Merge 8+9+10 into "exit 0"** — each of the three is a distinct lie channel (no verdict; FAIL
  under verdict; forged/shrunken summary); each has a control or reachable class.

## Tradeoff and stop point

The next deletion after the derived `no_child_exec` clause would harm an axis: `execveat` (clause 7)
has no killed control but is the only net over memfd-launched helpers, and clauses 1/8 survive on
reachable classes their siblings cannot see. Removing the derived clause itself would buy one
diagnostic string and lose the fail-loud redundancy Mistake 3 pushed for; the honest recommendation
is: **keep the frozen sentence, file the `(at least once)` redundancy as a note for whoever authors
the round-49 counter**, together with the missing `CtlExecveatHelper` control.

No lane bytes outside this file were modified; the shared tree was not touched (read-only session;
no writes, no git/jj commands, no sandbox created).
