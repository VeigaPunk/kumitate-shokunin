EXEC fid-routeprobe done before=20 after=0 reps=51

# ExecFidRouteProbe — C1(e) anchor repair for the two probe-cluster notes

Axes: operability (C1 anchor-fidelity debt) + coverage (the notes keep their
internals claims true at the pin). Patch:
`/fast/scratch/kumitate-r36/w/ExecFidRouteProbe.patch` (2 files, +204/−149), cut
from lane `0614092` in `/fast/scratch/kumitate-r36/w/ExecFidRouteProbe/lane`
(branch `r36-execfidrouteprobe`). No other path changed (`git status --porcelain`
lists exactly the two notes). No tool installs.

## Counts (L1 contract amendment applied: both-eligible neighbours => noid)

Harness: `/fast/scratch/kumitate-r36/w/ExecFidRouteProbe/fid.mjs` — imports the
registry gate's own `probeSections` and walks only member sections; nearest left +
nearest right backticked span in the 14-char window, both eligible => `noid`
(never elsewhere/absent); nonok = elsewhere + absent.

| note | before (pristine `0614092`) | after (patched) |
|---|---|---|
| `corpus/knowledge/route-probe-cluster.md` | anchors=80 ok=26 elsewhere=15 absent=5 dead=1 noid=33 **nonok=20** | anchors=81 ok=63 elsewhere=0 absent=0 dead=0 noid=18 **nonok=0** |
| `corpus/knowledge/live-surface-probe.md` | anchors=0 (no registry member section) **nonok=0** | anchors=0 **nonok=0** |

`node fid.mjs <lane> /fast/scratch/kumitate-r36/src --note <rel>` reproduces both
lines. live-surface-probe is topic-form (no `## \`<file>\`` heading), so the fidelity
universe is empty for it; its measurable delta is the cite-check line anchors
below, not a FIDELITY line. The prototype's old right-first numbers (route-probe
nonok=31) are superseded by the amended rule; I did not chase anchors whose repair
would only move an ambiguity from elsewhere to noid.

## route-probe-cluster.md — repairs (37 anchor sites)

