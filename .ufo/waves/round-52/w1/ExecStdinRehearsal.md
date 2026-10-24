# ExecStdinRehearsal — round 52 B2e

## Axes
- **Transport fidelity:** exact 32-byte nonce delivery and no added output bytes.
- **Receipt binding:** `stdin_sha256` and child `stdout_sha256` match independent captures; receipt verifies `VALID`.
- **Shape coverage:** command consumes both argv/stdin versus ignores stdin.

## Findings

**A — host `/bin/cat`: confirmed.** Fed fixed UTF-8 payload `00112233445566778899aabbccddeeff` (32 bytes). Captured output was exactly 32 bytes, byte-equal to input, with no newline. Input and output SHA-256 were both `5947d7c33d783f94b3b4c1a96ebc8991ed28f1b069b71e03376cba8caa98a720`. Exit 0; stderr empty.

**B — five v2 `/bin/cat` receipts: PASS.** Ran `node <v2> run --out <base> --stdin -- /bin/cat` five times. Each run exited 0; all receipts had 32-hex nonces, recorded `stdin_sha256` equal to SHA-256 of `Buffer.from(nonce, 'utf8')`, and recorded `stdout_sha256` equal to an independent `/bin/cat` capture. All five verifies returned `RECEIPT: VALID` exit 0; nonces were distinct.

| Run | Nonce | stdin/stdout SHA-256 (both matched) | Verify |
|---|---|---|---|
| cat-1 | `1471752e200cb6f67cce5c041543635a` | `957c383ae9b706f1be6b28e39217704ad044974099b7d56b22ecb9bdd5da220b` | VALID, exit 0 |
| cat-2 | `64f346b282210bc99e1f92b6505a914e` | `11f71ae171fb6067db189cb300c39d9a8c0f8d0b9f6d3a454d397faf8e4fa322` | VALID, exit 0 |
| cat-3 | `95544e68ec80001c30bfa1a93e234265` | `ff34e58b59a08cfaa8b009f9e3001120339e6a027b5a942a299dec1b240e0401` | VALID, exit 0 |
| cat-4 | `f69f4563f630f15e49b62a7f8b868253` | `2d59213ac8a4a433ecba60eff01935b3fb143130c4d56a34e0071163431a8b00` | VALID, exit 0 |
| cat-5 | `6cfaf48d0ef924ec1e689fd471140609` | `fa93a71d70633edde3917dbabc522ebe769d63387c088d4966191fafd08fcba1` | VALID, exit 0 |

**C — odd shapes: PASS against v2.**
- `/usr/bin/sha256sum -- -` (argv plus stdin): receipt argv was `["/usr/bin/sha256sum","--","-"]`, exit 0, nonce `f3f93bd1cdf8810c918e082cbb3661ba`; `stdin_sha256` was `4ad5a4c16279027eab5fdb3a7867369b00a199aff443cbb1d962957e41cdd79d`; stdout was 68 bytes and its receipt hash `e9e57c65053d76de78c51da9c394a2bebc2e68e57cc8d643fb0e51eb4de9a3dc` matched an independent child capture. Verify returned `RECEIPT: VALID` exit 0.
- `/usr/bin/true` (ignores stdin): receipt argv was `["/usr/bin/true"]`, exit 0, nonce `ec8d44afadf1ff3548dd600d88f1e772`; `stdin_sha256` was `e27c7b131b855abfe643fece47ec42286a8cf0f29ee663a366f57d4e2e3aa62f`; stdout was empty and its receipt hash `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` matched an independent child capture. Verify returned `RECEIPT: VALID` exit 0.

## B2e disposition

The frozen B2e arm invokes only `/bin/cat`; its all-shapes implication was separately rehearsed against the delivered v2. All requested shapes (cat, argv-plus-stdin `sha256sum`, and stdin-ignoring `true`) recorded the nonce-byte input hash and the independently captured actual stdout hash, and all verifies remained `VALID`.

**Disposition:** The observed behavior matches the frozen generic STDIN contract for all tested shapes. No contract note is indicated by this rehearsal. The frozen probe remains unchanged and cat-specific; no probe edit was made.

## Retained evidence

- V2 runs, full parsed receipts, independent child captures and verify outputs: `.ufo/waves/round-52/build/ExecStdinRehearsal/v2-receipt-rehearsal.json`.
- Host cat and fixed-payload shape oracles: `.ufo/waves/round-52/build/ExecStdinRehearsal/host-and-shape-oracles.txt`.
- Frozen contract: `.ufo/waves/round-52/plan.md` lines 85–88; frozen B2e arm: `.ufo/waves/round-52/probe/attest52-probe.mjs` lines 236–262.
- No remaining blocker for this rehearsal. Tools installed/updated: none.
