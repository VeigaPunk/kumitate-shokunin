EXEC checklist done items=14 parses=14

# ExecChecklistRewrite — SKILL.md `## Verifiable checklist` (round 36, C1/f)

Base: `0614092e0804aaca06642cb3a263a05c1cacc98e` (clone at
`/fast/scratch/kumitate-r36/w/ExecChecklistRewrite/lane`, branch
`r36-execchecklistrewrite`). Patch: `/fast/scratch/kumitate-r36/w/ExecChecklistRewrite.patch`
(sha256 `ef4b874ef143f3999c5db4f069189ce696d8ef36d92222b079a11cf8ce5b47cc`),
1 file, +27/−7, standard `a/` `b/` prefixes, `git apply --check` clean on a
pristine `0614092e` clone (`lane-base`).

## Parsed items (frozen `CHECKLIST_RE`, run against the patched tree)

The parse below is produced by `/fast/scratch/kumitate-r36/w/ExecChecklistRewrite/parse.mjs`,
which extracts the regex literal from `scripts/surface-probe.mjs` itself and
evals it — not a hand copy. Output (verbatim):

```
 1 line=627 label="Citation gate verdict" cmd="node scripts/cite-check.mjs" exits=0|1 expect="CITE_CHECK:"
 2 line=628 label="Citation gate hermetic suite" cmd="node scripts/cite-check.mjs --selftest" exits=0 expect="VERDICT: PASS"
 3 line=629 label="Live sighting-surface conformance" cmd="node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json" exits=0 expect="SURFACE_PROBE: CLEAN"
 4 line=630 label="Surface-probe hermetic suite" cmd="node scripts/surface-probe.mjs --selftest" exits=0 expect="VERDICT: PASS"
 5 line=631 label="Round-gate hermetic suite" cmd="node scripts/round-gate.mjs --selftest" exits=0 expect="VERDICT: PASS"
 6 line=632 label="Round-close artifact audit" cmd="node scripts/round-gate.mjs" exits=0 expect="ROUND_GATE: CLEAN"
 7 line=633 label="Filed-report tracking" cmd="node scripts/round-gate.mjs --tracked" exits=0 expect="ROUND_GATE: CLEAN"
 8 line=634 label="Proxy recompute" cmd="node scripts/proxy-check.mjs" exits=0 expect="PROXY: MATCH"
 9 line=635 label="Proxy-check hermetic suite" cmd="node scripts/proxy-check.mjs --selftest" exits=0 expect="VERDICT: PASS"
10 line=636 label="Member-claims gate" cmd="node scripts/claims-check.mjs" exits=0 expect="CLAIMS: MATCH"
11 line=637 label="Kimi-substrate census" cmd="node scripts/kimi-census.mjs" exits=0 expect="KIMI_CENSUS: CLEAN"
12 line=638 label="Sources-registry gate" cmd="node scripts/sources-check.mjs" exits=0 expect="SOURCES_CHECK: CLEAN"
13 line=639 label="Sources-check hermetic suite" cmd="node scripts/sources-check.mjs --selftest" exits=0 expect="VERDICT: PASS"
14 line=640 label="Anchor fidelity" cmd="node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json" exits=0 expect="FIDELITY: CLEAN"

items=14 malformed=0
```

`grep -c '^\s*- \[' SKILL.md` → **14** (was 13). No task lines exist outside
the checklist block (`stray task lines outside checklist block: 0`).

## Diff summary (SKILL.md only)

1. **Intro (615-625)** — ScribeSkillProse owns this line and asked for its text
   verbatim; applied as given, then one paragraph of mine: items 3/8/10/14 are
   pin-aware (`.ufo/pins/origin.json`, `kumitate-origin-pin-v1`, `src-rev=<12 hex>`
   in the verdict), item 1 keeps explicit `--src`, no pin → `--src`/`$UFO_SRC`
   fallback. This is the "no verdict line names the revision it measured" named
   gap retired for the checklist as a whole.
2. **Item 3 (620)** — `node scripts/surface-probe.mjs` →
   `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json`;
   exit set and `SURFACE_PROBE: CLEAN` unchanged.
3. **Items 8, 10 (625, 627)** — text unchanged by design; the commands are the
   bare gates and inherit the pin default from the gate, per PIN v1.
