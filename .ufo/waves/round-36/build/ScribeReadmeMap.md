SCRIBE readme drafted rows=5 gaps=1

# ScribeReadmeMap — corpus/README.md deltas (round 36, drafted only)

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin, master 0614092.
Pin for all source facts: /fast/scratch/kumitate-r36/src at 31c465f15669f744848bd9f5d56191c5085670f7
(`git -C … rev-parse HEAD` → that sha, run 2026-10-21). README was **not** edited; no
lane file, git/jj state, or scratch clone was touched. `anchor-fidelity-gate.md` and
`pinned-evidence.md` are not on disk yet (their scribe items are still in flight), so
the row wording below is drawn from the frozen item specs; anything not observed is
marked [INFERENCE].

Counts I started from, measured read-only:
`grep -c '^| \`' corpus/README.md` → **79** rows; `ls corpus/knowledge/*.md corpus/lessons/*.md | wc -l` → **80**
(the missing row is `lessons/round-35-verifier-spotcheck.md`, owned by ExecReadmeRow).
After ExecReadmeRow (+1) and this delta (+3 new rows) the map is 83/83; the stanza's
`C2_total` must then read 83, not 80 — L1 dependency, not mine.

## A. New rows — append after line 94 (`lessons/round-35.md`), before blank line 95

A1 — `knowledge/anchor-fidelity-gate.md`

| `knowledge/anchor-fidelity-gate.md` | `scripts/claims-check.mjs --fidelity` (`kumitate-fidelity-ratchet-v1`): the anchor→symbol arm over the member sections the registry gate already parses — anchor = a backticked `:N[-M]` / `path:N[-M]` that resolves to the section's own member file, symbol = the adjacent backticked span (right first, then left, both within 14 chars); five classes (`ok` / `elsewhere` / `absent`, with `dead` / `noid` printed diagnostics), `nonok = elsewhere + absent` the only gated term; per-note + total ratchet in `.ufo/pins/fidelity-ratchet.json` (its `revision` must equal the pin, `RATCHET_MALFORMED` / `RATCHET_REV_STALE` exit 2); the four defect shapes liveness cannot see (symbol moved, symbol gone, range widened onto a blank line, anchor with no paired symbol); before/after `588 → 0` at `31c465f1`; honest limits (heuristic pairing, section-scoped universe, no semantic equivalence) | `scripts/claims-check.mjs`, `.ufo/pins/fidelity-ratchet.json`, `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt`; S023, S030 in `corpus/SOURCES.md` |

A2 — `knowledge/pinned-evidence.md`

| `knowledge/pinned-evidence.md` | Why a gate verdict must name the revision it scored (`src-rev=<12 hex>` in the verdict line); the pin file `.ufo/pins/origin.json` (`kumitate-origin-pin-v1`: repo / revision / clone / recreate / verified_at) and `--pin` defaulting to `<self>/.ufo/pins/origin.json` when it exists; the three assertion outcomes and exits — match, `SRC_REV_MISMATCH` 2, `SRC_REV_UNVERIFIABLE` 2 — plus the no-pin portability case; the never-`--src`-the-operator-checkout rule; what stays unpinned (kimi-census substrate, lane-local files) and why | `.ufo/pins/origin.json`, `scripts/claims-check.mjs`, `scripts/proxy-check.mjs`, `scripts/surface-probe.mjs`; S031–S032 in `corpus/SOURCES.md` |

A3 — `lessons/round-36.md`

| `lessons/round-36.md` | Round-36 method: revision-named gate verdicts (PIN v1 in `claims-check` / `proxy-check` / `surface-probe`, `src-rev=` on every verdict line); FIDELITY v1 with a per-note ratchet burns the lane's anchor debt down (`nonok` 588 → 0 at `31c465f1`); `surface-probe` concatenates the manifest's declared `digestInputs` order (kills the false `SCRIPT_DIGEST_MISMATCH`) and runs `fleet-dispatcher status` in a mkdtemp `UFO_STATE_DIR`, so a read-only pinned tree becomes reachable; KNOWN v1 manifest with strict staleness (`KNOWN_STALE` when an expectation stops firing); R5 + R7 sectionized (9 new member sections) ⇒ `R_sections` 83 → 92/92 ⇒ `coverage:runtime-layer` 9 → 10; mistakes mined from the round-35 moving-checkout checklist and the 79/80 row miss | LOG.md round-36; S029–S032 in `corpus/SOURCES.md` |

