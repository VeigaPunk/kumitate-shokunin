# layer-axes — the retired `coverage` axis's two successors, first measured

Round 15 retired `coverage` at its **terminal** value: `floor(10 × 19/19 ×
50/50)` = 10, a product of two ratios that had both reached 1.0, so the integer
no longer responded to the object it names (`SCORECARD.md` `## Retired`). That
entry named two successors — `coverage:script-layer` and
`coverage:runtime-layer` — and fixed only their *partition*, not their terms. The
terms were then pre-registered a round early, in `SCORECARD.md` `## Planned`
("round 16 (pre-register, one move)"), so that the round that measures them
cannot fit the definition to the measurement. This note is the restatement a
reusing lane reads: the two formulas, every term's derivation with its frozen
command, the measured integers against the retired parent, why the honesty term
exists and which pre-registered fallback the measurement refuted, the amendment
the terms cost `scripts/proxy-check.mjs`, what the gate still does **not** show,
and the failure modes a reader can fire.

Both terms live in `scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`), the
read-only checker of this lane's own scorecard. They are the first terms in that
tool's history that read the origin tree at all: the four legacy terms (`A`, `C`,
`C1`, `C2`) remain self-only, and the layer terms reach the origin through **one
in-process import** of `scripts/claims-check.mjs` (contract `kumitate-claims-v1`)
— never a subprocess.

## The two successors (frozen in `SCORECARD.md`, restated here)

The formulas below are **the scorecard's**, not this note's: they are frozen in
`SCORECARD.md` `## Planned` (round-16 pre-registration), defined per layer in
`## Retired`'s `### coverage:script-layer` and `### coverage:runtime-layer`
sections, and implemented by `scripts/proxy-check.mjs`. This note **restates**
them — it does not define them — and documents the derivation, the measurement
and the failure modes a reader can fire; if the two ever disagree,
`SCORECARD.md` is the definition and this note is stale.

~~~
coverage:script-layer  = floor(10 × C1s / C1s_total × S_sections / S_members)
coverage:runtime-layer = floor(10 × C1r / C1r_total × R_sections / R_members)
~~~

The layer split is by registry-row **id prefix**: rows `S1`–`S8` are the script
layer, rows `R1`–`R11` the runtime layer. `C1_layer` keeps the family standard
the legacy `C1` already uses (a cell counts only when its fourth cell starts
`yes`); the second factor is the honesty term.

**The two vocabularies are one term**, stated once so the prose form and the
machine form cannot drift apart:

| `SCORECARD.md` prose | `proxy-check.mjs` term | Meaning |
|---|---|---|
| `C1_layer` (script) | `C1s` / `C1s_total` | `yes` rows / all rows among ids starting `S` |
| `C1_layer` (runtime) | `C1r` / `C1r_total` | `yes` rows / all rows among ids starting `R` |
| `V_layer` (script) | `S_sections / S_members` | verified member sections / declared members |
| `V_layer` (runtime) | `R_sections / R_members` | same, runtime layer |

"Member section" means a section the claims gate resolves to a file **inside the
row's declared family** — `sections[].inFamily === true`. Sections a note
legitimately reaches across families are counted by the gate but excluded from
the layer numerator (measured: 3 such sections).

The retired parent, for contrast:

~~~
coverage = floor(10 × C1 / C1_total × C2 / C2_total)
~~~

`C2` (README-map freshness) does **not** appear in either successor. The
pre-registered alternative — each successor "keeping its own C1/C2 pair" — was
measured and refuted before the split landed, because `C2_layer` is 1.0 by
construction: every note a layer's rows reference already has a README row, so
both successors would have read `floor(10 × 1.0 × 1.0)` = 10 under two new names
(`SCORECARD.md` `## Retired`, `## Planned`).

## Term → derivation

Each term, where it is computed, and the command that reproduces it. Only
`coverage_script` / `coverage_runtime` and the four counts are claimed; `C1s`,
`C1r` and their totals are intermediates of the derivation.