4. **New item 14, appended after item 13** — so the 13 existing items keep
   their ordinals (SCORECARD's "items 12–13 = sources gate + suite" stays true):
   `Anchor fidelity — node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json → exit 0 + FIDELITY: CLEAN`.
5. **Paragraph under the list (641-661)** — exit-2 causes now name the pin and
   ratchet fail-closed arms (`SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`/
   `KNOWN_REV_MISMATCH`, `RATCHET_MALFORMED`/`RATCHET_REV_STALE`); the old
   "neither gate writes to the origin tree" claim is replaced by the pinned
   reality (gates resolve from the read-only clone and assert its HEAD; the
   probe's origin read verbs run with `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH`
   under a `mkdtemp` that is removed), and the measurement sentence is now
   explicitly a dated snapshot ("At round-13 close (2026-09-28): …") with
   "re-run the item and read the line it prints" — the counts are not presented
   as live.

## Deviation from the literal item text (deliberate)

The assignment's item ends `… + \`FIDELITY: CLEAN\`.` — with the period. The
frozen `CHECKLIST_RE` terminates at the closing backtick (`…(?<expect>[^`]+)`$`),
so the trailing period makes the line **malformed** (`CHECKLIST_GRAMMAR`,
item fails). Proven, not assumed:

```
node -e '… re.test("- [ ] Anchor fidelity — `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → exit 0 + `FIDELITY: CLEAN`.")'
with trailing period matches: false
```

I dropped the period to satisfy the stated invariant ("Every command must match
CHECKLIST_RE"); the grammar and `scripts/surface-probe.mjs` were not touched.
If the L1 prefers the period, the parser must change instead — that is an
ExecSurface*/grammar decision, not a text one.

## Evidence: my prose adds no citation finding

`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src --json`,
patched clone vs a pristine `0614092e` clone in the same parent dir (so the
fleet-root derivation is identical), diffed per SKILL.md finding with line
numbers normalized (my edits shift every later line):

```
new error-severity: 0
new tokens: .ufo/pins/origin.json,.ufo/pins/surface-known.json,.ufo/pins/fidelity-ratchet.json
```

The three new tokens are `OK|note` — `lives under pruned .ufo/ (runtime
namespace, never a resolution target)`. Whole-file: 268 → 273 findings, all
additions notes. Live verdict is still `CITE_CHECK: DRIFT` in both clones for
pre-existing reasons unrelated to this patch (same error multiset shifted).

## Risks / integration notes

- **SCORECARD must move C 13 → 14** (`kumitate-proxy-v1` block + `## Axes`
  operability sentence): `scripts/proxy-check.mjs` re-derives `C` from SKILL.md
  and compares, so PROXY reads DRIFT until the stanza says 14. Messaged to
  KumitateR36.ScribeScorecard.
- **Coupling to sibling patches**: item 3 needs surface-probe's `--known`
  (ExecSurfaceKnown) and `.ufo/pins/surface-known.json` (pin files owner);
  item 14 needs `claims-check --fidelity --fidelity-ratchet`; items 3/8/10 need
  the pin default in surface-probe/proxy-check/claims-check. If any of those
  land later or differently, the corresponding item fails loudly (which is the
  intended behavior), not silently.
- **Residual prose not in my scope**: the Round-16 paragraph (now ~665-700)
  still says the Proxy recompute item's default is "`$UFO_SRC` or the
  ufo-fsd-alpha tree", which is now the-second-choice ordering behind the pin.
  It is outside `## Verifiable checklist`; flagging for the L1/ScribeSkillProse
  rather than widening my edit.
- Tooling: no installs/upgrades were made in this wave.

## Commands run (all read-only against the a-w clone)

- `git clone --no-hardlinks … lane` + `checkout -b r36-execchecklistrewrite 0614092e` (scratch only)
- `node parse.mjs lane` (frozen-regex parse; output above)
- `grep -c '^\s*- \[' SKILL.md` → 14
- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src [--json]` (patched vs pristine, no writes)
- `git diff --src-prefix=a/ --dst-prefix=b/ > /fast/scratch/kumitate-r36/w/ExecChecklistRewrite.patch`
- `git -C lane-base apply --check <patch>` → OK, then applied → `items=14 malformed=0`
- Not run, per the wave contract: no build/lint/test/formatter, and
  `surface-probe --checklists` itself (items 3/8/10/14 cannot pass until the
  sibling pin/pin-file patches land; running it now would only re-measure the
  absent arms).
