# ReviewFreeze — freeze integrity verdict (kumitate r48, attempt 2, item ReviewFreeze)

**VERDICT: FREEZE INTACT.** All four assigned checks pass from committed bytes at
`fe3d45bf929246915c8c0de5f7f8682b5015b22c` (HEAD, detached; verified `git rev-parse HEAD`).
No candidate score exists anywhere in the lane; no F48 amendment is forced by anything
observed. One documentation nit and three residual-risk notes below — none block data.

Method: read-only git (`show`/`cat-file`/`log`/`grep`/`diff`/`rev-parse`) against
`fe3d45bf` and every ref under `--all` (incl. `origin/wip/operator-save-20261023`
= `bd4d2b22e93d480b513a251f9672e543adc73403`, parent `fe3d45bf`), plus working-tree
`grep -rl` over `.ufo/waves/round-4{7,8}` and a whole-tree `CAPROUTE48` census.
No counter was run; no repo writes. No tools installed (none needed; pacman paused).

## Check 1 — probe sha256 — PASS

`git show fe3d45bf:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum`
= `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` — exact match.
The working-copy file hashes identically (unmodified), and all six stability receipts
record `counter_sha256=f24a3af5…0cf2` internally. The frozen instrument is the
committed instrument.

## Check 2 — ROUTED_HELD sentence identity — PASS

Extracted the predicate sentence from committed `plan.md` § C1 (lines beginning
"Site s is ROUTED_HELD at rev r when…") and from the committed counter header comment
(`caproute48-probe.mjs:6-15`, `//`-prefix stripped); whitespace-normalized `diff`
= **SENTENCE IDENTICAL** (one sentence, ends "…with no canary variable in the child's
environment."). The receipts carry the label, not the sentence: every r47 SITE line
reads `label=ROUTED_HELD`, every r48 SITE line `label=ROUTED_MISS`, emitted by the
counter's own `label=ROUTED_HELD|ROUTED_MISS` (probe line 375) — the label token is
the same one the sentence defines. The attempt-2 addendum (uncommitted `M plan.md`)
does not restate the sentence; it asserts identity by reference ("same predicate
sentence as the freeze header", plan.md:103), which this diff confirms true.

## Check 3 — six stability receipts — PASS

Committed at `fe3d45bf` under `probe/receipts/`:

| receipt | CAPROUTE48 line | exit |
|---|---|---|
| stab-r47-f00cf278-{1,2,3}.txt | `rev=f00cf278… base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48` | 0 |
| stab-r48-f00cf278-{1,2,3}.txt | `rev=f00cf278… base=f00cf278 set=r48 held=0/4 runs=3 rule=F48` | 1 |

r47: 5/5 ×3, all five sites ROUTED_HELD (K488, SC549, SC859, CC879, AT802; AT802
106/106 ×3 — the R47-5 parser fixes hold). r48: 0/4 ×3, all four sites ROUTED_MISS
with expected reasons (`no_cap_run_ancestor`, `no_capped_scope_ancestor`,
`no_bwrap_ancestor`, `canary_in_env`, `uncapped_exec`, `uncapped_direct_children`).
All six ran concurrently 11:41:40Z→11:47:06Z at load1 122.77→82.75/100.65, and every
receipt's recorded `counter_sha256` equals the committed probe sha (check 1).

## Check 4 — no candidate score — PASS

- `git log --all --oneline | grep -i route48`: only the two freeze commits
  (`837e8ca`, `fe3d45b`; same message, `fe3d45b` is the tip) — no score commit.
  The only C1 score commit in the entire log is round-47's `f399fc6` (rule=A2,
  prior round, not this claim).
- `grep -rl 'held=4/4' .ufo/waves/round-4{7,8}` (working tree): 9 files; committed
  at `fe3d45bf`: only `plan.md` (target spec text, not a score). On
  `origin/wip/operator-save-20261023`: the same set plus nothing else.
  `git log --all -S 'held=4/4'` adds only `bd4d2b2` (the operator save itself).
- Whole-tree `CAPROUTE48 … held=4/4` census (`build/` + `r48/` + spec JSONs):
  every actual score line names a **sandbox rev absent from the lane** —
  `git cat-file -e` fails for all 31 non-base revs observed (incl. comparators
  `f55bf22e`, `61f1c703`, `af03fad5`, `62919386`, `fc90b99a`). The only in-lane
  revs ever scored are `f00cf278` (0/4) and `fe3d45bf` (0/4 r48 / 5/5 r47).
  A lane candidate score is therefore impossible for any 4/4 on file.

### 4a. The five ROUTED_HELD readings on file (adjudicated: NOT candidate scores)

- `build/CtlEnvCaps-pristine-receipt.txt` @ `f55bf22e` and
  `build/CtlEnvCaps-restored-receipt.txt` @ `61f1c703` — attempt-1 comparator arms
  of the CtlEnvCaps control; sandbox revs, pre-data, named comparator provenance in
  `build/CtlEnvCaps.md`. (Peer note: the addendum's "only 4/4 reading" names just
  the pristine one — minor under-statement; the restored arm exists too.)
- `r48/MutRunnerUnshare-pristine-receipt.txt` @ `af03fad5`,
  `r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt` @ `62919386`,
  `r48/MutSpawnEnvDodge-pristine-receipt.txt` @ `fc90b99a` — this wave's mutant
  seats' *pristine* (unmutated comparator) arms; sandbox revs, their paired mutant
  arms read 0/4 or are still in flight (several receipts truncated/empty — seats
  running, not verdicts).

None is an integration claim, none is on a lane commit, none is `--selftest`-eligible
as a C1 score. The amendment question these positive readings raise under F48's
pre-data clause is delegated by spec to ReviewCtlEnvCaps; freeze integrity itself is
unaffected — the counter demonstrably still reads 0/4 on un-routed lane revs and
4/4 only on genuinely-routed sandbox revs.

## Residual risk / gaps (for the integrator, not verdict-blocking)

1. **Addendum is uncommitted** (`git status`: `M plan.md`). Committed `plan.md` at
   `fe3d45bf` has no attempt-2 section; C2's `COUNTER_RERUN` predicate sentence
   exists only in the working tree and spec JSONs — nothing contradicts it yet
   (instrument absent at base, `cat-file -e` → 128, matching C2's before-state),
   but the "frozen" C2 sentence is declared, not committed. Land it with the C2
   commit or a freeze-amendment commit.
2. **Timing**: peer CritFreezeTiming — plan:4 "scope freeze 13:04Z" is the declared
   bound, not the instrument-freeze instant (fe3d45bf committer 11:47:18Z);
   `rc-at802-pidwrap.txt` narrates 11:43–11:50Z, straddling the commit of a file
   already inside it. Narrative-only discrepancy; bytes are consistent.
3. **r48/ mutant receipts are in-flight** — several are partial (RUN lines only) or
   zero-byte. Treat no r48/*-receipt.txt as final until its seat yields; none
   currently shows a mutant arm reading held>0.
4. `837e8ca` is an earlier identical-message freeze commit reachable in history
   (pre-tip); only `fe3d45bf` is the frozen tip. Verified the probe sha at the tip.

Report: .ufo/waves/round-48/r48/ReviewFreeze.md
