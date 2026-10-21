SCORECARD-TERMS stanza-changes=8 axes-rows=2 prose-sites=3

# ConnectorScorecardTerms — round 36 SCORECARD edit set (read-only)

`stanza-changes=8` = literal values in the `kumitate-proxy-v1` block that change (15 other keys asserted unchanged, 23 total); `axes-rows=2` = `## Axes` rows whose text changes (3 checked and left alone); `prose-sites=3` = `## Measurement proxies` / claim-block prose edits. Paths lane-relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; origin read only at `/fast/scratch/kumitate-r36/src` (`HEAD=31c465f15669f744848bd9f5d56191c5085670f7`, verified). No lane file was edited.

## 1. `kumitate-proxy-v1` stanza — 8 value changes

Block spans `SCORECARD.md:283-307`. Key ORDER is parent-frozen (`scripts/proxy-check.mjs:289-302`: 17 `TERM_KEYS` + 6 `PINS`); edits replace values only. Charset is `[A-Za-z][A-Za-z0-9_.-]*` (`:332`), so no `fidelity`/`src-rev` key can be added without `STANZA_KEY_UNKNOWN` exit 2 — "no fidelity term" is enforced by the tool, not merely chosen.

| # | Line | Current literal | Replacement |
|---|---|---|---|
| 1 | 285 | `C=13` | `C=14` |
| 2 | 288 | `C2=79` | `C2=80` |
| 3 | 289 | `C2_total=79` | `C2_total=80` |
| 4 | 293 | `R_sections=83` | `R_sections=92` |
| 5 | 295 | `coverage_runtime=9` | `coverage_runtime=10` |
| 6 | 302 | `pin.surface-probe=148cbf85ce4c7682a4ca4a663b730d28f4c41698100f7a0313f424c7b0ecb52e` | `pin.surface-probe=<recompute>` |
| 7 | 304 | `pin.proxy-check=5852fefd6dc061c6123e9e5e791271fafddf157d520bd6a43aa32a7c3a81fdfb` | `pin.proxy-check=<recompute>` |
| 8 | 305 | `pin.claims-check=e9a21b441f1216bf41d1cca037b36021c581ec7892df3bf973295f9321b0f61b` | `pin.claims-check=<recompute>` |

Recompute: `sha256sum scripts/surface-probe.mjs scripts/claims-check.mjs scripts/proxy-check.mjs` after all three patches integrate (`ExecProxyPin` forbids adding/removing keys). Assert `pins=6 match` in the verdict.

Unchanged (line: literal): 284 `A=7`; 286 `C1=19`; 287 `C1_total=19`; 290 `S_members=88`; 291 `S_sections=88`; 292 `R_members=92`; 294 `coverage_script=10`; 296 `C1k=5`; 297 `C1k_total=5`; 298 `K_members=51`; 299 `K_sections=51`; 300 `coverage_kimi=10`; 301 `pin.cite-check=…`; 303 `pin.round-gate=…`; 306 `pin.kimi-census=…`.

