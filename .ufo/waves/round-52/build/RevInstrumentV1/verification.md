# RevInstrumentV1 — verification of the delivered v2 (round 52, C1) — FINAL

Harness: `verify-v2.mjs` (19 cases; 17 gate + 2 historical pre-repair counter shapes).
Transcripts: `v1-baseline.txt`, `v2-ExecInstrumentV2.txt` (superseded bytes), 
`v2-ExecInstrumentV2-final.txt`, `attest52-rerun-at-base.txt`.

| Artifact | sha256 | Reading |
|---|---|---|
| v1 (lane `scripts/`) | `44919763…e8d9` | gate **7/17** (the ten failures are exactly the routed defects) |
| delivered v2, final | `4d9d824a5d2be764a56cf0f49c2c2092556681266fc9b215103619b2db20ab77` (789 lines, 44 cases) | gate **17/17**, selftest `PASS (44/44)` |
| delivered v2, earlier | `aed7191c…0b29` (757 lines, 41 cases) | gate 15/17 (B3c/B4c pre-repair) — superseded |
| live A52 probe | `67b16479…822e` | repaired vs frozen `f6146a2c…1428` (3 hunks: B3c ×2, B4c ×1) |
| D52 probe | `e1aa4083…7169` | identical to both frozen copies (untouched) |

## Contract items — verified by execution on the final bytes

`case <name>: PASS` ×44 and `ATTEST_SELFTEST: PASS (44/44)` (probe B1 label/count, v1 scored 0);
R52-1 rolled month + calendar rollover → `TAMPERED` exit 1; R52-8 zone-less prelude → exit 2
under **both** `TZ=UTC` and `TZ=Asia/Tokyo`; F5 blank line and F8.1 unknown field →
`UNREADABLE` exit 2; F7 half-pair → run exit 2, receipt removed; F6 spawn failure → run exit 0,
recorded `exit: 127`; A2e `run --stdin -- /bin/cat` → `stdin_sha256 = sha256(32 nonce chars)`,
`stdout_sha256 = sha256(probe-captured cat stdout)`, `VALID`, GNU `sha256sum -c` 0; digest binds
`stdin_sha256` (stale digest → `REPLAY`); B6: three r51 v1 receipts `VALID`; F4 escaped
basenames (`back\slash`, `new\nline`) verify `VALID` **and** pass `sha256sum -c`.

## The two counter conflicts are closed by freeze repair (verified both ways)

Addendum item 1 (repaired B3c): the fresh receipt is copied into an isolated directory **under
its original basename** (sidecar verbatim, so the name rule matches) and only the prelude is
rewritten — to `wall_start + 30 s`, inside the window. The sidecar hash mismatch is then the
only possible reject. Measured on the final v2: `exit=1`, `RECEIPT: TAMPERED` (my M12r).
Addendum item 2 (repaired B4c): each copied sidecar's **recorded name field** is re-pointed to
the copy's basename (hash unchanged), so both copies are attested and the ledger nonce-reuse
arm answers. Measured on the final v2: twin alone `VALID`, `ledger(orig.txt) = REPLAY`,
`ledger(twin) = REPLAY` (my M11r).

Both repaired crafts also PASS on v1 — they were `B3c PASS`/`B4c PASS` at base and remain
non-discriminating between v1 and v2. They are forgery-class regression checks, not evidence
of the v2 fix; the discriminators stay B1/B1c/B2/B2e/B3/B4/B4c/B4d.

### Still required by the plan's own freeze discipline (process, not bytes)

`plan.md` carries **no numbered addendum** (only the pre-existing sentence at line 153), and
`base/attest52-base.txt` has **not** been regenerated after the probe edit. The frozen copies
under `build/CritFreeze/` now differ from the live probe. I ran the repaired probe at the frozen
base rev and it is **byte-identical** to the committed receipt:

```
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258… rule=A52 version=v1 | … B3c PASS … B4c PASS …
```

