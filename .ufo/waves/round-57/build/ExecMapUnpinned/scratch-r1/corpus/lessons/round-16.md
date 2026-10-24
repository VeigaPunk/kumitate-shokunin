# round-16 — the successors' first measurement, and the honesty term that prices the gap

## What the round did

Round 15 retired `coverage` at saturation and wrote its successors' *terms* into
`## Planned` so that the round which measured them could not fit the definitions
to the number. Round 16 is that measurement, and it is a **tool** move rather than
a corpus move: the successors became machine-derived terms in
`scripts/proxy-check.mjs` — `coverage_script` and `coverage_runtime` — fed by
`scripts/claims-check.mjs`'s single registry/note derivation, exposed there as
`probeSections()` and imported in process by the proxy.

There is exactly one derivation, not two: the gate's `runCheck()` calls the same
`probeSections()` the proxy imports, the export is additive (`export { walkFiles,
parseRegistry, DEFAULT_SRC, SCORECARD_FILE, CORPUS_DIRS }`), and importing the
module from another module does not run `main()` — measured from `cwd=/tmp` with
`await import('<repo>/scripts/claims-check.mjs')`, which printed no verdict line,
returned `probeSections` plus the five names above, and read
`ok=true rows=19 sections=137` when handed the repo path.

The frozen terms, and the whole of their first measurement — arithmetic over
counts a non-author can re-run, never prose:

```sh
coverage:script-layer  = floor(10 × C1s/C1s_total × S_sections/S_members) = floor(10 × 8/8  × 74/114) = floor(6.4912) = 6
coverage:runtime-layer = floor(10 × C1r/C1r_total × R_sections/R_members) = floor(10 × 11/11 × 60/98)  = floor(6.1224) = 6
```

Both first factors are already at their ceiling — every registry row of both
layers reads `yes`, and no `no` cell is left anywhere in the registry — so from
this round on the two axes are driven entirely by the honesty term
`V_layer = sections/members`, the part the retired aggregate never measured. The
retired 10 splitting into 6 and 6 **is** the deliverable: a split has to expose a
worse number, and this one exposes −4 on both halves.

## What the terms are made of (measured from the tree, not from the prose)

The denominators are the frozen layer universe counted over the origin tree —
`S_members` 114 = 72 `scripts/*.mjs` + 42 files under `scripts/*/` (recursive),
`R_members` 98 = 93 `crates/ufo-core-runtime/src/*.rs` + 5
`crates/ufo-cli/src/*.rs` — the same 114 and 98 round 15 declared in `## Retired`:

```sh
$ SRC=/home/vgpnk/Projects/origin-work/ufo-fsd-alpha
$ ls $SRC/scripts/*.mjs | wc -l                                       → 72
$ find $SRC/scripts -mindepth 2 -type f | wc -l                       → 42
$ ls $SRC/crates/ufo-core-runtime/src/*.rs | wc -l                    → 93
$ ls $SRC/crates/ufo-cli/src/*.rs | wc -l                             → 5
```

The numerators are the claims gate's own member sections, reduced per layer from
its `--json`, so a re-derivation does not have to trust this note's transcription
of them:

```sh
$ node scripts/claims-check.mjs --json | node --input-type=module -e '
const j = JSON.parse(await new Response(process.stdin).text());
for (const L of ["S","R"]) {
  const rows = j.rows.filter(r => r.id.startsWith(L));
  console.log(L, "rows=" + rows.length, "yes=" + rows.filter(r => r.covered).length,
    "sections=" + rows.reduce((a, r) => a + r.sections.length, 0),
    "inFamily=" + rows.reduce((a, r) => a + r.sections.filter(s => s.inFamily === true).length, 0));
}'
S rows=8 yes=8 sections=74 inFamily=74
R rows=11 yes=11 sections=63 inFamily=60
```

The two columns are the round's one genuine definition edge (below): the gate
counts 137 member sections, but only 74 + 60 = **134** of them are *in family*
(`sections[].inFamily === true`), the rest being the three `SECTION_FILE_NOT_MEMBER`
sections R9's note carries (`loop_driver_tests.rs`, `local_ship_tests.rs`,
`distill_tests.rs` — members of R2/R6/R7). The frozen numerator is the in-family
one, because a layer must not be credited with members its own rows never
verified:

```sh
$ node scripts/proxy-check.mjs --json | node --input-type=module -e '
const j = JSON.parse(await new Response(process.stdin).text());
const t = j.terms;
console.log(JSON.stringify({S_members:t.S_members, S_sections:t.S_sections,
  R_members:t.R_members, R_sections:t.R_sections,
  coverage_script:t.coverage_script, coverage_runtime:t.coverage_runtime}));'
{"S_members":114,"S_sections":74,"R_members":98,"R_sections":60,"coverage_script":6,"coverage_runtime":6}
```