Derivation (measured at the pin): `C` = `grep -c '^\s*- \[' SKILL.md` → 13 now, 14 after `ExecChecklistRewrite` (item 14 `Anchor fidelity`); `A` stays 7 (three of the seven artifacts edited, none added). `C2` = `grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md` → **79**; `C2_total` = `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **80**; the one unrowed note is `corpus/lessons/round-35-verifier-spotcheck.md` (set-diff: notes−rows = {that file}, rows−notes = ∅). `ExecReadmeRow` adds it ⇒ **80/80** ⇒ `floor(10 × 1.0 × 1.0)` = 10, matching the terminal `| coverage | 10 |` row. `R_members` = `ls crates/ufo-core-runtime/src/*.rs | wc -l` → 88 + `ls crates/ufo-cli/src/*.rs | wc -l` → 4 = **92**; `R_sections` 83 + 9 (R5 4 + R7 5) = **92** ⇒ `floor(10 × 11/11 × 92/92)` = **10**. Corroborated by `.ufo/waves/round-36/evidence/c2-simulation.txt`: `R raw 95 distinct 92 score 10`.

## 2. `## Axes` — 2 row edits, 3 asserted unchanged

**Edit A — `SCORECARD.md:313` (operability, stays 8).** Replace
`and C=13 (`## Verifiable checklist`; items 12–13 = the sources-registry gate and its hermetic suite) ⇒ 20/23 ≈ 0.870 ⇒ 8 — round 34 is an f_O walk (17/20 → 20/23), integer held; 9 needs A+C ≥ 27 (7 more honest items).`
with
`and C=14 (`## Verifiable checklist`; items 12–13 = the sources-registry gate and its hermetic suite, item 14 = the anchor-fidelity sweep at the pin) ⇒ 21/24 = 0.875 ⇒ 8 — round 34 is an f_O walk (17/20 → 20/23) and round 36 another (20/23 → 21/24), the integer held both times; 9 needs A+C ≥ 27 (6 more honest items).`
Then replace the row tail
`the C term counts listed items, not passing ones (`## Limits` round-35 entry) | round 35 (gate discrimination; integer held) |`
with
`the C term counts listed items, not passing ones (`## Limits` round-35 entry). Round 36 (integer held): checklist 14/14 at the pin (open 11/13), the anchor-fidelity sweep reads `FIDELITY: CLEAN (… nonok=0 …)`, and the three pinned gates print `src-rev=31c465f1`. | round 36 (2026-10-21; integer held) |`

**Edit B — `SCORECARD.md:316` (coverage:runtime-layer, 9 → 10).** Replace the whole row (current, verbatim):
`| coverage:runtime-layer | 9 | `floor(10 × 11/11 × 83/92)` = **9** — current fleet-cycle round 18 adds eight source-backed members in R3/R4/R6 to the baseline 75; denominator 92 remains 88 runtime + 4 CLI files. Require selected rows 5/6/4, strict adv=0, and global occurrence=distinct proof; commands and measured commits are recorded in the current-cycle measurement entry below. Notes: `knowledge/cost-and-profile.md`, `knowledge/runtime-support.md`, `knowledge/distill-and-l3.md` | round 18 (current fleet cycle, 2026-10-15) |`
with
`| coverage:runtime-layer | 10 | `floor(10 × 11/11 × 92/92)` = **10** at the pinned origin `31c465f1` (round 36) — R5 (4 members) and R7 (5 members) stop being topic-form and gain one `## ` member section each in `knowledge/native-admission-detail.md` / `knowledge/local-ship.md`, with ≥1 own-file anchor whose symbol sits on the cited line and ≥1 verbatim symbol; `R_sections` 83 → 92 (distinct in-family) over `R_members` 92 = 88 `crates/ufo-core-runtime/src/*.rs` + 4 `crates/ufo-cli/src/*.rs`; `C1r/C1r_total` = `yes` rows / all `R*` rows (**11/11**); the nine new sections read nonok=0 in the same fidelity sweep. Round-18 history: `floor(10 × 11/11 × 83/92)` = **9**. Derived by `scripts/proxy-check.mjs` as `coverage_runtime`; before→after in `## Move log` | round 36 (2026-10-21; at `31c465f1`) |`

Unchanged, asserted: 314 `| coverage | 10 |` (terminal value; its `C2 53/53` phrase is the round-34-labeled retirement-era reading at `:327` — do NOT rewrite; the derived term now reads 80/80, so no `AXES_DRIFT`); 315 `| coverage:script-layer | 10 |` (8/8 × 88/88 held; fidelity re-anchoring moves no section count); 317 `| coverage:kimi-layer | 10 |` (51/51; `kimi-census.mjs` and its members untouched).

## 3. Prose — 3 sites

**P1 — A bullet, `SCORECARD.md:35-38`.** Current tail:
`  (+ `scripts/claims-check.mjs`, contract `kumitate-claims-v1`, 791 L, 12 finding
  kinds, 35-case hermetic suite, 5 fail-closed arms + 3 usage arms, exit
  0/1/2/64, sha256 `7bb9451d…`).`
Append (the bullet is already two artifacts stale):
` → **6** after round 19 (+ `scripts/kimi-census.mjs`, contract `kumitate-kimi-census-v1`); → **7** after round 34 (+ `scripts/sources-check.mjs`, contract `kumitate-sources-v1`, 34-case hermetic suite). Round 36 adds no artifact — A stays **7** — and re-pins three of the seven (`surface-probe`, `claims-check`, `proxy-check`), each now printing `src-rev=` from the origin pin.`

**P2 — checklist correction, `SCORECARD.md:53-58`** (append; do not rewrite the round-35 correction or the round-19 sentence at `:47-52`, both stay as written):
`  *Correction (round 36, 2026-10-21; the round-35 correction above stays as written):* the list has **14** items since round 36 — item 14 is `Anchor fidelity` (`node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → exit 0 + `FIDELITY: CLEAN`) — and at the pinned origin `31c465f1` `node scripts/surface-probe.mjs --checklists` reads `CHECKLIST: 14/14 pass`, `VERDICT: PASS`, exit 0. Round-36 open read `CHECKLIST: 11/13 pass`, `VERDICT: FAIL`, exit 1, with `Live sighting-surface conformance` and `Proxy recompute` red (`.ufo/waves/round-36/baseline/checklists.txt`); both now run at the pin (the first with `--known .ufo/pins/surface-known.json`). `--fidelity` is a flag on the existing claims gate, not a new artifact and not a stanza key: the parent-frozen 23-key set has no `fidelity` key, so `fidelity=` would fail closed `STANZA_KEY_UNKNOWN` exit 2. A stays 7, C 13 → 14.`

**P3 — claim-block intro, `SCORECARD.md:277-279`.** Current:
`a second walk), `--src DIR` defaults to `$UFO_SRC` or the lane's checkout, and a
`--src` that is not a directory fails closed (`SRC_NOT_A_DIR`, exit 2) rather than
scoring the layer terms at 0.`
Replace with:
`a second walk), `--src DIR` defaults to the pinned clone when `.ufo/pins/origin.json` exists (else `$UFO_SRC` or the lane's checkout); a pinned run asserts `git -C <src> rev-parse HEAD` equals the pin revision (`SRC_REV_MISMATCH` / `SRC_REV_UNVERIFIABLE`, exit 2) and prints `src-rev=<12 hex>` in its verdict line, and a `--src` that is not a directory fails closed (`SRC_NOT_A_DIR`, exit 2) rather than scoring the layer terms at 0.`
(The old sentence would otherwise describe a default the three gates no longer use.)

## 4. `## Move log` row shape (`SCORECARD.md:395-398`, newest first after :398)

Five columns `| Round | Axis | Before | After | Evidence |`, in-cell pipes escaped `\|`:

`| 36 | operability (checklist 13 → 14; integer held at 8) | \`node scripts/surface-probe.mjs --checklists\` → \`CHECKLIST: 11/13 pass\` \`VERDICT: FAIL\` exit 1 (\`Live sighting-surface conformance\`, \`Proxy recompute\` red; \`.ufo/waves/round-36/baseline/checklists.txt\`); \`node scripts/proxy-check.mjs\` → \`PROXY: DRIFT (C2_TOTAL_DRIFT declared=79 computed=80; AXES_DRIFT coverage 10 vs 9; PIN_UNPINNED)\` exit 1; fidelity prototype \`TOTAL anchors=1530 … nonok=588\` | C=**14** (item 14 = anchor-fidelity sweep) ⇒ \`f_O = 21/24 = 0.875\` ⇒ **8**; \`CHECKLIST: 14/14 pass\` exit 0; \`FIDELITY: CLEAN (… nonok=0 … src-rev=31c465f1)\`; \`PROXY: MATCH (… src-rev=31c465f1)\`, \`CLAIMS: MATCH (… src-rev=31c465f1)\`, \`SURFACE_PROBE: CLEAN (… known=1 … src-rev=31c465f1)\`; A held at 7 (no new artifact, three re-pinned) | \`node scripts/surface-probe.mjs --checklists\`; \`node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json\`; \`node scripts/proxy-check.mjs --pin .ufo/pins/origin.json\`; \`sha256sum scripts/surface-probe.mjs scripts/claims-check.mjs scripts/proxy-check.mjs\` |`

`| 36 | coverage:runtime-layer (9 → 10 at the pinned origin \`31c465f1\`) | \`floor(10 × 11/11 × 83/92)\` = **9**; R5/R7 topic-form (\`ROW_NO_SECTIONS\` ×2; claims \`sections=175 adv=6\` at the pin) | \`floor(10 × 11/11 × 92/92)\` = **10**: nine new member sections (R5 4 + R7 5) in \`knowledge/native-admission-detail.md\` / \`knowledge/local-ship.md\`; \`R_sections\` 83 → 92, \`R_members\` 92 unchanged; claims \`sections=184 adv=4\` | \`node scripts/proxy-check.mjs --pin .ufo/pins/origin.json\`; \`node scripts/claims-check.mjs --pin .ufo/pins/origin.json --row R5 --row R7 --strict\`; fidelity sweep on both notes |`

## 5. Contradictions and ordering (stated, not smoothed)

- **C2 80/80 is a data dependency, not a claim.** If `ExecReadmeRow` does not land, `C2` stays 79 against `C2_total` 80 ⇒ derived coverage 9 ⇒ `AXES_DRIFT coverage 10 vs 9` and no `PROXY: MATCH`, whatever the stanza says. The row for `corpus/lessons/round-35-verifier-spotcheck.md` must land before the proxy verdict is taken.
- **Two "before" fidelity numbers exist.** The assignment's named prototype (`.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt`) reads nonok=**588** (anchors=1530, ok=340, elsewhere=492, absent=96, dead=173, noid=429); the contract-format reference (`fidelity-reference.txt`, 25 min later) reads nonok=**577** (anchors=1504) — the delta is `failure-telemetry` (44/22 vs 22/11) and `loop-driver` (41/11 vs 37/11), i.e. pairing sensitivity, not tree drift. Quote the arm's own pristine-tree run as authoritative; both converge at 0 after. Never put both numbers in one row without naming the run quoted.
- **`R_sections` must stay 92 after re-anchoring.** A fidelity repair that deletes rather than moves a heading fires `S_SECTIONS_DRIFT`/`R_SECTIONS_DRIFT`; the S layer must stay 88 and the R layer 92.
- **`sections=184 adv=4` is arithmetic** from the pinned baseline `sections=175 adv=6` (`claims-pin.txt`) minus R5/R7 `ROW_NO_SECTIONS`; [INFERENCE] until the full-pin claims run prints it.
- **620/625/627/628 are pre-rewrite line numbers.** After `ExecChecklistRewrite` the block is `SKILL.md:627-640`; cite labels going forward.
- **A=7 is a file count, not a provenance count.** The frozen `find` admits any `*.mjs`/`*.js`/`*.sh`/`*.py` anywhere outside `.git`, so an executor's leftover helper (the round-11 `audit-env.sh` precedent) makes A=8 and fires `A_DRIFT`. Nothing in this round may land such a file; the prototype dumps end `.mjs.txt` and are safe.
- **Do not silence `PIN_UNPINNED` by pinning `sources-check`.** The warning for `scripts/sources-check.mjs` survives under `PROXY: MATCH` (warnings do not gate); adding `pin.sources-check` is `STANZA_KEY_UNKNOWN` exit 2 in the parent-frozen 23-key set.

## 6. Commands run (read-only)

`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15…`; `ls`/`find` member counts → 70+18 (S=88), 88+4 (R=92); `grep -c '^\s*- \[' SKILL.md` → 13; `grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md` → 79; `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → 80; set-diff → missing row `lessons/round-35-verifier-spotcheck.md`; reads of `.ufo/waves/round-36/baseline/{proxy-default,proxy-pin,claims-pin,surface-pin,checklists}.txt`, `fidelity-prototype-v1.txt`, `fidelity-reference.txt`, `evidence/c2-simulation.txt`; `grep` of `scripts/proxy-check.mjs` (`TERM_KEYS`/`PINS`/`RE_*`); `grep -F` of every quoted "current" literal against `SCORECARD.md` (6/6 FOUND). No tool installed, no package transaction.
