# RevCompat — independent backward-compat review, round 52 (v1 → v2 receipt-attest)

Seat: RevCompat (lever `kumitate-r52.RevCompat`). Read-only against the lane; all rehearsal state
under `.ufo/waves/round-52/build/RevCompat/`. No tool installs or upgrades were needed.
Base facts used: lane tip `ac567439` (round-52 wave-validation commit), shipped instrument
`scripts/receipt-attest.mjs` @ `ac567439` = contract `kumitate-receipt-attest-v1`.

## Verdict

1. **Whitelist containment: PROVED.** Every v1 record field is in the v2 whitelist; the only
   v2-only field is `stdin_sha256`, and it is optional. No v1 receipt can flip to `UNREADABLE`
   through the whitelist **as the contract words it** (see finding F3 for the wording trap).
2. **No genuine r51 receipt flips at its committed path: CONFIRMED** — with receipt bytes, on every
   verify-path addition (line shape, prelude shape, sidecar-name equality, CLOCK round-trip) and
   empirically against the sibling v2 draft (all three `RECEIPT: VALID`, exit 0).
3. **But two of the thirteen frozen A52 checks are UNREACHABLE under the contract's own additions —
   B3c and B4c.** Both frozen checks feed the *new* fail-closed shapes their own doctored inputs:
   the probe requires `exit 1 / TAMPERED` / `REPLAY` where v2 canonically answers `UNREADABLE`
   (exit 2) / `TAMPERED`. This makes `ATTEST52_HELD held=13/13` unattainable as frozen (F1, F2).

Severity: **F1, F2 = blocking for C1** (predicate `held=13/13`); F3 = contract-wording hazard;
F4/F5 = documented semantic narrowings, no action required beyond the SCORECARD note.

---

## F1 (blocking) — probe B3c requires exit 1 TAMPERED on a prelude that v2 classifies UNREADABLE

`probe/attest52-probe.mjs:290` rewrites the prelude to the literal

```js
lines[idx] = 'run-at: 2020-01-01T00:00:00.000Z (rewritten by probe B3c)';
```
and then requires `v.status === 1 && /RECEIPT: TAMPERED/.test(last)` (line 295). The prelude value
`2020-01-01T00:00:00.000Z (rewritten by probe B3c)` does **not** match the contract's
`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$` (plan § C1 SHAPE item 1), so v2 must answer
`receipt-attest: UNREADABLE` exit **2** — the fail-closed class the plan explicitly assigns to a
non-conforming prelude. The probe's own check then fails on the verdict class, not on the security
property (the receipt *is* rejected).

Rehearsal, verbatim (`build/RevCompat/draft-vs-probe.out`):

```
B3c v1=1 RECEIPT: TAMPERED (probe requires 1 TAMPERED)
B3c v2draft=2 receipt-attest: UNREADABLE malformed receipt (run-at prelude has invalid shape) (probe requires 1 TAMPERED)
```

The v1 arm passes only because v1 never inspects the prelude's shape (sidecar hash fires first);
the v2 draft (`build/ExecCompat/receipt-attest-v2-b6-scratch.mjs:29`, `parseReceipt` validates the
prelude regex before the sidecar step at line 115) answers UNREADABLE. The probe text is otherwise
unchanged from A51, so this is a v1-era expectation inherited into a v2-shaped wave.

## F2 (blocking) — probe B4c's ledger copies cannot satisfy the v2 sidecar-name rule

`probe/attest52-probe.mjs:369-370` builds its ledger by **renaming** copies:

```js
copyFileSync(rcpt, join(ledgerDir, 'orig.txt'));
copyFileSync(`${rcpt}.sha256`, join(ledgerDir, 'orig.txt.sha256'));
```

The copied sidecar still records the *original* basename. Measured on the real bytes
(`build/RevCompat/probe-craft-rehearsal.out`):

