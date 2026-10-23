RESULT ReviewCounter48 verdict=NO_FALSE_HELD_FOUND

Review of the frozen counter `.ufo/waves/round-48/probe/caproute48-probe.mjs`
(sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` — byte-identical to the
`counter_sha256` recorded in `probe/receipts/stab-r48-f00cf278-*.txt` and `stab-r47-f00cf278-1.txt`)
against plan § C1. Read-only; no installs were made (none needed). No output of round-47 seat
ReviewCounterA2 was used. The `lsp` device is not in this seat's inventory, so all cross-file checks
are direct reads of `git show f00cf278:<file>` blobs and text grep — no language server answered any
file; nothing below should be read as LSP-backed.

Method. Static read of the whole 378-line counter; sources of both gates, `scripts/cap-spawn.mjs`
and `scripts/cap-run.mjs` at base `f00cf278` (blob reads via `git show`); the six checks below were
then attacked empirically: (a) synthetic logs fed to the counter's own `parseLog`/`judge`/`uncappedDirect`
extracted verbatim from the frozen file (harness: `/fast/scratch/hyaku/kumitate-r48/seats/w1-ReviewCounter48/harness.mjs`,
log-runner `parsefile.mjs` in the same dir); (b) live `strace` runs with the counter's exact flag set
(`-f -qq -v -s 8192 --decode-pids=pidns -e trace=execve,execveat,clone,clone3,fork,vfork -e signal=none`;
host: node v24.21.0, strace 7.2, bubblewrap 0.13.1) — logs kept as `l1.log` (node spawn), `l2.log`
(thread-leader exec), `l3.log` (bwrap `--unshare-pid` chain) in the seat dir. All runs wrapped in
`timeout -k 10`; peak scratch use < 1 MiB (`df -h /fast`: 68G free).

## Answers to the six assigned checks (short form)

1. Predicate coverage — every clause maps to code and nothing weaker; see "Clause map" below. No gap found.
2. Parse completeness — no successful execve/clone record can be skipped silently. Padded returns,
   resumed chains and pidns comments parse (T1/T6/T5, live l1/l3); `= ?` and unprefixed lines exit 2
   (T2/T3); a never-resumed record exits 2 (T7). A thread-leader exec does NOT parse — it exits 2
   (D1), it is not silently skipped. The header's "every non-empty line that does not parse is exit 2"
   is inaccurate as documentation (D3), but the silently skipped line classes (`+++ … +++`, untraced
   syscalls) carry no exec/clone records; with `-qq` the exited/killed forms do not occur at all (l1
   had zero such lines).
3. Allowances — they cannot rescue an uncapped SITE launch: site candidates are judged independently
   of `uncappedDirect` (probe:282-308), and T13 shows a `bash -c 'exec node …/fleet-dispatcher.mjs
   status'` smuggle reads `capped=0` → `uncapped_exec` → ROUTED_MISS. But the r48 allowance (probe:73-75)
   admits uncapped NON-site direct launches without limit and inspects only a pid's FIRST exec (D2) —
   breadth the plan itself names ("SP1049 … the command is data"), implemented verbatim.
4. Base validity — the base gate (probe:347-352) rejects exit≠0, missing/failing summary, missing
   `VERDICT: PASS` and n<1 with exit 2; I found no path that scores against an invalid base run. The
   base's own routed/unrouted state is not re-asserted per invocation (D4, low; pinned by the frozen
   sha constant at probe:64 and the stab-r48 receipts).
