RESULT ReProbeC1 rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=confirmed before=15/16 after=0/16

## What I ran

Own scratch clone (`git clone --no-hardlinks`, detached at 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3;
a58b7f72afc1eb44b37e438a2f8b212c658874e5 present in it), frozen probe fed by stdin, two counted
runs, node v24.21.0 (same minor the scout ran), TMPDIR pointed into my scratch. No tools installed
or updated; used pre-existing node v24.21.0 and /usr/bin/tar.

## Footer confirmation — both claims reproduce exactly

- Before at a58b7f72: `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS` — CONFIRMED.
  The only kill is `resolved>0` (the round-40 pin, 63/64); every other mutant passes 64/64.
- After at 4e58bb0e: `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS` — CONFIRMED.
  All 16 killed, control 75/75 (64 + 11 hermetic cases, matching the lesson's 64→75).
- My two full outputs match the lane receipts `.ufo/waves/round-41/final/cite-mutants-open-a58b7f72.txt`
  and `cite-mutants-measured-4e58bb0e.txt` line-for-line (18/18 lines each, including per-mutant
  exit/cases/fail_lines). The 68db3419 receipt has the identical 17 outcome lines and differs only
  in its rev field — consistent with 4e58bb0e being a later measured revision of the same build.

## Anchor fidelity — the probe's 16 are the scout's 16, not easier stand-ins

- Id set and order: the probe's M[] ids equal the 16 ids in the first line of
  `.ufo/waves/round-40/build/ScoutCiteVerdict.md` one-to-one (warn-total, resolved-kind-gate,
  strict-conjunct, strict-warn-arm, resolved>0, citeCheck-map, render-env-empty, render-env-zero,
  exit2-empty, exit2-zerores, exit0/1-map, parse-64, suite-group-verdict, suite-any-fail,
  suite-exit-json, suite-exit-text). The set correctly excludes the scout's pinned rows (error arm,
  `!drift`, `kind !== 'dir'` fail-closed) and the equivalent `filesScanned > 0` row.
- Uniqueness: every anchor occurs exactly once in `scripts/cite-check.mjs` at BOTH revisions —
  probe-enforced (occurrences=1 else `nomatch`; both runs nomatch=0) and independently re-checked
  with a scratch counter (32/32 unique). Main-flow anchors sit at identical lines in both revs
  (1581, 1583, 1589 ×2, 1590, 1595, 1626 ×2); suite/exit anchors at a58b: 2511, 2514, 2525-2526,
  2542-2543, 2552, 2567-2568, 2575; at 4e58: 2604, 2607, 2618-2619, 2635-2636, 2645, 2660-2661,
  2668 — the shift is exactly the added test cases, so the mutated constructs did not move.
- Semantics: each replacement is the minimal single-condition drop of exactly the condition the
  scout's section C row names: warn-total → `{}`; resolved-kind-gate removes only the
  `f.kind === 'OK'` gate; strict-conjunct keeps `totals.warn > 0` and drops only `opts.strict`;
  strict-warn-arm keeps the error arm and drops only the strict-warn arm; resolved>0 drops only
  that conjunct; citeCheck-map forces CLEAN; the two render arms and two exit-2 arms each flip one
  ternary arm to `false` leaving the sibling arm intact; exit0/1-map forces 0; parse-64 → 0; the
  four suite rows force per-group/overall PASS or return 0. No anchor hits dead code, a weaker
  proxy, or a neighbouring condition.
- Kill mechanism is real, not rigged: `KUMITATE_CITE_SELFTEST_INJECT_FAIL` is read only inside
  `selfTest()` (line 2457 at 4e58bb0e; the only other `process.env` read is `UFO_SRC` at 117); the
  injected child pushes one failing case and SKIPs the two self-observation cases (lines
  2456-2462), so it cannot recurse. The four suite-* kills come from the parent's self-observation
  cases asserting a child `VERDICT: FAIL` + exit 1 in text and in `--json`.

## Residual (nuance, not a refutation of the footers)

