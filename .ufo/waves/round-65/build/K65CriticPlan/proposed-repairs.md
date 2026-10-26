# K65CriticPlan — proposed repairs (for the L1; this file edits nothing)

Frozen items (`plan.md`, `probe/*`, `controls/harm/*`, `base/*`) stay untouched. Every item below lands in an
UNFROZEN subject: `scripts/harm-matrix-gates.json`, `.ufo/pins/*.json`, `corpus/`, `PROVINCE.md`, the report.

## P1 — wire the controls manifest (finding K65CriticPlan-2/3)

Append to `scripts/harm-matrix-gates.json` `gates[]` (schema: `id`, optional `needs`, `argv`, `verdict`, `clean`, `timeout`):

```json
{
  "id": "harm-controls-manifest",
  "needs": ".ufo/waves/round-65/controls/harm/MANIFEST.sha256",
  "argv": ["bash", "-c", "cd .ufo/waves/round-65/controls/harm && sha256sum -c MANIFEST.sha256 >/dev/null && echo HARM_CONTROLS: CLEAN"],
  "verdict": "^HARM_CONTROLS: (\\w+)",
  "clean": ["CLEAN"],
  "timeout": 60
}
```

At base `47fe2383` the path is absent (ABSENT); at M it is CLEAN iff all 16 case files match the manifest, else the
verdict line is absent and the gate is NOT_CLEAN -> `NEW_RED` -> H5's `harm_absent+new_red` count > 0 -> H5 exit 1.
This is a strengthening (it can only add a way to fail) and needs no counter edit.

Ratchet rule to state in the report: a new `controls/harm/case-NN` lands with (i) a regenerated `MANIFEST.sha256`,
(ii) a re-pinned `harm65-controls-manifest` sha in `.ufo/pins/counter-pins.json`, (iii) the 16 freeze case shas
unchanged. Without (ii) `counter-pins` flips CLEAN->DRIFT and H5 fails.

## P2 — the two artifacts C2's O7 needs (finding K65CriticPlan-3)

Add to C2's surface (and to the wave-1 scribe item):

1. `corpus/README.md`: one coverage-map row, first cell a single backticked path:
   `| `knowledge/omp-installed-release-mcp-runtime.md` | <what it grounds> |`
2. `.ufo/pins/readme-map.json`: append `"knowledge/omp-installed-release-mcp-runtime.md"` to `covered`
   (v2, append-only; 157 -> 158).

Measured without them (entry present, nothing else): `README_MAP: DRIFT files=158 rows=157 covered=157 bad=2
first=uncovered:knowledge/omp-installed-release-mcp-runtime.md`, exit 1 -> O7 MISS.

## P3 — the `source-dupes` trap (finding K65CriticPlan-1)

The natural release URL is already a pinned duplicate group: `.ufo/pins/source-dupes.json` holds
`ids=[S060,S068] url=github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99`. A new C2 row that
reuses that URL under a UP-TO-DATE S### scope makes `source-dupes` DRIFT (measured: `ids=S060,S068,S201`, exit 1)
while `sources-census.sh validate` still exits 0 — i.e. C2 can pass O7 and still redden C1's H5.

Pick one (record which in the report):
- (a) the two version-pinning rows use per-file URLs at the tag (`.../blob/v18.12.6/<path>`), which are distinct from
  S068's tree URL and still satisfy O6's `/v18.12.6/` arm; or
- (b) append the new group to `.ufo/pins/source-dupes.json` `known` in the same landing (state why in the row note).
Do NOT append a row whose URL normalises to S060/S068's under a same scope either: same-URL+same-scope is census E04
and fails O7's census arm.

## P4 — proxy refresh must clear four codes (finding K65CriticPlan-6)

Measured in `git archive 2ca91a0c` (in /tmp): `proxy-check --strict` prints
`A_DRIFT A: declared=351 computed=357 delta=+6`, `C2_DRIFT`, `C2_TOTAL_DRIFT`, `PIN_UNPINNED scripts/harm-matrix.mjs`.
So the close refresh must declare the recomputed `A` (recount at M), `C2` and `C2_total` (=157, then 158 after the
entry) and either add `pin.harm-matrix=<sha256 of scripts/harm-matrix.mjs>` to `kumitate-gate-pins-v1` or record that
`--strict` is still red on `PIN_UNPINNED`. The plan's D2 sentence names only `C2_TOTAL_DRIFT`.

## P5 — pin the probe's key set (finding K65CriticPlan-7)

Add to `.ufo/pins/counter-pins.json`:

```json
{ "round": 65, "name": "omp-binary-probe", "path": "scripts/omp-binary-probe.sh",
  "sha256": "8774640580b56fcb454281d68465a687a779cebb0b8410cd418d5e4cb03117e3" }
```

O6 enforces only `stated.size >= 12` plus set-equality with whatever the archive's probe prints; unpinned, the probe
can be shrunk to 12 easy keys. If a wave seat hardens it, re-pin in the same landing.

## P6 — version reconciliation (finding K65CriticPlan-8)

The amendment (or a new C2 row capturing `omp --version` stdout) must state: S004/`omp-task-contract.md:205` recorded
`omp/18.12.3` on 2026-10-19; the probe measures `real_version=18.12.6` on 2026-10-25; the recheck cadence is on-release.
O8 does not catch the contradiction, so it is a scribe requirement, and wave-2 should check the sentence exists.

## P7 — H5/M coupling disclosure (finding K65CriticPlan-1)

C1's stated limit gains one sentence: H5 is measured at the round tip M, which contains C2's landing; a C2 landing that
reddens any base-CLEAN registry gate (`sources-check`, `source-capture`, `source-dupes`, `claims-check`, ...) is a HARM
row and fails C1. The close therefore measures H5 twice: at the C1-only commit (after `scripts/harm-matrix.mjs` +
controls + registry land) and at M; both lines go in the report.
