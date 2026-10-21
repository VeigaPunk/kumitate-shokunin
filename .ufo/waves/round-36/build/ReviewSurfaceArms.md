REVIEW surface-arms cases=61 selftest=61/61 live="SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)"

# ReviewSurfaceArms — the four surface-probe patches as one change set

Basis: read each delivered patch against the frozen DIGEST/PIN/KNOWN/state
contracts; ran each lane's selftest; composed all four in a review scratch clone
(`/fast/scratch/kumitate-r36/w/ReviewSurfaceArms/final2`, four official patches,
9 conflict hunks hand-resolved) and ran the pin+known live scenario. That tree is
a review harness, **not** the L1 artifact. Patch hashes: digest `73c66f9a…`,
dispatcher `64f54075…` (report states the same), known `a1e91936…`, pin `25b6fdb5…`.
At review time the lane has digest+dispatcher+known only: lane `--selftest`
53/53, `grep -c 'loadOriginPin\|src-rev='` = 0 — the pin arm and the claimed
`src-rev=` verdict are not yet in the lane. No installs were needed.

## Per-arm verification

### DIGEST — PASS
`:801` (`concatInputs = setOk ? listedPaths : []`) concatenates declared order;
set equality stays derived from disk. On the pin, declared order (shim, module,
base, argv, observe, surface) gives `sha256:b36559d0…` = manifest.scriptDigest;
sorted gives `sha256:f17d1547…` (the baseline false mismatch). DIGEST_ORDER still
notes the shim→module→sorted-libs divergence. False-negative control (declared
order permuted, digest over sorted → SCRIPT_DIGEST_MISMATCH) is hermetic and
passes. Null entries, duplicates and a short listing land in
DIGEST_SET_INCOMPLETE before any concat is claimed — no pass-without-measure.

### DISPATCHER STATE — PASS, with one addition beyond the item text
`:568-593` spawns `node <src>/scripts/fleet-dispatcher.mjs status`, cwd `<src>`,
UFO_STATE_DIR=`<mkdtemp>/ufo`, UFO_PENDING_WORK_PATH=`<mkdtemp>/ufo/pending-work.json`,
UFO_PROJECT_ROOT=`<src>`, removal in `finally`. Baseline at the pin:
`{"code":"EACCES",…mkdir '…/src/.ufo'}` exit 1; fixed: exit 0 and
STATUS_REACH/SHAPE/QUEUE_SCHEMA ok. It also redirects NODE_COMPILE_CACHE for the
sighting shim (`:542-563`) — not named in the item, but required by C1's “gates
stop writing into the tree they read”: an unredirected writable shim creates
`<src>/.ufo/cache/node-compile/…`. With both redirects a writable pin copy shows
zero list+mtime changes (1341-entry snapshot diff empty); the read-only pin is
unchanged and no `<src>/.ufo` appears. Trade-off (contract-mandated, disclosed):
status is now the empty throwaway-state projection, so queue content is not
scored; shape/schema still are.

### KNOWN — PASS on the shipped file; one allow-list risk (finding 1)
`:343` loadKnown validates contract/revision/exact 4-key entries/duplicates
(`Object.hasOwn(SEVERITY,…)`); `:396` applyKnown matches the exact quad and
excuses only when **all** subjects are listed; `:693` gating excludes only
`known === true`; `:810` KNOWN_STALE is an error. Live matrix: shipped known →
CLEAN known=1 exit 0; no known → DRIFT errors=1; stale extra entry → DRIFT
errors=1 known=1; wrong subject → DRIFT errors=2 known=0; rev mismatch → exit 2
KNOWN_REV_MISMATCH before any tree read; malformed/duplicate/proto-key kind →
exit 2 KNOWN_MALFORMED. CLEAN genuinely requires the expectation to fire. A
writable pin copy with an extra undeclared verb yields subjects {sneaky,surface}:
known excuses `surface` only, prints the KNOWN line **and** an ERROR for the same
finding, verdict `DRIFT … errors=1` — no silent narrowing.

### PIN — PASS
Pin lane `:342` load/shape-check (missing explicit pin = PIN_MALFORMED), `:376`
git HEAD read, `:395` assert, `:407` ` src-rev=<12>` rendered inside the verdict.
Live: matching pin → CLEAN with `src-rev=31c465f15669`; wrong revision → exit 2
SRC_REV_MISMATCH (both revs, no `surfaces=`); non-repo/missing clone → exit 2
SRC_REV_UNVERIFIABLE; git absent (`PATH=''`) → exit 2 SRC_REV_UNVERIFIABLE; bad
JSON/short rev/foreign contract → exit 2 PIN_MALFORMED; explicit `--src` at the
right rev → CLEAN; no pin file → old byte-identical verdict, no `src-rev`;
`--selftest`/`--checklists` never load a pin.

