CROSSAXIS separable=yes shared_files=scripts/proxy-check.mjs,SCORECARD.md

# Connector — C1/C2/C3 causal separability and integration order

Claim-level: **yes**, each claim is verifiable with the other two absent. Gate-level: **no** — all three
feed one `proxy-check` run whose 17 declared terms must agree simultaneously, and the 23-key stanza pins
`scripts/proxy-check.mjs` (C1+C3) and `scripts/kimi-census.mjs` (C3) by full sha256, so no claim can be
re-pinned before the other's edit to the same file lands.

## Evidence (commands run, outputs)

`node /tmp/kr35-cross.mjs` (imports `probeSections`, src=/fast/scratch/kumitate-r35/src):
```
S occ 86 distinct 86 S1:1 S2:7 S3:2 S4:5 S5:2 S6:5 S7:6 S8:58
R occ 83 distinct 83 R1:8 R2:12 R3:5 R4:6 R5:0 R6:4 R7:0 R8:4 R9:1 R10:2 R11:41
S_members 88
missing sections: [ 'scripts/omp-route-grammar.mjs', 'scripts/ufo-swarm-registry.mjs' ]
```
`node /tmp/kr35-cross2.mjs` (all-sections identity variant + unresolved/foreign counts):
```
S occ 86 distinctFile 86 distinctFileOrHeading 86 unresolved 5 foreign 1
R occ 83 distinctFile 83 distinctFileOrHeading 83 unresolved 0 foreign 3
```
`node /tmp/kr35-cross3.mjs` (identity over *all* sections, `file ?? heading`; dup/drop simulation):
```
S sectionsAll 92 distinctAll(file??heading) 91 occInFamily 86 distinctInFamily 86
R sectionsAll 86 distinctAll(file??heading) 84 occInFamily 83 distinctInFamily 83
SIM occ before 86 after 86 | distinct before 86 after 85 | dropped scripts/fleet-dispatcher.mjs dup scripts/run-omp-native-trial.mjs
```
`git --no-optional-locks status --porcelain` → ` M corpus/knowledge/remaining-scripts-census.md`; `?? .ufo/waves/`.
HEAD is `1770305`; the note is **already dirty** (+81/−64: prose, counts, member table; no `## ` heading change).

## 1. Per-claim separability

| claim | standalone verification | does not need |
|---|---|---|
| C1 | `proxy-check --selftest` (new dup-one/drop-one cases; baseline 104 cases) + `--json` `terms.S_sections==86`, `R_sections==83` on the live tree (`proxy-check.mjs:595` current occurrence loop) | C2 registry, C3 K rules |
| C2 | note sections added/removed + probe sum `S 88/88` and `claims-check --row S8` `sections=60 errors=0` | C1 semantics (values equal, §4), C3 |
| C3 | `kimi-census` CLEAN, `K 51/51`; proxy `terms.K_members/K_sections == 51`; heading already exists (`kimi-mcp-plane.md:21`) | C1 S/R, C2 src registry |

C3's only real cross-dependency is the shared `proxy-check.mjs` (below); C2 and C3 are independent layers, and C1 has no dependency on C2's numbers.

## 2. Files two claims both touch

- `scripts/proxy-check.mjs` — **C1**: `layerTerms` occurrence loop `:595` (+ header doc `:27-96`, + new
  selftest cases). **C3**: `K_MEMBER_RULES` `:345-374`, header doc, fixture `FX_KIMI_FILES` `:1145`,
  `fxBase` default `K_members: 29` `:1315`, and every literal verdict string carrying `K=.../29`.
  Overlap regions: header doc comment; the selftest base arithmetic and literals.
- `SCORECARD.md` — **C2**: S8 registry row `:126` members cell 63→60, stanza `S_members=88`,
  `S_sections=88`, `coverage_script=10` (`:277` block), Axes row `coverage:script-layer` `:309`.
  **C3**: stanza `K_members=51`, `K_sections=51`, K1 registry row `:137` 3→4, Axes row
  `coverage:kimi-layer` `:311`. **C1**: `pin.proxy-check` only. One file, three writers → single owner.
