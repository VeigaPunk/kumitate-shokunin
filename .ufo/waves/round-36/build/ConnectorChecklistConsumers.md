CHECKLIST-CONSUMERS sites=34 live=21 historical=13

# Checklist-count consumers at round-36 build (read-only seat)

Lane HEAD `0614092e`; tree clean except untracked `.ufo/waves/round-36/`. Current count `grep -c '^\s*- \[' SKILL.md` → **13** (SKILL.md:618-630); round-36 target **14**, `CHECKLIST: 14/14 pass` at `src-rev=31c465f1…`. `.ufo/pins/` does **not** exist yet (`ls` → NO .ufo/pins), so every pin reference is new text. Site = one row; a grouped row lists every line it covers. Historical = must survive verbatim (dated round record).

## LIVE (must change or appear this round) — 21

| # | pointer | current text (verbatim fragment) | replacement |
|---|---|---|---|
| L1 | SCORECARD.md:285 | `C=13` (stanza `kumitate-proxy-v1`) | `C=14` (R1) |
| L2 | SCORECARD.md:313 | ``and C=13 (`## Verifiable checklist`; items 12–13 = the sources-registry gate and its hermetic suite) ⇒ 20/23 ≈ 0.870 ⇒ 8 … 9 needs A+C ≥ 27 (7 more honest items)`` | R2 |
| L3 | SCORECARD.md:53-58 | round-35 correction ends `the pass count is a separate measurement and is quoted with its date.` | append R3 **after** :58; 53-58 untouched |
| L4 | SCORECARD.md:452-467 | `2. **operability — pinned checklist source.** Checklist items run the proxy and claims gates without `--src`…`; `3. … Even fixed, item 620 stays red…` | append R4 after :467 |
| L5 | SCORECARD.md:1056-1057 | `## Limits (recorded, not hidden)` then `- **Round 35 (2026-10-20) — what the round did not fix.**` | insert R5 as first bullet |
| L6 | SCORECARD.md:445 (`## Move log`) | no round-36 row | new row, R6 |
| L7 | SKILL.md:613-616 | `Every item is read-only, runs from this repo's root, and prints its own verdict;` / ``node scripts/surface-probe.mjs --checklists` executes the list.`` | R7 |
| L8 | SKILL.md:630→631 | last item `- [ ] Sources-check hermetic suite — …` | insert R8 as line 631 |
| L9 | SKILL.md:632-646 | ``Exit 2, or no verdict line at all, is a tool/environment fault (`--src` missing,`` … `Live 2026-09-28 at round-13 close:` | R9 |
| L10 | SKILL.md:607-609 | `and no verdict line names` / `the revision it measured — cite the commit beside the verdict instead.` | R10 |
| L11 | SKILL.md:600 | ``node scripts/surface-probe.mjs [--checklists]`` … ``sighting.surfaceDigest` in the origin tree's `config/ufo.json` (outside this repo — named gap)`` | R11 |
| L12 | SKILL.md:602 | ``node scripts/proxy-check.mjs [--strict]`` … ``stanza (terms + `pin.*` sha256)`` | R12 |
| L13 | SKILL.md:603 | ``node scripts/claims-check.mjs [--row ID] [--strict]`` … ``registry `yes — <note>` cells`` | R13 |
| L14 | corpus/knowledge/member-claims-gate.md:148 (EOF) | file ends ``…`pin.claims-check`, so the tool cannot drift silently either: `LOG.md` round 14.`` | append R14 |
| L15 | corpus/knowledge/executable-scorecard.md:59 | ``| `C` — executable checklist items | `grep -c '^\s*- \[' SKILL.md` (`SCORECARD.md:39-51`) |…`` | R15 |
| L16 | corpus/knowledge/executable-scorecard.md:258-259 | ``The `SKILL.md` checklist is the other shared surface: `surface-probe.mjs --checklists` / runs every item, so one command exercises all five gates.`` | R16 |
| L17 | corpus/knowledge/live-surface-probe.md:201-207 | `runs each command with cwd = repo root, … prints` / ``CHECKLIST: n/m pass` then `VERDICT: PASS|FAIL`.`` | append R17 |
| L18 | README.md:12-13 | ``- `SKILL.md` — the distilled expertise: decision tables, error patterns,`` / `checklists (absent on lanes still in shonen seed form — see `corpus/`)` | **no change** (live file, no count) |
| L19 | corpus/lessons/round-36.md (absent) | — | new; `## Gate` = R19 |
| L20 | corpus/README.md (map) | no `lessons/round-36.md` row | new row R20 |
| L21 | LOG.md (EOF) | no round-36 entry | new entry R21 |

