# ConnOverlap — kumitate round 52 sibling-overlap scan

Seat: ConnOverlap. Scan clock: 2026-10-24 (local). Read-only. No tool installed. No lane source edited.

**Verdict: kumitate round 52 overlaps no live sibling claim.** No sibling current-round claim owns `scripts/receipt-attest.mjs`, RFC 3339 as an invocation-clock source, the nonce/`--ledger` invocation ledger, or the A52/D52 gate probes. Homonyms and one settled prior-art corpus (kake round 24) are named below so they are not scored as contests.

## Axes

- Contested-write completeness: improved by separating live claims from homonyms and from settled sibling corpus.
- C1 operability (`kumitate-receipt-attest-v2`): unharmed. No sibling current wave writes or claims that instrument.
- C2 frontier coverage (`fail-closed-clock-validation`, S102 = RFC 3339): unharmed as a kumitate-local claim, but a "first in the fleet" novelty sentence would be false. Kake already mined RFC 3339 as its own S032 on 2026-10-21. Qualifying that sentence improves honesty and changes no counter.

## Method

Current round = highest numeric `.ufo/waves/round-*` per lane (it matched the newest mtime everywhere). `.ufo/reports/` newest dirs all predate 2026-10-23 and none equals the current wave, so they are not this-round claims. Phrase walk (python3, skip `__pycache__` / `node_modules` / journalctl man dumps / files >1.5 MiB) over those 17 sibling wave trees for `receipt-attest`, `fail-closed-clock`, `invocation-attestation`, `kumitate-receipt`, `gate-probe`, `ATTEST52`, `DOCTRINE52`, `RFC 3339` / `rfc3339`.

Lanes with no `.ufo/waves` and no `.ufo/reports`: `audio-shokunin`, `game-dev-2d-shokunin`, `game-dev-3d-shokunin`.

Absent artifact: live peer `kotodama-r65` has no `/home/vgpnk/Projects/shokunin/kotodama-shokunin/.ufo/waves/round-65` (checked; false). Newest on disk is round-64.

## Current-round claims (one line each)

Live or touched 2026-10-24 (roster or wave mtime):

| Lane / round | Frozen claim (source) | Overlap with r52? |
|---|---|---|
| chousa r38 | C1 one pinned absolute `env` for research-gate capture (`ENV_PIN_CAPTURE_MATCH=7/7`); C2 round-38 receipt bindings. `w1-spec.json` context; `w1/ConnOverlap.md:4` | No. Homonym "receipt"/"pin". Their seat already refuses kumitate `pin.receipt-attest` (`ConnOverlap.md:16`). |
| kake r45 | C1 `c45_audit.py` refuses three invalid witness-receipt classes; C2 v2 selftest kills 4/4 witness mutants and v6 names only executed class runs. `w1-spec.json` context. `w1-spec.json` has **zero** `receipt_replay` / `RFC 3339` / `S032` | No live claim. See prior art below. |
| kotoba r64 | C1 pin G7 `span_missing` (219→223 assertions); C2 four r63 routed defects. `plans/round-64.md:27-29` | No. "helper-invocation receipts" is carry-forward debt wording in `w1/ScribeSCORECARD.md:212`, not the claim. |
| kotodama r64 | C linguistics socialization entry + S718–S749; O `reopen-row.py` redirect edges; Ca r63 bookkeeping. `w1-spec.json` context | No. |
| mori r39 | C1 fabricated-content P-C7; C2 conformance timeout P-C8; C3 ancestry supersede P-C9 on `tools/mori-sources-appendonly.py`. `contract.md:34-131` | No. "receipt" = evidence file; "gate" = append-only sources gate. |
| revenger r64 | C1 firmware C07 knowledge entry (S036/S037); C2 attributed kill of `receipt['stdout_sha256']==H(raw_bytes)` inside `verify_icon_languages.py` and `verify_multi_icon_states.py`. `reports/round-64/claims.md:18-80`. Explicitly "No new gate capability" (`:123`) | No shared file. Closest live homonym (forged stdout hash). Different programs. |
| tsukuroi r36 | C1 five tools stop copying ambient env (`tools/run-receipt.py` is one of the five); C2 journalctl v262 `-F`/`-N` rejection note. `git show 6d76fb20:SCORECARD.md` "Round 36 — declaration" | No. `run-receipt.py` is a score harness. Journalctl man captures mention RFC 3339 as an output profile, not a clock-validation source row. Phrase walk of non-man files: 0 hits. |
| kumitate r52 | C1 receipt-attest v2; C2 fail-closed clock note sourced on S102 RFC 3339. `plan.md:45-59` | Self. |

Newest but not a 2026-10-24 live dispatch (still the current round on disk):

