SKILL-CITATION lines=39 must-change=20 historical=19

# ConnectorSkillCitations — SKILL.md / SCORECARD.md citations the C1/C2 edits change

Read-only seat. Scope: `SKILL.md` + `SCORECARD.md` at lane tree `0614092e` and the round-36
baseline (`.ufo/waves/round-36/baseline/`). `lines` = table rows; a row may cover a contiguous
span or a line set. Lane cwd for every command below:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

## Two literals in the item do not exist in either file

- `CHECKLIST: 11/13` — **0 occurrences** in SKILL.md/SCORECARD.md (`grep -n '11/13' SKILL.md
  SCORECARD.md` → no output). It lives only at `.ufo/waves/round-36/claims.md:13` and
  `.ufo/waves/round-36/baseline/checklists.txt:14`. The live structural claim is
  `SCORECARD.md:54` ("the list has 13 items since round 34"), which the C term forces to 14.
- `sections=175` — **0 occurrences** in SKILL.md/SCORECARD.md. Only `LOG.md:1624` (round-35
  after-measurement) and `baseline/claims-{default,pin}.txt`. Post-C2 the live total is **184** by
  arithmetic, not observation: baseline per-row sections S `1+8+2+5+2+5+6+60=89`, R
  `8+12+5+6+0+4+0+4+4+2+41=86` ⇒ 175; R5+R7 add 9. **Do not** edit LOG.md:1624 to 184.

## Must change in the same commit (20)