| Term | Claimed in the stanza? | Derivation | Frozen command |
|---|---|---|---|
| `C1s` / `C1s_total` | no (intermediate) | `yes` rows / all rows among ids starting `S` | `grep -cE '^\| S[0-9]+ \|' SCORECARD.md` for the denominator; the `yes` test is the tool's escape-aware 4th-cell split |
| `C1r` / `C1r_total` | no (intermediate) | same, ids starting `R` | `grep -cE '^\| R[0-9]+ \|' SCORECARD.md` |
| `S_members` | yes | files in the script layer's frozen universe, recursively | `find scripts -maxdepth 1 -type f -name '*.mjs' \| wc -l` + `find scripts -mindepth 2 -type f \| wc -l` (recursive: 72 + 42 = 114; the depth-1 reading, `-mindepth 2 -maxdepth 2`, is 38 and is wrong) |
| `S_sections` | yes | Σ in-family member sections in the `S` rows' notes | `probeSections()` (below) |
| `R_members` | yes | `.rs` files in the two runtime source dirs | `find crates/ufo-core-runtime/src -maxdepth 1 -type f -name '*.rs' \| wc -l` + `find crates/ufo-cli/src -maxdepth 1 -type f -name '*.rs' \| wc -l` |
| `R_sections` | yes | Σ in-family member sections in the `R` rows' notes | `probeSections()` (below) |
| `coverage_script` | yes | `floor(10 × C1s/C1s_total × S_sections/S_members)` | `proxy-check.mjs` `deriveTerms()` |
| `coverage_runtime` | yes | `floor(10 × C1r/C1r_total × R_sections/R_members)` | `proxy-check.mjs` `deriveTerms()` |

The layer universe is frozen in `scripts/proxy-check.mjs` and is **not** "all
scripts": `scripts/<name>.mjs` at the top level, every file under
`scripts/<dir>/` recursively (the registry's 42), `crates/ufo-core-runtime/src/<name>.rs`,
and `crates/ufo-cli/src/<name>.rs`. Five top-level shell scripts
(`scripts/dev-verify.sh`, `scripts/gates.sh`, `scripts/self-iter.sh`,
`scripts/smoke.sh`, `scripts/ufo-night-watchdog.sh`) sit outside that universe
and belong to no family; that is a definitional limit of the registry, recorded
in `SCORECARD.md` `## Limits`, not a member the terms dropped.

The `yes` test is deliberately the *same* code path the legacy `C1` uses
(`splitRowCells()`, escape-aware): `S7`'s members cell carries an escaped `\|`
inside a backticked command, so a naive `split('|')` would shift the 4th-cell
test onto a prose cell and silently stop counting that row. The layer split
therefore cannot disagree with the legacy `C1` about which rows are covered.

## Measured 2026-09-28, before either tool edit

Reproduce, never recall — these are the values the round's terms were fitted to,
taken from the tree *before* `scripts/proxy-check.mjs` or
`scripts/claims-check.mjs` was edited. Lane HEAD at the reading: `637d181`
(round-14 close); origin tree `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` at
`5725fa7d3`.

~~~
$ find scripts -maxdepth 1 -type f -name '*.mjs' | wc -l              # 72
$ find scripts -mindepth 2 -type f | wc -l                             # 42   ⇒ S_members = 114
$ find crates/ufo-core-runtime/src -maxdepth 1 -type f -name '*.rs' | wc -l    # 93
$ find crates/ufo-cli/src -maxdepth 1 -type f -name '*.rs' | wc -l             # 5    ⇒ R_members = 98

$ node --input-type=module -e '
    const { probeSections } = await import("./scripts/claims-check.mjs");
    const p = probeSections();
    let C1s = 0, C1sT = 0, C1r = 0, C1rT = 0, Ssec = 0, Rsec = 0, outFam = 0;
    for (const r of p.rows) {
      const isS = r.id[0] === "S";
      if (isS) { C1sT++; if (r.covered) C1s++; } else { C1rT++; if (r.covered) C1r++; }
      for (const s of r.sections) { if (s.inFamily) { if (isS) Ssec++; else Rsec++; } else outFam++; }
    }
    console.log(JSON.stringify({ ok: p.ok, C1s: `${C1s}/${C1sT}`, C1r: `${C1r}/${C1rT}`,
      S_sections: Ssec, R_sections: Rsec, outOfFamily: outFam, totals: p.totals }));
  '
{"ok":true,"C1s":"8/8","C1r":"11/11","S_sections":74,"R_sections":60,"outOfFamily":3,
 "totals":{"rows":19,"yes":19,"notes":27,"sections":137,"errors":0,"warnings":16,"adv":16}}

$ node scripts/claims-check.mjs
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)              # exit 0