[S032 is conditional on ScoutSourceRepro; drop it from A2/A3's source cells if that row is
rejected — S029 is own-work (the pinned census behind C2) and S031 covers the pin itself.]

## B. Amended rows — coverage cell moves (R5/R7 sectionization)

B1 — line 30, current (quote):
`| \`knowledge/native-admission-detail.md\` | Seat model vs seat grammar attribution, JS-parity coercions, \`FAILURE_RULES\` home, profile admission order; Cf-vs-Mn/Zs parity drift (cross-domain) | … |`
Literal new row (Covers cell gains the family status; Sources cell unchanged):

| `knowledge/native-admission-detail.md` | Seat model vs seat grammar attribution, JS-parity coercions, `FAILURE_RULES` home, profile admission order; Cf-vs-Mn/Zs parity drift (cross-domain); registry family R5 at internals level (4 of 4, round 36 — one `##` section per member, each carrying a symbol-on-line own-file anchor and a verbatim symbol) | `native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs` |

B2 — line 34, current (quote, source cell shown head only):
`| \`knowledge/local-ship.md\` | … bounds table; defects D-A/B/C | \`local_ship.rs\` (2489 L), \`bounded_fs.rs\` (155 L), \`fs_durability.rs\` (277 L), \`ufo-cli/src/main.rs\` :1841-1860 |`
Literal new row — note the **source sizes are re-measured at the pin**:
`wc -l` in /fast/scratch/kumitate-r36/src → local_ship.rs 2389, local_ship_tests.rs 2969,
bounded_fs.rs 149, bounded_fs_tests.rs 107, fs_durability.rs 198 (the row's 2489/155/277
predate `31c465f1`):

| `knowledge/local-ship.md` | `ufo local-ship` apply/verify/rollback: refusal order, verdict asymmetry + CLI exit map, cooperative apply-lock election, journal recovery tree, verifier denylist (95 basenames / 13 prefixes), external-effect table, `bounded_fs`/`fs_durability`/`atomic_write`, bounds table; defects D-A/B/C; registry family R7 at internals level (5 of 5, round 36 — one `##` section per member, each carrying a symbol-on-line own-file anchor and a verbatim symbol) | `local_ship.rs` (2389 L), `local_ship_tests.rs` (2969 L), `bounded_fs.rs` (149 L), `bounded_fs_tests.rs` (107 L), `fs_durability.rs` (198 L), `ufo-cli/src/main.rs` :1841-1860 |

Line 53 (`knowledge/remaining-scripts-census.md`, S8) is **unchanged** — verified its cell
already reads `60 of 60 members at the pinned origin 31c465f1` (line 53, one line, quoted
only in part here). Lines 64/66 (`member-claims-gate`, `layer-axes`) are **not** moved:
the 146/143 section figure and the `6/7` measurement are the notes' own historical
records, and both notes still say exactly that (layer-axes.md:161-162, README:64-66); only
+9 in-family sections land, and `totals.sections` counts covered rows' notes only
(`scripts/claims-check.mjs:463` probeSections takes `out.notes` from the registry cells),
so the new knowledge notes do not enter that total.

## C. Known gaps — new fidelity bullet, insert between line 175 and line 176

There is **no fidelity bullet today**: `grep -n 'fidelity\|nonok' corpus/README.md` returns
nothing; the bullets are lines 98/130/152/155/162/166/176. Literal new bullet:

- **Anchor fidelity is a gated term now, and its numbers are pin-scoped** — round 36's
  `scripts/claims-check.mjs --fidelity` classifies every anchor in the member sections the
  registry gate already parses: `ok` / `elsewhere` / `absent`, with `dead` / `noid` printed
  as diagnostics; `nonok = elsewhere + absent` is the only gated quantity, dead and noid
  are never ratcheted. The debt is closed at the pin: the L1 prototype read `nonok=588`
  (anchors 1530 / ok 340 / elsewhere 492 / absent 96 / dead 173 / noid 429;
  `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt`) and the landed arm reports
  `FIDELITY: CLEAN … nonok=0` at `src-rev=31c465f1`. The ceiling lives in
  `.ufo/pins/fidelity-ratchet.json` (`kumitate-fidelity-ratchet-v1`): its `revision` must
  equal the active pin (`RATCHET_REV_STALE` exit 2), a note absent from `notes` must read
  `nonok=0`, and the total has its own ceiling — so re-pinning, or an upstream move, forces
  a re-measure rather than a silent pass. With no pin file the arm still runs for
  portability but prints no `src-rev=`, and the number then names no revision. Two honest
  limits: the pairing is heuristic (adjacent span, 14 chars) and the universe is the
  registry's member sections, not every backticked reference in the corpus.

