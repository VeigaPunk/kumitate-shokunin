# ExecReceiptSet — round-57 C1 receipt set (attest-run-{1,2,3} + doctored control)

Seat: ExecReceiptSet (executor, leaf). Lane: `kumitate-shokunin`. Date: 2026-10-24.
Item: verify each of `.ufo/waves/round-57/receipts/attest-run-{1,2,3}.txt` with
`node .../scripts/receipt-attest.mjs verify --ledger .ufo/waves/round-57/receipts <f>`, capture VALID ×3,
and confirm the doctored `attest-run-2-replayed.txt` is NOT VALID.

## Verdict

**Corroborated.** All three planned receipts read `RECEIPT: VALID` exit 0 against the full ledger; the
doctored control reads `RECEIPT: TAMPERED` exit 1. Measured at lane `@` = `2909579f06af`
(parent `8c6f5b01`), cwd = lane root, `scripts/receipt-attest.mjs`
sha256 `ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31`, node v24.21.0.

## Files changed

- Production / lane files: **none**. No git or jj state touched; `jj st` shows only sibling seats'
  entries plus my own two artifacts.
- Written: `.ufo/waves/round-57/build/ExecReceiptSet/**` (evidence + scratch) and this report.

## Observed evidence (exact)

Primary command, run once per file from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs \
  verify --ledger .ufo/waves/round-57/receipts .ufo/waves/round-57/receipts/<f>
```

| file | exit | stdout tail |
|---|---|---|
| `attest-run-1.txt` | 0 | `RECEIPT: VALID` |
| `attest-run-2.txt` | 0 | `RECEIPT: VALID` |
| `attest-run-3.txt` | 0 | `RECEIPT: VALID` |
| `attest-run-2-replayed.txt` | 1 | `receipt-attest: sidecar mismatch: sidecar 5bcb7aba0a3ee5708a092fa61d74b85f9b57dd5e191165445455f441e3268988, actual 0354f3e6550d08f812025fdf8da91a928fe855692c2d115b8edcdf1e5bbe3f8a` + `RECEIPT: TAMPERED` |

stderr empty in all four runs. Every VALID run emitted the same five ledger skip notes
(`attest-run-{1,2,3}.txt.sha256`: sidecar absent; `attest-run-2-replayed.txt`: sidecar hash mismatch;
`attest-run-2-replayed.txt.sha256`: sidecar absent), i.e. no nonce-reuse alarm fired between the three
attested receipts, and the doctored control was excluded from ledger evidence by **attestation state**
(stronger than the plan's "excluded by name").

Body invariants recomputed from the committed bytes (`build/ExecReceiptSet/body-fields.txt`):

- argv exactly the frozen plan set — run-1 `node scripts/readme-map.mjs --selftest`,
  run-2 `node scripts/bind-oracle.mjs --selftest`, run-3 `node scripts/round-gate.mjs --selftest`; exit 0 each.
- 3/3 distinct 32-hex nonces (`89182e38…`, `e9f14ab4…`, `9a065643…`), 3/3 distinct digests.
- `wall_start` span across the three = **326.213 s ≥ 300 s** (12:41:22.462Z → 12:46:48.675Z);
  first-start→last-end = 334.306 s.

Committed-revision corroboration (`rev-r1/`, `r1-vs-wc.txt`, `r1-verify.txt`): the eight receipt files
extracted with `jj file show -r f0dc6d1160e6` into a scratch ledger also read VALID×3 / TAMPERED.
`attest-run-3.txt` differs between `f0dc6d` (wall 12:26:15.254–12:26:23.075Z, sha `70701e58…`) and the tip
(re-minted by `b3bd0633`, wall 12:46:48.675–12:46:56.768Z, sha `d3dfc3d3…`); each pair is internally
consistent, no cross-commit receipt/sidecar mixing, and the tip commit and working copy agree. `7178bfd3643c`
(the plan's base) tracks no receipt files, so K1 do-nothing still holds for this evidence block.

Discriminating controls (scratch copies only, `scratch/{A,B,C,D}`): appended byte → exit 2 `UNREADABLE`
(missing trailing newline); one hex digit flipped in the sidecar → exit 1 `TAMPERED`; body field `exit`
0→1 with stale digest → exit 1 `REPLAY`; **replayed control with its sidecar re-minted to the doctored
bytes → exit 1 `TAMPERED`** (`prelude 2026-10-24T13:45:00.000Z is outside the recorded wall window
[2026-10-24T12:43:19.632Z, 2026-10-24T12:43:19.945Z]`). The doctored control therefore cannot be laundered
by re-hashing its sidecar. No-ledger runs reproduce VALID×3 / TAMPERED.

## Risks / limits (observed, not defects against this item)

1. `VALID` is internal consistency with a co-located sidecar, not provenance: a fresh `run` minted in
   scratch (`scratch/E1/forged.txt`, argv `node -e …`) verified `VALID` exit 0 under the real ledger. The
   contract carries no secret or signature (report as boundary, not regression).
2. The prelude is outside the semantic digest and is only bound by the 60 s `PRELUDE_SLACK_MS` window; a
   run-2 copy with the prelude shifted +30 s and the sidecar re-minted read `VALID` (`scratch/E2`,
   same digest/nonce → the same-digest ledger exemption does not fire). The committed doctored control
   rewrites the prelude ~62 min out, so it is caught twice; the near-window variant is not.
3. The plan says the doctored control's "sidecar [was] untouched"; observed, the sidecar was re-emitted
   with the new basename (92 B) while retaining run-2's hash `5bcb7aba…` — hash untouched, name changed.
   Detection is unaffected (mismatch is on hash *and* name matches the basename).
4. The quoted relative `--ledger .ufo/waves/round-57/receipts` is cwd-dependent; from another cwd the same
   command fails closed with exit 2 `UNREADABLE ledger directory … does not exist` (`cwd-relative.out`).
   Verification must be run from the lane root, as done here.

## Blockers

None.

## Retained evidence

`.ufo/waves/round-57/build/ExecReceiptSet/`: `verify-run-{1,2,3}.{out,err}`, `verify-replayed.{out,err}`,
`noledger-*.out`, `body-fields.txt`, `rev.txt`, `rev-at.txt`, `rev-r1/`, `r1-vs-wc.txt`, `r1-verify.txt`,
`run3-history.txt`, `tip-state.txt`, `receipts-manifest.sha256`, `cwd-relative.out`, `scratch/`,
`summary.txt`.
