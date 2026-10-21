SIMPL surface added=106 ship=4 evidence=101 delete=1

# SimplSurface — round-36 build-wave scaffold audit (read-only)

Snapshot 2026-10-21T02:32:20-03:00: 106 new lane files = 4 production files
(`.ufo/pins/{origin,fidelity-ratchet,surface-known}.json`,
`corpus/knowledge/pinned-evidence.md`) plus 102 under `.ufo/waves/round-36/`
(44 non-`build/*.md` + 58 seat reports). The L1 integrated `ExecPinFiles` and
`ScribeKnowledgePin` while this audit ran, so the production surface is no longer
untouched: 8 files are modified (`SCORECARD.md`, `SKILL.md`, `corpus/README.md`,
`corpus/knowledge/{live-surface-probe,local-ship,native-admission-detail}.md`,
`scripts/{surface-probe,proxy-check}.mjs`) — classified separately below, since they are
modifications rather than additions. `scripts/claims-check.mjs` is still unmodified.

Class: **ship** = production surface a gate/lane reader consumes; **evidence** = wave
record that should stay but is not consumed; **delete** = should not be committed.
Paths are relative to `.ufo/waves/round-36/` except the production rows, shown lane-relative.

```
git ls-files --others --exclude-standard | sort          # 106 at 02:32:20
find .ufo/waves/round-36 -type f -exec sha256sum {} +    # fixture-copy check
grep -rIn 'build-assignments' --exclude-dir=.git --exclude-dir=.jj .
git diff -U0 -- scripts SKILL.md corpus SCORECARD.md | grep -E '^\+' \
  | grep -E '/fast/scratch|/tmp/|\.ufo/waves|588|577|TODO|FIXME|console\.debug'
git -C /fast/scratch/kumitate-r36/src status --porcelain=v1   # empty
```

No `lsp` device is mounted (`read xd://lsp` → "No such tool"; active devices are core
tools + `ast_edit`/`debug` + the REA MCP set), so the zero-consumer claim below rests on
literal grep, not a semantic reference proof. Recorded as unavailable per protocol.

## Classification