- `scripts/kimi-census.mjs` — C3 only (`MEMBERS` `:104-107`, `FROZEN` `:149`, selftest `:716-724`), but
  its pin lives in the same stanza, so a C3-only edit still invalidates the shared block.
- `corpus/knowledge/remaining-scripts-census.md` — C2 only; `corpus/knowledge/kimi-mcp-plane.md:21` — C3
  reads an existing heading, no edit needed.

## 3. Integration order

Recommended single-owner order:
1. **C3 proxy edits first** (K rule + fixture K1 3→4, total 29→30). Adding the rule before C1's new cases
   means C1 writes its cases against the final fixture arithmetic; the reverse order forces a second pass
   over C1's freshly written `K_members=29` literals.
2. **C1 rebased on C3** (`layerTerms` distinct set + 3 selftest cases; 104→~107 cases).
3. **C2 note edit** (disjoint file) — see dirty-tree hazard in §5.
4. **One SCORECARD pass by L1** (registry S8 63→60, K1 3→4, stanza S 88/88 `coverage_script=10`,
   K 51/51, `C2_total=78` if the README row lands, Axes prose), then compute `pin.proxy-check` and
   `pin.kimi-census` from the final tree. Pins last is mandatory: they hash the files edited in 1–2.
5. Verify once: `proxy-check --src … --json`, `claims-check --src … --row S8`, `kimi-census`,
   `proxy-check --selftest`.

Why not C2-first: C2 measures `S_sections` through whatever proxy semantics are live. It is numerically
safe here (§4), but only the C1-then-C2 order makes C2's declared 88 provably a *distinct* 88 rather than
an occurrence 88 that a duplicate could inflate. Why not C1 and C3 in parallel branches: both edit
`proxy-check.mjs`'s header, fixture base and literal verdicts; the second patch needs a manual rebase and
only then can the pin be computed.

## 4. Does C1's distinct derivation change C2's measured value?

**No — measured, on the baseline and on the C2 target.** S: occurrence 86 = distinct 86 (per row
`S1:1 S2:7 S3:2 S4:5 S5:2 S6:5 S7:6 S8:58`); R: 83 = 83. No S/R row contains a duplicate member section.
The five deleted members survive only as unresolved headings (`file:null`, `inFamily:undefined`), so both
derivations already exclude them. C2 adds exactly two sections for two uncovered members → 88 occurrences
and 88 distinct identities; `coverage_script = floor(10×8/8×88/88) = 10` under either. C1 is a guard, not
a mover, of C2's value.

Conditional ways it *would* move it (implementation constraints for ExecDistinct):
- **H1 (masking).** If the identity set admits unresolved sections (identity over all rows as
  `s.file ?? s.heading`, i.e. dropping the `inFamily === true` filter), S reads **91** = 86 + 5 unresolved
  headings — exactly the stale declared `S_sections=91`. `S_SECTIONS_DRIFT` would vanish and
  `coverage_script = floor(10×91/88) = 10` would match, masking all five dead members; R would read 84.
  Distinct must be built only over `inFamily === true` sections, whose `file` is always non-null.
- **H2 (duplicate).** If C2 gives an already-covered member a second section (e.g. repurposes a dead heading
  to a live member that already has one), occurrence 88 but distinct 87 → `S_SECTIONS_DRIFT` +
  `COVERAGE_SCRIPT_DRIFT` (9), and `claims-check:401`'s per-row `MEMBER_COUNT_DRIFT` fires too.
- **H3 (pre-C2 evidence).** ExecDistinct's acceptance says `S_sections` "must still be 86"; that is only
  true pre-C2. After integration the invariant is distinct==occurrence at 88, not 86. Re-running the 86
  assertion post-integration would report a false failure.

## 5. Contradictions and second-order effects

- **The trio does not turn the lane gate green.** Baseline also carries `C2_TOTAL_DRIFT` declared 77 vs
  computed 78 (an error, so it blocks MATCH). ScoutC2Readme drafts the missing `corpus/README.md` row; the
  stanza `C2_total=78` must land in the same L1 pass. C1/C2/C3 neither cause nor fix it.
