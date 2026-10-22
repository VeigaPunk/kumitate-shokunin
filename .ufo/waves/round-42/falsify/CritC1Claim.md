RESULT CritC1Claim rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=weaker objections=4

Impacted axis: operability. The battery is a real gate: it exits 1 on genuine selftest erosion in
both target suites, and the "terminal integer" statement is right. The integer move 8 -> 9 is
weaker than claimed. Three units arrived (A +1, C +2), and any one of them alone reaches
A+C = 27, which already gives 9. So the frozen counter cannot falsify the capability. Removing
the script still reads 9. Removing both checklist items still reads 9. A zero-byte `.mjs` file
at the open bytes reads `PROXY: MATCH ... operability=9`. The C +2 has no marginal effect on
the integer.

## Objections

1. **The integer move is overdetermined, so the counter cannot falsify it (strongest).** The
   lesson says "The verdict and its hermetic suite are checklist items 18–19, so the frozen
   operability proxy reads A 9 → 10, C 17 → 19, `f_O` 26/29 → 29/32, integer 8 → 9". This credits
   the items for a move they do not make. Measured in scratch clones (`/fast/scratch/hyaku/kumitate-r42/falsify/CritC1Claim/lane2`):
   - At c9a084bf, with items 18–19 deleted from `SKILL.md`, the terms read `{"A":10,"C":17,"operability":9}`.
   - At c9a084bf, with `scripts/gate-mutants.mjs` removed, the terms read `{"A":9,"C":19,"operability":9}`.
   - At a0a07bae (round-open bytes plus amendments) I added a zero-byte `scripts/noop.mjs`, set the stanza to `A=10` and set
     the axis row to 9. The proxy printed `PROXY: MATCH (A=10 C=17 operability=9; ...)`, exit 0. Without `--strict`
     the only cost is a `PIN_UNPINNED` warning.
   - Arithmetic: `floor(10·n/(n+3))` is 8 for n = 26 and 9 for n = 27…∞.

   So the integer certifies "some `.mjs` file or some `- [` line was added". It does not certify
   that the gate exists or that it works. The capability's honesty rests entirely on the receipt
   (`final/c1-measured-c9a084bf.txt`), not on the frozen counter. Build seat CritC1Honesty had
   already shown that 27 gives 9. That remark was not carried into the lesson's claim sentence.
   Fix: change the claim to say "A +1 moves the integer; items 18–19 are recorded and do not
   move it". Also name the receipt's `frozen=41/41`, not the counter, as the falsifier.
2. **The kill rule credits FAIL lines caused by the environment, so a survivor can read
   `killed`.** `classifyMutant` (gate-mutants.mjs:426–434) returns `killed` on any `FAIL ` line
   when the case total equals the control's. The control runs once, before the mutants, and
   nothing re-confirms a kill. I planted a survivor (the eroded parse-64 suite, below) and filled
   the per-user task headroom right after the control line (`starve.sh`). Six runs gave:
   - hog 42: `MUTANT cite-check:parse-64 killed cases=73/75 fail_lines=2 exit=1` (a false kill);
   - hog 40 and 50: `crash signal:SIGABRT` (correctly fails closed);
   - hog 36: `survived` (correct);
   - hog 30 and 48: my 30 s cap fired.

   A false kill on the last survivor turns `SURVIVED` exit 1 into `CLEAN` exit 0. This is
   conditional on host pressure, which is the condition the lesson's own mistake row (~500
   processes) records. Proposed fix, **untested**: `gate-mutants-kill-confirm.patch` in the
   scratch dir. It reruns each kill, requires the same failing case names, and re-runs the
   controls after the mutants. Its `--selftest` did not finish inside my 30 s host cap, so it is
   not verified.
3. **A seat-private scratch path is baked into a standing gate.** Line 29 reads
   `const SCRATCH_TMPDIR = '/fast/scratch/hyaku/kumitate-r42/seats/ExecGateMutants/tmp';`. Checklist
   item 18 therefore depends on a round-42 seat directory. On a checkout or host where
   `/fast/scratch/hyaku` is not writable, the item fails with exit 2 instead of measuring
   [INFERENCE: not run on such a host]. Every clone shares that one parent, so my scratch runs
   had to edit this line. Fix: use `os.tmpdir()` or an environment override, keeping the existing
   owner and mode checks.