(`attest52-rerun-at-base.txt`, `diff` empty). So re-committing the receipt is reading-preserving
and cannot disturb the frozen arithmetic — but until the addendum names the new probe hash
(`67b16479…`) and the receipt is re-committed under the same path, the Q43 claim ("frozen AND
executed") cites bytes that are no longer in the tree.

## R52-6 — closed in the final bytes

The earlier mis-scoped arm is now honestly named `nonce-change-with-stale-digest-is-replay`
(line 700) and a correct prefix arm was added: `r52-6-ledger-nonce-16bit-prefix-not-reuse`
(line 710) builds two internally consistent receipts whose nonces share a 2-byte prefix and
requires **`VALID`** under `--ledger` for both — a truncating nonce comparator returns a false
`REPLAY` and fails. `r52-6-inner-digest-16bit-prefix-collision-reads-replay` (728) covers the
digest-prefix direction, and `r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid` (742)
covers the sidecar direction. All three PASS.

## Truncation mutants — killed (verified, not taken on report)

Three mutants of the final bytes (16-bit prefix compares at the three sites) were built in this
directory and run against their own suites; each exits 1 with **exactly one** failing case, the
arm that exists to catch it:

| mutant | site | killing case |
|---|---|---|
| `mutant-sidecar.mjs` | `if (parsed.hash !== actual)` → `slice(0,4)` | `r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid` |
| `mutant-digest.mjs` | `if (digest !== record.digest)` → `slice(0,4)` | `r52-6-inner-digest-16bit-prefix-collision-reads-replay` |
| `mutant-nonce.mjs` | `state.nonce === record.nonce` → `slice(0,4)` | `r52-6-ledger-nonce-16bit-prefix-not-reuse` (both receipts read a false `REPLAY`) |

Transcripts `mutant-*.selftest.txt`. This closes SCORECARD (h3) for all three compare classes.

## Close note — the doctored control's sidecar must be re-pointed, not copied

B3 passes in every variant, but only one of them demonstrates the sentence it is cited for
("run-2's receipt with only the `run-at:` prelude rewritten, sidecar untouched"). Measured on the
final bytes, with the prelude moved to `wall_start + 30 s` (in-window, so only the sidecar can
reject):

| committed sidecar for `attest52-run-2-replayed.txt` | verdict | branch |
|---|---|---|
| verbatim copy of `attest52-run-2.txt.sha256` (F3's r51 recommendation) | `TAMPERED` exit 1 | **name mismatch** — prelude coverage never exercised |
| records `attest52-run-2-replayed.txt` with run-2's original hash | `TAMPERED` exit 1 | **sidecar hash mismatch** — the declared class |
| absent (r51's actual committed state) | `TAMPERED` exit 1 | sidecar absent — also not the declared class |

So B3's arithmetic is safe either way, but the committed fixture must use the second row or the
artifact again fails to demonstrate prelude-byte coverage (the F3 defect, now via the name rule).
This is the same lesson as repair item 2: any copied pair needs its sidecar name field re-pointed.

## Residuals that remain open by contract design (unchanged, not defects of this build)

- **R52-2 / F2**: documented only (header + printed note + case at ~690). A same-nonce twin
  beside a prior with a damaged sidecar still reads `VALID`.
- **R52-3 / F6**: capture failure stays `exit: 127` with no distinguishing field, and the SHAPE
  whitelist makes a `capture_error` field contract-illegal. Needs a contract change.
- **F8.2 / F8.3**: unreadable-sidecar diagnostic and ±60 s prelude slack untouched (Q39 ceiling).
- B3c/B4c no longer discriminate v1 (see above); any close claim that they witness the v2
  hardening would be wrong.

## Lane dependencies recorded

- `build/MutCounter52/counter-mutant.txt` (B5c) still absent at this writing; the probe reads it
  from `git archive <rev>`, so it must be **committed** before the scored close rev.
- Round-52 receipts, pin re-derivation (`4d9d824a…`), proxy stanza and the README map row remain
  L1 integration duties; B2/B4/B5 are unscoreable until they land.
- `v2-remedied-preview.mjs` (the alternative route: drop the name rule) is **superseded** and
  kept only as the record of the rejected option; it was derived from the earlier 757-line bytes.