Gated non-ok (20/20 repaired to the nearest real occurrence):
- :2-3 `Authorization` absent -> symbol is now `SQLite` (pin line 3: "never reads
  SQLite / token files"); the HTTP-Authorization claim stays prose, unbackticked.
- re-pointed: :1080->1073 persistState; :1164->1157 main; :97->108 --help
  (plus new :101 usage); :61->65 PROBE_CONCURRENCY=8; :784->775 mapPool;
  :41->49 FAILURE_CLASSES; :939->932 assertNoSecrets; :904->897 session_truncated;
  :1037->1030 interpretPersistedHealth; :1191->1184 fatal envelope; :23->:51
  runOmpCatalog adjacency; :100 process.exit(2) on kimi line 100; :123
  targets.some; :193 :31 empty-MODE default; :95/:98 emit/emitRaw; :223
  `targets.every(...)` -> `targets.every` (verbatim substring of pin line 223).
- absent symbols named as upstream removals: `spawnCollect("omp", [...])` ->
  `spawnCollect` (def :669, call site line 804); `ROUTE_TOKEN` -> the shared
  `omp-route-grammar.mjs` reached through `parseRoute` :215 (def) /
  `parseRouteGrammar` :32 (import); `!ok ? 2 : healthy ? 0 : 3` ->
  `!payload.ok ? 2 : payload.healthy ? 0 : 3` (:1178, the verbatim process.exit
  expression).
- dead :1191 -> :1184 (same envelope symbol, now inside the 1188-line file).

Non-gated truth re-points inside member sections: :1117->1110 (pid-timestamp tmp),
:63-65->:67-71 (PARITY block), call-site anchor :813 removed -> "line 804",
:103->:107 parseArgs, :39->:43 DEFAULT_TIMEOUT_MS, :40->:44 MAX_BUFFER,
:45->:49, :506->:497 classifyFailure, :1015->:1008, :1174->:1167 healthy,
plus symbol annotations that make existing anchors checkable (:6-7 reroute, :4-5
fsync+rename, :57-58 printHelp, :28 process.exit(2), :89-90 targetStatus,
:19/:20/:22/:23 constants). File length 1195 -> 1188 L; scope total now states
both censuses (2253 at 964f443e, 2246 at 31c465f1 = 1188+159+147+244+116+392).
Two out-of-section parity anchors :63-65 -> :67-71 (scope paragraph and the
probe-redact member section) and the removals-table inlining sites
:1080/:1117 -> :1073/:1110.

Note header: the round-35 "anchors are true only at the revision each section
states" notice is retired and replaced by a round-36 pin statement
(`31c465f15669f744848bd9f5d56191c5085670f7`, clone `/fast/scratch/kumitate-r36/src`)
that names the fidelity universe as the member sections and marks the appendix
(`## argv surface` onward) as outside it.

## live-surface-probe.md — repairs (14 origin anchors + self-reference rule)

FIDELITY 0/0; cite-check errors for this note 14 -> 0
(`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src`).

Tree labels + self-reference rule now explicit in a round-36 notice: origin cites
measure the pinned clone; lane-owned claims about `scripts/surface-probe.mjs` cite
the lane file by symbol (no line numbers). Applied:
- `--src` default sentence (old host path `/home/vgpnk/Projects/origin-work/...`)
  replaced by the PIN v1 behaviour: pin clone when `--src` is absent,
  `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE` exit 2, `src-rev=<12 hex>` in the
  verdict; no-pin behaviour unchanged.
- Digest: "sorted lib modules" corrected to the declared `digestInputs` order
  (base, argv, observe, surface — `surface.mjs:13-18`, hash at `:31-45`), with the
  lane probe's declared-order concatenation + `DIGEST_ORDER` note stated as a
  lane-owned claim (`checkDigests`), and the false sorted-order
  `SCRIPT_DIGEST_MISMATCH` named as the defect round 36 fixes.
- Origin re-points (all verified by reading the pin):
  `scripts/ufo-sighting:224` -> `:95`; `sync-ufo-contracts.mjs:102/:869` ->
  `:56`/`:475-480` (typed detail `:475-499`); `ufo-sighting.mjs:88-95` ->
  `:4484-4493` (also in "does NOT do"); `surface.mjs:13` -> `:11` imports,
  `:401` -> `:326` spawnSync; dispatcher `14387-14456` -> `9022-9069`,
  `14390` -> `4525-4545` + comment `9024-9028`, `14391-14395` ->
  `sweepOrphanTmpFiles` `8902-8942` called at `8954-8959`, stale
  `emitLedgerModuleTelemetry`/`DURABLE_TELEMETRY_KINDS`/`emitterLatchTouch`
  replaced by `emitLatched` `7326-7348` (console sink, in-memory latches) and the
  status gauge `9042-9047`; digest homes `:43-58` -> `:13-18`/`:31-45` and
  sync `842-851/:853-855` -> `443-456`/report `506-542`; `config/ufo.json:65` ->
  `:55`; NOT-do cites `:88-95` -> `4484-4493`, `14390` -> `9022-9028`, ownerLane
  `:948/:949/:2633` removed (no `ownerLane` in the pin's 2137-line file).
- Pin re-derivations (evidence commands below): digestInputs 28 -> 6, manifest
  errors 79 -> 73, status keys 12 -> 6, lib modules 26 -> 4, verb dispatch line
  list replaced with pin lines (`open:4477 … peek:4683`), `surface` as the one
  upstream `VERB_UNDECLARED` carried as a pinned `KNOWN`, ERROR_CODE_OFF_MANIFEST
  4 occurrences / 3 codes at the pin (`ufo-sighting.mjs:2010/:2468/:4420`,
  `base.mjs:131`). Historical 2026-09-28 values stay dated; bare old hex digests
  were removed because cite-check read them as live pins (PIN_MISMATCH).

## Exact retained evidence

- `node fid.mjs … --note corpus/knowledge/route-probe-cluster.md --detail` on the
  pristine base: 20 non-ok (15 elsewhere + 5 absent), dead 1, noid 33; after: 0.
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src` in the
  patched clone: `SUMMARY: errors=0 warnings=6` / `CLAIMS: MATCH (rows=19 yes=19
  notes=27 sections=175 adv=6)` — identical to baseline `claims-pin.txt`, so the
  edits added no registry finding.
- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src` in the
  patched clone: this note's errors 0 (was 14); route-probe 37 -> 33 (remaining
  are appendix/historical-name citations outside the fidelity universe:
  `atomic-write.mjs`, deleted colocated test files, `daa371583`, and the
  appendix's pre-restructure line numbers).
- Pin facts: `node -e` on `surface.mjs` -> digestInputs 6
  (`scripts/ufo-sighting`, `scripts/ufo-sighting.mjs`, base, argv, observe,
  surface), scriptDigest `sha256:b36559d0…`, errors 73, verbs 12, extras
  register/twin/help; `canonicalJson(surfaceManifest())` =
  `sha256:1064c19a…` = `config/ufo.json:55` pin.
- Dispatcher: `UFO_STATE_DIR=<tmp>/ufo UFO_PENDING_WORK_PATH=<tmp>/ufo/pending-work.json
  UFO_PROJECT_ROOT=/fast/scratch/kumitate-r36/src node …/fleet-dispatcher.mjs status`
  -> exit 0, keys `ok,queue,routing,ledger,ledgerRotation,manifest`,
  `queue.schema ufo-pending-work-v1`, zero files in the temp dir; `status --json`
  -> exit 1 `{"kind":"dispatcher_usage_error","error":"unsupported argument: --json"}`,
  zero files. The pin clone was never written (it is `chmod a-w` and I only read).
- `grep -n 'command === "' scripts/ufo-sighting.mjs` -> the 12 verb lines and the
  3 extras cited; `fail()` scan -> 244 calls / 73 codes;
  `code:` literal scan -> the 4 pin sites above.

## Risks / blockers

- FIDELITY numbers are from my contract harness; the shipped `--fidelity` is
  ExecClaimsFidelity's patch. If its ambiguity rule or eligibility test differs,
  re-run the note lines and compare (route-probe must read nonok=0, anchors=81).
- live-surface-probe now documents round-36 lane behaviour (`--pin`, `--known`,
  mkdtemp dispatcher env, declared-order digest). It must land together with
  ExecSurfacePin/ExecSurfaceKnown/ExecSurfaceDigestOrder/ExecSurfaceDispatcherState,
  otherwise those paragraphs describe unimplemented behaviour.
- The route-probe appendix still carries pre-restructure numbering and deleted
  file names (33 cite errors). It is explicitly outside the fidelity universe in
  the note header; burning it down needs a separate cite pass (not this item,
  and the checklist's citation item accepts exit 0|1).
- No blockers: both notes' member sections read nonok=0 at
  `31c465f1`, and the registry gate is unchanged (MATCH, errors=0).
