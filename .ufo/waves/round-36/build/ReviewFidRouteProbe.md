REVIEW fid-routeprobe anchors=58 self-ref-fail=1 fidelity=5

# ReviewFidRouteProbe — ExecFidRouteProbe patch (route-probe-cluster.md + live-surface-probe.md)

Scope: `/fast/scratch/kumitate-r36/w/ExecFidRouteProbe.patch` (applies clean to
`0614092`, `git apply --check` OK), files read at the executor's lane and the origin
verified only through the pin clone `/fast/scratch/kumitate-r36/src` (HEAD
`31c465f15669f744848bd9f5d56191c5085670f7`). 58 changed anchors re-opened: 24 in
route-probe-cluster.md (range-aware diff vs `0614092`), 34 added in
live-surface-probe.md. `fidelity=5` is the shipped `--fidelity` nonok for
route-probe-cluster; live-surface has no member section and no FIDELITY line (0).

## 1. BLOCKER — the note is not nonok=0 under the frozen FIDELITY v1 predicate

The patch says, in the note itself (route-probe-cluster.md:5-7): "Every
member-section anchor below was re-opened at that pin and now carries its adjacent
on-line symbol, so `node scripts/claims-check.mjs --fidelity` reads `nonok=0` for
this note." That is false. The shipped arm agrees with the frozen rule (right-first,
`next ?? prev`, no ambiguity branch — claims-check.mjs:298-300), and on the patched
lane it reads:

    FIDELITY note=corpus/knowledge/route-probe-cluster.md anchors=81 ok=62 elsewhere=5 absent=0 dead=0 noid=14 nonok=5

with the ratchet active (`.ufo/pins/fidelity-ratchet.json`, ceiling 0):

    FIDELITY  ratchet  RATCHET_NOTE note=corpus/knowledge/route-probe-cluster.md nonok=5 ceiling=0

Cause: the executor measured with a private harness that adds an "Amended FIDELITY
rule" — when both neighbours are eligible it returns `noid`
(`/fast/scratch/kumitate-r36/w/ExecFidRouteProbe/fid.mjs:24-46`). The frozen
contract has no such branch; `noid` is only "no symbol paired". Its report
(`.ufo/waves/round-36/build/ExecFidRouteProbe.md:1`, `before=20 after=0`) and the
note header are therefore measured under a rule the wave does not ship, and its
`before=20` also rewrites the frozen baseline (31).

The five sites are gate-mechanical, not factual — the prose is true but the
right-adjacent span is not on the cited line:
- route-probe-cluster.md:174 `writeVerdict` (`:40`) → pairs `VERDICT_PATH` (8 chars
  right); line 40 is `function writeVerdict(...)`, `VERDICT_PATH` is at 35/42/51/83/92.
- :177 `openTmpExclusive` (`:66`, `O_EXCL`) → pairs `O_EXCL`; line 66 is
  `function openTmpExclusive(tmp)`, `O_EXCL` is at 63/67.
- :192 `COMPILED_REDACT_PATTERNS` (`:33`) → pairs `redact`; line 33 is the
  `COMPILED_REDACT_PATTERNS` assignment, `redact` is at 47/67.
- :206 `FAKE_OMP_DELAY_MS` (`:35`), with `MODE` → pairs `MODE`; line 35 is
  `process.env.FAKE_OMP_DELAY_MS`, `MODE` is at 29/30.
- :210 `catalogHasRoute` (`:60`), while only `SUCCESS_MODES` → pairs
  `SUCCESS_MODES`; line 60 is `function catalogHasRoute(...)`, `SUCCESS_MODES` at 58/300.
Minimal repair: end each note line at the anchor (its intended symbol becomes the
left neighbour), or cite the paired symbol on its own line (O_EXCL→:67,
MODE→:29). No prose truth needs to change.

## 2. MEDIUM — live-surface self-claim about conformance-mode scratch is false

live-surface-probe.md:146-150: "EVERY filesystem mutation in the file
(`mkdtempSync`/`mkdirSync`/`writeFileSync`/`rmSync`) is inside the fixture or
dispatcher-scratch region ... conformance mode creates and removes exactly that one
scratch root and writes nothing under `--src`."

The integrated probe creates **two** conformance-mode roots, not one:
`scripts/surface-probe.mjs:674` `mkdtempSync(... 'kumitate-surface-cache-')` removed
at :690 (`readSightingSurface`), and `:701` `mkdtempSync(... 'kumitate-surface-state-')`
removed at :723 (`readDispatcherStatus`). The sighting-cache root is neither the
fixture nor the dispatcher-scratch region, so both clauses of the sentence are
inaccurate. This is lane-owned (self-reference class): it cites no lane line at all,
and the correct statement is "two roots — one compile-cache root for the shim, one
state root for `status` — both removed; nothing under `--src`".

## 3. PASS — the self-reference citation rule itself is respected

- No anchor anywhere in live-surface-probe.md cites `scripts/surface-probe.mjs:<line>`
  (`grep -n 'surface-probe\.mjs:[0-9]'` → no match): probe internals are cited by
  symbol only, exactly as the note's own rule states.
- No lane-owned claim cites the origin copy as its authority: `checkDigests`,
  `readSightingSurface`/`readDispatcherStatus`, `--pin`/`--known` are cited by symbol
  or by lane path without a line; origin citations stay attached to origin behaviour
  (sync-ufo-contracts, fleet-dispatcher), which is their correct owner.