Pin dependency is stated inside that bullet on purpose: the closure is a property of
`31c465f1` read through `/fast/scratch/kumitate-r36/src`, not of "the source tree".

## D. Header — pin instead of the moving checkout (non-row delta)

Current lines 2-4 (quote): `Memory for orchestration & tooling work: OMP task/hub dispatch,
ufo-fsd / scripts, \`crates/ufo-core-runtime\`. Sources are in /
\`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha\` unless noted.`
Literal replacement for lines 2-4:

Memory for orchestration & tooling work: OMP task/hub dispatch, ufo-fsd
scripts, `crates/ufo-core-runtime`. Sources are read at the pin
`.ufo/pins/origin.json` (round 36: `/fast/scratch/kumitate-r36/src` at
`31c465f1`) unless noted; `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` is
the operator's moving checkout and is never passed as `--src`.

This keeps line 7's "against that tree" referring to cite-check's own default
(origin-work), so the citation paragraph below needs no edit.

## E. `## Frontier` — no change

`corpus/README.md` has no `## Frontier` section: `grep -n '^## '` → line 12
`## Coverage map`, line 96 `## Known gaps`, nothing else. The frontier list is
`PROVINCE.md:17` (`### Frontier — named ground, entered by sourced entries, not yet
gated`). Round 36 entered no new ground: it hardens gates that already exist and
sectionizes two families already in the registry, so no `## Frontier` entry (and no new
section) is warranted.

## F. Optional, not counted — line 166 bullet is stale in two ways

`- **Live-surface coverage is 2 surfaces …**` still says "After round 13 the single
uncovered family is **R11** … 0 named" (false since round 15) and predates the round-36
pin/known behaviour. If L1 wants it true, the minimal edit is to add: the probe runs at
the pin (`src-rev=` in `SURFACE_PROBE:`), the one upstream `VERB_UNDECLARED surface`
defect is a `--known` line (`known=1`, `.ufo/pins/surface-known.json`), and its
dispatcher status runs in a temp state dir so the read-only tree is not written. I did
not draft a full replacement because the item scopes Known gaps to the fidelity bullet.

## G. Findings / carried items (reported, not fixed)

1. `bounded_fs_tests.rs` appears in the "36 of the 93 carry no basename mention" list
   (README:130-150). After B2 it is cited, so that count reads 35, not 36 — it needs the
   python re-scan the bullet names, not a hand edit. [INFERENCE: the scan excludes this
   README; B2 is a new mention in the map, so the count is recomputed, not decremented.]
2. The stanza (`SCORECARD.md:296-303`) still carries `C2=79`, `C2_total=79`, `R_sections=83`,
   `coverage_runtime=9`; the proxy's live read is `C2_total` computed 80 today (README rows
   79 + the missing round-35-verifier row). After ExecReadmeRow + A1-A3 it is 83 rows /
   83 files, and after C2 it is `R_sections=92`, `coverage_runtime=10`. L1 owns the stanza.
3. Line 34's `ufo-cli/src/main.rs` :1841-1860 anchor was not re-checked at the pin in this
   seat (cite-check's job); the five `.rs` sizes above were re-measured.
## H. Commands run (read-only; no builds, gates or edits)

```
$ grep -n '^#\|^## ' corpus/README.md
1:# kumitate-shokunin corpus / 12:## Coverage map / 96:## Known gaps
$ grep -n 'fidelity\|nonok\|FIDELITY' corpus/README.md      # no output
$ grep -n 'native-admission-detail.md\|local-ship.md\|layer-axes.md\|member-claims-gate.md\|remaining-scripts-census.md' corpus/README.md
30, 34, 53, 64, 66
$ grep -c '^| `' corpus/README.md                            # 79
$ ls corpus/knowledge/*.md corpus/lessons/*.md | wc -l       # 80
$ ls corpus/knowledge/ | grep -E 'anchor-fidelity-gate|pinned-evidence'   # none (not landed yet)
$ sed -n '30p;34p;53p;64p;66p' corpus/README.md               # row quotes above
$ sed -n '1,12p;90,97p;164,182p' corpus/README.md             # header + insertion points
$ cd /fast/scratch/kumitate-r36/src && git rev-parse HEAD
31c465f15669f744848bd9f5d56191c5085670f7
$ wc -l crates/ufo-core-runtime/src/{local_ship,local_ship_tests,bounded_fs,bounded_fs_tests,fs_durability}.rs
2389 2969 149 107 198
```