4. **External kill leaks process groups and temp dirs.** Each selftest is spawned
   `detached: true` (its own group), and cleanup runs only in `process.once('exit')`. When I
   SIGKILLed the gate, mutant and control `--selftest` groups kept running: 3–6 processes, with
   `etimes` up to 118 s, outliving the gate's own 60 s timeout. Two to four `kumitate-gate-*` temp
   dirs remained, which I killed and removed by hand. The receipt's `leftovers=0` covers only a
   normal exit. A checklist runner's timeout kill (surface-probe `CHECKLIST_TIMEOUT_MS`) would
   take this path. Fix: a reaper keyed on the temp parent at start-up, or `PR_SET_PDEATHSIG` via a
   tiny wrapper.

Nit (not counted): "`f_O < 1` for every finite A+C, so `floor(10 × f_O)` never reaches 10" is
exact for the formula. The JavaScript implementation (`operabilityOf`) returns 10 at
A+C = 10^17, because of double rounding (it returns 9 at 10^16). That is unreachable for line
counts, so the "terminal integer 9" statement holds in practice. It holds only upward:
deleting units can still move the integer to 8 (n ≤ 26).

## Does the battery fail on real regressions? Yes (both suites)

My clone is `lane` at c9a084bf plus two harness-only commits. One points `SCRATCH_TMPDIR` at
this seat. The other adds a `GM_ONLY` id filter, so that one mutant fits inside my 30 s
host-safety cap. Verdict logic is unchanged, and `gateExitCode` returns 1 on a survivor before
its frozen-count check, so the exit 1 below is the real path.

- **cite-check erosion.** I changed `scripts/cite-check.mjs:2454` from `ok: r.status === 64` to
  `ok: true`.
  - `cite-check --selftest`: `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0. Item 9 stays green.
  - The gate prints `MUTANT cite-check:parse-64 survived cases=75/75 ... exit=0 verdict=PASS`, then
    `GATE_MUTANTS: SURVIVED (...)`, exit 1. A replicate run inside a 4-id run gave the same survivor.
  - Unweakened control (`e0b.txt`): `parse-64 killed cases=74/75`.
- **wave-census erosion.** In check WC25 I dropped the unknown-wave arm
  (`unk.status === 1 && /EXPECT_UNKNOWN/.test(unk.out) && ` removed).
  - `wave-census --selftest`: `31/31 pass`, `VERDICT: PASS`, exit 0.
  - The gate prints `MUTANT wave-census:survivor/M10-unknown-wave-zero survived cases=31/31`, and
    `M02-wave-grammar-hyphen` is still `killed cases=29/31`. Result: `GATE_MUTANTS: SURVIVED`, exit 1.

  M10's kill was localized first: unweakened, it fails only WC25 and WC24.
- **Not observed:** a full 43-mutant run at c9a084bf. Three attempts (default jobs, `--jobs 1`
  and `--jobs 2`) hit my 30 s cap. The selftests stalled in `epoll_wait`/`futex`. The likely
  cause is my tighter task cap (`nproc` = current + 64; the gate's own cap is current + 256),
  not the gate, so this is not counted against it. The receipt's CLEAN 43/43 is not re-derived
  here.

## Is the integer move falsifiable by the frozen counter?

Only jointly. The counter returns to 8 only if two of the three new units are removed. A single
regression, whether the script is deleted or the gate is broken, leaves 9 and `operability` MATCH.
The item counter C counts listed `- [` lines, not passing ones (proxy-check.mjs:490, :930). A
SURVIVED gate still contributes its line. The falsifier that bites is the gate's own exit or
`frozen=41/41` substring, not the frozen counter.

## Method and host safety

- Scratch root: `/fast/scratch/hyaku/kumitate-r42/falsify/CritC1Claim`. Clones `lane` and `lane2`
  at c9a084bf; extracted tree `base/`. Digests: cite-check `1915e5b9…`, wave-census `682c3943…`,
  gate-mutants `3c6678cb…`, all equal to the receipt header. Eroded cite-check: `420e268b…`.
- Every node run went through `run.sh`: `setsid`, `prlimit --nproc=<current user tasks + 64>`,
  `timeout -s KILL 30`. After each kill, I killed any orphaned selftest groups and removed their
  temp dirs. The final check showed 0 processes and 0 temp dirs.
- Receipts: `e1-*.txt` (cite-check erosion), `e2-*.txt` (wave-census erosion), `e6-*.txt`
  (starvation false kill), `e0*.txt` and `e5-*.txt` (cap-limited full runs),
  `gate-mutants-kill-confirm.patch` (untested fix). `killers-cite.txt` is partial: six of the 18
  cite-check mutants before a 120 s cap.
- Tool installs or updates: none.
