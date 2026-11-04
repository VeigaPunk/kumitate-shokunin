# EVIDENCE — K87ExecBind (round 87, C1 `receipt-bind`)

All paths absolute. Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base `db97929212bb61ae970b10abac3cc4cd976713ae`; freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`.
Nothing committed, pushed, stashed or checked out. No tool installed.

| artifact | sha256 | what it is |
|---|---|---|
| `receipt-bind.mjs` | `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a` | the candidate; byte-identical to the already-integrated `scripts/receipt-bind.mjs` |
| `rehearse/emit-close-receipts.mjs` | `0093249abb1fe1a540c5ee6ee520b8b4088ac9195abf2110a4dfdcdb4433bee3` | rehearsal harness (not an integrated tool) |
| `receipts/selftest.txt` | — | `--selftest` transcript, `RECEIPT_BIND_SELFTEST: PASS held=39/39`, exit 0 |
| `receipts/detect-r86.txt` | — | the `detect-r86` acceptance command on the committed round-86 close dir |
| `receipts/probe87-integrated-default.txt` | — | frozen probe on the real lane, integrated default tool, `--rev 25a3a75d` |
| `receipts/probe87-real-lane.txt` | — | frozen probe on the real lane, explicit `--tool <candidate>` |
| `receipts/probe87-rehearsal-12of12.txt` | — | frozen probe over a rehearsal close dir in a scratch clone, `HELD 12/12` |
| `receipts/probe87-rehearsal-later-rev.txt` | — | same receipts, probed at a later rev, `HELD 12/12` |
| `receipts/proxy-strict-pin.txt` | — | `proxy-check --strict` before/after the `pin.receipt-bind` recipe |
| `receipts/rehearsal-close-dir.txt` | — | the 11-receipt rehearsal close dir: headers + exit codes |
| `receipts/rev-coverage.txt` | — | why `--rev` must be the integration commit |
| `receipts/determinism.txt` | — | same directory twice → byte-identical verdict |
| `receipts/cli-samples.txt` | — | `--help` (exit 0) and `--json` on the round-86 dir |
