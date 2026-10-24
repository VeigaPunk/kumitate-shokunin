# MutD57SourceRow — mutation probe: S117 status cell (`mined` → `queued`)

Role: mutation-tester (attack). Item: flip S117's status cell to `queued` in a scratch copy;
verify D57 **E3** misses (the row must be `mined`) and **sources-check stays clean** (the status
enum stays legal). One probe, no integration, no contract change.

Judged revision: lane tip `8c6f5b017d149b18134917378cdbed3b492d8e89` (the plan's bookkeeping tip;
R1 `f0dc6d11` re-verified there per LOG). Probe bytes executed: `doctrine57-probe.mjs` sha256
`8837a090ce76419ac996fafb9103357427935791a0399471e52dbf2ead670d53` — **matches** the round-57
`doctrine57-probe` pin in `.ufo/pins/counter-pins.json`, so the detector is the frozen counter, not a
copy.

## Method (scratch only)

The lane repo is read-only for me and the probe needs a `git archive <rev>`, so the mutation lives in
a sandbox under my own build dir:

- `git -C <lane> archive 8c6f5b0… | tar -x -C .ufo/waves/round-57/build/MutD57SourceRow/sandbox`
- `git init` + local `add -A` + commit there (no lane objects touched). Pristine sandbox commit
  `REV1 = abd1919d5253a3a8c8d3706db54f35b4c7be37e9`; mutant commit
  `REV2 = 96a5bb1809626ee755d479e950405395e6f5a93f`.
- One-cell edit in `corpus/SOURCES.md`: S117 row, cell 8 `mined` → `queued`. Nothing else.

`git diff REV1 REV2`: `corpus/SOURCES.md | 2 +-` — 1 file, 1 insertion, 1 deletion. Blob
`de143662…` → `0a491f75…` (`git rev-parse REV1:corpus/SOURCES.md REV2:corpus/SOURCES.md`).

## Baseline (pristine, same detector)

```
lane 8c6f5b0 : DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=8c6f5b01… rule=D57 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS   exit=0
sandbox REV1 : DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=abd1919d… rule=D57 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS   exit=0
sources-check (sandbox worktree): SOURCES_CHECK: CLEAN (rows=120 tiers=A:99,B:13,C:8
  status=queued:12,mined:88,rejected:20 entries_with_source=14 legacy=38)   exit=0
```

Baseline is green, so a mutant miss is attributable, not pre-broken
(`.ufo/waves/round-57/build/MutD57SourceRow/baseline-*`).

## Mutant result

```
DOCTRINE57: DOCTRINE57_UNMET held=4/5 checks=5 rev=96a5bb18… rule=D57 |
  E1 PASS | E2 PASS | E3 MISS S117:queued | E4 PASS | E5 PASS      exit=1
```

- **E3 killed the mutant.** The MISS detail is `S117:queued`, i.e. `cells[8] === 'mined'` failed on
  exactly the flipped cell; no `pin-miss` component appears, so the capture-registry half of E3
  (S117–S120) still passes. Independent read of the same rows, outside the probe:
  `pristine {"status":"mined","usedBy":"corpus/knowledge/worker-heartbeat-liveness.md"}` →
  `mutant {"status":"queued","usedBy":"corpus/knowledge/worker-heartbeat-liveness.md"}` — used-by and
  every other cell are byte-identical, so the miss is caused by the status alone, not by a
  side-effect on `cells[11]`.
- **sources-check stayed clean, as predicted** — including `--strict`:
  ```
  SOURCES  info  LEGACY_NO_HEADER  count=38
  SOURCES_CHECK: CLEAN (rows=120 tiers=A:99,B:13,C:8 status=queued:13,mined:87,rejected:20
    entries_with_source=14 legacy=38)   exit=0        (plain and --strict)
  ```
  `STATUSES` is `{queued, mined, rejected}` (`scripts/sources-check.mjs:107`), so the downgrade is
  schema-legal; only the census counters move (`queued:12→13`, `mined:88→87`) and counts are printed,
  not judged. This corroborates the item's premise: the status column is *not* an
  operability-enforced invariant anywhere in sources-check.
- **Non-collateral:** E1 (entry provenance), E2 (12 receipt clauses), E4 (sources-check on the
  extracted tree) and E5 (live census) all PASS on the mutant — the mutation is surgical.

## Verdict

**KILLED by D57 E3** — expected detector, observed exactly: `held=4/5`, literal
`E3 MISS S117:queued`, exit 1, and the predicate sentence degrades from `DOCTRINE57_HELD held=5/5`
to `DOCTRINE57_UNMET held=4/5 checks=5`, which is a hard fail for the frozen predicate. The
mutant's second half is confirmed too: sources-check reports CLEAN (exit 0) both plain and strict,
so E3 is the **sole** guard against a legal-status downgrade of an admitted row.

Coverage findings (findings, not contract edits):

1. E4 inside D57 runs sources-check on the extracted tree and therefore shares its blindness: a
   mutant that passes the status enum keeps E4 green. Only E3's literal `mined` requirement fires.
2. E5 is live-only by construction (it validates the fleet root, not `<rev>`): it is inert for any
   rev-local source-row mutation and passed here while the judged rev was defective.
3. The census line is the only observable trace (`status=queued:13,mined:87`); it is a print, not a
   gate, so nothing fails on it. Anyone reading only sources-check would score this mutant as
   surviving.
4. If E3's status conjunct were relaxed to "one of the legal statuses" the mutant would survive with
   `held=5/5`; the check must keep the literal `mined` comparison.

## Restoration evidence

Sandbox file restored to the pristine blob with `git checkout REV1 -- corpus/SOURCES.md`:

```
restored sha256(corpus/SOURCES.md) = b58498dd1e2983480dc50c48c6226776048f123df00294e56d96f03461b25e79
baseline sha256(corpus/SOURCES.md) = b58498dd1e2983480dc50c48c6226776048f123df00294e56d96f03461b25e79   (identical)
restored REV1: DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=abd1919d… rule=D57 | E1..E5 PASS   exit=0
restored sources-check: SOURCES_CHECK: CLEAN (… status=queued:12,mined:88,rejected:20 …)         exit=0
```

Baseline result reproduced from restored bytes, so the kill is not a one-way artefact.

Lane integrity: `sha256(lane/corpus/SOURCES.md) = b58498dd…` before **and** after the probe
(`baseline-lane-sources.sha256` = `final-lane-sources.sha256`); lane `HEAD = 8c6f5b0…` unchanged; no
lane file written outside
`.ufo/waves/round-57/build/MutD57SourceRow/` and this report. `git status` shows only sibling seats'
outputs plus my own build directory.

## Artifacts (`.ufo/waves/round-57/build/MutD57SourceRow/`)

`baseline-doctrine57-lane.txt`, `baseline-doctrine57-sandbox.txt`, `baseline-sources-check-sandbox.txt`,
`mutant-doctrine57-sandbox.txt`, `mutant-sources-check-sandbox.txt`,
`mutant-sources-check-strict-sandbox.txt`, `mutation.diff`, `provenance.txt`, `sandbox-revs.txt`,
`{baseline,mutated,restored}-sandbox-sources.sha256`, `baseline-lane-sources.sha256`,
`final-lane-sources.sha256`, `final-lane-status.txt`, `restored-doctrine57-sandbox.txt`,
`restored-sources-check-sandbox.txt`, `sandbox/` (scratch repo).

Limits: the mutant lives in a sandbox clone built from the lane's `git archive`, so the probe's E5
selects the real fleet root regardless of `<rev>` — recorded, not repaired. No package installs and
no routing changes were made for this probe.
