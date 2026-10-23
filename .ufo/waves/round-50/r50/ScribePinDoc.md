# ScribePinDoc — gate-pin documentation draft

## Axes
- Operability: make pin ownership and refresh steps executable and auditable.
- Coverage: keep the parent-frozen pin contract distinct from the lane-owned gate-pin family and cover changed runnable scripts.

## Paste-ready SCORECARD.md note

### Round 50 — script pin families and re-pinning

`scripts/proxy-check.mjs` has two separate pin families. The frozen `kumitate-proxy-v1` stanza has `STANZA_KEYS = [...TERM_KEYS, ...Object.keys(PINS)]`: 17 score terms plus exactly six required script pins, with no other keys. Those pins cover `pin.cite-check` → `scripts/cite-check.mjs`, `pin.surface-probe` → `scripts/surface-probe.mjs`, `pin.round-gate` → `scripts/round-gate.mjs`, `pin.proxy-check` → `scripts/proxy-check.mjs`, `pin.claims-check` → `scripts/claims-check.mjs`, and `pin.kimi-census` → `scripts/kimi-census.mjs`. Do not add lane gate pins to this frozen stanza.

The separate `kumitate-gate-pins-v1` block is the lane-owned set. Its accepted mappings are `pin.anchor-truth` → `scripts/anchor-truth.mjs`, `pin.sources-check` → `scripts/sources-check.mjs`, `pin.wave-census` → `scripts/wave-census.mjs`, `pin.gate-mutants` → `scripts/gate-mutants.mjs`, `pin.omp-census` → `scripts/omp-census.mjs`, `pin.cap-run` → `scripts/cap-run.mjs`, `pin.bind-oracle` → `scripts/bind-oracle.mjs`, `pin.cap-spawn` → `scripts/cap-spawn.mjs`, and `pin.counter-rerun` → `scripts/counter-rerun.mjs`. The checker verifies declared gate pins and excludes those declared paths from `PIN_UNPINNED`; this does not widen the v1 key set or its six-pin count.

After any `scripts/*.mjs` edit, recompute the SHA-256 of every changed script and update its corresponding pin line in its existing family. In particular, a `proxy-check.mjs` edit requires refreshing the v1 `pin.proxy-check` value; a `cap-run.mjs` or `bind-oracle.mjs` edit requires refreshing its gate-pin value. An edited script with no mapping remains `PIN_UNPINNED`; the checker’s coverage scan must be satisfied by an existing pin mapping and declaration in the appropriate stanza. Then run `node scripts/proxy-check.mjs --strict`: the checker does not rewrite the stanza, and stale declared hashes are reported as `PIN_DRIFT` or `GATE_PIN_DRIFT` (strict also promotes warnings such as `PIN_UNPINNED`).

For this round’s three relevant lines, the exact current-tree values are:

```text
# kumitate-proxy-v1
pin.proxy-check=0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929

# kumitate-gate-pins-v1
pin.cap-run=64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672
pin.bind-oracle=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

Recompute these after the round’s relevant source edits before committing the scorecard lines; these are observed pre-edit/current-tree hashes, not assertions about any later patch.

## Findings and evidence

- Source contract: `scripts/proxy-check.mjs:451-470` defines `PINS`, `STANZA_KEYS`, and `GATE_PINS`; `:1020-1065` parses the distinct gate-pin block; `:1089-1148` verifies hashes and warns for unpinned `.mjs` scripts. `SCORECARD.md:268-275` documents the unchanged six-pin parent set and gate-pin separation.
- This checkout already contains `pin.bind-oracle` in both `GATE_PINS` (`scripts/proxy-check.mjs:468`) and the scorecard stanza (`SCORECARD.md:319`); this note does not claim it is a new unlanded change.
- Command run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```text
$ sha256sum scripts/cap-run.mjs scripts/proxy-check.mjs scripts/bind-oracle.mjs
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  scripts/cap-run.mjs
0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929  scripts/proxy-check.mjs
c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5  scripts/bind-oracle.mjs
```

- Gate/test commands were not run; this is a documentation draft and hash capture only. No tools were installed.

## Scope / hand-off

- Behavior: gives L1 paste-ready explanatory text and the three observed pin lines to refresh after source changes.
- Gates: recommends `node scripts/proxy-check.mjs --strict` after updating hashes; not executed here.
- Touched surface: only this assigned report artifact. Lane product files, git/jj state, and index were not modified.
- Out of scope: no code change, pin update, or validation run.
- Artifact: `.ufo/waves/round-50/r50/ScribePinDoc.md`.