$ node scripts/proxy-check.mjs                                            # before the edit
PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10; pins=5 match)   # exit 0
~~~

Which gives:

| Successor | Rows | `C1_layer` | Members | Sections | `V_layer` | Score |
|---|---|---|---|---|---|---|
| `coverage:script-layer` | `S1`–`S8` | 8/8 = 1.0 | 114 | 74 | 0.6491 | `floor(10 × 1.0 × 0.6491)` = **6** |
| `coverage:runtime-layer` | `R1`–`R11` | 11/11 = 1.0 | 98 | 60 | 0.6122 | `floor(10 × 1.0 × 0.6122)` = **6** |
| `coverage` (retired parent) | 19 | 19/19 = 1.0 | — | — | `C2` 50/50 = 1.0 | **10**, terminal |

The two terms read 6 and 6 against the retired 10: a drop of four points on both
halves, entirely from the honesty term the parent never measured. That is the
point of the split — it **exposes** a worse number instead of renaming a
saturated one.

### Current after round 17

The formula did not change. R1 gained eight distinct in-family member sections
and R8 gained `native_dispatch_topology.rs`, so runtime moved 60 → 69 / 98 and
score 6 → 7; script stayed 74/114 and 6:

| Successor | Rows | `C1_layer` | Members | Sections | `V_layer` | Score |
|---|---|---|---|---|---|---|
| `coverage:script-layer` | `S1`–`S8` | 8/8 = 1.0 | 114 | 74 | 0.6491 | **6** |
| `coverage:runtime-layer` | `R1`–`R11` | 11/11 = 1.0 | 98 | 69 | 0.7041 | **7** |

`claims-check --row R1 --row R8 --strict` reports 12 sections / adv=0; an
explicit census reports occurrences=distinct (8=8, 4=4). The extra guard is
required because round 17's critic reproduced an implementation limit:
`layerTerms()` counts section occurrences while the gate dedupes files for its
declared-count finding. Distinct-per-layer counting is queued; it was not hidden
inside the coverage move.

Three counting notes a re-deriving reader will hit:

- `S_sections + R_sections` = 74 + 69 = **143** member sections, out of the
  **146** the claims gate reports (`totals.sections`). The 3 difference is
  exactly `R9`'s out-of-family sections — the cross-cutting test inventories
  (`crates/ufo-core-runtime/src/loop_driver_tests.rs`,
  `crates/ufo-core-runtime/src/local_ship_tests.rs`,
  `crates/ufo-core-runtime/src/distill_tests.rs`) that the registry places inside
  `R2`/`R6`/`R7` on purpose. They surface as advisory `SECTION_FILE_NOT_MEMBER`,
  not as errors, and the layer numerator counts only `sections[].inFamily ===
  true` — so the terms cannot be inflated by a note that legitimately reaches
  across families.
- `S_members` counts files, not "scripts": the recursive 42 are
  `scripts/charter-scribe/` (6, including its prompt and systemd children),
  `scripts/collect-omp-native-handoff-lib/` (6), `scripts/lean-cargo/` (4,
  including its bin child), `scripts/ufo-sighting-lib/` (26).
- `V_layer` is a *member* ratio: the denominator is the registry cells' declared
  membership (114 + 98 = 212), so a cell that under-declares its family inflates
  the term (the round-15 `R1` cell repair is the worked example).

## Why the honesty term exists, and which fallback the measurement refuted

The pre-registration named a fallback: if round 16 measured that `V_layer`
double-counts `C1_layer` — "a family is either all-section-form or all-topic, so
the two terms move together" — then the successors would instead use
`floor(10 × C1_layer × F_layer)` with `F_layer` the layer's **file-level
residue** (the unscored scorecard diagnostic, recorded there as 201/211 ≈ 0.952
after round 15 — a recall, not re-derived here).
That fallback is refuted by the measurement above, and the reason is structural,
not incidental:

- `C1_layer` is **1.0 in both layers** (8/8 and 11/11) while the first
  measurement's `V_layer` was **0.6491** and **0.6122**. Round 17 moved only
  runtime `V_layer` to 0.7041; neither value is forced to 1.0 by saturated C1.
- The terms are computed from different objects: `C1_layer` reads **registry
  cells** (a lane-prose claim about a family), `V_layer` reads **member sections
  inside the notes** (a machine-verified heading with a live own-file anchor and
  a verbatim symbol). At the first measurement 9 rows were topic-form
  (`S1`–`S5`, `R1`, `R2`, `R5`, `R7`); round 17 sectionized R1, leaving 8
  (`S1`–`S5`, `R2`, `R5`, `R7`). A layer can therefore be fully cell-covered
  and materially member-unverified.
- The historical readings show the same decoupling across rounds: on the
  round-14 tree (reproduced from lane HEAD `637d181`) the gate read `CLAIMS:
  MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)`, with the per-layer split
  `S` 74/114 and `R` 13/98 and `C1s` already 8/8 — the script layer's `C1` has
  been saturated since round 13 while its section fraction has not. Round 15 then
  moved `totals.sections` 90 → 137 and `R`'s in-family share 13 → 60 (+47) while
  the legacy `C1` moved by a single row (18/19 → 19/19): a 9% registry move next
  to a 48% honesty move.

Reproduction of the round-14 reading (read-only; no working-tree write):

~~~
$ d=$(mktemp -d) && git archive HEAD | tar -x -C "$d"     # HEAD = 637d181, round-14 close
$ (cd "$d" && node scripts/claims-check.mjs)
CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)               # exit 0
~~~

`F_layer` would also have priced the residue at file granularity *and* needed a
second origin walk per layer, which is the I/O the round-14 design deliberately
kept out of the proxy's measurement path. It stays a priced, unused alternative.

## The amendment the layer terms cost

Written down because it changes a boundary this lane's other notes assert about
`scripts/proxy-check.mjs`:

- **The four legacy terms stay self-only.** `A`, `C`, `C1`, `C1_total`, `C2` and
  `C2_total` are still derived from `--self`'s tree and nothing else; a lane that
  only wants them still needs no origin tree. The layer terms are the first
  origin-tree consumers on the proxy's measurement path.
- **One derivation, reached by import.** The proxy does not re-implement the
  claims logic and it never walks `--src` itself: the frozen layer universe is a
  *filter* (`LAYER_PATTERNS`) applied over the one origin walk `probeSections()`
  performs, so a run costs one traversal, not three. The proxy imports
  `scripts/claims-check.mjs` in-process and calls
  `probeSections()` — `{ ok: true, rows, totals }` or `{ ok: false, kind,
  detail }`, with `rows` carrying `{ id, family, covered, form, notes,
  sections }` and `totals` the gate's own `{ rows, yes, notes, sections,
  errors, warnings, adv }`. `scripts/claims-check.mjs` was refactored so that
  `runCheck()` calls the same `probeSections()`, i.e. there is exactly one
  derivation, not a second copy; it now exports `probeSections`, `walkFiles`,
  `parseRegistry`, `DEFAULT_SRC`, `SCORECARD_FILE` and `CORPUS_DIRS` behind a
  main guard: `node scripts/claims-check.mjs …` behaves byte-identically, while
  `await import('./scripts/claims-check.mjs')` from another module does **not**
  run `main()`. Verified: the import prints nothing and returns the shape above.
- **Never a subprocess.** The proxy's invariant — no spawn on the measurement
  path, `--selftest` is the only spawner — survives; there is no `child_process`
  edge between the two gates, so a claims-check crash cannot be mistaken for a
  verdict line.
- **New input, new refusal.** `--src DIR` was added to `parseArgs()` and `USAGE`,
  defaulting to `$UFO_SRC` or the frozen origin path (`DEFAULT_SRC`). Without a
  directory there the layer terms cannot be scored, so the proxy fails closed
  with `SRC_NOT_A_DIR` (exit 2) rather than reporting "absent" as `MATCH`.
- **Six new stanza keys, integers only**: `S_members`, `S_sections`, `R_members`,
  `R_sections`, `coverage_script`, `coverage_runtime`. The stanza grammar admits
  `key=value` with a value in `\d+`, and the axis names contain `:` — hence the
  `_` forms. `compareTerms()`, `compareAxes()` (over the `AXIS_ROWS` pairs),
  `renderVerdict()` and `--json` all carry them.
- **The two successor axes are gated like the legacy ones.** `AXIS_ROWS` maps
  axis `coverage:script-layer` → term `coverage_script` and
  `coverage:runtime-layer` → term `coverage_runtime`, so each successor needs an
  `## Axes` row whose integer equals the term's derivation; a missing or
  disagreeing row is `AXES_DRIFT` (exit 1), the same kind the legacy axes use.
