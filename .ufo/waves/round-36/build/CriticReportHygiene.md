CRITIC report sections=6 missing=8 unresolved-routed=4

Seat KumitateR36.CriticReportHygiene (critic, read-only). The filed report does not exist yet: fleet `.ufo/reports/round-36/` holds only `kotodama.md`, and the report lands last (PROTOCOL.md:119).

I attacked three things:
- the draft `.ufo/waves/round-36/build/ScribeReport.md` (report block :11-91);
- the drafted record in the same dir: ScribeLog, ScribeScorecard, ScribeLesson, ScribeShonen, ScribeSkillProse, ScribeKnowledgeFidelity;
- the live lane working tree at ~02:35 −03.

How the verdict line counts:
- `sections`: prompt §4 sections present in order — 6/6 (:14, :27, :41, :69, :79, :85).
- `missing`: other required report elements absent from the draft — M1–M8 below.
- `unresolved-routed`: round-35 routed defects with neither a landed fix nor a why-not in the draft. The draft dispositions none of RD1–RD4.

"Prompt" means fleet `.ufo/prompts/kumitate-round-36.md`. Impacted axis: operability (report/record hygiene and C1's own evidence).

## Strongest counterexample (RD4 + C1 overclaim)

The gate behind RD4 stays unpinned:
- `scripts/cite-check.mjs:106-120` resolves `$UFO_SRC` → `~/Projects/ufo-fsd-alpha`, and ScoutPinDesign.md:76,83 keeps cite-check "unchanged".
- The working-tree checklist still runs `node scripts/cite-check.mjs` (`SKILL.md:627`), and `SKILL.md:620` says only "Items 3, 8, 10 and 14 are pin-aware".
- So `CHECKLIST: 14/14` keeps one origin-reading verdict, `CITE_CHECK:`. It follows the operator's moving checkout and names no revision — the Q15/RD4 class.

Three drafts nevertheless retire or promise the property:
- ExecChecklistRewrite.md:45-47 says the gap is "retired for the checklist as a whole".
- ScribeSkillProse.md:46-52 says "The remaining gap is … not the revision".
- ScribeLesson.md:69 says "claim-supporting cite runs must print `src-rev=` under PIN v1". PIN v1 does not cover cite-check, so this fix cannot be shown able to fail (§2b.3, prompt :68-72).

Smallest safe correction:
- Narrow SKILL.md:607-609 instead of retiring it, using ConnectorPinConsumers.md:26: "cite-check, round-gate, kimi-census and sources-check still need the commit cited beside the verdict".
- Scope C1's "every verdict line" to the three pinned gates.
- Disposition RD4 as a why-not: the final cite run uses the bound wrapper at ScoutCiteProvenance.md:99-104 (`--src "$SRC"` + printed `src-rev` + JSON `src` on one line), and `cite-check --pin` is pre-registered.

## Missing required elements (missing=8)

- **M1. Routed-defect dispositions are absent.** Violates §6.5 (:376-378): "turn every … routed defect into a lesson-backed QUALITY.md criterion or fix, or say in the report why not". No build item drafts a QUALITY.md criterion (0 build-spec items match `QUALITY`).
- **M2. Non-authored files are not named.** Violates §6.5 (:374-375, "name them"). The draft does not name `corpus/lessons/round-35-verifier-spotcheck.md`, landed by `protocol-shokunin` in `0614092`. The inherited sentence (:23) covers uncommitted outputs only.
- **M3. The planner-seat mapping is absent.** Violates §6.2 (:207-210, "Record that mapping in the report"). It is only in `accounting.md:6`.
- **M4. The L0-questions line is absent.** Violates §5 (:138-140).
- **M5. There is no upstream/cross-domain section.** Violates §5 (:135-137, "upstream work is documented in the report") and PROTOCOL.md:157. ConnectorOutOfProvince.md U1–U3 holds the material: `VERB_UNDECLARED` (`scripts/ufo-sighting.mjs:4484`, manifest `surface.mjs:74`) and the dispatcher state write (`fleet-dispatcher.mjs:42,90,458-462`).
- **M6. The misroot-sweep result is absent.** Violates §6.3 (:312-317). At my read the fleet repo held no kumitate wave file; re-run before filing.
- **M7. The fleet census before/after with exit codes is absent.** Violates §2b.2 (:54-66). The draft substitutes the lane gate `node scripts/sources-check.mjs` (:71-77). No `sources-census.sh validate` output exists anywhere under `.ufo/waves/round-36/` (grep finds only prompt text), so the round-start run is unrecorded. Report it as a conformance defect; never backfill it.
- **M8. The sourced-claim mapping is absent.** Violates §2b.4 (:73-74). The draft never says which claim rests on S029/S030/S031, and claims.md cites no `S###`.

## Trend vocabulary, SHONEN, stale-lane, placeholders

- **"(provisional)" qualifiers.** Every trend carries one (:81-83, 4 hits). §4 (:116-117) and LEARNING.md:28-29 allow exactly one of `improved|harmed|unchanged|unprovable-but-better`.
- **Self-assessed discernment.** `improved` (:83) rests on gate revision-scoping.
  - LEARNING.md:35 measures gate decisions against the outside spot-check.
  - LEARNING.md:42-46 says "a subagent the lane dispatched is still the lane".
  - The r35 closure endorsed `unchanged` pending closure (round-35-verifier-spotcheck.md:161-164).
  - Correction: `unchanged`, with that reason.
- **Expansion needs re-deriving.** `unchanged` (:81) must be re-checked once the entry set is final. ScribeReadmeMap.md:21-23 adds `knowledge/anchor-fidelity-gate.md`, and ScribeSources.md:84 names `knowledge/pinned-evidence.md`. If admitted, both are LEARNING.md:33 observables.
- **SHONEN pointers are placeholders.** The heading and one line per box are present (4/4 per SHONEN.md:5-8), but every pointer is `<pending>` (:87-90). §4 (:118-119) requires a resolvable pointer for `[~]`.
- **SHONEN outside check cannot pass.** ScribeShonen.md:3 proposes "14/14 … src-rev=31c465f1566 on every item line". Item lines print `CHECKLIST PASS SKILL.md:N exit=…`, and item 1 is unpinned.
- **Stale-lane line.** Its content is true (`.ufo/watchdog.log:528` r35 complete, `:533` one r36 launch). But "Progressing evidenced by `<hash-pending>`" (:23) is a placeholder.
- **Placeholders.** The block holds 45 `<pending>`/`<hash-pending>` tokens. Under the §4 marker rule (:121-125), filing needs `grep -cE '<(hash-)?pending>'` → 0 and the tool-installs line (:25) filled.

## Commit-hash citation rule

- **Hash source unstated.** The draft never says hashes come from the helper's `landed <hash>` line after remote verification (§6.4 :328-331), and it lists 7 `<hash-pending>` commit rows (:33-39).
  - Cite the helper lines plus `jj-lane.sh state` (local=remote, ahead=0).
  - If falsify evidence lands later, name W (measured) and T (tip), and show `merge-base --is-ancestor W T` → 0 (PROTOCOL.md:119-123).
- **Broken record chain.** The SCORECARD r36 rows say "measured commit in `LOG.md` round 36" (ScribeScorecard.md:64,70). The LOG draft (ScribeLog.md:3-83) has no measured-commit line. It also drops the standing line "The work commit's hash is cited in the round report (a commit cannot name itself)" (LOG.md:1471, :1628). Violates §2.5 (:22-23).
- **Inconsistent src-rev literal.** Drafts write `31c465f1` (:19, :43) and `31c465f1566` (claims.md:19-20, ScribeLog.md:42-43, ScribeShonen.md:3,5). PIN v1 prints 12 hex: `31c465f15669` (ScoutCiteProvenance.md:1). Paste gate output whole (Q7).

## Evidence pointers that resolve

- **Bare filenames.** The block uses 22 distinct bare filenames (`checklists.txt`, `RevManifestDigest.md`, …). They resolve to nothing from a fleet-repo report. Use lane-root paths (§4 :104-106).
- **Drifted line pointers.** `SKILL.md:620/:625` (:18) already point elsewhere: working-tree line 620 reads "Items 3, 8, 10 and 14 are pin-aware…".
  - Cite `0614092:SKILL.md:620,625` instead.
  - ScribeShonen's `SKILL.md:607-609` and `:613-631` need the same fix.
- **Untracked evidence.** Every `.ufo/waves/round-36/*` path is untracked (`??`) today. Commit baseline/frozen/build/falsify/final before citing them.
- **Operator-checkout baselines.** Two baseline citations come from the operator checkout, which is the default src (`surface-default.txt:2`):
  - The CLAIMS baseline cites `claims-default.txt`.
  - The SURFACE baseline cites "errors=2 default" (:18, :57, :60).
  - This violates Q15 (QUALITY.md:78-81) and claims.md:5-6, which says the checkout is "never read as a measurement source".
  - Cite `claims-pin.txt`/`proxy-pin.txt` instead; they are byte-identical (`cmp`). No write to that checkout's `.ufo` was observed.
- **Unrecorded checklist command.** `checklists.txt` names no src or command (0 hits). Its 11/13 is src-invariant: claims/proxy default==pin, surface FAILs both, and cite exits 0|1 in both. State the command and env.
- **Wrong FIDELITY baseline.** The draft uses the prototype's 588 (:59). The contract-resolver reference reads `anchors=1504 … dead=173 noid=424 nonok=577` (`baseline/fidelity-reference.txt:19`). The delivered arm's pristine-tree baseline is still unobserved (ScribeLog.md:102-105).

## Routed defects (round-35-verifier-spotcheck.md:166-188)

- **RD1 (:168-173): partial.** The arm is planned (working-tree `SKILL.md:640`), but the cited instance — dead own-file anchors that survived the gate — stays ungated.
  - v1 treats `dead` as diagnostic-only.
  - `SECTION_DEAD_ANCHOR` fires only when none of a section's own-file anchors is live (`claims-check.mjs:33,377-380`).
  - The baseline proves the gap: 173 dead anchors with `errors=0` (fidelity-reference.txt:19, claims-pin.txt:27).
  - The report needs this why-not plus the r37 pre-registration (ScribeScorecard.md:103).
- **RD2 (:174-181): fix available, not landed.** ScoutCiteProvenance reproduced 223→182 and 91→30 (rose=0). Four things block landing:
  - Its `fidelity-sweep.mjs` (:123-124) would enter the proxy A walk (r35 report:71, "A_DRIFT 7→8"). Commit it as `.mjs.txt`.
  - The counts are net over 1547→1589 rows, not a cohort (:45-47). That needs an appended correction to LOG.md:1651 (append-only per PROTOCOL.md:125-127); ScribeLog has none.
  - The runs used /tmp clones (:55-56), which Q14 forbids as evidence.
  - In the lesson, captured-by should be Q3 (QUALITY.md:23-26), not "non-author spot-check" (ScribeLesson.md:69).
- **RD3 (:182-184): partial.**
  - Three of the 11 noticed notes have no member section the arm parses, so they are absent from fidelity-reference.txt. They hold 28 anchors: live-surface-probe 18, singleton-and-queue-ownership 9, successor-chain 1 (headings `live-surface-probe.md:23,53,96`, `singleton-and-queue-ownership.md:18,39,50`, `successor-chain.md:15,35,42`).
  - Notice counts are not v1 counts, so "624→0" cannot come from v1. Ops-watchers' notice says 416 against v1 nonok 189 + dead 158 + noid 66; sighting-wall says 22 against 35.
  - ExecFidOps keeps the notice "Re-anchoring is queued" (`ops-watchers.md:9`); no item owns the other ten notices.
  - ScribeScorecard.md:83 says "closed … for the quantity the round-35 entry named". That quantity is the regression metric (SCORECARD.md:1064), which reads 182 at base (ScoutCiteProvenance.md:24).
  - 36 anchors have no repair seat (ScribeLog.md:86-91).
- **RD4 (:185-188): unresolved.** See the counterexample; captured-by is Q15.

## Record statements false as drafted

- **Liveness claim.** "Liveness stays the registry gate's job" (ScribeLog.md:78-79, ScribeScorecard.md:83) and "dead geometry is already the registry gate's" (ScribeKnowledgeFidelity.md:76) are false, per `claims-check.mjs:377-380` and the 173-dead baseline.
- **src-rev claim.** "`src-rev=` on every verdict line" (ScribeReadmeMap.md:31; draft :19) is false for the cite-check, round-gate, kimi-census and sources-check verdicts.
- **Landed-changes table.** The table (:31-39) omits S029–S032, `lessons/round-36.md`, the README rows, the new knowledge entries, the notices and the wave evidence (PROTOCOL.md:156).
- **C2_total mismatch.** ScribeReadmeMap.md:17 needs `C2_total`=83, but the live stanza reads 80 (ScribeScorecard.md:9).
- **Sentinel count.** Build and falsify carry 3 sentinels each, against §6.2's "≤2 sentinel" (:226). Record it as a deviation.

## Commands run (read-only) and outputs

- **Lane status** (`git -C <lane> status --porcelain=v1 --untracked-files=all`): all round-36 wave files `??`. At 02:35 also `M SCORECARD.md SKILL.md corpus/README.md`, 3 notes, 2 scripts, and `?? .ufo/pins/`.
- **Fleet status** (`git -C /home/vgpnk/Projects/shokunin status --porcelain`): `.ufo/watchdog.log`, `.ufo/state/*.report-baseline` and `scripts/hyaku/wave-slot.sh` only; no kumitate wave file.
- **Default vs pin baselines** (`cmp baseline/claims-default.txt baseline/claims-pin.txt`): equal. Proxy default vs pin is also equal.
- **Operator-checkout writes** (`find /home/vgpnk/Projects/ufo-fsd-alpha/.ufo -newermt '2026-10-21 00:47' | wc -l`): 0. The `.ufo` mtime is 2026-10-20 07:12.
- **Pin clone** (`git -C /fast/scratch/kumitate-r36/src cat-file -t 964f443e`): `commit`; HEAD is `31c465f15669f744848bd9f5d56191c5085670f7`.
- **Report block :11-91:** 45 placeholders, 22 distinct bare filenames, 4 `provisional`.
- **Line drift** (`git show 0614092:SKILL.md | sed -n '620p;625p'`): base shows checklist items; the working tree shows pin prose.
- **Notices:** the 11 fidelity notices sum to 624 (11+18+40+416+9+65+9+22+9+1+24).

Tool installs/updates: none. Wrote only this file.