5. Site signatures — verified against the real base spawn shapes: RG742 `spawnSync(process.execPath,
   [SELF, …args])` with `SELF = fileURLToPath(import.meta.url)` (round-gate.mjs:719,742); SP491
   `spawnSync('bash', [host,'surface','--json'])` (surface-probe.mjs:491); SP519 `spawnSync(process.execPath,
   [host,'status'])` (surface-probe.mjs:519); SP1592 `spawnSync(process.execPath, [selfPath, …args])`
   (surface-probe.mjs:1592-1594). All hold under routing: signatures key on `argv[1..3]` and the exec
   PATH's basename, so bwrap `--argv0` (which rewrites only argv[0], cap-run.mjs:190) cannot break a
   match, and cap-run's `realpath` resolution keeps basenames (`/usr/bin/bash`); `/fast/scratch` is not
   a symlink (`readlink -f /fast/scratch` → itself), so `runnerFile` (probe:265) equals cap-spawn's
   `CAP_RUN` (cap-spawn.mjs:26) — proven live by stab-r47 reading `uncapped_direct=0,0,0` on all five
   routed r47 sites. A raw child matching a DIFFERENT site is impossible (disjoint script names); the
   excluded `--selftest` variants (`!a.includes('--selftest')`, probe:66,69) are mutually exclusive
   with every match. No counter-owned false-miss path found.
6. PID handling — padded prefix `^(\d+) +` (probe:150) handles 4-digit-after-wrap records (T5 uses one;
   receipts observed `9879  clone(…)` parsing); reuse → exit 2 (probe:189, T4); threads carry
   CLONE_THREAD edges that never exec (live l1: 6 such edges, parsed, harmless — `uncappedDirect`
   skips exec-less pids at probe:271); pidns returns use the comment value (probe:173, T5; live l3:
   `= 2 /* 1743326 in strace's PID NS */` → edge `1743326<-1743319`, chain intact). None of these
   break a chain or a count without exit 2.

## Findings

### D1 (medium, robustness — honest-fail direction): a thread-leader exec makes the whole invocation exit 2
strace 7.2 prints a non-leader thread's exec as a three-line cluster (live `l2.log`, python
`threading.Thread(target=…) + os.execv` under the counter's exact flags):

```
1554753 execve("/usr/bin/true", ["true"], […]) … <pid changed to 1554752 ...>
1554752 +++ superseded by execve in pid 1554753 +++
1554752 <... execve resumed>)           = 0
```