- **Pin consequence**: `scripts/claims-check.mjs` is now an import dependency of
  `scripts/proxy-check.mjs`, so both files must be re-pinned in the
  `kumitate-proxy-v1` block after any edit to either; an unrecorded edit shows up
  as `PIN_DRIFT`, not as a stale claim.

## What the gate does not show

- **Shape, not truth.** The gate verifies that a member section's heading
  resolves to a file inside the row's declared family, that the section carries a
  live anchor into that same file and a verbatim symbol from it. It cannot read
  whether the sentence around the anchor is true. The layer terms inherit exactly
  that ceiling: `V_layer` is a *shape* ratio.
- **134 of 137 sections count, and 78 of 212 declared members have none.**
  `totals.sections` = 137 (the gate's own count), the layer numerator is
  `S_sections` 74 + `R_sections` 60 = 134 (the 3 exclusions are `R9`'s
  cross-cutting inventories), and the registry's declared membership across both
  layers is 212 (114 + 98). So 78 declared members carry **no** verified member
  section — 40 in the script layer (114 − 74) and 38 in the runtime layer
  (98 − 60). The terms print that gap as 0.6491 and 0.6122; they do not close it.
- **9 of 19 rows are probed for note existence only.** The topic-form rows
  (`S1`–`S5`, `R1`, `R2`, `R5`, `R7`) carry no member headings, so the gate can
  assert only that the note exists and that it names *some* family member
  (`ROW_NO_SECTIONS`, advisory; `NOTE_FOREIGN`, error). A `yes` cell there can
  rest on a note naming one member of five.
- **Membership is what the registry declares, not what the tree holds.**
  `S_members`/`R_members` are counted over the frozen universe, and `V_layer`'s
  denominator is the *declared* membership in the cells, so a cell that
  under-declares its family inflates `V_layer` without any note improving.
- **The two integers are not independent measurements of "the axis".** Both read
  6, and both are one row of registry drift away from moving: `C1_layer` is 1.0,
  so only `V_layer` can push them down, while a false `yes` cell with no note
  behind it raises `C1_layer`'s numerator and leaves the honesty half untouched.

## Failure modes a reader can fire

Six drift kinds, all produced by `compareTerms()` as `term=<key> declared=<n>
computed=<n> delta=<n>` (severity error, exit 1), plus one fail-closed arm:

| Kind | Fires when | How a reader fires it |
|---|---|---|
| `S_MEMBERS_DRIFT` | the stanza's `S_members` ≠ the frozen universe's count (114) | edit `S_members` in the `kumitate-proxy-v1` block on a copy, or add/remove a `scripts/*.mjs` file |
| `S_SECTIONS_DRIFT` | the stanza's `S_sections` ≠ the in-family section sum over the `S` rows (74) | edit the stanza value, or delete a member section from an `S` note (which also fires the gate's own `MEMBER_COUNT_DRIFT`) |
| `R_MEMBERS_DRIFT` | the stanza's `R_members` ≠ 98 | edit the stanza value, or add a `.rs` file to either runtime source dir |
| `R_SECTIONS_DRIFT` | the stanza's `R_sections` ≠ the in-family sum over the `R` rows (60) | edit the stanza value, or rename an `R`-row member heading |
| `COVERAGE_SCRIPT_DRIFT` | the stanza's `coverage_script` ≠ `floor(10 × C1s/C1s_total × S_sections/S_members)` | edit the derived integer while its terms stay put |
| `COVERAGE_RUNTIME_DRIFT` | the stanza's `coverage_runtime` ≠ the runtime derivation | same |
| `SRC_NOT_A_DIR` (fail-closed, exit 2) | `--src` absent, or not a directory | `node scripts/proxy-check.mjs --src /nonexistent` |