What the ratio prices, stated as a subtraction rather than as a sentence about
prose: **40 of the script layer's 114 declared members and 38 of the runtime
layer's 98 have no in-family member section the gate can verify** (114 − 74 and
98 − 60), i.e. the 9 rows that are still note-existence-only, against 134 of the
212 declared members gated overall (0.632). That is the number the retired
aggregate had no way to express, and it is the number the two successors carry.

## Before → after (same tools both sides)

The `before` block was read at the round's opening, with both tools still at the
digests the stanza declared (`pin.proxy-check` and `pin.claims-check` both
matched, i.e. `pins=5 match`); the `after` block is the same two commands with the
round-16 tools in place — the proxy line read with the stanza's two digests at
their closing values, because the re-pin itself was still owed when this note was
written (recorded below, not hidden).

```sh
before  $ node scripts/proxy-check.mjs
        PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10; pins=5 match)   exit 0
after   $ node scripts/proxy-check.mjs --scorecard /tmp/r16-lesson/sc-current-pins.md
        PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=52/52 coverage=10; S=74/114
                       coverage:script-layer=6; R=60/98 coverage:runtime-layer=6; pins=5 match)   exit 0

before  $ node scripts/claims-check.mjs
        CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)                          exit 0
after   $ node scripts/claims-check.mjs
        CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)                          exit 0
```

The claims line does not move, and that is the point of the refactor: the gate's
totals are the *same object* the proxy now consumes, so widening the proxy could
not be allowed to change one character of the gate's verdict — it prints what
`probeSections()` returns, and the export is additive.

The `after` proxy line is the round's closing arithmetic, read with `--scorecard`
pointed at a copy of this scorecard whose only difference is the two digest
lines: the re-pin lives in `SCORECARD.md`, not in the tool, and at the moment
this note was written it was still owed (the tool file was still being edited —
five distinct digests were observed for it between its first post-round-15 edit
and this note's write time, `890d325d` … `5ed61cbe` — so no pin could have been
recorded against it). The same command against the un-re-pinned scorecard reads
`PROXY: DRIFT (PIN_DRIFT term=pin.proxy-check …; PIN_DRIFT term=pin.claims-check
…)` exit 1 and **nothing else** — measured on every re-run — so the numbers above
are the ones the plain run prints the moment that re-pin lands.