### Replacement blocks (each is one logical line; paste verbatim)

R1 `C=14`.

R2 (replace fragment in SCORECARD.md:313) ``and C=14 (`## Verifiable checklist`; items 12–13 = the sources-registry gate and its hermetic suite, item 14 = the anchor-fidelity sweep, added round 36) ⇒ 21/24 = 0.875 ⇒ 8 — round 34 is an f_O walk (17/20 → 20/23), round 36 walks it again (20/23 → 21/24), integer held; 9 needs A+C ≥ 27 (6 more honest items).`` Score cell stays `8` (21/24 floors to 8): an `f_O` walk, not an axis move.

R3 (append after SCORECARD.md:58) ``  *Correction (round 36, 2026-10-21; both readings above stay as written):* the list has 14 items since round 36 — the 14th, `Anchor fidelity` (`node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → `FIDELITY: CLEAN`) — and every item runs at the origin pin: `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 14/14 pass`, `VERDICT: PASS`, exit 0 (paste the observed line, date and `src-rev=` from the round-36 close run). `C = 14` ⇒ `f_O = 21/24 = 0.875` ⇒ operability 8. The round-35 note above is the round-35 reading, not this one.``

R4 (append after SCORECARD.md:467) ``**Round 36 outcome (2026-10-21).** All three pre-registered items landed: the gates resolve the origin tree from `.ufo/pins/origin.json`, assert the clone's `HEAD` and stamp `src-rev=` in their verdict lines; the probe concatenates the manifest's declared `digestInputs` order; and item 620 reports the one upstream defect as `KNOWN sighting/VERB_DISPATCH` instead of red. `CHECKLIST: 14/14 pass` at the pin (round-36 row in `## Move log`). Nothing above is rewritten.``

R5 (first bullet under `## Limits`) ``- **Round 36 (2026-10-21) — what the round did not fix.** (a) Fidelity debt is closed at the pin (`nonok=0`) but the universe is the member sections the registry gate already parses; anchors with no adjacent symbol (`noid`) and out-of-range anchors (`dead`) stay printed diagnostics, not gated — the claim covers `elsewhere + absent` only. (b) The pin is a dependency, not a portability win: without `.ufo/pins/origin.json` the gates fall back to `$UFO_SRC`/the lane checkout as before, and with the pin but no clone they fail closed `SRC_REV_UNVERIFIABLE`. (c) The `KNOWN` manifest masks exactly one upstream finding and is revision-bound (`KNOWN_REV_MISMATCH`); a second upstream defect reads `DRIFT` until the manifest is re-issued. (d) The checklist pass count moved 11/13 → 14/14 without moving the operability integer (`f_O` 20/23 → 21/24, 8 both times).``

R6 (`## Move log` row, checklist clause; rest is ConnectorScorecardTerms') ``| 36 | operability (C1) + coverage:runtime-layer (C2) | before: `CHECKLIST: 11/13 pass`, `FIDELITY nonok=588`, `PROXY: DRIFT` (C2_total 79/80, AXES_DRIFT), `SURFACE_PROBE: DRIFT` | after: `CHECKLIST: 14/14 pass`, `FIDELITY: CLEAN nonok=0`, `PROXY: MATCH … src-rev=31c465f1`, `SURFACE_PROBE: CLEAN (known=1) … src-rev=31c465f1` | … |``

R7 (SKILL.md:613-616, both lines) ``Fourteen items (the 13 from rounds 9–34 plus `Anchor fidelity`, added in round 36). Every item is read-only, runs from this repo's root, and prints its own verdict; with `.ufo/pins/origin.json` present each gate resolves the origin tree from the pin (`--src`/`--pin` override), asserts the clone's `HEAD` and stamps `src-rev=<12 hex>` in its verdict line. `node scripts/surface-probe.mjs --checklists` executes the list.``

R8 (new line 631) ``- [ ] Anchor fidelity — `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → exit 0 + `FIDELITY: CLEAN` `` — matches `CHECKLIST_RE` (`scripts/surface-probe.mjs:182`: one em-dash, one backticked command, `→ exit N` + one backticked substring).

R9 (SKILL.md:632-636) ``Exit 2, or no verdict line at all, is a tool/environment fault (`--src` missing, empty scan set, unparsable surface JSON, `SRC_REV_UNVERIFIABLE`): fix the tool, not the claim. Exit 2 on a pinned input is a pin fault, not a tree finding — `SRC_REV_MISMATCH` (clone not at the pin), `KNOWN_REV_MISMATCH` (known-findings file names another revision), `RATCHET_MALFORMED`/`RATCHET_REV_STALE` (fidelity ratchet unreadable or off-revision): repair the pin or the sibling file. A named `CITE_CHECK: DRIFT` / `SURFACE_PROBE: DRIFT` / `FIDELITY: DRIFT` is a tree finding — the gate measured the tree, the owner named in that line owes the repair, and no gate writes to the origin tree. Historical (round-13 close, 2026-09-28): `CITE_CHECK: DRIFT (files=47 tokens=4530 errors=14 warnings=75)` —``

R10 (SKILL.md:607-609) ``Named gaps (not claimed): no gate yet ships the §Gate standard "two evidences" frozen-snapshot run with a digest-pinned expected-verdict file. The revision gap is retired (round 36): with `.ufo/pins/origin.json` every gate asserts the clone's `HEAD` against the pin and prints `src-rev=<12 hex>`; mismatch or an unverifiable clone is exit 2 (`SRC_REV_MISMATCH` / `SRC_REV_UNVERIFIABLE`). Without a pin file the gates behave as before and name no revision.``

R11 (SKILL.md:600) ``| surface-probe | gate | `node scripts/surface-probe.mjs [--checklists] [--src DIR] [--pin FILE] [--known FILE]` → `SURFACE_PROBE:` / `CHECKLIST: n/m` | `--selftest` | `## Verifiable checklist` below; frozen status shape in the script; `sighting.surfaceDigest` reached through `.ufo/pins/origin.json` → the pinned clone's `config/ufo.json` (round 36); known upstream findings pinned in `.ufo/pins/surface-known.json` |``

R12 (SKILL.md:602) ``| proxy-check | gate | `node scripts/proxy-check.mjs [--src DIR] [--pin FILE] [--strict]` → `PROXY: MATCH\|DRIFT (… src-rev=<12 hex>)` | `--selftest` | `SCORECARD.md` `<!-- kumitate-proxy-v1` stanza (terms + `pin.*` sha256); `.ufo/pins/origin.json` (the revision the layer terms scored) |``

R13 (SKILL.md:603) ``| claims-check | gate | `node scripts/claims-check.mjs [--row ID] [--src DIR] [--pin FILE] [--strict] [--fidelity --fidelity-ratchet FILE]` → `CLAIMS: MATCH\|DRIFT (… src-rev=<12 hex>)` / `FIDELITY: CLEAN\|DRIFT (… nonok=<n> … src-rev=<12 hex>)` | `--selftest` | `SCORECARD.md` registry `yes — <note>` cells; `.ufo/pins/origin.json` (src-rev); `.ufo/pins/fidelity-ratchet.json` (per-note `nonok` ceilings, revision-bound) |``

R14 (append to member-claims-gate.md) ``## Fidelity arm (round 36)`` + `` `--fidelity` widens the same note walk from liveness to position. For each backticked anchor (`:N[-M]`, or a `path:N[-M]` resolving to the section's own member file) it pairs the ADJACENT backticked span on the same note line — the next span starting within 14 characters after the anchor, else the previous span ending within 14 before it; the paired span must not itself be an anchor, must not be path-like, must be 3+ characters after trim and not only punctuation or digits. Classes: `ok` (symbol occurs on lines N..M), `elsewhere` (in the file, not the range), `absent` (nowhere in the file), with `dead` (range outside the file or N>M) and `noid` (no adjacent symbol) printed as diagnostics. `nonok = elsewhere + absent` is the only gated quantity — `FIDELITY: CLEAN` needs `nonok=0`, and `--fidelity-ratchet FILE` (`kumitate-fidelity-ratchet-v1`) binds per-note ceilings plus the total to one revision (`RATCHET_REV_STALE` otherwise). Liveness stays the registry gate's job: this arm does not re-implement `SECTION_DEAD_ANCHOR` and does not gate `dead`/`noid`. Measured: nonok 588 on the round-36 prototype universe → `FIDELITY: CLEAN nonok=0` at `31c465f1` after the S1–S8/R re-anchor sweep.``

R15 (executable-scorecard.md:59, pointer cell) ``(`SCORECARD.md` §Measurement proxies, the **C** bullet — heading-stable; the line range has moved twice)``

R16 (executable-scorecard.md:258-259) ``The `SKILL.md` checklist is the other shared surface: `surface-probe.mjs --checklists` runs every item (14 since round 36, each resolving the origin pin, so the run names the revision it scored), and one command exercises every gate row in the registry above.`` (corrects the pre-existing "all five gates"; the registry has seven rows — flagged, not claimed here.)

R17 (append to live-surface-probe.md:207) ``Since round 36 every gate item resolves the origin tree from `.ufo/pins/origin.json`, so an item's verdict carries `src-rev=<12 hex>`; the probe itself takes `--src DIR` / `--pin FILE` to override the tree and `--known FILE` to classify a pinned upstream finding as `KNOWN` (a listed finding that stops firing is `KNOWN_STALE`, an error).``

R19 (corpus/lessons/round-36.md `## Gate`) ``node scripts/surface-probe.mjs --checklists`` → `CHECKLIST: 14/14 pass`, `VERDICT: PASS`, exit 0 at `src-rev=31c465f1…`; ``node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`` → `FIDELITY: CLEAN (… nonok=0 … src-rev=31c465f1…)` exit 0.

R20 (corpus/README.md new row, house format) ``| `lessons/round-36.md` | Round-36 method: <one line> | LOG.md round-36; commit `round-36` |``. Coupling: the file without the row moves `C2` (`grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` vs `find … | wc -l`); the stanza `C2_total` is ConnectorScorecardTerms' number.

R21 (LOG.md round-36 entry) must quote, with date and `src-rev=`: `CHECKLIST: 14/14 pass`, `FIDELITY: CLEAN nonok=0`, `PROXY: MATCH`, `SURFACE_PROBE: CLEAN (known=1)`.

## HISTORICAL (must stay verbatim) — 13

| # | pointer | quoted text (fragment) |
|---|---|---|
| H1 | SCORECARD.md:39-52 | `…→ **11** after round 19 … All eleven are *executed*, not merely` / ``listed: … `CHECKLIST: 10/10 pass`,`` (round-19 reading, explicitly preserved) |
| H2 | SCORECARD.md:53-58 | `*Correction (round 35, 2026-10-20; … stays as written):* the list has 13 items …` + `CHECKLIST: 9/13 pass` |
| H3 | SCORECARD.md:320-321 | `operability now has five runnable artifacts and ten executed checklist items` (round-14/17, kept by the :323 note) |
| H4 | SCORECARD.md:326 | ``live terms are now A=7, C=13 (`f_O` 20/23, 7 more honest items to 9)`` (round-34 correction) |
| H5 | SCORECARD.md:1057-1061 | ``The checklist read `CHECKLIST: 9/13 pass` at open; … item 620 … stays red`` (round-35 Limits) |
| H6 | SCORECARD.md:421, :438, :440, :585, :1049, :1163, :1461 | `read **8/10**`; `CHECKLIST: 6/6 pass`; `CHECKLIST: 4/4 pass`; `CHECKLIST: 10/10 pass`; `CHECKLIST: 9/9 pass` ×2; `fell 10/10 → 8/10` |
| H7 | LOG.md:213, :274, :337, :399, :500, :597, :741, :883, :1492, :1590 | `CHECKLIST: 4/4` / `6/6` / `9/9` (×4) / `10/10` (×3) / `6/11` / `9/13` |
| H8 | corpus/lessons/round-9.md:68, round-10.md:11, round-11.md:12,44 | `CHECKLIST: 4/4 pass`; `CHECKLIST: 6/6 pass`; `CHECKLIST: 9/9 pass` |
| H9 | corpus/lessons/round-35.md:14 | ``…«`CHECKLIST: 10/10 pass`»; the round-35 baseline … `CHECKLIST: 9/13 pass`, `VERDICT: FAIL`, exit 1`` |
| H10 | corpus/lessons/round-35-verifier-spotcheck.md:127-128,160 | `A=7 C=13 held`; `checklist 9/13 → 12/13` |
| H11 | corpus/knowledge/executable-scorecard.md:368, :395, :426, :437, :454, :470 | `A+C = 15`; `CHECKLIST: 10/10 pass`; `still executes 9/9`; `A+C = 13`; `CHECKLIST: 9/9 pass`; `A+C = 4+9 = 13` (all inside dated historical blocks) |
| H12 | corpus/README.md:94 | `…mistakes mined from the moving-tree baseline and the 9/13 checklist` (round-35 row) |
| H13 | SHONEN.md:1,5 | `# kumitate-shokunin — Promotion checklist` / `- [ ] SKILL.md contains … checklists…` — **different checklist, four items; never edit against C** |

## Adjacent, NOT a checklist-count site (uncounted)

- PROVINCE.md:5 `**Owns:** the domain knowledge, playbooks, error patterns, and checklists above.` — no count, no change.
- SKILL.md:750 `deliberately not a checklist item, since it is red until the round is committed and pushed` — `--close` prose, no count.
- corpus/knowledge/round-close-gate.md:210-211,220-221 `Four instruments … one command exercises all four gates` — a *gate* count (7 registry rows today), stale independently of round 36; flagged, not claimed.

## Verification (commands run; outputs quoted above)

```
$ git -C <lane> rev-parse HEAD → 0614092e0804aaca06642cb3a263a05c1cacc98e
$ git status --porcelain → only "?? .ufo/waves/round-36/"
$ grep -c '^\s*- \[' SKILL.md → 13        (items at SKILL.md:618-630)
$ ls .ufo/pins → NO .ufo/pins
$ grep -n 'CHECKLIST: [0-9]' SCORECARD.md → 48,55,438,440,585,1049,1058,1163
$ grep -n 'CHECKLIST: [0-9]' LOG.md → 213,274,337,399,500,597,741,883,1492,1590
$ grep -rn 'CHECKLIST: [0-9]' corpus → executable-scorecard:395,454; lessons round-9:68,
  round-10:11, round-11:12,44, round-35:14 (+ round-35-verifier-spotcheck prose)
$ grep -rn 'C=13' (excluding .ufo) → SCORECARD:285,313,326; LOG:1466,1506,1620;
  executable-scorecard:437; round-35-verifier-spotcheck:127
$ sed -n '906-940p' scripts/proxy-check.mjs → compareAxes() parses ONLY the integer Score
  cell of `| <axis> | <n> |`; the `20/23` fraction is unparsed prose
$ sed -n '182p' scripts/surface-probe.mjs → CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u
```
Arithmetic: A=7, C=14 ⇒ 21/24 = 0.875 ⇒ floor(10×0.875) = **8**; 9 needs A+C ≥ 27, i.e. 6 more honest items.

## Contradictions stated, not smoothed

1. **Green ≠ meaningful.** C counts *listed* items, so 14/14 does not move the axis; `f_O` walks 20/23 → 21/24 and the integer holds at 8. Item 14 is the only item whose failure mode is semantic (symbol-on-line), so the fidelity arm — not the count — is the operability content.
2. **Three readings under one bullet.** After R3 the C bullet carries round-19, round-35 and round-36 readings; each must stay separately dated or the bullet becomes the defect round 35 corrected. Hence R3 is an append, never a rewrite.
3. **The fraction is prose.** Only the `## Axes` integer is machine-checked (`AXES_DRIFT`); `20/23 → 21/24` is honesty, not a gate — do not claim the proxy verifies it.
4. **The pin is a new single point of failure.** Every green line at the pin assumes `/fast/scratch/kumitate-r36/src` at `31c465f1`; without it the gates are exit 2, not green. R5/R10 say so; R7 must not imply portability it lacks.

## Cross-check against wave artifacts already in the round cache

- `ExecChecklistRewrite.md` (executor) reports `EXEC checklist done items=14 parses=14` and its patched tree parses 14/14 with item 14 exactly R8's text (`cmd="node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json" exits=0 expect="FIDELITY: CLEAN"`) at **SKILL.md:640** — the intro grew 9 lines, so my pre-edit pointers (L7/L8/L9 on 613-646) must be re-anchored after that patch lands; the item text itself matches, do not rewrite it.
- `ScribeSkillProse.md` R11-equivalent keeps `--pin FILE`/`--known FILE` but omits `--src DIR` and drops my "named gap closed" wording. `scripts/surface-probe.mjs:239-241` documents `--src DIR` (default `$UFO_SRC`, then the two `~/Projects` candidates), so R11's flag list is the accurate one; the surviving sentence "outside this repo — named gap" is what R10/R11 retire.

## Residual unknowns

- No gate was run (read-only seat; the after-state does not exist yet). `14/14`, `nonok=0`, `PROXY: MATCH src-rev=…` are declared targets, not observations — R3/R19/R21 keep them as paste-the-observed-line slots.
- Whether item 14 needs `--src`/`--pin` in its text depends on the pin default landing as specified; if the default is not wired, R8 must gain `--pin .ufo/pins/origin.json` (RevChecklistSelf/ReviewChecklist own that check).