| # | path:line | literal now | required change / why |
|---|---|---|---|
| M1 | SKILL.md:9 | origin repo ``/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`` | Dead path: SCORECARD.md:765 records "origin tree moved … is gone". After C1 the source of record is `.ufo/pins/origin.json` (repo `ufo-fsd-alpha`, rev `31c465f1…`, clone `/fast/scratch/kumitate-r36/src`). Prose naming the dead literal contradicts every `src-rev=31c465f1` verdict. |
| M2 | SKILL.md:600 | surface-probe entry `[--checklists]`; pinned values "…outside this repo — named gap" | Add `[--pin FILE] [--known FILE]`; pinned values gain `.ufo/pins/origin.json` + `.ufo/pins/surface-known.json`. The digest-pin gap clause may stand (the pin lives in the origin tree) but must name the pin file that fixes the revision. |
| M3 | SKILL.md:602 | proxy-check entry `[--strict]` | Add `[--pin FILE]`; pinned values gain `.ufo/pins/origin.json`. |
| M4 | SKILL.md:603 | claims-check entry `[--row ID] [--strict]` | Add `[--pin FILE] [--fidelity] [--fidelity-ratchet FILE]`; pinned values gain `.ufo/pins/fidelity-ratchet.json`. |
| M5 | SKILL.md:607-609 | "no verdict line names the revision it measured — cite the commit beside the verdict instead." | Falsified by C1's core claim; this is the *only* prose sentence that states the opposite of C1. Replace with: every gate verdict carries `src-rev=<12 hex>` when a pin is active. Leave the "two evidences frozen-snapshot" half of the paragraph alone (still true). |
| M6 | SKILL.md:620 | `node scripts/surface-probe.mjs` → exit 0 + `SURFACE_PROBE: CLEAN` | Baseline FAIL is exactly this item (`checklists.txt:` `FAIL SKILL.md:620 … substring=miss`, exit 1). The only expected finding is upstream `sighting/VERB_DISPATCH VERB_UNDECLARED surface`; the command must pass `--known .ufo/pins/surface-known.json` (default pin supplies `--pin`). |
| M7 | SKILL.md:618-630 (insertion) | 13 `- [ ]` items (`grep -c '^- \[ \]' SKILL.md` → 13) | Add item 14: `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → exit 0 + `FIDELITY: CLEAN`. Order is free (the executor runs file order); placing it after :627 keeps the claims arms together. |
| M8 | SCORECARD.md:54 | "the list has 13 items since round 34" | 14 since round 36. Preferred mechanism per this file's own convention (326, 469): append a dated round-36 correction; keep the 9/13 snapshot on 55-58. |
| M9 | SCORECARD.md:285 | `C=13` | `C=14`. `proxy-check` re-derives C from `SKILL.md` (SCORECARD:39-40); a checklist edit without this line is a live `C` drift, not a doc nit. |
| M10 | SCORECARD.md:288 | `C2=79` | Must equal the live README map: round-open drift is `C2_TOTAL_DRIFT declared=79 computed=80`. Expected post-fix 80/80 once the orphan note gets its `corpus/README.md` row (if the resolution instead deletes the orphan, both lines stay 79 — but they cannot stay 79 while computed is 80). |
| M11 | SCORECARD.md:289 | `C2_total=79` | Same as M10 (denominator). |
| M12 | SCORECARD.md:293 | `R_sections=83` | `92` (83 + R5 4 + R7 5, distinct in-family). |
| M13 | SCORECARD.md:295 | `coverage_runtime=9` | `10` (`floor(10 × 11/11 × 92/92)`). |
| M14 | SCORECARD.md:302 | `pin.surface-probe=148cbf85…` | Recompute after the `--pin`/`--known`/digest-order/state-dir edits. |
| M15 | SCORECARD.md:304 | `pin.proxy-check=5852fefd…` | Recompute after the `--pin` edit. |
| M16 | SCORECARD.md:305 | `pin.claims-check=e9a21b44…` | Recompute after the `--pin`/`--fidelity` edit. |
| M17 | SCORECARD.md:313 | `A=7 … C=13 …` ⇒ `20/23 ≈ 0.870 ⇒ 8`; "7 more honest items"; "items 12–13" | `C=14`, `21/24 = 0.875 ⇒ 8`, "6 more honest items"; append "item 14 = the fidelity sweep". **Gate-invisible**: `AXES_DRIFT` compares only the score (8 = 8), so a stale formula here rots silently. Items 12–13 remain the sources pair. |
| M18 | SCORECARD.md:316 | `floor(10 × 11/11 × 83/92)` = **9**; "selected rows 5/6/4"; notes cost-and-profile/runtime-support/distill-and-l3; last change "round 18" | `floor(10 × 11/11 × 92/92)` = **10**; selected rows R5 4 / R7 5; notes gain `knowledge/native-admission-detail.md` + `knowledge/local-ship.md`; last change "round 36 (R5+R7 at `31c465f1`)". |
| M19 | SCORECARD.md:326-328 | "live terms are now A=7, C=13 (`f_O` 20/23, 7 more honest items to 9) and C2 77/77" | The sentence says "now", so it is a live claim. Update to C=14 / 21/24 / 6 more and C2 to the post-fix value (80/80), or append a superseding round-36 correction in the same style. Note the pre-existing contradiction: it already reads C2 77/77 while the stanza reads 79. |
| M20 | SCORECARD.md:1062-1063 | "(b) Anchor fidelity is not a gated term: … a moved anchor still counts." | Falsified by C1(e). It sits under "Round 35 … what the round did not fix", but the clause is a present-tense property claim. Append a round-36 line closing (b) (`--fidelity` gates nonok; CLEAN at the pin) rather than rewriting the round-35 record. |

## Status at re-read (2026-10-21; worktree dirty from sibling executors)

Line numbers are the pre-edit snapshot; the literals are the stable key.
- **LANDED (uncommitted):** stanza 285 `C=14`, 288-289 `C2=80`/`C2_total=80`, 293 `R_sections=92`,
  295 `coverage_runtime=10`; `## Axes` 313 (`C=14`, `21/24 = 0.875`, item 14, "6 more") and 316
  (`92/92` = 10, round 36); checklist at 14 items — item 3 is SKILL.md:629 (`--known`), item 14 is
  SKILL.md:640; a pin preamble landed at SKILL.md:615-625 ("Items 3, 8, 10 and 14 are pin-aware …
  `src-rev=<12 hex>`").
- **PENDING:** SKILL.md:9; gate-registry entry commands 600/602/603; named-gaps 607-609 (now
  directly contradicted by the new 615-625 preamble — the one internal contradiction left in
  SKILL.md); SCORECARD.md:54, 326-328, 1062-1063.
- **PINS STALE NOW:** 302/304/305 still hold pre-edit sha256 while
  `scripts/{surface-probe,proxy-check}.mjs` are modified, so `proxy-check` reads `PIN_DRIFT` until
  recomputed after the tools settle. Recompute last.
- **Drift:** SKILL.md +9 by the checklist (620 → 629), +20 by the CITE_CHECK snapshot (637 → 657;
  CLAIMS 716 → 736). SCORECARD line numbers unchanged by insertions.

## Historical — must stay exactly as written (19)

| # | path:line | literal | why it must not move |
|---|---|---|---|
| H1 | SKILL.md:657 (was 637) | `CITE_CHECK: DRIFT (files=47 tokens=4530 errors=14 warnings=75)` | Dated snapshot ("Live 2026-09-28 at round-13 close"). `cite-check` is not edited by C1/C2; the count changes only because SKILL.md grows — record that in the round report, not here. |
| H2 | SKILL.md:736 (was 716) | `CLAIMS: MATCH (… sections=146 adv=14)`, "Live 2026-09-29" | Dated snapshot; superseded by 175 → 184. Do not back-fit. |
| H3 | SCORECARD.md:12 | origin tree `…/origin-work/ufo-fsd-alpha` @ `ee907f1cf` | Baseline definition ("Baselines are measured against…"), not a live anchor. |
| H4 | SCORECARD.md:55-58 | `CHECKLIST: 9/13 pass`, `VERDICT: FAIL` at round-35 open | Dated round-35-open measurement; the correction around it (54) is the live claim. |
| H5 | SCORECARD.md:96-100 | C2 53/53…48/48 readings | Round-17 measurement inside a live definition. Already stale vs stanza 79; append, never rewrite. |
| H6 | SCORECARD.md:195-197 | `floor(10 × 8/8 × 74/114)` = 6, "tied … lowest axis" | Round-16/17 reading; superseded by row 315 (88/88 ⇒ 10). |
| H7 | SCORECARD.md:253-260 | `74 + 69 = 143` vs `sections=146`; "proxy currently counts … occurrences" | Round-17 cross-check; the occurrence clause was superseded in round 35 (SKILL.md:728-731). |
| H8 | SCORECARD.md:395-443 | entire `## Move log` (rows 9–35 incl. `S=88/88` at 400, `PROXY: MATCH … S=91/91 … R=75/92` at 404, `83/92` at 405, `sections=` at 420-423, `CHECKLIST: 10/10` at 421, `A=4 C=9` at 428, `CHECKLIST`/A=/C= at 436-440) | Round records by definition; the round-gate cites them. Round 36 goes in a **new** row. |
| H9 | SCORECARD.md:452-467 | round-36 pre-registration: `92/92 ⇒ 10`, "R occurrences 83 = distinct 83", "sorted order … declared dependency order" | The declaration under test; rewriting it after the fact destroys the falsifier. |
| H10 | SCORECARD.md:469-470 | "old line … S 91/91, R 83/92 … stale at `31c465f1`" | Meta-note that already retires the 91/91 reading. |
| H11 | SCORECARD.md:487-488 | round-35 pre-reg: "live trees unchanged (S 91/91, R 83/92)"; "R5 + R7 … ⇒ 92/92 ⇒ 10" | Forward declaration; the round-35 record of an unexecuted item. |
| H12 | SCORECARD.md:496,526,552 | `83/92, score 9` (round-33 candidate; steered round-18/17 targets) | Dated plans/records; 496 explicitly says "UNADMITTED candidate". |
| H13 | SCORECARD.md:574-590 | round-14 forecast comparison incl. `CHECKLIST: 10/10 pass` (585) | Dated execution record. |
| H14 | SCORECARD.md:610,654,676,761,1465 | `A=5, C=10` readings | Pre-round-34 operability readings in dated narrative. |
| H15 | SCORECARD.md:1058-1061 | `CHECKLIST: 9/13 pass` at open; "After round 35, item 620 … stays red" | Round-35 Limits record. The new KNOWN pin is the round-36 answer and belongs in a round-36 Limits entry. |
| H16 | SCORECARD.md:1163 | `CHECKLIST: 9/9 pass` | Round-14 record. |
| H17 | SCORECARD.md:1492-1493 | `floor(10 × 8/8 × 74/114)` = 6; `floor(10 × 11/11 × 69/98)` = 7 | `## Retired` forecasts, "measured round 16/17". |
| H18 | SCORECARD.md:1619,1641-1644 | `75/92, score 8`; "candidate … 83/92, score 9 is not admitted"; layer status table | Round-33 blocked-cutover record. |
| H19 | SCORECARD.md:1680-1682 | "Live after round 34: operability 8 … coverage:runtime-layer 9" | Explicitly an as-of-round-34 declaration; round 36's 10 belongs in the axes row + move log. |

## Checked, no change required (not counted)

Stanza keys that keep their values: `A=7` (284 — no new script), `C1=19`/`C1_total=19` (286-287),
`S_members=88`/`S_sections=88` (290-291), `R_members=92` (292), `coverage_script=10` (294),
`C1k`…`coverage_kimi` (296-300), `pin.cite-check`/`pin.round-gate`/`pin.kimi-census` (301, 303,
306). Axes rows `coverage` (314), `coverage:script-layer` (315 — `88/88` stays 10),
`coverage:kimi-layer` (317). Verdict grammar without counts: SKILL.md:618 (cite-check accepts
`exit 0|1`), 625 (proxy recompute needs no text change: the bare command picks up the default pin
and the expected substring `PROXY: MATCH` still holds), 695, 787-788; SCORECARD.md:266.
SKILL.md:731 (`sections=` is still a raw occurrence count — `--fidelity` does
not change that).

Adjacent prose the C1 edits change in substance but that carries no anchor/verdict/count
(recommended, not counted): SKILL.md:590-592 (gate preamble still says the probe "does execute
origin read verbs … dispatcher `status`"; after C1(b) that run is `mkdtemp`-isolated and creates/
modifies nothing under `<src>`); SKILL.md:703-711 (probe mode set now includes `--pin`/`--known`);
SKILL.md:712-731 (claims bullet predates `--fidelity`; add a round-36 note like the existing
round-35 note at 728-731).

## Evidence (commands run; read-only)

- `grep -c '^- \[ \]' SKILL.md` → `13` (pre-edit). `baseline/checklists.txt` → `FAIL SKILL.md:620 …
  substring=miss`, `FAIL SKILL.md:625 … substring=miss`, `CHECKLIST: 11/13 pass`, `VERDICT: FAIL`,
  `EXIT=1`. `baseline/proxy-pin.txt` → `C2_TOTAL_DRIFT C2_total: declared=79 computed=80`,
  `AXES_DRIFT coverage: row=10 derived=9`, `PROXY: DRIFT`, `EXIT=1`. `baseline/claims-pin.txt` →
  `ROW R5 form=topic sections=0`, `ROW R7 form=topic sections=0`,
  `CLAIMS: MATCH (… sections=175 adv=6)`.
- `sed -n '283,307p' SCORECARD.md`, `sed -n '313p;316p;326,328p' SCORECARD.md`, `sed -n
  '607,609p' SKILL.md`, `sed -n '1062,1063p' SCORECARD.md` → the values quoted in the tables.
- `grep -n '11/13' SKILL.md SCORECARD.md` → empty; `grep -n 'sections=175' SKILL.md SCORECARD.md`
  → empty; `grep -rn '11/13' --include='*.md' .` → only `.ufo/waves/round-36/claims.md:13`.
  `grep -n '31c465f1' SKILL.md SCORECARD.md` → SCORECARD 132, 315, 400, 455, 470, 1065 (historical
  or the live pin at 315).
- Install/update log: none. No tool installed, no package transaction, nothing written outside this
  report.

## Risks and second-order effects

1. **Silent rot:** 313, 54 and 326-328 are not gate-checked (proxy's `AXES_DRIFT` compares scores,
   and 8 stays 8; C is checked only against the stanza). If the checklist grows and only the stanza
   moves, every gate reads green while the prose still says 13 items / `20/23` / `f_O` 0.870.
2. **Two doc-level falsifiers of C1** if left untouched: SKILL.md:607-609 ("no verdict line names
   the revision") and SCORECARD.md:1062-1063 ("anchor fidelity is not a gated term"). Both are the
   exact negation of the claim; a CLEAN gate run does not clear them.
3. **History is measured, not decorative:** 400/404/405/420-440/496/526/552/1492-1493/1619/1641-1682
   are cited by `round-gate` and by the `## Planned` falsifiers. Editing their numbers to the
   round-36 values would make the round-35/33 records false; put 184 sections / 92/92 / 10 /
   14/14 in a new move-log row and the appended measurement.
4. **Pre-existing contradiction, not caused by C1/C2:** SCORECARD.md:326 says C2 77/77 while the
   stanza has read 79 since round 35; the C2_total fix widens it to 80. Handle it in the same
   round-36 correction, otherwise the new C2 change inherits the inconsistency. Likewise
   `SKILL.md:9` + `SCORECARD.md:765` already disagree; C1 makes that disagreement load-bearing
   because the pin file becomes the only honest origin anchor.

## Verification to run after the edits (L1; not run by this seat)
`node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src` → `PROXY: MATCH` with
`A=7 C=14 … S=88/88 … R=92/92 … src-rev=31c465f1566`, zero findings; `node
scripts/surface-probe.mjs --checklists` → `CHECKLIST: 14/14 pass`; `node
scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` →
`FIDELITY: CLEAN`; `grep -c '^- \[ \]' SKILL.md` → 14; and a grep proving no `C=13`,
`R_sections=83`, `coverage_runtime=9` or `CHECKLIST: 13` remains outside the historical spans
listed above. Expected claims total after C2 is 184 — arithmetic from the baseline row counts, not
an observed run [INFERENCE on the 184 value only].