| Lane / round | Claim | Overlap? |
|---|---|---|
| kagi r28 (2026-10-21) | `corpus/release-clock.py` version-token findings; derived-row anchor match. `build-spec.json` context | No. "clock" = release versions, not wall clocks. Phrase hits 0. |
| kaidoku r34 (2026-10-23) | GNU Verneed reader; **its** S103 = LSB symbol versioning, S104 = glibc elf.h. `claims.json:44-57` | No. S103 id is lane-local. Not RFC 3339. Phrase hits 0. |
| kama r31 (2026-10-23) | llama-server chat-parameter table; SCORECARD claim-row evidence. `preregistration.json` | No. A repair bullet asks for an instrument-agreement gate/probe **registry row**, not a probe repair of kumitate gates. |
| kasegi r23 | Mirror-escape classification; F06–F08 CVD sources. `claims.json` | No. |
| kengaku r29 | Generated-config projection, 812×3 tasks. `build-spec.json` | No. |
| lore r103 (2026-10-19) | Canon-method coverage CM-a…g, QUALITY Q01–Q10, SOURCES census. `seats/R103Planner.md:5-35` | No. "fleet-ledger" is a path to a SOURCES contract, not an invocation ledger. |
| mado r28 (2026-10-23) | Mutation-gate held-out rotation; nine record defects D1–D9. `registration.md:17-67` | No. |
| souji r22 | Acceptance-summarizer scalar/cache defects. `preregistration.txt:1` | No. Explicitly no executed-command authentication. |
| tabi r22 (2026-10-21) | C1 durable lifecycle rows (`claim-classification.json`). RFC3339 `instant()` in `check-review-chronology.mjs:50` is classified maintenance, not the claim (`claim-classification.json:23`) | Adjacent timestamp parser, not this round's claim, not live, not invocation receipts. |
| tameshi r35 (2026-10-23) | `tally-audit-v3.py` sweep hole; six self-assessment mismatches. `spec-w1.json` | No. |

## Phrase-walk hits (only these)

- chousa r38: `w1/ConnOverlap.md:16` cites kumitate `pin.receipt-attest` in order to **refuse** absorbing it.
- kake r45: `w1/ConnectorSiblingOverlap.md:72,75` cites kumitate r51 `receipt-attest` / `invocation-attestation` to **refuse** merging them with `ledger_latest_check.py`. That seat's own verdict (`:1`) is no contested write scope. Its sweep predates kumitate r52 and chousa r38's tree; this scan re-read both.
- tabi r22: six RFC3339 lines in the chronology checker and its attack notes (paths above). Not a sourced RFC 3339 registry claim.

Zero hits in the other 14 current waves for those needles.

## Prior art that is not a live claim (do not ignore)

Kake round **24** (2026-10-21), still the maintained reader, not re-opened as an r45 claim:

- `kake-shokunin/corpus/knowledge/static-canonical-preflight.md:157-180` — "Receipt replay hardening". `scripts/receipt_replay.py` parses publishing-receipt timestamps (real calendar/clock, offset required on c2 `fetchedAt`, UTC lower bound 2026-10-21, not after the revision's committer instant). Lexical prefix compare was the defect they closed.
- `kake-shokunin/corpus/SOURCES.md:40` — S032, tier A, mined 2026-10-21: "RFC 3339 … Calendar and offset grammar for timestamp fields in publishing receipts." Used-by is `static-canonical-preflight.md`, not kumitate.

That falsifies a blanket "no sibling corpus holds fail-closed timestamp checks on receipt readers." It does **not** contest r52's write set: r45's frozen claims are `c45_audit.py` / `c45_count.py`, and `w1-spec.json` does not mention `receipt_replay`, RFC 3339, or S032.

Delta that remains kumitate's (plan.md CLOCK / SHAPE, not claimed by kake):

- Invocation body `wall_start` / `wall_end`: `Date.parse` finite **and** `new Date(ms).toISOString()` byte-identical round-trip (month-13 rollover → TAMPERED).
- Prelude must match `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$` (zone-less → UNREADABLE), so the verdict does not depend on verifier TZ.
- Kake explicitly allows RFC3339 full-date as well as date-time, allows offsets, and bounds by committer instant. Different schema, different failure mode.

## Proposed move (one)

When L1 writes the C2 entry and the S102 lesson sentence, add one prior-art clause and do not retarget the claim:

> Kake already mined RFC 3339 as lane-local S032 (2026-10-21) for publishing-receipt calendar/offset parse and a committer-instant bound (`scripts/receipt_replay.py`). Kumitate S102 is a different obligation on invocation-receipt wall clocks: finite parse plus exact UTC `toISOString` round-trip, and a `Z`-only millisecond prelude. S102 is not a renumber of S032. Kaidoku's S103 (LSB Verneed) is a third lane-local id.

Do not edit kake, kaidoku, or revenger. Do not call `ledger_latest_check.py`, revenger `receipt_ok()`, tsukuroi `run-receipt.py`, or chousa `verify-receipts.py` the same surface as `scripts/receipt-attest.mjs`.

## Risks

- `kotodama-r65` can still open a round-65 tree this scan cannot see. Re-read that directory if it appears; do not block r52 on it. Round-64 on disk is linguistics, not attestation.
- A C2 sentence that says the fleet had no RFC 3339 receipt-timestamp source is contradicted by kake `SOURCES.md:40`.
- Grepping `receipt`, `ledger`, `gate`, or `probe` across lanes false-contests chousa, kake, kotoba, mori, revenger, and tsukuroi. The discriminator is the instrument path plus the frozen predicate.
- Source-id collision is not file collision. Kumitate S102/S103, kake S032, and kaidoku S103 live in three `corpus/SOURCES.md` files.

## Verification (not run by this seat)

- `rg -n 'receipt_replay|RFC 3339|S032' kake-shokunin/.ufo/waves/round-45/w1-spec.json` stays empty.
- `rg -l 'scripts/receipt-attest|attest52-probe|fail-closed-clock-validation' <sibling>/.ufo/waves/<newest>` stays empty except citation seats (chousa `ConnOverlap.md`, kake `ConnectorSiblingOverlap.md`).
- C2 prose names kake S032 as prior art and still cites kumitate S102 for the round-trip / `Z`-prelude obligation. A52/D52 predicates unchanged.

## Files written

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/w1/ConnOverlap.md` (this file only).