Mid-round, before the stanza caught up, the same command was a measured `DRIFT`
twice over — not a defect but the two tripwires working: `C2_total` read 51
(this lesson had not landed yet, and the stanza was already written for the
round's final 52/52), and the two `PIN_DRIFT` rows were the re-pin the tool owner
owed after editing the two files. The pin arm is re-runnable on demand — a
scratch scorecard carrying the round-15 digests, next to a tree whose two files
have moved:

```sh
$ cp SCORECARD.md /tmp/r16-lesson/sc-stale-pins.md      # copy, then restore the two round-15 pin values in it
$ node scripts/proxy-check.mjs --scorecard /tmp/r16-lesson/sc-stale-pins.md
PROXY  error  PIN_DRIFT  pin.proxy-check: declared=d0a722c5… computed=61a014c3…
PROXY  error  PIN_DRIFT  pin.claims-check: declared=d0f95fa0… computed=57b8d3d4…
PROXY: DRIFT (PIN_DRIFT term=pin.proxy-check …; PIN_DRIFT term=pin.claims-check …)   exit 1
```

(the digests are abbreviated to their first eight hex; the tool prints all 64.)

## The pre-registered fallback, refuted by measurement

The round-15 plan pre-registered one fallback: if `V_layer` turned out to
**double-count** `C1_layer` (the worry being that a family is either
all-section-form or all-topic, so the two factors might move together), the
successors were to become `floor(10 × C1_layer × F_layer)` with `F_layer` the
file-level residue of that layer — a form that would put a *second* origin-tree
walk in the proxy, priced at the time as the second choice.

Measurement refutes the double-count in the only way that counts: `C1_layer` is
**1.0 for both layers** (8/8 and 11/11) while `V_layer` is **0.649123** and
**0.612245**. A factor pinned at its ceiling cannot be re-encoding a factor that
is not: if the two were one measurement under two names, `V` would read 1.0
wherever `C1` does and both products would have stayed at the retired 10. They
did not, and the two layers' `V` values differ from each other while their `C1`
values are both exactly 1.0 — so the second factor carries information the first
cannot. The fallback was therefore **not** taken, and the consequence is
concrete: the proxy did not acquire a second origin-tree walk, and the file-level
residue stays what it was — an unscored, hand-re-run diagnostic in this
scorecard rather than a hidden third term.

## The honesty price: the proxy stops being self-only

Round 14 refused to put origin-tree I/O in `scripts/proxy-check.mjs` on the
grounds that `A` counts files, so a new mode inside an existing file would move
no term while moving the tool's fidelity; round 15 then priced the successors'
cost as an **import, not a subprocess**. Round 16 paid it, and the amendment is
recorded here rather than left to be discovered.

The header's bound before this round read, verbatim:

> Reads only, under `--self` + the scorecard: no writes, no network, no
> subprocess, no git, no lock.

and, one paragraph down, the sentence that made this tool unusual among its
siblings:

> No environment variable is consulted — unlike its siblings, whose defaults are
> env-overridable, the only defaults here are the scorecard and tree next to this
> script, so a polluted env cannot move a measurement.

After the amendment the bound is split, term by term: the legacy terms
(`A C C1 C1_total C2 C2_total` plus the derived `operability` / `coverage`)
remain self-only, while the layer terms read the origin tree **exactly once, in
process**, through the imported `probeSections()` — no subprocess, no second
traversal, no writes, no network. `--src` now exists (`default: $UFO_SRC or
/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`), which is the env-override the
old sentence ruled out for the scorecard path. Each price has a measurement:

- **Fail-closed before any number is printed.** The layer terms cannot be scored
  without the tree, so a non-directory `--src` refuses the verdict, both arms
  measured:
  `node scripts/proxy-check.mjs --src /nonexistent` →
  `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /nonexistent is absent`, exit 2; and
  `--src scripts/proxy-check.mjs` → `… is file`, exit 2. The claims gate carries
  the same kind name (`CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR --src /nonexistent is
  absent)`, exit 2, measured before the proxy's landed), which is what makes the
  pair auditable: the two tools refuse in the same vocabulary. The arms are
  suite-pinned too: `node scripts/proxy-check.mjs --selftest` →
  `PROXY_SELFTEST: 71/71 pass`, `PASS [71/71] every declared fail-closed arm
  fires in at least one fixture — 11 arms observed`, `VERDICT: PASS`, exit 0
  (55 cases before the round).
- **The recursive definition of `scripts/*/` had to be written down.**
  `find $SRC/scripts -mindepth 2 -type f | wc -l` is 42, but
  `find $SRC/scripts -mindepth 2 -maxdepth 2 -type f | wc -l` is **38**: the
  other 4 files sit at depth 3 (`charter-scribe/systemd` 2,
  `charter-scribe/prompts` 1, `lean-cargo/bin` 1). Depth-1 is not an equivalent
  reading — it makes `S_members` 110 — and it is only *harmless* by accident:
  `floor(10 × 74/110)` is still 6. The frozen term says recursive; a reader who
  shortcuts it lands on a different denominator under an unchanged verdict,
  which is exactly the class of error no gate can see.

## A split that has to expose a worse number

The fleet's test is kasegi's, read from their file rather than recalled:
`kasegi-shokunin/SCORECARD.md:76-77` — "Splitting exposes a *worse* number rather
than concealing it, which is the test for whether a split is honest." Their own
split (`depth` → `depth:density` + `depth:verifiability`) recorded "No axis
retired"; this lane's is the first retirement-at-saturation in the fleet, so the
test is applied to a retirement rather than inherited from a precedent.

| | Retired `coverage` | `coverage:script-layer` | `coverage:runtime-layer` |
|---|---|---|---|
| first factor | `C1/C1_total` 19/19 = 1.0 | `C1s/C1s_total` 8/8 = 1.0 | `C1r/C1r_total` 11/11 = 1.0 |
| second factor | `C2/C2_total` 50/50 = 1.0 | `S` 74/114 = 0.649 | `R` 60/98 = 0.612 |
| score | **10** | **6** | **6** |

The retired axis had *both* factors at their ceilings — that is why it was
retired, and why it could not read anything but 10. The successors keep the
registry half and replace the README half with the member-gating half the
aggregate never had, so the number falls to where the lane's own record says it
belongs (134 of 212 members gated). The pre-registered per-layer variant that
kept `C2` instead would have read 10 and 10 under two new names: it concealed the
gap, and round 15 refused to land it for that reason. This round's numbers are a
drop of four points on both halves, entirely from the honesty term — the opposite
of concealing.

## What the round found unplanned

1. **The forecast's numerator and the frozen definition's numerator differ.**
   The pre-registered arithmetic read `R_sections=63` (the gate's own R-row
   `sections` total) and forecast `floor(10 × 63/98)` = 6; the frozen term counts
   only `sections[].inFamily === true` and therefore reads **60**
   (`floor(10 × 60/98)` = 6). The 3-section gap is R9's note naming
   `loop_driver_tests.rs`, `local_ship_tests.rs` and `distill_tests.rs` — all
   gate-warned `SECTION_FILE_NOT_MEMBER`, all members of R2/R6/R7 — which the
   gate counts but does not verify as R9's. Same integer, different denominator:
   recorded because a reader re-deriving 63 from the gate's `sections=137` would
   otherwise read the tool as wrong. The stanza now carries 60, and the visible
   consequence is that 74 + 60 = 134 ≠ the gate's `sections=137`.
2. **Both successors read the same integer.** 6 and 6: the split separates the
   two layers by *term*, not yet by *value*, and with `C1_layer` pinned at 1.0 the
   only thing that can separate them is `V` (0.649123 against 0.612245 — 40
   ungated script members against 38 ungated runtime members). Recorded so a
   future reader does not read two equal integers as one axis measured twice.
3. **The origin tree moved and the layer universe did not.** Round 15 read
   `93798be12`; this round reads `5725fa7d3` (2026-09-28 22:49, 35 dirty paths)
   — yet `git diff --name-status 93798be12..HEAD -- scripts
   crates/ufo-core-runtime crates/ufo-cli | wc -l` → `0`, no file in those three
   trees has an mtime after 2026-09-28 20:00, and the single dirty path inside
   the layer universe is `scripts/fleet-dispatcher.test.mjs`. So this round's
   `S_members`/`R_members` are HEAD-independent *by measurement* rather than by
   assumption, and the 212-file universe is the one round 15 measured.
4. **The round's own memo moved its own denominator.** The stanza was written
   for the round's final corpus (52 README rows / 52 notes), and before this
   lesson landed the proxy computed `C2_total=51` and printed `C2_TOTAL_DRIFT`
   — measured, then resolved by writing the note rather than by editing the
   stanza. A lesson that records a count is part of that count, which is why the
   closing numbers can only be written once every artifact carrying them exists,
   and why the tripwire rather than the prose is the source of truth about when
   that is.

## L2 fleet (one batched dispatch, one writer per file)

The round was split so that no two lanes held one file, and the split is visible
in the lanes' own roster titles: `ExecProxyLayers` ("Recounting layer terms with
inFamily filter") owns `scripts/proxy-check.mjs` and the `--src` arm;
`ExecClaimsExport` ("Proving import is cwd-independent and cleaning scratch")
owns the export/main-guard proof; `ScoutLayerBoundary` ("Faithful note-stem
section derivation") re-derived the section halves independently of the tool;
`ExecScorecard` ("Mapping scorecard headings with line numbers") owns
`SCORECARD.md` and wrote the twelve-count stanza and the `## Axes` rows;
`ExecCorpusDocs` owns `corpus/README.md`; `ExecAxisNote` owns the new
layer-axes note; `ExecSkill`, `DistillerHeads` and `ConnectorSiblings`
cross-checked the record; `CriticTerms` read the terms adversarially;
`PlannerR17` planned the next round; L1 assembled and ran the close gates. This
note records only what its own author measured or quoted with its command — the
fleet's arms belong to the lanes that ran them.

## Gaps this round leaves open

- Both successors carry a **dead first factor**: `C1_layer` is 1.0 for both
  layers and cannot move (no `no` cell remains in the registry), so any future
  move on either axis must move `V_layer` or re-derive the terms. A number that
  cannot move is a number that will be claimed at its ceiling again if nobody
  watches it.
- `V_layer` counts **shape, not truth**, the gate's limit since round 14: a
  member section with a live own-file anchor and a verbatim symbol passes whether
  or not the sentence around it is true, and 78 of the 212 declared members have
  no in-family section at all (40 script-layer, 38 runtime-layer). The gap is not
  one kind of row: the 9 topic-form rows have no member sections, and 4
  section-form rows are flagged `MEMBER_COUNT_SUSPECT` (R3 5 declared / 2 found,
  R4 6/3, R6 4/2, R8 4/3) — none of those members can be probed today.
- The denominators move with the tree, not with the registry: a future origin
  commit that adds or removes a layer file changes both scores with no edit in
  this repo — which is why `--src` is a parameter, and why the next round should
  read the two scores as a function of a *stated* tree revision rather than of
  "the origin".
- The proxy still cannot see a *reason*: it recomputes arithmetic over one more
  input than before (the origin tree, through one import) and compares it with
  this scorecard's claim. It cannot show that a member section is *about* its
  member, only that it exists and carries the shape the gate checks.
- **One step of the round was still owed when this note was written**: the two
  digest lines in the stanza (`pin.proxy-check`, `pin.claims-check`) still carry
  the round-15 values, so a plain `node scripts/proxy-check.mjs` reads the
  two-row `PIN_DRIFT` above rather than the green line. Everything else in the
  round is green, the re-pin is a byte edit in this scorecard and not in the
  tool, and the note records the state instead of the intention.
