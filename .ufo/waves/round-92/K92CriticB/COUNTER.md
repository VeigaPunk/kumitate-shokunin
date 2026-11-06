# K92CriticB — COUNTER findings on the frozen instrument (claim C1 `seat-route`)

Two counters. Neither is a kill event under the frozen rule; both are ways the round can read
HELD (or be reported as stronger than it is) without the definitions being what carries it.
Receipts in this directory; the lane was not modified.

## COUNTER 1 — kill clause (d) is a byte grep, and a delegating construction evades it and reads HELD

The plan's independence arm (`plan.md`, kill rule (d)) is: "grep of its bytes for `round-92`,
`oracle92`, `probe92` > 0, or a seat-shown runtime read".

`delegate.mjs` (this directory, sha256 `b617aaac6295789c2665d971f46be70fb1e0f99042f3266ba03f0832e343a10d`,
14 lines of code) implements **none** of the field definitions. It globs at runtime:

```js
const root = '.ufo/waves';
const wave = readdirSync(root).filter((d) => /^round-\d+$/.test(d)).sort().at(-1);
const oracle = readdirSync(join(root, wave, 'probe')).find((f) => /^oracle.*\.py$/.test(f));
process.stdout.write(execFileSync('python3', [join(root, wave, 'probe', oracle), ...args]).toString());
```

Measured:

```
$ grep -c "round-92\|oracle92\|probe92" delegate.mjs
0
$ (from the lane root) python3 .ufo/waves/round-92/probe/probe92-c1.py --tool …/delegate.mjs \
    --index …/index92.tsv --sample-a …/sampleA.tsv --waves .ufo/waves/round-91/w1-results.json \
    --out …/ctl-oracle-delegated.txt
C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12
        salt=b617aaac6295789c tool_sha256=b617aaac6295789c…
```

So clause (d)'s mechanical arm reads 0 and the frozen probe reads HELD 133/133. The clause's second
arm — "or a seat-shown runtime read" — has no mechanical form: nothing in the predicate inspects the
candidate's child processes, imports or syscalls.

**Impacted axis**: operability (the shipped tool's substance), plus the round's `receipt-bind`-class
independence claim. **Smallest safe correction** (for the L1 to apply by hand at M, since the plan is
frozen): run the M candidate under one process check before scoring —
`strace -f -e trace=execve,openat -o /tmp/… node scripts/seat-route.mjs --results … --json` and
require **no** child `execve` and **no** `openat` under `.ufo/` outside `w1-results.json`; or, cheaper,
`grep -E "oracle\*|round-\*|child_process|execFile|spawnSync" scripts/seat-route.mjs` and read the
hits. The shipped candidate currently passes the cheap form for the right reason (its only
`spawnSync` calls are `process.execPath` on itself inside `--selftest`, `seat-route.mjs:729-768`), but
that is a fact to verify at M, not something the frozen predicate establishes.

## COUNTER 2 — two of the ten advertised strata are empty sets; three fields have no discriminating transcript

`plan.md` § "Frozen predicate" names a "10-stratum draw (fallback 12, dead 6, aborted 6, silent 4,
errfix 8, multi 8, clean 12, redact 4, parseerr 2, capnone 4)". Measured against the frozen index and
a real receipt:

```
$ awk -F'\t' '{n=split($4,a,","); for(i=1;i<=n;i++) c[a[i]]++} END {for(k in c) print c[k], k}' \
    .ufo/waves/round-92/probe/index92.tsv
11974 fallback · 9551 clean · 4737 multi · 1382 errfix · 941 dead · 459 aborted · 47 silent ·
46 capnone · 5 none · 1 redact          # 23206 rows; parseerr = 0 rows, redact = 1 row

$ awk '/^C_ITEM/{print $2}' K92ExecTool/score1.txt | sort | uniq -c
6 aborted · 4 capnone · 12 clean · 6 dead · 8 errfix · 12 fallback · 8 multi · 4 silent   # total 60
```

so the C draw is **60**, not 66: the `redact` (4) and `parseerr` (2) quotas take nothing — the
universe has one `redact` transcript (already consumed by sample A) and **no** `parseerr`
transcript at all. Direct consequence, measured with the oracle over every scored record:

```
A (61):      parse_errors>0 = 0   redacted last_error = 1   final=other = 0
C (60):      parse_errors>0 = 0   redacted last_error = 0   final=other = 0
W r91 (12):  parse_errors>0 = 0   redacted last_error = 0   final=other = 0  (dead=0)
```

* `parse_errors` and `final:"other"` are exercised by **no** record in A, C or W. A candidate that
  omits the non-object/unparsable-line counter, or that maps an unknown `stopReason` to `served`,
  scores 133/133.
* `last_error` redaction is exercised by **one** transcript in the whole universe
  (`…/C2ExecF.jsonl`, the single `DISAGREE A redact … fields=last_error` line in
  `controls/ctl-noredact.txt`). It is load-bearing (redaction-blind reads 132/133 → UNMET), but the
  credential-shape guard rests on one file and on the held-out half not at all.
* HELD is still reachable (`60 ≥ 55`), so this does not block the round; it means the report must
  not describe C as covering redaction or parse errors.

**Impacted axis**: calibration (the instrument's stated coverage) and depth (a field with no
referent). **Smallest safe correction** (report-level, since the instrument is frozen): state in the
round report and the SCORECARD row that C scored 60 = 66 − 6, that `redact`/`parseerr` quotas took
0, and that `parse_errors`, redaction and `final:"other"` have 0/0/1 discriminating transcripts; and
route `parse_errors` / `final:"other"` to the next round as fields either to delete from the
definition or to ground on synthetic transcripts (which would have to be added to a future index, not
to this one).

## Not a counter (checked, holds)

* The oracle is faithful to the plan's field definitions — read line by line against
  `oracle92.py` (`captured` two-pass, `_pm` "?", served set, per-turn `last_error` overwrite,
  redact-then-cut-120, `yielded` over assistant turns, `final` derivation, wave locator marks and
  tie-break). The positive control agrees with itself at 133/133 for a reason.
* Salt-keyed C defeats **memorisation**: a tool cannot know the salt of bytes it is still writing,
  so a fixed answer table cannot be aimed at the C draw. The delegation route above is the only
  cheap way past it, and that is a (d) problem, not a salt problem.