- **`claims-check` CLI stays DRIFT after C2** (`SECTION_DEAD_ANCHOR row=R11 … round.rs` anchors 17–20,
  runtime layer, plus warnings). Proxy consumes only `probeSections().ok` + rows, not findings, so a green
  proxy can coexist with a red claims gate. C2's acceptance must be `--row S8 sections=60 errors=0`, never
  the global `CLAIMS: MATCH`.
- **Base tree is dirty (changed after the baseline).** `corpus/knowledge/remaining-scripts-census.md`
  mtime 21:22:14, baseline 21:11:12: the working tree now declares the 31c465f1 counts 88/60 and lists the
  two added members in its table, but keeps all five departed member `## ` headings and adds no sections
  (68 `## ` headings, no `Departed members` section). Section-level terms are unchanged vs the baseline
  (S 86/88, 5 unresolved, 2 uncovered). ExecS8Writer clones HEAD `1770305`, which lacks these edits; its
  patch will conflict with, or regress, this prose. L1 must reconcile before/at integration.
- **C3's K_sections needs no note edit**: `kimi-mcp-plane.md:21` ``## `~/.kimi-code/mcp.json` `` normalizes
  to `mcp.json` (`proxy-check.mjs:655-670`) and binds once the rule exists. But SCORECARD `:311` still
  says mcp.json "stays outside K … until round 35" — prose is unmeasured; only the integer 10 is gated, so
  a stale sentence survives MATCH. Same for the C2 Axes row: its integer is already 10, so C2's 9→10
  change is visible only through the stanza terms and `COVERAGE_SCRIPT_DRIFT`/`AXES_DRIFT`, not via a
  numeric Axes change.
- **C3 mirror rule**: add `mcp.json` to `K_MEMBER_RULES` with `secret: true` (as `server.token` `:366`), not
  a plain `kind:'file'`. Census treats a SHAPE-ONLY file as any non-dir leaf (`kimi-census.mjs:296-298`);
  proxy's non-secret arm requires exactly `kind==='file'` (`:640-643`). Without `secret`, a symlink/FIFO
  replacement counts in the census (51) but not in the proxy (50) — a cross-gate split on the same host.
  Live `~/.kimi-code/mcp.json` is `-rw-r--r--`, so a 0600 mode floor passes (0644 & 0600 == 0600); 0700
  would fail.
- **C3 fixture ripple**: proxy fixture K1 3→4 makes the hand total 29→30, touching every literal `K=…/29`
  and `K_members: 29` (e.g. `:1315`, `:1424-1427`, `:1597` and the literal verdict strings at `:1352-1374`).
  Census selftest `FROZEN.K1` assertions (`:527-533`, `:696`) and the mcp.json case `:716-724` invert.
- **ExecMutationBefore instrument risk**: `S_SECTIONS_DRIFT` already fires pre-C2 (declared 91 vs 86), so a
  verdict/finding-presence kill signal would say "killed" before C1. It must key on the computed term
  change (86→85 pre-C2; 88→87 post-C2), as its prompt's term clause already allows.

## Risks

- Pin churn: any post-pin edit to `proxy-check.mjs` or `kimi-census.mjs` re-reds `PIN_DRIFT`; the stanza is
  the only pin location and v1 forbids new keys (`sources-check` stays `PIN_UNPINNED`, exit 1 under `--strict`).
- C1's live value is unchanged today, so only the hermetic mutation cases plus the post-C2
  distinct==occurrence check distinguish a correct implementation from a no-op; C2-first is numerically
  safe by measurement but leaves C2's 88 as an occurrence count a later duplicate could inflate.

## Verification (post-integration, one run each)

`node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src --json` → `S_sections=88`,
`S_members=88`, `coverage_script=10`, `K_members=51`, `K_sections=51`, `C2_total=78`, 6 pins match;
`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8` → sections=60, 0 errors;
`node scripts/kimi-census.mjs` → CLEAN, members=51; `node scripts/proxy-check.mjs --selftest` → pass (`C1` cases + `C3` fixtures).

Tooling: none installed or upgraded (no pacman transaction, no uv/npx install).