The first record ends in `<pid changed to …>` with no return value, so the return regex (probe:173)
fails → `die` (probe:174). Verified end-to-end: `node parsefile.mjs l2.log` →
`DIE(exit2) unparsed return in execve record of pid 1554753: … "<pid changed to 1554752 ...>"`.
(Even past that, the resumed record arrives under the leader pid with no pending entry → probe:164
would also exit 2.) Concrete input: any traced process whose non-leader thread execs. None of the two
gates' spawn shapes does this today (node/bash spawn from the main thread; cap-run's chain is
fork+exec of fresh single-threaded processes — and the r47 receipts show 15 clean runs), but a single
occurrence in any run — e.g. a checklist command (SP1049's data) that execs from a worker thread —
converts the invocation to exit 2, which is recorded and never a score (kill rule), stalling C1
verification rather than falsifying it. No wrong count or label is possible. Recommendation: none for
the frozen counter; wave seats should treat an unexplained exit 2 with `unparsed return … <pid changed`
in the message as this format, not as a dropped record (relevant to ExecRootCause's drop hypothesis).

### D2 (medium, allowance breadth — plan-derived, no site risk): r48 allowances are shape-wide, first-exec-only, unbounded
`allowDirect` (probe:73-75) admits (a) ANY number of direct children whose first exec is
`sh|bash|dash … -c …` (argv[1] is the only thing checked — the `-c` command is never inspected), and
(b) any number of `node <any path ending in /scripts/<gate>.mjs> … --selftest` children (suffix-only
path check, any tree), and it inspects ONLY `ex[0]` of each child pid, so later execs on an admitted
pid are unconstrained. Concrete input (synthetic, run through the frozen `judge`/`uncappedDirect`;
harness T13 output verbatim):

```
T13-judge-bash-c-site: OK {"n":1,"capped":0,"why":["no_bwrap_ancestor","no_capped_scope_ancestor","no_cap_run_ancestor"],"dodge":0}
```

— a direct child `bash -c 'exec node …/fleet-dispatcher.mjs status'` IS caught by judge
(`uncapped_exec` → MISS), but the sibling `bash -c 'exec node /tmp/evil.js'` (non-site) is invisible:
dodge stays 0 and no signature matches. So a C1 candidate can add uncapped non-site direct launches
without tripping `uncapped_direct_children`. This is within the plan's letter (SP1049's "command is
data"; the claim covers the four named sites), and `judge`'s independence keeps every site exec
chain-checked; report it so the C1 sentence is not over-read as "no other uncapped launches exist".
The counter is frozen and must not be tightened after the first candidate score (kill rule).

### D3 (low, documentation): the header overclaims parse strictness
Header lines 33 and 25-29 say every non-parse line and every skipped class exits 2. Measured false as
written: `1234  +++ exited with 0 +++`, `55  +++ killed by SIGKILL +++`, `55  +++ superseded by execve
+++` and `10  restart_syscall(<…>)` are all skipped silently (harness T1/T8/T9/T10, e.g. `T1-padded-exited-line: OK {"execs":1,"rootPid":1234,"parentSize":0}`).
No exec/clone record can hide in those lines (strace emits them as standalone notices; with `-qq` the
exited/killed forms do not occur at all — live l1.log has zero), and the superseded form occurs only
inside D1's cluster which exits 2 anyway. Documentation mismatch only; no scoring impact.

### D4 (low, hardening): base validity never asserts the base is UNROUTED
The base gate (probe:347-352) checks exit/summary/verdict/n≥1 but not `b.dodge > 0` nor `b.capped === 0`,
so a wrong frozen base commit would still be scored (exec counts and case floors would simply be
taken from it). Mitigated: the base is a frozen sha constant (probe:64), the trailer prints it
(`base=f00cf278`), and `probe/receipts/stab-r48-f00cf278-{1,2,3}.txt` pin `held=0/4` exit 1 with the
full miss reasons at that sha. Residual only.

## Clause map (check 1, predicate sentence → code)

- "each of 3 runs … from its own git archive … under strace -f with a planted canary": probe:8-10, 311-336
  (`measure` RUNS=3 for rev, `git archive` + `tar -x`, `runGate` 201-236 plants the random canary in the
  gate's env; the three runs of a gate run concurrently, gates sequential).
- "the trace parses completely": probe:150, 164, 174, 180, 189, 193-195 (any unparsed/unresumed record →
  exit 2; log size bounded at probe:46, 209-211).
- "the gate exits 0": probe:362.
- "the line before its final VERDICT: PASS is that gate's own suite summary with n = m and m no lower
  than base": probe:218-227 (exact `VERDICT: PASS` tail + `SUMMARY[gate]` regex on the preceding line),
  SUMMARY 53-60 keyed by owning gate, enforced at probe:368 and 370.
- "no FAIL line": probe:228 (`/^FAIL\b/`) enforced at 369; both gates emit unindented `FAIL  <case>`
  (round-gate.mjs:1538, surface-probe.mjs:1786) — verified.
- "no successful execveat": probe:177-178 (counts rv=0 only), enforced at 367.
- "no direct child … uncapped launch outside the named allowances": probe:263-276 + allowDirect 73-75;
  the allowances are exactly the plan's three names (RG1409/SP1766 nested `--selftest`, SP1049
  `bash -c`) — see D2 for breadth.
- "exec'd exactly as many times as in the base run (at least once)": probe:363-364 with base measured
  once at 347 and validated at 348-352.
- "every such exec preceded … by the ordered chain cap-run (node) → systemd-run --scope (MemorySwapMax=0,
  MemoryMax ≤1024M, TasksMax ≤256) → bwrap (--unshare-pid --clearenv --die-with-parent)": probe:282-308
  (ancestry walk with global seq ordering R<S<B<E), 254-259 (`isScope`: `--scope` flag + the three
  properties, M-suffix regex), 261 (`isBwrap`), runner exclusion 282-283; cap-run emits exactly this
  shape (cap-run.mjs:185-190; cap-spawn.mjs:26,36-44 absolute `CAP_RUN`).
- "no canary variable in the child's environment": probe:303, 307 (per-exec envp scan; routing's
  `--clearenv` strips it — stab-r48 base runs read `canary_in_env`, i.e. the check bites).
- "label needs 3 runs": `why` is unioned across all three tips per site (probe:357-371); `held` counts a
  site only when that union is empty (probe:372-373), exit 0 iff all sites held (probe:377).

## Verified-good evidence (commands + verbatim outputs)

- Signatures against base truth: `git show f00cf278:scripts/round-gate.mjs` lines 719/742/1409-1412;
  `git show f00cf278:scripts/surface-probe.mjs` lines 491/519/1049/1592-1594/1766-1767; `runChecklists`
  runs IN-PROCESS (surface-probe.mjs:1670) — no unlisted spawn can match SP1592. Summary/verdict
  emitters match SUMMARY exactly: round-gate.mjs:1541-1542 `ROUND_GATE_SELFTEST: n/m pass` +
  `VERDICT: PASS`; surface-probe.mjs:1787-1788 `n/m cases passed` + `VERDICT: PASS`.
- Chain machinery works against the real cap-run: `stab-r47-f00cf278-1.txt` (this counter, set r47,
  11:41-11:47Z) reads `SITE K488 … capped/n=53/53,53/53,53/53 … uncapped_direct=0,0,0` for all five
  sites and `held=5/5 … rule=F48`, `exit=0`.
- Before-state: `stab-r48-f00cf278-1.txt` reads `held=0/4 … rule=F48`, `exit=1`, `base_n` 116/2/2/14
  (matches plan § C1 table), reasons include `no_cap_run_ancestor` and `canary_in_env`, `uncapped_direct`
  58/9/9/9. The 116 decompose as 57 direct runGate children + 59 spawned under the raw nested selftest
  (consistent with uncapped_direct=58 = 57+1); both halves route identically under the C1 build, so the
  count equality is symmetric.
- Synthetic parser probes (harness.mjs, counter code loaded verbatim): T2 `= ?` → DIE exit2; T3
  unprefixed line → DIE; T4 pid reuse → DIE; T5 pidns comment edge `parentOf42=10`; T6 resumed padded
  execve OK `{execs:[7],resumed:1,parentOf9:3}`; T7 never-resumed → DIE; T11 execveat counted; T12
  failed execve ignored; T14 fully routed chain OK `{n:1,capped:1,why:[],dodge:0}` (covers the `env -i`
  intermediary and same-pid bwrap→node execs).
- Live format runs (counter's exact strace flags): l1.log `execs=2 … edges=7` (6 CLONE_THREAD threads +
  1 child, no `+++` lines with `-qq`); l3.log `edges=2 sample=[1743319<-1743314, 1743326<-1743319]` —
  the pidns-comment edge is correct and the bwrap fork chain resolves.

## Residual risk and verification gaps

- D1 is the only finding that can change a C1 outcome, and only by converting a run to exit 2 (never a
  score); if wave-2 sees `unparsed return … <pid changed to` the cause is strace 7.2's thread-leader
  format, not record loss — that distinction matters for ExecRootCause's "strace never drops a traced
  record" attack, which this review did not test under load (out of scope; wave-1 seat owns it).
- The summary/verdict clauses are textual proxies: a candidate gate that lies in its summary line and
  omits FAIL lines satisfies them by construction. The counter implements the frozen predicate
  faithfully; whether that proxy is good enough is exactly what pre-data control CtlSummaryForge
  measures, and a `ROUTED_HELD` there forces the plan's amendment path.
- D2's breadth means a passing C1 commit does not certify "no uncapped non-site launches in the gates";
  the C1 sentence covers the four sites plus the direct-child allowance as named.
- I did not re-run the full counter end-to-end (the receipts at the identical sha are the run evidence;
  every behavioral claim above was tested through the counter's own extracted code or live strace runs
  in `/fast/scratch/hyaku/kumitate-r48/seats/w1-ReviewCounter48/`).

No false-ROUTED_HELD path was found on any of the four sites; findings D1-D4 are recorded above with
their evidence. No actionable defect remains in scope for this review.
