# Round 72 — the routed plan-before-ready host defect landed (path-form normalization), and the fix's first live map-arm run found the next one

## Gate

Opened this round, capture pinned under `.ufo/waves/round-72/open/captures/`:
- S221 — MSYS2, "Filesystem Paths", https://www.msys2.org/docs/filesystem-paths/, opened
  2026-11-01 (`curl -sL`, 57360 bytes, sha256 `d580e8c0…`, pinned in
  `.ufo/pins/source-captures.json`). Located quote, § Filesystem Paths (12 words): "The
  problem here is that those are in many cases not compatible" — the Cygwin/native boundary
  across which the same directory has non-interchangeable path forms (`C:/nope`, `/c/nope`,
  `C:\nope`); § Manual Unix ⟷ Windows Path Conversion names `cygpath` as the converter (the
  landed fix uses the shell's own `cd && pwd -P`, which needs no external tool and is
  identity on Unix hosts).

Decisions:
- **Admit** S221 (tier A, official MSYS2 project docs) — criterion Q1–Q5: header facts in
  the row, capture pinned and gate-verified (`SOURCE_CAPTURE: CLEAN captures=53`); it
  grounds exactly one claim (C1's normalization mechanism); re-opened live, quote verbatim.
- **Reject** — candidate: fix verifier note N4 by editing the scored v3 counter's header
  line ("scripts/control-replay.mjs is likewise untouched (pin-checked)") in place.
  Criterion missed: the r70/r71 frozen-history rule the lane itself landed (scored counter
  bytes are never amended after scoring; `pin.replay71-probe` `75094e4a…` was re-executed
  green by the non-author verifier — a byte change would invalidate that reproduction).
  Disposition: the erratum lives in the round-71 lesson `## Errata` and the LOG round-72
  entry. **Flip:** a versioned v4 counter (new pin, own red/green receipts) if a
  counter-side change is ever routed for substantive reasons; wording alone does not meet
  that bar.
- Standing rejects re-opened this round: none — the round made one same-round reject
  (above); per Q21 the reject names its criterion and flip.

## Mistakes

- measurement-infra (timeout sizing) · the first green selftest run was wrapped in
  `timeout 300` and was killed mid-suite at case ~29 (29 ok / 0 bad, no summary line) —
  reading that partial output as a result would have been a fabrication risk; the suite's
  honest runtime on this host is ~8–10 minutes (36 fixture cases, Windows process spawn)
  · captured-by: `tail` of the killed run showing no `PLAN_BEFORE_READY_SELFTEST:` summary
  line (`scratch/kumitate-r72/selftest-green-raw.txt`, deleted with the scratch; the
  complete run is `.ufo/waves/round-72/close/pbr72-green-selftest.txt`) · fix: re-run with
  an unbounded budget and treat the summary line as the only verdict; a verdict line's
  absence means "not measured", never "passing so far".
- expectation-coupling (unmeasured prediction) · the plan pre-registered "checklists item
  SKILL.md:744 PASS exit=0; total 8/33" without measuring surface-probe's per-item wall
  cap; measured, the item reads `exit=null wall=120.020` — the probe's own 120 s cap kills
  the now-runnable 39-case suite on this host, the checklist total stays 7/33, and the
  item's failure reason changed (tool-refused-to-run → probe-wall-cap) · captured-by:
  `.ufo/waves/round-72/close/checklists-AFTER.txt` · fix: plan Amendment 2 (the claim's
  pass-sensitive evidence is the gate's own receipts, not the checklist total) and the cap
  is now a named host constraint; a prediction that names a counter's after-value must
  first measure the counter's own operating envelope.

## Routed host defects (discovered or dispositioned this round; both dated, neither silently skipped)

- **plan-before-ready map arm: `UNRUNNABLE reason=ARCHIVE` on win32 (new, routed).** With
  the path-form refusal fixed, the map arm ran on this host for the first time and failed
  closed at round 71's plan: `git archive f4f67ec5 | tar -x` exits 2 because the tree
  contains round-57 SentinelArtifacts attack-fixture symlinks whose targets are absolute
  origin-host paths (`/home/vgpnk/...`); MSYS tar cannot create them here. Diagnosis
  receipt: `.ufo/waves/round-72/close/pbr72-map-archive-diagnosis.txt` (archive exit 0,
  219105280 bytes; extraction exit 2 with per-member symlink errors; member listing). The
  FAIL is the arm's correct fail-closed behavior on an unextractable archive; the repair (a
  disclosed sanitized extraction that still fails closed on real drift, with a hermetic
  case) is routed to a later round as a versioned change. Until then, `--round N` verdicts
  for rounds whose trees carry those fixtures read FAIL `MAP_UNRUNNABLE` on this host, and
  the archived-map arm remains origin-only ground.
- **kimi-census: crashes on win32 node (dispositioned at open, routed).**
  `node scripts/kimi-census.mjs` → `TypeError: process.getuid is not a function` at
  `scripts/kimi-census.mjs:258` (`verify(root, runningUid = process.getuid())`), exit 1 —
  the census cannot run at all on this host (win32 node has no `process.getuid`). Same
  repair class as the routed fix this round landed: versioned change with a hermetic case,
  routed to a later round; until then the kimi-layer census keeps its r70
  different-host disclosure. Companion disposition: `scripts/proxy-check.mjs` reads
  `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src C:\fast\scratch\hyaku\kumitate-pin\src` at open
  (carried from round 70 — the v1 stanza's origin pin is unreachable here); no axis reading
  on this host depends on either tool.

## Round-72 verdicts

C1 (operability, lowest non-retired axis 9 — terminal under the frozen `f_O` proxy;
capability deepening of gate `plan-before-ready`; sourced on S221) **verifies** on the
gate's own receipts: red at base `a615abc…` — CLI refuses BOTH `--repo` path forms
(`--repo is not the repository root`, exit 2; `open/pbr72-red-cli.txt`), the selftest
cannot build fixture 1 (`toplevel mismatch`, exit 2; `open/pbr72-red-selftest.txt`),
checklist item 744 FAIL exit=2 in 0.85 s (`open/checklists-BEFORE.txt`, total 7/33); green
at `e158ee96…` (fix commit, `pin.plan-before-ready` re-pinned `0c7da32a…` → `cb8da6f2…` in
the same commit) — CLI prints real verdict lines on committed history (round 63 PASS
`map=SKIP reason=MAP_PRE_EPOCH_ROUND` exit 0; round 62 FAIL `reason=NO_PLAN` exit 1, the
registry-row-locked shape; round 71 FAIL `MAP_UNRUNNABLE` — the new routed finding above),
the selftest reads `PLAN_BEFORE_READY_SELFTEST: PASS (39/39)` exit 0 including the new
decisive case `repo-path-form-toplevel` (`--repo` in git's own reported form; the receipt
notes "host reports differing path forms … the case is decisive here";
`close/pbr72-green-selftest.txt`), and the committed blob re-hashes to the pin
(`close/pbr72-blob-identity.txt`). Operability integer 9 → 9 (terminal; `f_O` terms
unchanged — an edited `.sh` adds no runnable file and no checklist item). No axis harmed:
coverage rows and the retired aggregate untouched; the coverage:kimi-layer census keeps its
r70 different-host disclosure (and now also its win32-crash disclosure above).
admitted_self: the claim verifies as amended (Amendments 1–2); the two pre-registered
expectations that measured differently (round-71 NA shape; checklist 8/33) are disclosed in
the plan amendments and mined above.