```
B4c.ledger(orig.txt) sidecarRecordedName="b4c-a1b2c3d4e5f6.txt" basename="orig.txt" hashStillCoversOrig=true
B4c v1 orig=1 RECEIPT: REPLAY     (probe requires 1 REPLAY for both)
B4c v1 twin=1 RECEIPT: REPLAY
B4c v2draft orig=1 RECEIPT: TAMPERED
B4c v2draft twin=0 RECEIPT: VALID
```

Two independent v2 mechanisms break the check:

- subject sidecar-name equality (plan § C1 SHAPE: "The sidecar's recorded name must equal the
  receipt's basename → else `RECEIPT: TAMPERED`") fires on `orig.txt` **before** the ledger arm
  (v1's check order keeps the sidecar at step 2 and the ledger at step 4). Probe needs REPLAY.
- the ledger's attested-prior predicate inherits the same name rule, so `orig.txt` is no longer
  *attested* evidence for the twin's ledger scan: the twin reads `VALID` where the probe requires
  `REPLAY`. Both arms are asserted together in `b4cok = twinValid && replay1 && replay2`
  (line 377), so B4c fails either way.

This is not a v1-receipt regression (B6 uses the receipts at their committed paths — see the
containment table), but it is a frozen-counter/contract contradiction: renaming a receipt pair is
enough to change an attested prior into a rejected subject.

### Repair recommendation (freeze addendum, plan § "Freeze receipts" permits it)

- B3c: assert `v.status !== 0 && !/RECEIPT: VALID/` (rejection, either class), keeping the
  prelude-rewrite bytes unchanged — that is the R52-8 property. Or keep `exit 1` and craft the
  rewrite as a *shape-valid* prelude outside the window (e.g. `run-at: 2020-01-01T00:00:00.000Z`).
- B4c: after copying, rewrite each copied sidecar line with the new basename
  (``${sha(bytes)}  orig.txt\n``), exactly as the probe already does for the twin at line 367.
  Two-line change; keeps the REPLAY intent and the twin-valid arm intact.
- Alternative (weaker): mandate in the contract that the prelude-shape and sidecar-name checks run
  **after** the sidecar hash / ledger arms. That contradicts the fail-closed ordering R52-3/R52-8
  ask for and forces the implementation to contort to a probe artifact — not recommended.

### Reachability map under the natural v2 (draft-measured)

| check | needs | draft answers | verdict |
|---|---|---|---|
| B1 selftest | exit 0, ≥30 PASS | n/a (verify-only scratch) | untested |
| B1c rolled clocks | any nonzero | `1 TAMPERED` | reachable (`build/RevCompat/b1c-b3-draft.out`) |
| B2/B2c/B2e | r52 receipts exist | n/a | not yet committed (gap) |
| B3 r51/r52 doctored control | `1 TAMPERED` | `1 TAMPERED` | reachable (`b1c-b3-draft.out`) |
| B3c live prelude rewrite | `1 TAMPERED` | `2 UNREADABLE` | **unreachable (F1)** |
| B4/B4d | r52 receipts / corrupt digest | n/a | not yet committed (gap) |
| B4c ledger twin | `REPLAY` both arms | `TAMPERED` + `VALID` | **unreachable (F2)** |
| B6 r51 receipts | `0 VALID` ×3 | `0 VALID` ×3 | reachable (compat holds) |

Ceiling under the current frozen counter at a faithful v2: **11/13**, i.e. `ATTEST52_UNMET`.

## F3 (medium) — "exactly the whitelist" is satisfiable two ways; only one keeps B6 green

Plan § C1 SHAPE: "the record field set is exactly the whitelist {…, digest, stdin_sha256?}". v1's
record has **9** fields; the whitelist lists **10**, with `stdin_sha256` marked optional. Read as
set *equality including* `stdin_sha256`, every v1 receipt becomes `UNREADABLE` and B6 fails; read as
"required = {9 v1 fields}, allowed = that plus optional `stdin_sha256`", B6 passes. The sibling
draft takes the correct reading (`REQUIRED` 9 names, `ALLOWED` 10 — `receipt-attest-v2-b6-scratch.mjs:11-12`),
and my harness proves the containment for the v1 direction:

```
V1_SEMANTIC_FIELDS ["argv","exit","mono_span_ms","nonce","stderr_sha256","stdout_sha256","wall_end","wall_start"]
V1_RECORD_FIELDS   ["argv","digest","exit","mono_span_ms","nonce","stderr_sha256","stdout_sha256","wall_end","wall_start"]
V2_WHITELIST       [... same 9 ...,"stdin_sha256"]
CONTAINMENT v1<=v2 PROVED        V2_ONLY_FIELDS ["stdin_sha256"] (optional-only)
```

Ask: the delivered instrument's header should state the reading (required 9 + optional
`stdin_sha256`) so `--selftest` and B6 are not hostage to an ambiguity. Also note the plan's own
B4 list: `stdin_sha256?` is the only optional field — the whitelist must reject *any other* extra
key (self-test arm already required by the plan: "SHAPE arms (unknown field …)").

## Containment / flip table — the real r51 receipt bytes

Bytes read from `.ufo/waves/round-51/receipts/` at `ac567439` (`cat -A`, byte tails, and the
harness `build/RevCompat/compat-rehearsal.out`). Every genuine receipt is exactly two lines +
one trailing `\n` (tails `…5a227d0a` = `Z"}\n`), no blank line, no CR.

| receipt | bytes | prelude (v2 regex) | fields ⊆ whitelist | sidecar name == basename | sidecar hash | CLOCK round-trip (wall_start/wall_end/prelude) | order/prelude window | v2 verdict |
|---|---|---|---|---|---|---|---|---|
| `attest-run-1.txt` | 481 | `2026-10-24T02:35:11.057Z` ✓ | ✓ (9) | ✓ `attest-run-1.txt` | ✓ | ✓ / ✓ / ✓ | ✓ / ✓ | **VALID** |
| `attest-run-2.txt` | 478 | `2026-10-24T02:39:06.793Z` ✓ | ✓ (9) | ✓ `attest-run-2.txt` | ✓ | ✓ / ✓ / ✓ | ✓ / ✓ | **VALID** |
| `attest-run-3.txt` | 583 | `2026-10-24T02:48:04.542Z` ✓ | ✓ (9) | ✓ `attest-run-3.txt` | ✓ | ✓ / ✓ / ✓ | ✓ / ✓ | **VALID** |
| `attest-run-2-replayed.txt` (doctored control) | 478 | `2026-10-23T20:43:09.000Z` ✓ | ✓ (9) | ✗ records `attest-run-2.txt` | ✗ (sidecar sha `7d0f3e07…` vs bytes `93915509…`) | ✓ / ✓ / ✓ | ✓ / ✗ window | **TAMPERED** (unchanged class; name fires before hash) |

Verbatim record line, run-1 (the v1 field set in the wild):

```
{"argv":["node","scripts/bind-oracle.mjs","--selftest"],"digest":"dfd8a98b081c83edb7dffb0dfc978ba00ed5ec26f2c305fde30ed951316845b5","exit":0,"mono_span_ms":313,"nonce":"3fd22d2153f74061d59ed9527b4ffca7","stderr_sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","stdout_sha256":"1d09dc59f002996df6e8c7948c720b13414fcc0e7ccb959c2bdc35d40bafcaf8","wall_end":"2026-10-24T02:35:11.371Z","wall_start":"2026-10-24T02:35:11.057Z"}
```

(Exact line 2 of the file, pasted from `sed -n '2p'`; the harness independently parses it, and its
digest recompute over `canonical(record − digest)` reproduced `dfd8a98b…`.)

Cross-checks that matter for the verify path:

- **CLOCK round-trip is a no-op for every v1 value**: all wall fields were produced by
  `new Date(ms).toISOString()` (v1 `doRun`), so `Date.parse` is finite and `toISOString()` returns
  the field bytes exactly — including the doctored prelude `2026-10-23T20:43:09.000Z`, which is why
  the r51 control keeps its TAMPERED verdict through the *window* rule, not through a shape error.
- **Inner digest formula unchanged**: recomputing `sha256(canonical(record − digest))` reproduces
  the recorded digest for all four files (`digestOk:true` each row). Any v2 change to `canonical()`
  would flip all four to REPLAY — the contract says the digest is unchanged; keep the byte-identical
  serializer.
- **Sidecar naming**: v1 wrote GNU text-mode lines with the bare basename; v2's equality rule is
  satisfied by construction for everything `run` writes (all four probe-craft helpers that write
  sidecars themselves use `basename`, verified in `compat-rehearsal.out`).

## F4 (low, documented narrowing) — renamed copies change class, and stop counting as ledger evidence

The only flip of genuine v1 bytes is *renaming a pair*, and it flips twice: `VALID` → `TAMPERED`
and "attested prior" → "skipped". This is the intended R52-3 closure (a sidecar name that escapes
the receipt's directory is a name-escape vector), but it is observable behavior that v1 did not
have and that the v2 header should state explicitly next to the ledger paragraph, because it also
changes what `--ledger` can *see*: a misnamed pair is no longer evidence of a prior invocation
(mirrors v1's "only attested receipts count", extended by F2's mechanism). No receipts in the repo
today are affected — `.ufo/waves/*/receipts` exists only for round 51, and every sidecar there
records its own basename except the doctored control.

## F5 (low, forward) — the frozen B4c twin writes a NON-canonical JSON line

`probe/attest52-probe.mjs:371` appends `,"digest":"…"}` after a key-sorted body, so `digest` sits
last on disk (canonical order would place it after `argv`). v1 and the v2 draft both parse then
re-canonicalize, so the twin verifies `VALID` (measured). The plan's SHAPE item never requires
canonical on-disk bytes — good — but any future "the JSON line must be canonical" check would
invalidate the probe's own twin. Note it in the contract so the fix isn't reintroduced.

## Residual risk / verification gaps

- **No v2 instrument exists yet** (`scripts/receipt-attest.mjs` is v1 at `ac567439`; `round-52/receipts/`
  absent). F1/F2 are established two ways: from the plan's normative sentences and empirically
  against the sibling draft `build/ExecCompat/receipt-attest-v2-b6-scratch.mjs` (a verify-only B6
  scratch, headed "not the delivered run/selftest instrument"). The delivered instrument may order
  checks differently; if it does, that ordering is now load-bearing for two frozen checks and MUST
  be recorded in the contract, or B3c/B4c repaired. Both are admissible; silence is not.
- The assignment's named rehearsal source `build/ExecCompat/` was **present but only as the
  scratch verifier above**; no `build/ExecInstrumentV2/` exists. B2/B4/B2e/B3 (round-52 receipts)
  could not be exercised — those receipts are committed at integration. Dependency recorded.
- B4c's `twinValid` arm and B3's committed control were tested with v1-generated bodies; a v2
  `run` that changes field order or adds `stdin_sha256:null`-style placeholders (it must not; the
  field is optional and absent when `--stdin` is not passed) would perturb the twin/tampered crafts.
  The draft's `REQUIRED`/`ALLOWED` split is the correct constraint to keep.

## Rehearsal artifacts (all under `build/RevCompat/`)

- `compat-rehearsal.mjs` / `.out` — field-set containment, per-receipt v2 simulation, B4c rename proof.
- `probe-craft-rehearsal.mjs` / `.out` — verbatim B3c/B4c crafts against v1 (baseline green).
- `draft-vs-probe.mjs` / `.out` — same crafts + r51 receipts against the sibling v2 draft (F1/F2/F6 evidence).

No files written outside `build/RevCompat/` and this report; no jj/git mutations; no installs.