## Findings

1. **MEDIUM — `--known` can excuse a reach or shape finding: CLEAN while the
   check row FAILs.** KNOWN v1 restricts neither kind nor check, and the
   implementation is contract-faithful, but the arm can pass without measuring a
   surface. Reproduced: (a) pin clone with `scripts/fleet-dispatcher.mjs` removed
   + known `{dispatcher, SURFACE_UNREACHABLE, STATUS_REACH, dispatcher}` →
   `CLEAN (… known=2 …)` with STATUS_REACH/STATUS_SHAPE/STATUS_QUEUE_SCHEMA all
   FAIL; (b) dispatcher printing the frozen shape minus `ledgerRotation` + known
   `{dispatcher, STATUS_SHAPE, STATUS_SHAPE, ledgerRotation}` → `CLEAN known=2`
   with `FAIL dispatcher STATUS_SHAPE — missing=ledgerRotation`. The shipped
   `.ufo/pins/surface-known.json` holds only the verb finding, so the wave's live
   verdict is honest; the risk is a changed accept-list. Hardening (next
   revision): restrict excusable kinds to upstream vocabulary and refuse to
   excuse reach/shape/queue-schema findings.

2. **MEDIUM — checklist item 3 does not assert the pin term it claims.**
   `SKILL.md:629` asserts only `SURFACE_PROBE: CLEAN`; `SKILL.md:620-623` says
   items 3/8/10/14 “print `src-rev=`”. Verified in the lane: the exact command
   exits 0 and prints `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0
   warnings=1 known=1)` with **zero** `src-rev=` (pin arm absent). A regression
   dropping pin support keeps the checklist green, so “all items green at the
   pin” does not evidence the pin. Recommend the expected substring be
   `known=1 src-rev=31c465f` or a separate pin item.

3. **MEDIUM (delivery) — the four patches do not compose mechanically.**
   digest+dispatcher apply cleanly on 0614092; known then conflicts in 1 hunk,
   pin in up to 9 (header contract, SEVERITY, opts/main, verdict render, CLI
   selftest; both known and pin add pin-reading helpers). The L1 must hand-merge;
   the resolved composition passed 61/61 and the live scenario, so semantics
   compose. Keep pin-load before known-resolve so a malformed pin refuses as
   PIN_MALFORMED first.

4. **LOW — selftest is not host-portable without git.** Pin fixture cases return
   `{ok:false}` (not SKIP) when git is missing, so `--selftest` FAILs on a
   git-less host; the gate itself correctly exits 2 SRC_REV_UNVERIFIABLE.

5. **LOW — a partially known multi-subject finding prints a KNOWN line and an
   ERROR line for the same finding.** Deliberate, tested, verdict stays DRIFT;
   only a CLI-readability risk.

6. **LOW — pin strictness beyond the contract text.** Uppercase 40-hex revision
   is PIN_MALFORMED (`GIT_REV_RE` lowercase); `resolve(pin.clone)` is
   CWD-relative. The shipped pin is lowercase and absolute.

## Verification gaps
- The L1's final integrated lane file did not exist during review; 61/61 and the
  live verdict come from the review composition. Re-run the lane's own selftest
  and checklist item after integration (pin arm still absent there).
- Checklist 14/14 not run (proxy/fidelity/claims arms are other seats).
- Host coverage: Linux x64, node v24.21.0 only.

## Selected commands / evidence
- Per-lane `node scripts/surface-probe.mjs --selftest`: digest 43/43, dispatcher
  44/44, known 50/50, pin 50/50; composed 61/61 VERDICT PASS.
- `final2` live: `--known .ufo/pins/surface-known.json` → exit 0, CLEAN
  known=1 src-rev=31c465f15669 (header prints pin path + rev); without --known
  DRIFT errors=1; stale entry DRIFT errors=1 known=1; `--strict` follows.
- Pin/known failure matrices above, all exit 2 with `SURFACE_PROBE: FAIL-CLOSED`.
- No-write proofs: read-only pin and writable pin copy both empty `find
  -printf '%P %T@ %s'` before/after diffs; unredirected writable shim creates
  `.ufo/cache/node-compile/…`, so the cache redirect is load-bearing.
- Digest on the pin: declared-order concat `sha256:b36559d0…` = manifest;
  sorted `sha256:f17d1547…`.
