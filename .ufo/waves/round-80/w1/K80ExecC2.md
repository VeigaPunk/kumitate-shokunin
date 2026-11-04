# K80ExecC2 — independent re-implementation of claim C2 (coverage:omp snapshot default)

Seat: K80ExecC2 (wave 1, kumitate round 80, lane `kumitate-shokunin`).
Assignment: re-implement plan §C2 from the plan text and `probe80-c2.mjs` only, in my own clone at
freeze `c6a7ebd3bd01ec34b2f9349a6756886c5dd85982`; re-capture/re-pin the clone; score with the
frozen counter; diff against the lane scaffolding version `6d03402fddf44cc9797ec590f0f888e933db4677`.
No lane tracked file was edited; nothing was committed. Tooling authorization used: **none** — no
tools installed or upgraded (node/git already present; nothing else was needed).

## What was implemented (clone `scripts/proxy-check.mjs`, written from plan §C2 + the frozen counter)

1. **Snapshot default.** With no explicit receipt and no live opt-in, the O terms read the committed
   receipt `<--self>/.ufo/pins/omp-shape.json` (`censusEntries(shape, note)`), disclosed
   `source=snapshot` in the JSON body and as `; source=snapshot` on the verdict line.
2. **`--omp-live` opt-in.** New flag; live read via the existing `census(root, note)` path, disclosed
   `source=live`. Per the plan's "explicit `--omp-live`/`--omp-root` opt-in", `--omp-root DIR` also
   opts into the live read (root override); env `OMP_AGENT_ROOT` alone does **not** opt in (probe arm 1).
3. **Fail-closed absent/corrupt receipt.** Default receipt unreadable → `OMP_SHAPE_NOT_FOUND` exit 2;
   invalid JSON/contract → `OMP_SHAPE_INVALID` exit 2; never a silent live fallback. Loaded after
   `SELF_NOT_A_DIR`, before every other check (probe arm 5 uses an empty `--self` with no scorecard).
4. **Disclosure plumbing.** `opts.ompSource` computed in `parseArgs` (`snapshot` for explicit
   `--omp-shape` and for the default; `live` only for the opt-ins); `renderVerdict` tail and both JSON
   bodies always carry `source`; `--omp-live` + `--omp-shape` → usage 64.
5. **Selftest.** 5 new hermetic arms (default-answers-with-dead-live-root, absent-receipt-fails-closed
   while a valid live root is pointed at via env — the no-silent-fallback discrimination,
   corrupt-default-receipt, `--omp-live` clean read, `--omp-live`/`--omp-shape` exclusivity); 15
   literal verdict-string assertions updated for the now-always-on `source=` tail segment.
   Result: `PROXY_SELFTEST: 164/164 pass` (`selftest-164.txt`), census `VERDICT: PASS (89 cases)`.

## Step 1 — clone re-measure (receipt + stanza), clone reads MATCH

- `node <clone>/scripts/omp-census.mjs --snapshot <clone>/.ufo/pins/omp-shape.json` →
  `OMP_SNAPSHOT: WROTE entries=65 sha256=84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435`
  — **byte-identical to the lane's pinned receipt** (same sha as `.ufo/pins/omp-shape.json` at the
  lane): independent recapture reproduced the pinned bytes exactly.