| path | class | reason |
|---|---|---|
| .ufo/pins/origin.json | **ship** | PIN v1 (`kumitate-origin-pin-v1`), revision `31c465f1…`, clone `/fast/scratch/kumitate-r36/src`; JSON-valid, clone `HEAD` matches. Opt-in by design: absent pin = today's default-src behaviour. |
| .ufo/pins/fidelity-ratchet.json | **ship** | FIDELITY v1 ratchet (`kumitate-fidelity-ratchet-v1`), revision = pin, 15 notes + total all `0` — strict expectation, not a fixture of current output. |
| .ufo/pins/surface-known.json | **ship** | KNOWN v1 (`kumitate-surface-known-v1`), exactly the one contracted upstream finding (`sighting/VERB_DISPATCH/VERB_UNDECLARED/surface`), revision = pin. |
| corpus/knowledge/pinned-evidence.md | **ship** | ScribeKnowledgePin's internals note: cited sources (S031 `git rev-parse`, S032 reproducible-builds), the pin contract, three outcomes/exits, reproduction commands, and the stated non-claims. No wave-only helper, no scratch path except the sanctioned clone. |
| accounting.md | evidence | 96 build / 81 falsify seat accounting frozen at dispatch prep. |
| baseline/checklists.txt | evidence | C1 before: `CHECKLIST: 11/13 pass`, lines 620/625 red. |
| baseline/cite-pin.txt | evidence | 182 KB citation-gate run at the pin; before-state for items 618–619. |
| baseline/claims-default.txt | evidence | `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175)` before. |
| baseline/claims-pin.txt | evidence | byte-identical to claims-default.txt — proves `--pin` was a no-op pre-change. |
| baseline/claims-rows.txt | evidence | R5/R7 `form=topic sections=0` + 5 warnings — C2's before row. |
| baseline/fidelity-prototype-v0.txt | evidence | superseded prototype run (different classes/totals); provenance of the definition drift, not a before number. |
| baseline/fidelity-prototype-v1.mjs.txt | evidence | authoritative prototype source, `.txt`-wrapped (no shebang, mode 644, nothing imports it); contract keeps it. |
| baseline/fidelity-prototype-v1.txt | evidence | authoritative before: `anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588`. |
| baseline/fidelity-reference.mjs.txt | evidence | second (L1) implementation; header says never production; not imported anywhere. |
| baseline/fidelity-reference.txt | evidence | second implementation run: `anchors=1504 nonok=577` — kept, non-authoritative (hazard 1). |
| baseline/kimi.txt | evidence | kimi census before. |
| baseline/proxy-default.txt | evidence | `PROXY: DRIFT` before (C2_total 79/80, AXES 10 vs 9). |
| baseline/proxy-pin.txt | evidence | byte-identical to proxy-default.txt — proves `--pin` was a no-op pre-change. |
| baseline/roundgate35.txt | evidence | round-35 close audit, 80 B. |
| baseline/roundgate-tracked.txt | evidence | tracked-tree round-gate run before, 71 B. |
| baseline/rows.json | evidence | registry row snapshot (19 rows) used to plan R5/R7; no production consumer. |
| baseline/selftest-cite.txt, baseline/selftest-claims.txt, baseline/selftest-kimi.txt, baseline/selftest-proxy.txt, baseline/selftest-roundgate.txt, baseline/selftest-sources.txt, baseline/selftest-surface.txt (7 files) | evidence | hermetic-suite outputs before; proxy reads 104/104. |
| baseline/sources.txt | evidence | sources gate before. |
| baseline/surface-default.txt | evidence | default-src probe before (2 errors); names `/home/vgpnk/Projects/ufo-fsd-alpha` — pre-pin default only, never a measurement source (hazard 2). |
| baseline/surface-pin.txt | evidence | pinned probe before (3 errors incl. `SURFACE_UNREACHABLE`); authoritative surface before-state. |
| build-assignments.json | **delete** | 4,841 B `{name: agentId}` map, 96/96 exactly equal to `build/swarm-registry.json` `members[*].agentId` (ndiff=0), zero consumers. Delete at wave close (proof below). |
| build/*.md (58 seat reports at snapshot; 43 named here — ConnectorChecklistConsumers, ConnectorOutOfProvince, ConnectorPinConsumers, ConnectorScorecardTerms, ExecChecklistRewrite, ExecClaimsPin, ExecPinFiles, ExecProxyPin, ExecR5Sections, ExecR7Sections, ExecReadmeRow, ExecSurfaceDigestOrder, ExecSurfaceDispatcherState, RevChecklistSelf, RevDispatcherStatus, RevManifestDigest, ReviewFidS8Counts, ScoutClaimsPin, ScoutFidRouteProbe, ScoutFidSighting, ScoutKnownFindings, ScoutPinDesign, ScoutProxyAxes, ScoutProxyC2, ScoutProxyPin, ScoutR5Members, ScoutR7Members, ScoutSourceGitRev, ScoutSourcePytest, ScoutSourceRepro, ScoutSurfaceDigest, ScoutSurfaceReach, ScoutUpstreamVerb, ScribeKnowledgeFidelity, ScribeKnowledgePin, ScribeLesson, ScribeReadmeMap, ScribeReport, ScribeScorecard, ScribeShonen, ScribeSkillProse, ScribeSources, SimplSurface; the rest are seats that reported after this listing) | evidence | one verdict-plus-findings report per seat (incl. this audit); round-35 committed 98 such build reports. |
| build/swarm-registry.json | evidence | live wave ledger; round-35 committed `falsify/swarm-registry.json`, same precedent. Mutable state, never a production input. |
| build-dispatch.json | evidence | one batched task call + registry skeleton (`agentId: null`); dispatch record. |
| build-spec.json | evidence | item prompts; source of the dispatch (round-35 precedent). |
| claims.md | evidence | frozen C1/C2 claims, before/after numbers, counting commands. |
| evidence/c2-simulation.txt | evidence | C2 arithmetic pre-check (R5=4, R7=5, distinct 92, score 10). |
| falsify-plan.md | evidence | falsify-wave plan. |
| falsify-spec.json | evidence | falsify-wave item spec (round-35 precedent). |
| frozen/lane-files.sha256, frozen/scripts.sha256, frozen/lane-tip.txt, frozen/pin.txt, frozen/notes-list.txt, frozen/R5-members.txt, frozen/R7-members.txt, frozen/R-runtime-count.txt, frozen/S-script-count.txt (9 files) | evidence | frozen run inputs: digests, lane tip `0614092e0804…`, pin rev/path, note population, R5/R7 populations, counts. |

Counts: 106 added = 4 ship + 101 evidence + 1 delete.

## Production surface (class ship: 4 additions above + 8 modifications)

Eight modified files, all contract work: `scripts/surface-probe.mjs` (+610/−…) and
`scripts/proxy-check.mjs` (+341) carry the DIGEST/DISPATCHER/PIN/KNOWN arms and the origin
pin; `SKILL.md` the 14-item checklist; `corpus/README.md` the C2 row;
`native-admission-detail.md`/`local-ship.md` the 9 R5/R7 member sections;
`live-surface-probe.md` the digest-order doc; `SCORECARD.md` the round-36 row.
Scaffold scan of every added line: no `.ufo/waves` reference, no hardcoded baseline totals
(`588`/`577` absent), no `TODO`/`FIXME`/`console.debug`, no new file under `scripts/`.
`/fast/scratch` appears twice and both are inert: the documented counting command in
`SCORECARD.md` (round-35 precedent) and a selftest fixture that points at
`/nonexistent/kumitate-r36/src` inside a `mkdtemp` (`surface-probe.mjs` — hermetic, no
lane or pin write). Nothing to delete here.

## The one delete candidate

`build-assignments.json` is a duplicate authority, not provenance:

- Derivation: `{k: v['agentId'] for k, v in build/swarm-registry.json.members.items()}`
  equals the file exactly — 96 members, 96 entries, `ndiff=0`, 0 null ids.
- No caller: `grep -rIn 'build-assignments'` over the lane and over the fleet root
  (excluding this lane) returned no hits; the only occurrence anywhere is an unrelated
  sibling lane's session log (kasegi round 23, same bookkeeping habit). Round-35 shipped
  no such file.
- Strict subset of registry fields (name→agentId only), so nothing is lost.

**Hold until wave close:** the L1 may read it while routing; the registry it duplicates is
the file the L1 actually reads. Recovery:
`python3 -c 'import json;print(json.dumps({k:v["agentId"] for k,v in json.load(open(".ufo/waves/round-36/build/swarm-registry.json"))["members"].items()},indent=1))'`.

## Kept deliberately, with hazards the falsify wave must not trip on

1. **Two "before" authorities for FIDELITY.** `fidelity-prototype-v1.txt` (anchors=1530,
   nonok=588) is the contract's before; `fidelity-reference.txt` (anchors=1504,
   `FIDELITY_TOTAL … nonok=577`) is a second implementation. Only 588 is admissible —
   never cite the reference as before number or after oracle.
2. **Pre-pin default evidence names the operator checkout.** `surface-default.txt:2` reads
   `src=/home/vgpnk/Projects/ufo-fsd-alpha`; that is the condition the pin removes, not a
   measurement source. `surface-pin.txt` is the authoritative before; `frozen/pin.txt` and
   `.ufo/pins/origin.json` are the only legitimate homes for the scratch clone path.
3. **Two byte-identical baseline pairs** (`proxy-default`≡`proxy-pin`,
   `claims-default`≡`claims-pin`). Not redundant: together they record that `--pin`
   produced identical output before the implementation — the before-half of the PIN claim.

## Hygiene checks (all clean)

- Fixture copies: sha256 of all 102 wave files vs all 344 tracked lane files — zero matches.
- No wave file is executable, has a shebang, or is a symlink; no `*.orig`/`*.rej`/`*~`/
  `*.tmp`/`*.bak` in the lane. The only JS is `.mjs.txt` evidence; `scripts/` gained no new
  file.
- Secrets scan (token/key/private-key/Bearer) over the wave, pins and the new note: two
  hits, both prose — `ScoutR5Members.md:15` and `SentinelSecrets.md:33` quote the upstream
  credential-shape *needles* (`dashscope_api_key=`, `sk-`/`xoxb-` prefixes); no credential
  value is present.
- Pin tree `/fast/scratch/kumitate-r36/src` is `dr-xr-xr-x`, `git status` empty,
  `HEAD=31c465f15669f744848bd9f5d56191c5085670f7` — no scaffold written into it.
- Empty `falsify/` and `final/` dirs are not files. No tool installs were needed.

## Preserved contract

Additions are confined to `.ufo/waves/round-36/` plus the three contracted pin files; no
gate or doc reads the wave directory. The one deletion removes a derived index; registry
membership, the pin literals, prototypes and baseline dumps stay. The next deletion would
harm an axis: removing the prototype/reference pair would destroy the only record of the
definition drift being corrected.
