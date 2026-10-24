source: S104 https://www.rfc-editor.org/rfc/rfc8785.txt; S105 https://manpages.debian.org/bookworm/coreutils/sha256sum.1.en.html
verified-at: 2026-10-24 (L1 fetch 05:37:58Z; wave-1 non-author re-open pending)
recheck: 365d

# Receipt identity & the ledger evidence set

Admitted round 53 (C2). Scope: what a receipt's *identity* is (the canonical-JSON record
digest, not whole-file bytes), and what a nonce ledger's *evidence set* is (every entry of
the directory, not a filename-extension subset). The round-53 v3 instrument
(`kumitate-receipt-attest-v3`) is the judged object; this entry records why it is built
this way. S104 (RFC 8785 JCS, tier A) grounds canonicalization as the identity concept;
S105 (sha256sum(1), tier B) grounds the sidecar's text-mode line format.

## Record identity is canonical, not byte identity

- A receipt's identity for nonce-ledger purposes is its record digest: sha256 over the
  canonical JSON of the semantic fields (parse, drop `digest`, sort keys recursively, one
  line). Canonicalization exists because "create a canonical representation of JSON
  [RFC8259] data" (S104, §1 Introduction, saved lines 95-97, 10 words) makes a data item's
  digest independent of serializer and whitespace choices. The lane's canonical form sorts
  keys and records one line; it deliberately does not implement every JCS primitive rule
  (IEEE-754 serialization, Unicode normalization) — the lane's field set is ASCII-safe
  (hashes, ISO instants, argv strings) so sorted-key one-line JSON is canonical *for this
  field set* (withheld claim, below).
- Whole-file bytes are NOT record identity: appending a trailing newline produces
  byte-distinct files with the same record. Measured class member: round 51's F5 finding
  (`receipt:.ufo/waves/round-51/w2/MutReceiptBytes.md@sha256:69fc18b35b95da00bf7a48423225b525c925c3d3fb500545ce1718a95a2992c9`
  — the committed r51 finding file; the F5 table shows v0/v1/v2 byte-distinct, nonce-identical)
  — one invocation, three whole-file sha256s. The round-52 probe arm B2 therefore scores
  distinctness on record digests (`receipt:.ufo/waves/round-52/probe/attest52-probe.mjs@sha256:be2fe0ecc95e1f1b4d6ecfa2a0004db424ccd6a112d60f083f3553ef186b47f4`)
  and the round-53 arm B2 inherits it.
- The sidecar binds the BYTES, not the record: the GNU text-mode line is
  "print a line with: checksum, a space, a character indicating input mode" (S105,
  DESCRIPTION, 13 words) — hash over the exact receipt file, prelude and trailing newline
  included. So a byte rewrite with a recomputed sidecar passes the byte layer and is caught
  only by the window/tolerance policy (`receipt:.ufo/waves/round-53/receipts/attest53-run-1.txt@sha256:e43a93180d17458c9d99f22be457848419f2f94152049aef970321cd41c1561e`
  attests the v3 instrument's own bind-oracle selftest run; the ±60 s prelude tolerance and
  its Q39 ceiling stay open, recorded in `corpus/knowledge/invocation-attestation.md`).

## The evidence set is the whole directory

- The v2 ledger scoped evidence to `*.txt` files. The R52-9 class (measured): a
  nonce-colliding forgery stored under `attest-run-1-forged.receipt` was invisible —
  verifying the original with `--ledger` answered `RECEIPT: VALID`. The round-53 base
  receipt reproduces the class live: `receipt:.ufo/waves/round-53/base/attest53-base.txt@sha256:ead6ac50a62463059ef14e16f5f96d70b62a1d2e7d2d11ae1df0c641a71dda6b`
  records `B7a MISS … ledger(orig)=RECEIPT: VALID namesEvasionFile=false` at base
  `d124a775` against the v2 bytes.
- v3 defines the evidence set as every directory entry. An entry counts when it is an
  attested receipt — sidecar present, GNU text-mode, name-matching, hash-covering,
  shape-valid, inner digest valid, clocks finite round-trippers — whatever its filename
  extension; the same-digest exemption is extension-independent (a byte-identical copy
  under another name is the same record, not a reuse). Non-regular files (directories,
  FIFOs, sockets, devices) and non-attested entries are skipped with the printed
  `ledger skipped <name>: not an attested receipt (<why>)` note — never read as receipts,
  never blocking on a FIFO.
- The four behavioral arms the instrument pins (each also a probe arm B7a–B7d):
  the hidden twin answers `RECEIPT: REPLAY` naming the evasion file; an attested
  `witness.log` prior is evidence; a byte-identical `dup.receipt` is exempt; a junk
  directory (subdirectory + `notes.json` + `stray.sha256`) verifies VALID with three skip
  notes. The 51-case selftest carries these as
  `receipt:.ufo/waves/round-53/receipts/attest53-run-3.txt@sha256:e4de10d2a2c1a25cc839bba1d8be004899f57a8d389406ec1dd3e98daa59670a`
  attests (run-3 wraps `node scripts/round-gate.mjs --selftest`, 61/61 green at mint time).

## Bound evidence index