- Clone stanza re-pin (`SCORECARD.md` in my clone only): `A=884→886` (the two frozen `probe80-c*.mjs`
  are runnable and counted), `C2=194→195`, `C2_total=194→195` (adopted the r79 verifier-spotcheck
  README row, byte-copied from the lane's adopted row), `O_members=64→65`,
  `pin.omp-shape→84e41b9f…`, `pin.proxy-check→be40a71dd5e7a5da4a09451ae08616d239d69916c5179aec0ade8ecbbe543573`.
- Clone verdicts (receipts in this directory):
  - default: `PROXY: MATCH (A=886 C=39 operability=9; … O=1/1 O_members=65 O_findings=0 O_bound=35
    coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)` exit 0
    (`clone-match-snapshot.txt`)
  - `OMP_AGENT_ROOT=/nonexistent`: identical MATCH, `source=snapshot` exit 0 (`clone-match-offline.txt`)
  - `--omp-live` (real root): MATCH, `source=live`, `O_members=65` exit 0 (`clone-match-live.txt`)
  - `--omp-live` with bogus root: `PROXY: FAIL-CLOSED (OMP_ROOT_NOT_A_DIR)` exit 2
    (`clone-live-bogus-root-failclosed.txt`)

## Step 3 — frozen counter `probe80-c2.mjs`

- **Specified command** (`--tool <clone> --lane <lane>`), this run:
  `C80_C2: HELD held=8/12`, exit 1 (`c2-probe-run1.txt`). The four FAILs (arms 1, 3, 10, 12) are
  **all and only** `A_DRIFT` on the lane tree: declared `A=886`, computed `A=889`. Every
  O-semantics assertion inside those arms held (`source=snapshot`, `O_members=65`, `O_findings=0`,
  `coverage_omp=10`, correct findings kinds); the arms fail solely on the full-MATCH exit code.
  **Cross-check:** the lane's own instrument (its working `scripts/proxy-check.mjs`, byte-identical
  to the 6d03402 version) reads the identical drift on the identical tree:
  `A: declared=886 computed=889 delta=+3` (`a-drift-crosscheck.txt`). Root cause, named: three
  runnable files deposited in the lane tree by seat K80LabratC2's report directory —
  `.ufo/waves/round-80/w1/K80LabratC2/{materialize.mjs,run-matrix.sh,summarize.mjs}` — exactly the
  "a new runnable file in the lane tree changes the frozen `A` term" harm the seat rules warn about.
  This is lane working-tree state mid-wave (`.ufo/waves/round-80/close/` already exists), not an
  instrument difference; I flagged it to K80LabratC2 and left their files untouched.
- **Same counter, self-consistent tree** (`--tool <clone> --lane <clone>`, the clone re-measured at
  step 1): **`C80_C2: HELD held=12/12`, exit 0** (`c2-probe-selflane.txt`) — all arms including the
  discriminating arm 1 vs 2 (same 68-member fixture: default MATCH `source=snapshot O_members=65`;
  `--omp-live` DRIFT `source=live O_members=68` with `O_MEMBERS_DRIFT`), arm 3 offline MATCH, arm 5
  `OMP_SHAPE_NOT_FOUND` exit 2 (JSON `"source": "snapshot"`), arm 7 `O_MEMBERS_DRIFT declared=64`,
  arm 8 `O_findings=1 coverage_omp=9`, arm 10 (`added=3`, proxy stays MATCH), arm 12 live MATCH.
  Expectation: against the lane at M (after the close re-measures the stanza, or if the labrat
  scripts move to scratch), the specified command reads 12/12 unchanged.
- **Run 2 — same specified command, after K80LabratC2 removed its three scripts from the lane tree**
  (their measurement: `terms.A=886`, `PROXY: MATCH`; my tool byte-rebuilt from the saved diff against
  the `git show 6d03402:scripts/proxy-check.mjs` base, sha-verified `be40a71d…` identical before the
  run): **`C80_C2: HELD held=12/12`, exit 0 against the lane** (`c2-probe-run2.txt`). All twelve arms
  pass with the lane as `--self`: the discriminating arm 1 vs 2 (same 68-member fixture — default
  MATCH `source=snapshot O_members=65`; `--omp-live` DRIFT `source=live O_members=68` with
  `O_MEMBERS_DRIFT`), arm 3 offline MATCH, arm 5 `OMP_SHAPE_NOT_FOUND` exit 2 (JSON
  `"source": "snapshot"`), arm 6 `OMP_SHAPE_INVALID` exit 2, arm 7 `O_MEMBERS_DRIFT declared=64`,
  arm 8 `O_findings=1 coverage_omp=9`, arm 9 census-equality `65/0/35`, arm 10 (`added=3`, proxy
  default stays MATCH), arm 11 both selftests, arm 12 live MATCH `source=live O_members=65`.

