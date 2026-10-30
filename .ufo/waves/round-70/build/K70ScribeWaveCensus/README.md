# K70ScribeWaveCensus — round-70 close-time reconciliation design (seat artifacts)

Canonical draft (fields, dead/unknown rule, r69→v2 mapping) lives in the seat report:
`.ufo/waves/round-70/w1/K70ScribeWaveCensus.md`.

This directory holds only this seat's artifacts. Nothing here is production; nothing here is
integrated by this seat (L1 owns production paths and integration).

| Artifact | Purpose |
| --- | --- |
| `reconciliation-schema-v2.json` | JSON Schema (draft-07) for the close-time file `.ufo/waves/round-70/close/wave-reconciliation.json` (schema id `ufo-wave-reconciliation-v2`) |
| `wave-reconciliation.template.json` | 64-seat template: every row `state=pending-collection`, all outcome fields null/false; `dispatch.instance` prefilled from `w1.ready.partial` |
| `lib/derive-state.mjs` | pure seat-state derivation, incl. the dead/unknown rule |
| `validate-reconciliation.mjs` | checker: `--mode template` (structure), `--mode derive` (print derived state), `--mode close` (structure + filesystem cross-check) |
| `make-template.mjs` | regenerates the template from the frozen dispatch file |
| `make-selftest-fixture.mjs` | regenerates the SYNTHETIC close-mode self-test fixture from current disk bytes |
| `selftest/midwave-close-fixture.json` | synthetic fixture (mechanically mirrored from a mid-wave snapshot; asserts no seat outcome; must never be copied into `close/`) |
| `selftest-derive.mjs` | 10 hand-written derivation cases incl. the dead/unknown discriminator |
| `receipts/` | captured stdout of every command run for this seat |

## Commands (all read-only, absolute paths)

```sh
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ScribeWaveCensus
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin

node "$B/selftest-derive.mjs"                                                        # PASS cases=10 failures=0
node "$B/make-template.mjs" "$L" "$B/wave-reconciliation.template.json"               # seats=64
node "$B/validate-reconciliation.mjs" --lane "$L" --file "$B/wave-reconciliation.template.json" --mode template
node "$B/validate-reconciliation.mjs" --lane "$L" --file "$B/wave-reconciliation.template.json" --mode derive
node "$B/make-selftest-fixture.mjs" "$L" "$B/selftest/midwave-close-fixture.json"
node "$B/validate-reconciliation.mjs" --lane "$L" --file "$B/selftest/midwave-close-fixture.json" --mode close
# negative controls (files mutated in scratch only):
node "$B/validate-reconciliation.mjs" --lane "$L" --file <scratch>/neg-control-report.json --mode close   # exit 1
node "$B/validate-reconciliation.mjs" --lane "$L" --file <scratch>/neg-control-state.json  --mode close   # exit 1
node "$B/validate-reconciliation.mjs" --lane "$L" --file "$B/wave-reconciliation.template.json" --mode close # exit 1 (template is not a reconciliation)
```

Observed outputs are in `receipts/`. Exit codes are recorded next to each command in the seat report.

## Limits

- The design is a draft. It has not been run against a settled wave; no seat outcome is asserted.
- `--mode close` on the synthetic fixture exercises the checker's cross-file plumbing only.
- The checker implements a structural subset of the JSON Schema; it is not a JSON-Schema validator.