A drift in the *declared* layer rows themselves (someone flips an `S` cell to
`no`) moves `C1s/C1s_total` and therefore `coverage_script`, but it does not
remove the honesty term: `V_layer` is computed from the notes, not from the
cells.

All six drift kinds, the successor-axes `AXES_DRIFT` and `SRC_NOT_A_DIR` were
fired on scratch copies of `SCORECARD.md`; the observed lines are in `## Exit map
and the verdict line` (six `term=<key> declared=<n> computed=<n> delta=<n>`
drifts, one `AXES_DRIFT` on `| coverage:script-layer |` and the `SRC_NOT_A_DIR`
fail-closed pair).

## Exit map and the verdict line

Same four-value shape as the three gates beside it (`0` match · `1` drift · `2`
fail-closed · `64` usage). The verdict line keeps the legacy terms and carries
the six layer terms; the six drift kinds above plus the two successor rows'
`AXES_DRIFT` are the exit-1 surface the layer terms add, and `SRC_NOT_A_DIR` is
the only new exit-2 arm. `--json` mirrors the same object,
with the six terms under `terms` (`S_members` `S_sections` `R_members`
`R_sections` `coverage_script` `coverage_runtime`).

Measured on the landed tools (scratch scorecard copy carrying the current pin
digests, so a plain run does not yet trip `PIN_DRIFT` on the two freshly edited
scripts):

~~~
$ node scripts/proxy-check.mjs --scorecard /tmp/r16-ExecAxisNote/sc.md
PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=52/52 coverage=10; S=74/114 coverage:script-layer=6; R=60/98 coverage:runtime-layer=6; pins=5 match)
                                                                                  # exit 0

$ # one doctored key at a time, same copy
S_members=113          → PROXY: DRIFT (S_MEMBERS_DRIFT term=S_members declared=113 computed=114 delta=+1)
S_sections=73          → PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections declared=73 computed=74 delta=+1)
R_members=97           → PROXY: DRIFT (R_MEMBERS_DRIFT term=R_members declared=97 computed=98 delta=+1)
R_sections=63          → PROXY: DRIFT (R_SECTIONS_DRIFT term=R_sections declared=63 computed=60 delta=-3)
coverage_script=7      → PROXY: DRIFT (COVERAGE_SCRIPT_DRIFT term=coverage_script declared=7 computed=6 delta=-1)
coverage_runtime=7     → PROXY: DRIFT (COVERAGE_RUNTIME_DRIFT term=coverage_runtime declared=7 computed=6 delta=-1)
| coverage:script-layer | 7 |  → PROXY  error  AXES_DRIFT  coverage:script-layer: ## Axes row=7 derived=6
                                 → PROXY: DRIFT (AXES_DRIFT term=coverage:script-layer declared=7 computed=6)
                                                                                  # exit 1 for every row above

$ node scripts/proxy-check.mjs --src /nonexistent
proxy-check: fail-closed — SRC_NOT_A_DIR: --src /nonexistent is absent
PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /nonexistent is absent                    # exit 2
~~~

The `R_sections=63` row is worth reading twice: 63 is what the gate counts in the
`R` notes *before* the member filter, so a lane that copies the raw section count
into the stanza reads a drift whose delta is exactly the 3 out-of-family
sections.

## What a reusing lane must change

The formulas are lane-agnostic but their inputs are not: a second lane reuses
this by (1) copying `scripts/claims-check.mjs` and `scripts/proxy-check.mjs`;
(2) declaring its own layer partition as registry **id prefixes** — the split is
defined on the first character of the row id, so a lane that wants different
layers must re-charter that split, not rename rows; (3) writing its own
membership universe (this lane's is `scripts/` plus the two runtime source dirs,
and the counts are lane-local by construction); and (4) accepting the same
honesty ceiling — the gate prices member sections, never prose truth, so
`V_layer` will read well below 1.0 for any lane whose registry is partly
topic-form. Design record: `corpus/knowledge/executable-scorecard.md` (the parent
proxy's contract) and `corpus/knowledge/member-claims-gate.md` (the derivation
being imported).
