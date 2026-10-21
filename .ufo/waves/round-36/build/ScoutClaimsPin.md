CLAIMS-PIN-MAP sites=19 selftest-cases=39 new-fixtures=10

# ScoutClaimsPin — PIN v1 / FIDELITY v1 edit map for `scripts/claims-check.mjs`

Read-only. No file edited, no git/jj mutation. Verified: `node scripts/claims-check.mjs --selftest`
→ `CLAIMS_SELFTEST: 39/39 pass` / `VERDICT: PASS` (run from the lane repo, 2026-10-21).
All lines are `scripts/claims-check.mjs` unless another path is named.

## A. Edit sites (19)

1. **Header contract doc `:1-61`** — findings table `:28-39`; verdict/exit map `:52-55`;
   the read-only sentence `:57-61` ("Zero dependencies … never writes a file anywhere") must
   grow the pin assertion (`git -C <src> rev-parse HEAD` reads the clone; it writes nothing)
   and a FIDELITY block. Contract ids `:68` (`CONTRACT='kumitate-claims-v1'`).
2. **USAGE `:122-140`** — option list `:128-137`, exit map `:139`. Add
   `--pin FILE`, `--fidelity`, `--fidelity-ratchet FILE`; name `src-rev=` on the verdict.
3. **`SRC_CANDIDATES` `:78-81`, `resolveSrcDefault` `:89-93`** — PIN v1's sibling
   `resolvePin()`/`pinFile()` belongs here (`DEFAULT_PIN_REL='.ufo/pins/origin.json'`,
   `PIN_CONTRACT='kumitate-origin-pin-v1'`). Keep `resolveSrcDefault` semantics byte-identical
   (four selftest cases `:756-781` assert candidate order and `SRC_NOT_A_DIR`).
4. **Constants `:99-111`** — `RE_CHUNK_HEAD :100`, `RE_EXT :101`, `RE_PATHISH :102`,
   `RE_BARE :103`, `RE_SYMBOL :104`. Add `RE_FID_BARE=/^:(\d+)(?:-(\d+))?$/`,
   `RE_FID_PATH=/^([A-Za-z0-9_][\w./-]*):(\d+)(?:-(\d+))?$/` (full-span match — the gate's two
   regexes are substring scanners and stay untouched), plus `FIDELITY_CONTRACT`,
   `RATCHET_CONTRACT='kumitate-fidelity-ratchet-v1'`.
5. **`FAIL_CLOSED_KINDS :105-109`** — add `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE`
   (and `RATCHET_MALFORMED`, `RATCHET_REV_STALE` if they ride the same coverage case `:849-850`;
   that case forces a firing case per token, i.e. +4 selftest cases minimum).
6. **`backticks` `:193-201`** — keep for the gate. FIDELITY adjacency needs character offsets,
   so add `spansOn(line)` returning `{t,s,e}` from `RE_SYMBOL` (definition `:104`) directly
   beside it. `RE_SYMBOL` is global and stateful; every new consumer must reset `lastIndex`.
7. **`sectionBodyChunks` `:293-296`** — currently `return parts.slice(1).map(p=>p)`; the split on
   `/^## /m` drops line offsets. Must return `{text, headingLine}` (1-based line number of the
   `## ` line) so FIDELITY can print/attribute per-note lines without re-scanning headings.
   Sole caller: `:345`.
8. **`probeRow` heading/body `:345-351`** — `RE_CHUNK_HEAD.exec(chunk)` `:346`, heading-shape
   test `:347-348` (`tok.includes('/') || RE_EXT.test(tok)`), `const body = chunk` `:350`,
   `const bodyNoHead = body.slice(body.indexOf('\n')+1)` `:369`. `bodyNoHead` is the FIDELITY
   walk window (heading line excluded, as the contract requires).