- Round-53 receipt run-1 (bind-oracle selftest, v3 instrument): `receipt:.ufo/waves/round-53/receipts/attest53-run-1.txt@sha256:e43a93180d17458c9d99f22be457848419f2f94152049aef970321cd41c1561e`
- Round-53 receipt run-2 (sources-check, v3 instrument): `receipt:.ufo/waves/round-53/receipts/attest53-run-2.txt@sha256:49c1dd272886021796e073db9079026fca3e59d9f50b59f2df736427e630f5e9`
- Round-53 receipt run-3 (round-gate selftest, v3 instrument): `receipt:.ufo/waves/round-53/receipts/attest53-run-3.txt@sha256:e4de10d2a2c1a25cc839bba1d8be004899f57a8d389406ec1dd3e98daa59670a`
- Round-52 receipt attest52-run-1 still VALID under v3 (format compat): `receipt:.ufo/waves/round-52/receipts/attest52-run-1.txt@sha256:dccbee0128dfec991c472a2518107073ee169950e5aaed7101989841b4435773`
- Round-52 receipt attest52-run-2 still VALID under v3: `receipt:.ufo/waves/round-52/receipts/attest52-run-2.txt@sha256:e22e6571e0f1c1465fbef375c625bd1da94dbf7f149f24c47631ee769a2aff14`
- Round-52 receipt attest52-run-3 still VALID under v3: `receipt:.ufo/waves/round-52/receipts/attest52-run-3.txt@sha256:b487e85ae7241a75f114aa9bfa6d0945ebbe97aaa7f7f056f81230e8ccf1b23a`
- Before-state, A53, at base d124a775 against the v2 bytes (B7a/B7b show the routed defect live): `receipt:.ufo/waves/round-53/base/attest53-base.txt@sha256:ead6ac50a62463059ef14e16f5f96d70b62a1d2e7d2d11ae1df0c641a71dda6b`
- Before-state, D53, at base (entry-absent): `receipt:.ufo/waves/round-53/base/doctrine53-base.txt@sha256:4e4d6aea2314c6a9b5f927ecd14945c1bdd535481788f85a26a8182f578ee774`
- The vacuous-counter class stays closed (hold-call-deleted A53 mutant reads UNMET held=0/0, exit 1): `receipt:.ufo/waves/round-53/build/MutCounter53/counter-mutant.txt@sha256:0d9dfb0c500658d9cb1a489140a0b44ed96816b4b0b486549219222a24eb1999`
- The attacking wave, prepared and validated under policy v2 (64 seats, one task call): `receipt:.ufo/waves/round-53/w1-validate.json@sha256:992cc56d1707d46121f41ddb79af9cd705c4ee4f0976bcbaa4e299495d7f661e`
- Opened source bytes, S104 (RFC 8785 JCS): `receipt:.ufo/waves/round-53/build/ScoutRfc8785/rfc8785.txt@sha256:63d52294eb0e3f0014174288186d388b4ddbf2c67d1ce8af1d9726eb0c3ab240`
- Opened source bytes, S105 (sha256sum(1) text mode): `receipt:.ufo/waves/round-53/build/ScoutCoreutils/coreutils-sha2.html@sha256:9ed3269c9e3694a6b7f845a48dcf83e151df53db585c3dceb68bf17f472ddb6d`
- The frozen plan (claims, kill rules, harm rules declared before data): `receipt:.ufo/waves/round-53/plan.md@sha256:aa03291a07d999a8e95d649de042f59b54c8b5549b7fcfc40247fd86084790d1`
- The R52-9 class as measured in round 51 (F5 finding file, nonce-identical byte-distinct trio): `receipt:.ufo/waves/round-51/w2/MutReceiptBytes.md@sha256:69fc18b35b95da00bf7a48423225b525c925c3d3fb500545ce1718a95a2992c9`
- The round-52 frozen counter whose B2 arm scores record-digest distinctness (the R52-10 probe-side half): `receipt:.ufo/waves/round-52/probe/attest52-probe.mjs@sha256:be2fe0ecc95e1f1b4d6ecfa2a0004db424ccd6a112d60f083f3553ef186b47f4`

## Prior art and boundaries

- Prior art: kake's S032 (RFC 3339, mined 2026-10-21) grounds receipt-timestamp parsing in
  the fleet; the round-52 entry `corpus/knowledge/fail-closed-clock-validation.md` (S102/S103)
  grounds the clock classes. This entry is the identity/evidence-set complement, not a
  renumber: S104/S105 are kumitate-local obligations about digests and sidecars.
- Withheld claims: S104 does not establish that sorted-key one-line JSON is canonical for
  arbitrary JSON (Unicode escapes, non-ASCII argv, number formats are outside the lane's
  field set and untested here). S105 is a man page (tier B): it grounds the sidecar line
  format the lane writes, not interoperability guarantees about every sha256sum
  implementation. Neither source says anything about nonces, replay windows, or ledger
  scoping — the evidence-set policy is the lane's own, resting on the measured R52-9 class.
- What this does not fix: the ±60 s prelude tolerance (Q39 ceiling, prelude-only rewrite
  with recomputed sidecar), the tree-author forgery boundary (a whole-tree author
  implements the contract), and B2e's data-not-execution bound — all carried in
  `corpus/knowledge/invocation-attestation.md` and the round-53 plan's limits.