- The claim "this note has no registry member section, so the fidelity sweep reads
  zero anchors" is correct: `RE_CHUNK_HEAD` requires a heading that *starts* with a
  backticked path; none of this note's headings do, and the shipped sweep prints no
  line for it.

## 4. LOW — route-probe appendix keeps stale numbering and a removed symbol

Header discloses appendix sections "keep their earlier numbering" (route note:8-10),
but the appendix still asserts `ROUTE_TOKEN` as live at
`scripts/probe-ufo-route-health.mjs:209` (route note:229), contradicting the member
section's own "the former in-file ROUTE_TOKEN class is gone upstream" (route note:122);
at the pin :209 is `INVISIBLE_CHARACTERS`. cite-check on the patched note: 34 findings
(pristine HEAD 38), all appendix-side (UNRESOLVED deleted files, LINE_OOR); disclosed
scope, not a fidelity-universe defect.

## Verifications that pass (changed-anchor re-opens at the pin)

- route-probe-cluster.md sizes: 1188/159/147/244/116/392 = 2246 (`wc -l`), and all
  member-section symbols verified on the cited lines (persistState :1073, tmp :1110,
  main :1157, parseArgs :107, usage :101, spawnCollect :669/804, PROBE_CONCURRENCY
  :65, mapPool :775, DEFAULT_TIMEOUT_MS :43, MAX_BUFFER :44, MAX_ROUTES :45,
  FAILURE_CLASSES :49, classifyFailure :497, parseRoute :215, assertNoSecrets :932,
  session_truncated :897, interpret* :1008/:1030, healthy :1167, exit :1178,
  envelope :1184; kimi :2/:3-4/:24/:28/:57-58/:69/:77/:89-90/:100/:119/:123/:140;
  models :40/:81/:108/:110/:196/:221/:223; redact :8/:9/:45/:47/:67/:75/:97/:106;
  fake-omp :10/:29/:30/:31/:35/:47/:58/:60/:95/:98/:174/:177).
- live-surface origin anchors all live and semantically on-line: sync-ufo-contracts
  :56 (host path), :475-480 (spawn `bash host surface --json`), :443-456
  (canonicalJson), :506-542 (checkSightingSurfaceDigest); ufo-sighting :95 (final
  exec), :4484-4493 (surface branch, `--json` required), :2010/:2468/:4420;
  surface.mjs :11/:13-18/:31-45/:48-57/:326; fleet-dispatcher :9022-9069 status
  branch, :4525-4545 writeQueue rename, :8902-8942 `sweepOrphanTmpFiles` called
  :8954-8959, :7326-7348 latch map, :9042-9047 gauge; config/ufo.json:55 pin.
- Recomputed at the pin, independently: `surfaceManifest().scriptDigest =
  sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4`;
  `canonicalJson(surfaceManifest()) =
  sha256:1064c19addf69f294fd46ebbaa3a99298a4fe60eb5241fcb0d1406f1c0ba6bb4` = config
  :55; declared digest order shim,module,base,argv,observe,surface; verbs 12;
  extras `register,twin,help`; errors 73 with 244 `fail("X")` call sites;
  `code:`-literal off-manifest 4 occurrences / 3 codes at exactly the cited lines.
- cite-check: live-surface 15 findings at HEAD → 0 patched; route 38 → 34.
- Registry gate on the patched lane: `CLAIMS: MATCH (rows=19 yes=19 notes=27
  sections=175 adv=6)`, errors=0.

## Residual risk / verification gaps

- [INFERENCE] The shipped FIDELITY arm landed in claims-check.mjs while this review
  ran (02:40); if its pairing changes before integration, re-run. Its current code
  (claims-check.mjs:298-300) is right-first and matches my measurement.
- surface-probe.mjs is being rewritten by sibling executors during the review
  (76395 → 122477 → 91080 bytes between 02:31 and 02:39). The scratch-root finding
  is against the 02:39 bytes`; re-check after ExecSurfacePin settles.
- The executor's `before=20/after=0` figures are not comparable to the frozen
  baseline (31) because of the harness amendment; do not adopt them in the wave
  accounting, and re-run the shipped gate after the 5 anchors are repaired.
- Probe behaviour claims verified live once: `node scripts/surface-probe.mjs --pin
  .ufo/pins/origin.json --known .ufo/pins/surface-known.json` →
  `SURFACE_PROBE: CLEAN (... errors=0 warnings=1 known=1 src-rev=31c465f15669)`,
  exit 0, pin tree `git status --porcelain` unchanged.

## Commands run (read-only apart from /tmp scratch under my own dir)

- `git -C <lane> show HEAD:<note>` / `git diff` / `git apply --check` on the patch.
- `node scripts/claims-check.mjs --self <lane> --src /fast/scratch/kumitate-r36/src --pin .ufo/pins/origin.json --fidelity [--fidelity-ratchet .ufo/pins/fidelity-ratchet.json]`
  → route nonok=5, `RATCHET_NOTE ... nonok=5 ceiling=0`, `FIDELITY: DRIFT`.
- `node <my>/fid-eval.mjs <lane> <pin> route-probe-cluster.md` → TOTAL nonok=5
  (elsewhere=5, absent=0).
- `node <my>/diff-anchors.mjs` (range-aware anchor diff) → route 24 changed
  (19 ok / 4 noid / 1 dead-or-noid diagnostic), live-surface 34 added.
- `node scripts/cite-check.mjs --src <pin>` on pristine HEAD and patched lane.
- `node --input-type=module -e 'import {surfaceManifest} ...'` for digests/counts.