9. **Section records `:354`, `:359`, `:389-392`** — three push sites; `:389-392` is the resolved
   one (`{note, heading, file, anchors, live, symbols, symbolHit, inFamily}`). Add
   `body` (=`bodyNoHead`) and `bodyStartLine` to the resolved push and `null`s to the two
   refusal pushes. This is the ONE derivation FIDELITY must reuse ("walks only the member
   sections the registry gate already parses"); do not re-scan `## ` headings in fidelity code.
10. **Anchor scans `:366-376`** — `RE_PATHISH.lastIndex=0 :367`, scan `:370-373`,
    `RE_BARE.lastIndex=0 :374`, scan `:375`; `ownAnchors :376`, `live :377-378`.
    **Do not widen or narrow these**: the un-backticked parenthesis case (`:842`) is frozen
    registry semantics. FIDELITY's anchors are backticked spans only — a separate pass.
11. **Symbol filter `:382`** — `backticks(bodyNoHead).filter(t => !/[/\\:.\s]/.test(t) && t.length>=3)`.
    Registry-only. FIDELITY's pairing rules (adjacent span, ≤14 chars, non-anchor, non-path-like,
    ≥3 trimmed, not punctuation/digits-only) need a new `pairSymbol(spans, idx)`.
    "Path-like" is undefined in the contract; align it with `:347` (`/[\/\\]/ || RE_EXT.test(t)`).
12. **New `fidelityFor({self, src, rows})`** — insert before `/* modes */` (`:417-423`).
    Consumes `rows[].sections[]` records from site 9, aggregates per note (a note shared by two
    rows must not double-count), returns `{notes:[{note,anchors,ok,elsewhere,absent,dead,noid,nonok}], totals}`.
    Classification priority is the contract's one implicit point — see §C.
13. **`renderVerdict` `:424-436`, call `:535`** — add a `rev` argument; append
    `` ` src-rev=${rev.slice(0,12)}` `` inside `CLAIMS: MATCH (…)` / `CLAIMS: DRIFT (…)` when a
    pin is active, omit the segment otherwise (portability clause).
14. **`failClosed` `:438-459`** — textual arm `:449`; JSON body `:440-450` gains `srcRev`, `pin`.
    FIDELITY needs its own printer (`FIDELITY: FAIL-CLOSED (<TOKEN> <detail>)`, exit 2) or a
    `mode` field here; the contract fixes only the exit code, not the line shape.
15. **`probeSections` `:463-484`** — returns `{ok:true, rows, totals, files}` `:484`.
    PIN must **not** enter this function: `scripts/proxy-check.mjs:1048` imports it and passes an
    explicit `src`; a pin-aware default would silently re-point that import. Additive keys
    (`src`) are safe — the only consumer reads `ok`/`rows`/`totals`/`files`
    (`scripts/proxy-check.mjs:1048-1057`).
16. **`tally` `:486-501`** — leave alone; folding fidelity `nonok` into `warnings` would break the
    frozen `CLAIMS: MATCH (rows=… adv=…)` strings asserted at `:630`, `:728`, `:831-832`.
17. **`runCheck` `:504-538`** — verdict computed `:519`, text render `:530-536`, JSON body
    `:520-529`, return `:538`. Plumb `opts.srcRev` into both renderers; the pin assert itself
    should run at the top of `runCheck` (before `:506`) so `SRC_REV_MISMATCH` precedes the tree walk.
18. **New `runFidelity(opts, started)`** next to `runCheck` (~`:540`): emit one
    `FIDELITY note=<note> anchors=… ok=… elsewhere=… absent=… dead=… noid=… nonok=…` line per
    note with `anchors > 0`, then `FIDELITY_TOTAL …`, then the verdict; apply `--fidelity-ratchet`
    (`{contract, revision, notes, total}`) with `RATCHET_MALFORMED`/`RATCHET_REV_STALE` exit 2 and
    the else-clean ratchet (listed note ≤ ceiling, absent note = 0, `total` ≤ ceiling).