- Observer nuance: three mutants are killed only through per-case `FAIL ` lines / `n<m` while the
  process still exits 0 — suite-group-verdict and suite-any-fail print `VERDICT: PASS` exit=0
  (73/75), suite-exit-text prints `VERDICT: FAIL` exit=0 (74/75); suite-exit-json is killed with
  exit=1. Under an exit-code-only observer that is 3/16 survived. This is inside the probe's own
  documented kill definition (header: killed = non-zero exit OR a `FAIL ` line OR `VERDICT: FAIL`
  OR fewer passed than ran), so the footers are honest under it; the consumer caveat is already
  routed by CritC1Statement.
- The counter observes `--selftest` only; the scout's document-mode fixtures (section C/E) are not
  in the counter — a limit the lane already records.
- Probe provenance: committed cb2d8d09 (2026-10-22 14:03:18 -0300), descendant of a58b7f72
  (12:53:25) and ancestor of 4e58bb0e (14:11:25); bytes identical at cb2d8d09 and tip
  (sha256 7e58ee47261d6047dd28288d349ea93085e2c7ae1df6f5ead5ec4bb070762dc4). The file does not
  exist at a58b7f72 (74-line insert between the two revs); it is stdin-fed, so the before-run is
  unaffected and "committed before its first counted run" holds.

## Evidence

```
$ git clone -q --no-hardlinks …/kumitate-shokunin …/seats/ReProbeC1/lane && git -C …/lane checkout -q --detach 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3
→ HEAD = 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3
$ TMPDIR=…/seats/ReProbeC1/tmp node --input-type=module - --lane …/lane --rev a58b7f72afc1eb44b37e438a2f8b212c658874e5 < …/probe/cite-verdict-mutants.mjs.txt
CONTROL unmutated PASS exit=0 cases=64/64 fail_lines=0
MUTANT warn-total survived exit=0 cases=64/64 fail_lines=0
MUTANT resolved-kind-gate survived exit=0 cases=64/64 fail_lines=0
MUTANT strict-conjunct survived exit=0 cases=64/64 fail_lines=0
MUTANT strict-warn-arm survived exit=0 cases=64/64 fail_lines=0
MUTANT resolved>0 killed exit=1 cases=63/64 fail_lines=1
MUTANT citeCheck-map survived exit=0 cases=64/64 fail_lines=0
MUTANT render-env-empty survived exit=0 cases=64/64 fail_lines=0
MUTANT render-env-zero survived exit=0 cases=64/64 fail_lines=0
MUTANT exit2-empty survived exit=0 cases=64/64 fail_lines=0
MUTANT exit2-zerores survived exit=0 cases=64/64 fail_lines=0
MUTANT exit0/1-map survived exit=0 cases=64/64 fail_lines=0
MUTANT parse-64 survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-group-verdict survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-any-fail survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-exit-json survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-exit-text survived exit=0 cases=64/64 fail_lines=0
CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS rev=a58b7f72afc1eb44b37e438a2f8b212c658874e5
$ TMPDIR=…/seats/ReProbeC1/tmp node --input-type=module - --lane …/lane --rev 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 < …/probe/cite-verdict-mutants.mjs.txt
CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0
MUTANT warn-total killed exit=1 cases=72/75 fail_lines=3
MUTANT resolved-kind-gate killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-conjunct killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-warn-arm killed exit=1 cases=73/75 fail_lines=2
MUTANT resolved>0 killed exit=1 cases=74/75 fail_lines=1
MUTANT citeCheck-map killed exit=1 cases=73/75 fail_lines=2
MUTANT render-env-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT render-env-zero killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-zerores killed exit=1 cases=74/75 fail_lines=1
MUTANT exit0/1-map killed exit=1 cases=74/75 fail_lines=1
MUTANT parse-64 killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-group-verdict killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-any-fail killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-exit-json killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-exit-text killed exit=0 cases=74/75 fail_lines=1
CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3
```

Scratch: /fast/scratch/hyaku/kumitate-r41/seats/ReProbeC1/ (lane clone, anchors.mjs/anchors.txt,
cite-4e58.mjs, cite-a58b.mjs, before-a58b7f72.txt, after-4e58bb0e.txt). Read-only seat: no patch,
no lane writes except this report, no jj/git state touched in the fleet lane.