## Step 4 — diff vs lane `6d03402` (`proxy-check-c2-vs-lane-6d03402.diff`; 432 lines, base 3409 → mine 3436)

Both implementations make the identical semantic move (receipt default, disclosed source, explicit
live opt-in, fail-closed absent receipt). Three behavioral micro-differences, none exercised by any
frozen arm:

1. **`--omp-live` + `--omp-root` combined.** Lane: usage 64 (the two live knobs are mutually
   exclusive). Mine: allowed — `--omp-live` with an explicit `--omp-root` reads that root, `source=live`.
   Plan wording ("explicit `--omp-live`/`--omp-root` opt-in") is satisfied by both; the lane's hard
   exclusivity is the stricter fail-closed reading and I would keep it if the parent prefers one
   line of delta.
2. **Default-receipt load position.** Lane resolves the default receipt path in `parseArgs`, so the
   load precedes the `SELF_NOT_A_DIR` check (`--self <nonexistent>` reports `OMP_SHAPE_NOT_FOUND`).
   Mine loads after the self check, so a nonexistent `--self` reports `SELF_NOT_A_DIR`. Both exit 2;
   probe arm 5 (existing empty dir) behaves identically. Mine gives better diagnostics for a typo'd
   `--self`; the lane's is the smaller diff.
3. **Selftest arm shapes.** Lane discriminates default-vs-live by adding a member to the fixture root
   (snapshot 26 MATCH vs live 27 DRIFT); mine discriminates by pointing `OMP_AGENT_ROOT` at a
   nonexistent root in the default arm (proves the live root is untouched) and adds a
   corrupt-default-receipt `OMP_SHAPE_INVALID` arm the lane covers only via explicit `--omp-shape`.
   Equivalent coverage: lane 163-style arms vs my 164, all passing on both sides.

**Which the plan prefers:** the plan's frozen sentences (default = committed receipt, disclosure in
verdict and JSON, explicit live opt-in, absent-receipt fail-closed) are met exactly by both; no
frozen arm or plan clause distinguishes the three deltas. The lane version is the reference the L1
validated; the only place I would converge on the lane's choice is difference 1 (single-knob live
opt-in), purely for strictness — it changes no scored surface.

## Disclosed process note

One edit during implementation briefly clobbered the tail of `runCheck` (swapped old/new strings);
caught immediately by reading the region back and repaired before any run — `node --check` passes
and the final file is self-consistent. Recorded for honesty, no impact on any receipt.

Scratch was deleted after run 1; run 2 required a rebuild of the tool, done mechanically from this
directory's saved diff applied to `git show 6d03402:scripts/proxy-check.mjs` and accepted only after
`sha256sum` returned the recorded `be40a71d…` (byte-identical to the tested file) plus `node --check`.
First rebuild attempt patched the wrong base (the c6a7ebd archive; 9/32 hunks rejected) and was
discarded before any run.

## Files

- Written (lane, my report dir only): this file and `.ufo/waves/round-80/w1/K80ExecC2/`
  (`c2-probe-run1.txt`, `c2-probe-run2.txt`, `c2-probe-selflane.txt`, `selftest-164.txt`,
  `census-selftest.txt`, `clone-match-snapshot.txt`, `clone-match-offline.txt`,
  `clone-match-live.txt`, `clone-live-bogus-root-failclosed.txt`, `a-drift-crosscheck.txt`,
  `proxy-check-c2-vs-lane-6d03402.diff`, `sha256s.txt`).
- Modified (my scratch clone only, never committed): `scripts/proxy-check.mjs`, `SCORECARD.md`,
  `corpus/README.md`, `.ufo/pins/omp-shape.json`.
- Scratch `/fast/scratch/hyaku/kumitate-r80/K80ExecC2/` (run 1) deleted after run 1;
  `/fast/scratch/hyaku/kumitate-r80/K80ExecC2-run2/` (run 2) deleted at yield.