19. **`parseArgs :878-908` + `main :909-916` + exports `:874` + selftest helpers `:543-597`**
    - opts literal `:879` gains `pin:null, fidelity:false, fidelityRatchet:null, srcRev:null`;
    - flags inserted with the existing `need()` idiom `:884-885` (usage exit 64 on a valueless flag),
      at `:889-892`;
    - the src-default branch `:906-907` becomes: pin resolved first (default
      `<self>/.ufo/pins/origin.json` when it `existsSync`s), then
      `src = pin.clone` when `--src` absent, else `resolveSrcDefault()`; `--selftest/--help` still
      stat no live path;
    - `main :913-914` → `if (opts.fidelity) process.exit(runFidelity(opts, started));` before
      `runCheck`; `-h :911` unchanged;
    - exports `:874` add `resolvePin` (proxy-check's C1d pin should import the ONE authority rather
      than fork it) and, if useful, `fidelityFor`;
    - fixture helpers `:543-597` per §B.

## B. Selftest: existing cases and fixture plan

**Existing: 39 cases**, all in one `selfTest()` (`:599-869`): 34 literal `check(...)` calls plus the
`arms` loop `:736-750` expanding one `check` to 5 (`:744`). Green baseline `:625-636`;
finding-kind cases `:637-704`; `--row`/`--json` `:705-733`; fail-closed arms `:735-750`;
derived-`--src` portability `:752-781`; usage `:785-816`; hermeticity/totals/symbol-threshold/
heading/paren cases `:818-847`; kind-coverage `:849-852`.

Helpers and their constraints:
`FIXTURE_FILES :543-549` (a.mjs 6 lines: `ALPHA_MARK` on L3; b.mjs 4 lines; dup pair; c.rs);
`fixtureSrc :551-558`; `fxNote :559-564`; `FX_GREEN_NOTE :565`; `FX_GREEN_ROWS :566-572`;
`fxRepo(root,{rows,notes,extra}) :573-579` (writes SCORECARD + corpus dirs); `runClaims(args,env)
:581-586` (already merges env — reuse for `PATH`-less pin cases); `verdictLine :588-592` **returns
the LAST stdout line**, which FIDELITY satisfies; `kinds :593-598` parses only `CLAIMS  ` lines, so
fidelity assertions need a sibling `fidCounts(run)`; `mk :611` (builds `self` + `<name>-src` from
`FIXTURE_FILES`); `args :612`; `ok(...) :613-625`.

**new-fixtures = 10** — 3 new helpers, 1 extended helper, 6 fixture data shapes:

| # | Fixture | Shape |
|---|---|---|
| F1 | `fxGitSrc(dir)` | `fixtureSrc(dir)`; `git init -q`; `git -c user.name=fx -c user.email=fx@x add -A`; `commit -q -m fx`; return `rev = git rev-parse HEAD` (spawnSync, env-isolated, under `tmp`). Needed by every pin case that must verify. |
| F2 | `fxPin(self,{revision,clone,contract?})` | writes `<self>/.ufo/pins/origin.json` with `{contract:"kumitate-origin-pin-v1", repo:"ufo-fsd-alpha", revision, clone, recreate:"…", verified_at:"2026-10-21"}`; optional bad-contract variant for fail-closed. |
| F3 | `fxRatchet(path,{revision,notes,total,contract?})` | writes the `kumitate-fidelity-ratchet-v1` JSON; malformed variant writes `{"contract":"wrong"}` or a string ceiling. |
| F4 | `mk` extension `:611` | accept `{notes, rows, pin, clone, git:true, ratchet}` so `sync` returns `{self, src, rev}`; today `mk` hardcodes `fixtureSrc(<name>-src)` and cannot supply a git clone. |
| F5 | note shape **elsewhere** | `## \`scripts/a.mjs\`\n\n\`ALPHA_MARK\` at \`scripts/a.mjs:2\`.\n` — anchor live (L2 non-blank), symbol only on L3 ⇒ `elsewhere=1 nonok=1`; gate emits no finding (anchor live, symbol present). |
| F6 | note shape **absent** | `… \`NEVER_IN_FILE\` at \`scripts/a.mjs:3\`.\n` ⇒ `absent=1 nonok=1`; gate would emit `SECTION_NO_SYMBOL`, so run fidelity-only. |
| F7 | note shape **dead** | `… \`ALPHA_MARK\` at \`scripts/a.mjs:99\`.\n` and the `N>M` variant `scripts/a.mjs:4-2` ⇒ `dead=1 nonok=0`; verdict CLEAN while the registry gate would say `SECTION_DEAD_ANCHOR` (proof dead is diagnostic-only). |
| F8 | note shape **noid** | `## \`scripts/a.mjs\`\n\nAnchor: \`scripts/a.mjs:3\`.\n` (no adjacent span within 14 chars) and the adjacency-blocked variant `Anchor: \`scripts/a.mjs:3\` — a deliberately long prose run, \`ALPHA_MARK\`.\n` ⇒ `noid=1 nonok=0`. Include one bare form `\`ALPHA_MARK\` at \`:3\`.` ⇒ ok. |
| F9 | ratchet pass / regression | pass: F5 fixture + `{revision:<pin rev>, notes:{"corpus/knowledge/fx-a.md":1}, total:1}` ⇒ exit 0 CLEAN; fx-b absent from `notes` and `nonok=0` exercises the else-clean rule. regression (ceiling): same with ceiling `0` ⇒ DRIFT exit 1. regression (unlisted): `notes:{}, total:0` with the F5 note ⇒ DRIFT exit 1. |
| F10 | pin mismatch / unverifiable / staleness | mismatch: `fxPin(revision='0'.repeat(40), clone:<git src>)` ⇒ exit 2 `SRC_REV_MISMATCH`; unverifiable: clone = plain `fixtureSrc` dir (no `.git`) or `runClaims(..., {PATH:'/nonexistent'})` ⇒ exit 2 `SRC_REV_UNVERIFIABLE`; staleness: F9 ratchet `revision:'0'.repeat(40)'` + valid pin ⇒ exit 2 `RATCHET_REV_STALE`. Match case: `revision=rev` ⇒ verdict carries `src-rev=<rev[:12]>`, exit unchanged. Precedence: explicit `--src` on the same clone revision + pin ⇒ still `src-rev=`, exit unchanged (contract asserts the *effective* src; a differing `--src` revision is a mismatch by the same sentence). |

New case count implied: 16 (5 fidelity classes incl. bare/no-id, 3 ratchet, 4 pin, 2 fail-closed
fidelity `SRC_NOT_A_DIR`/ratchet-malformed, 1 no-pin portability, 1 `src-rev=` on CLAIMS MATCH and
DRIFT). Every new fixture stays under `tmpdir()` — the existing `check` at `:823-825` enforces it.

## C. Open point and evidence notes

- **Classification priority is not stated in FIDELITY v1** and the four classes must partition
  each anchor for `anchors = ok+elsewhere+absent+dead+noid` to hold. The frozen prototype
  (`.ufo/waves/round-36/baseline/fidelity-prototype-v1.mjs.txt:37-45`) orders
  `dead → noid → ok/elsewhere/absent`, and it *skips* a pathish span whose basename does not match
  the section's own file (does not count it as an anchor at all). Reimplementing from the contract
  with a different order will not reproduce `nonok=588`; state the chosen order in the code comment
  and in the fidelity line doc. [INFERENCE: the contract's "dead (range outside the file or N>M)"
  precedes symbol pairing in the prototype only.]
- Prototype note set with `anchors>0` is **18 notes** (all `corpus/knowledge/*.md`;
  `gate-verdict`, `native-transcript-ledger-seats`, `test-inventories` read `nonok=0` but still
  print — consistent with "one line per note with anchors > 0"). Its resolver re-scans `## `
  headings by `includes(sec.heading)`; site 9's `bodyStartLine` removes that fragility.
- `RE_BARE :103`'s lookbehind `(?<![\w:.-])` matches inside a backticked span, but a substring
  hit is not the contract's anchor (`` `foo:3bar` ``). Full-span matching (site 4) is mandatory.
- `bodyNoHead` `:369` degenerates when the heading line has no trailing newline
  (`indexOf('\n') === -1` → the heading is included in the body). A fixture may pin this; not
  required by either claim.
- `walkFiles` prunes `.ufo` (`:157`), so the pin file under `<self>/.ufo/` never pollutes the
  origin index even when `self === src` in a fixture.
