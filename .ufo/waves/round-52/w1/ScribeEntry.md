# ScribeEntry — round-52 C2 entry draft: fail-closed clock validation

Seat: `ScribeEntry` (scribe). Lane: `kumitate-shokunin`, round 52, wave 1.
Drafted 2026-10-24. The assignment is a **draft** of the C2 corpus entry; nothing was admitted,
committed, moved into `corpus/`, or measured at a lane revision by this seat (the lane is
read-only to it outside `build/ScribeEntry/` and this report).

## Behavior — what landed

Full text of `corpus/knowledge/fail-closed-clock-validation.md` drafted at the seat path,
ready for L1 to move into `corpus/knowledge/` and commit:

- `.ufo/waves/round-52/build/ScribeEntry/fail-closed-clock-validation.md`
  — 20,138 bytes, 198 lines, sha256
  `dbaed764f234427436052627e485c35f11348393f164bb7c9b24ca5c7f09d672`

Supporting evidence, all under the seat dir:

- `clock-sweep.txt` — measured transcript, sha256
  `a775d5f3d89f1f0b4a83361d54616f4089610075a0cb6ceb839489bc0409ff46`
- `clock-sweep.mjs` — re-runnable chain sweep (lexical shape → `Date.parse` →
  `toISOString` round-trip, plus v1's two guard forms against a NaN window)
- `tz-verdict.mjs` — re-runnable R52-8 verdict experiment driver
- `v1-receipt-attest.mjs` — v1 instrument bytes extracted with
  `git show f539a71e:scripts/receipt-attest.mjs`, sha256
  `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (equals the plan's
  v1 pin byte-for-byte, which is what makes the extraction checkable)

Shape as frozen: line 1 `source: S102 <rfc-editor RFC 3339 .txt URL>; S103 <MDN Date.parse
URL>`; line 2 `verified-at: 2026-10-24 (wave fetch; non-author re-open pending)`; line 3
`recheck: 180d`; then body. Body: sources paragraph with both body sha256s; "the profile is
narrower than RFC 3339" (strict subset — `Z` only, `.mmm` only, seconds 00-59, `-00:00`
refused — not "RFC 3339 validated"); a six-step fail-closed chain (grammar shape → parse
finite → **byte round-trip** → ordering → window binding → TZ independence); the R52-1/R52-8
case study quoting v1's exact guards and the measured verdict flip; what v2 adds; a limits
section holding Q39 verbatim (integrity/freshness, never temporal truth); 19 receipt-bound
clause occurrences over 18 distinct paths; a clearly separated `## Pending bindings` list
with eight `FILL-AT-INTEGRATION-<n>` markers (not 64-hex, so they cannot bind or hash-miss).

## Measured results the entry rests on

Section A — one program, two runners (`node` v24.21.0 from fnm, v26.12.0 from mise; identical
readings on both):

| field | lexical | parse | round-trip | bytes equal |
|---|---|---|---|---|
| `2026-10-24T03:48:28.000Z` | true | 1792813708000 | `2026-10-24T03:48:28.000Z` | **true** |
| `2026-13-01T00:00:00.000Z` | true | `NaN` | n/a | false |
| `2026-02-30T00:00:00.000Z` | true | 1772409600000 | `2026-03-02T00:00:00.000Z` | false |
| `2026-10-24T03:48:28.000` | false | 1792824508000 | `2026-10-24T06:48:28.000Z` | false |

Against a NaN body window, v1's ordering guard (`end < start`) and prelude guard
(`prelude < low || prelude > high`) both stay false → `RECEIPT: VALID`; the same bounds
spelled `!(ms >= low && ms <= high)` reject NaN. `new Date(Date.UTC(2026,12,1))` rolls to
`2027-01-01`; the parse path does not roll month 13, it returns `NaN`.

Section B — R52-8 verdict experiment on the v1 bytes: one genuine receipt, body untouched,
`run-at:` re-written to the body instant with the offset removed, sidecar recomputed. Under
`TZ=UTC` → `RECEIPT: VALID`, exit 0; under `TZ=Asia/Tokyo` → parse
`2026-10-23T19:08:20.262Z`, `RECEIPT: TAMPERED`, exit 1; under `TZ=America/New_York` → parse
`2026-10-24T08:08:20.262Z`, `RECEIPT: TAMPERED`, exit 1. Same bytes, opposite verdicts.

## Gates run

Local replica of doctrine52's **E1 and E2 only** (the probe reads the entry from
`git archive <rev>`, and the draft is not committed; no rev exists to point it at). Replica
used the probe's own regexes and `git show f539a71e:<path> | sha256sum`:

```
E1 True
clauses=27 bound=19 distinct=18 misses=0
E2 True
FILL lines: 8   unbound non-FILL clauses: 0
```

E1 = trio within the first five lines incl. `rfc-editor.org/rfc/rfc3339` and the `S102`/`S103`
ids. E2 = ≥12 clause lines, ≥12 carrying `receipt:<path>@sha256:<64hex>`, every binding
hash-matching its blob at `f539a71e` (0 misses). E3/E4/E5 were **not** run: they are the
SOURCES-row / sources-check / census side of C2 and need the `S102`/`S103` rows (`mined` +
used-by this entry) owned by the `ScribeSources` seat — dependency recorded, not claimed.

## Bound paths (all 18 verified at `f539a71e`, no hash miss)

| path at `f539a71e` | sha256 |
|---|---|
| `.ufo/waves/round-52/base/attest52-base.txt` | `57355f3d6a1cc669e39993513e4fd9433a2a8c9d9c6cd9363d0fb468f1b0167d` |
| `.ufo/waves/round-52/base/baseline-gates.txt` | `09f55e2a263b382917a53a68756d3447fee11632eec2da7e79a61c7d17eb6284` |
| `.ufo/waves/round-52/base/doctrine52-base.txt` | `4c7f1363791498e450608cef3ce7c1fc0273b08d02db84aa23081c5f6367a6f9` |
| `.ufo/waves/round-52/plan.md` | `563d086bf1f59c60bb556501c0676597ec0df551eb03df57caacf1455c336565` |
| `.ufo/waves/round-52/probe/attest52-probe.mjs` (two clauses) | `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428` |
| `corpus/knowledge/invocation-attestation.md` | `2bbe5226d0f4ca61b86c6e419bdd6252bd3a08bab3ab599aec313dbc89499f10` |
| `.ufo/waves/round-51/w2/CritA3eGap.md` | `bd38328ae74a7039bb7fde647327241db6706cb306000f568efef513f5ec8576` |
| `.ufo/waves/round-51/w2/CritA2Span.md` | `93dfe9b6ae5e96f8e2654da07296baa78cd2738a1b8a69584774818d030a55cf` |
| `.ufo/waves/round-51/w2/CritLedger.md` | `cbe8e730d2698eb3e15d3b03e476a6133a1ab2ce1f0a0c6386776ec138e266aa` |
| `.ufo/waves/round-51/receipts/attest-run-1.txt` | `7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd` |
| `.ufo/waves/round-51/probe/attest51-probe.mjs` | `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c` |
| `.ufo/waves/round-51/probe/doctrine51-probe.mjs` | `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` |
| `.ufo/waves/round-51/w1/RevInstrumentContract.md` | `d146f3327577a61d843222f4384966bf5322a674044b9d9afac5d6b418bd0265` |
| `.ufo/waves/round-51/w1/ExecSelftestExec.md` | `de83be90f9d7b381d89166eb31ba2555de13b7291666e8e31e735783d72dbd90` |
| `.ufo/waves/round-51/w1/CritC1.md` | `ba815f68433f2c2f25953f8760b3f8cb48c05383cb20c02e96d6cca93a773ea9` |
| `.ufo/waves/round-51/w1/RevengerGap.md` | `ae70ce3f35e8c471719556974badfb63f1c00abc0938566aeea9e363901e5ab7` |
| `.ufo/waves/round-51/base/attest-base-v3r6.txt` | `b0fb355869d27549fa1e4601d3ef7dfff638878f380639c9732d38decb162adf` |
| `.ufo/waves/round-50/ReRunB49-1.txt` | `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6` |

Cross-check on method: these include the six hashes round 51's own entry cites for
`invocation-attestation.md`, `CritA3eGap.md`, `CritA2Span.md`, `attest-run-1.txt`,
`attest-base-v3r6.txt` and `attest51-probe.mjs`; my recomputation reproduces every one
byte-for-byte, so this `git show <rev>:<path> | sha256sum` procedure matches the one that
produced the r51 bindings.

## Freeze artifacts consulted (Q43 executions; not re-run by this seat)

- `base/attest52-base.txt`: `ATTEST52_UNMET held=5/13 … rev=02c01258…`; `B1c MISS exit=0
  last="RECEIPT: VALID"` (rolled clock read VALID at base); `B2 MISS` (all three receipts
  absent); `B2e MISS … USAGE unexpected argument "--stdin"`; `B5 MISS pin match;proxy
  exit=1 PROXY: DRIFT`.
- `base/doctrine52-base.txt`: `DOCTRINE52_UNMET held=0/5 … | E1 MISS entry-absent`.
- `base/baseline-gates.txt`: `PROXY: DRIFT (A_DRIFT 71→73; C2_TOTAL_DRIFT 117→118;
  AXES_DRIFT 10 vs 9)`, `BINDGUARD50 held=7/8`, `ATTEST51 held=8/9`, `DOCTRINE51 held=5/5`,
  census exit 0. (No `CHECKLIST` line in this file — the plan's `CHECKLIST: 21/23` comes
  from a different transcript.)

## Peer review incorporated

`kumitate-r52.CritC2` read the draft and returned three substantive corrections; all three
are applied in the current bytes:

1. **Ledger rule was inverted.** The draft said "an identical record under a distinct nonce
   is a byte replay". The r51 rule is the opposite polarity: a nonce reused across
   *different* record digests is the replay (flagged in both directions); byte-identical
   duplicates are exempt. Clause rewritten to digest identity.
2. **Measured vs bound was conflated.** The probe-header clause had used the probe's blob as
   evidence for node measurements that live in another file. It now binds only the header's
   text and states the correction, with the measured rows explicitly delegated to the
   pending transcript.
3. **Overclaimed reproduction.** The case-study intro said both consequences were reproduced
   by the frozen probe; only R52-1 is (B1c is a month-13 arm). R52-8 now cites the direct
   v1 instrument measurement (section B), and the TZ parse demo is no longer presented as a
   cross-TZ verifier verdict without evidence — it is one.

## Cross-seat coordination

`kumitate-r52.ScribeSources` confirmed the tier and supplied the row facts this entry depends
on. Applied to the draft:

- **S103 stays tier B** (scout proposed B, CritC2 concurs, `ScoutTierAudit` passed
  tier/scope/quote). No edit needed to the tier-B clause.
- **Their S102 row repair is `kind` `standard` → `spec`** to satisfy the frozen `KINDS` enum
  (`scripts/sources-check.mjs:102-105`: `spec, docs, paper, code, tool, dataset, talk, book,
  community, own-work` — no `standard`). Entry prose unaffected; their delta line 14 now reads
  `spec | A`.
- **Ordering is now written into the entry.** Both counters resolve blobs: E2 via
  `git show <rev>:<path>`, E4 via `sources-check`, whose `USED_BY_MISSING` (E11,
  `scripts/sources-check.mjs:317`, confirmed by reading the source) fires when a `mined` row
  names a `used-by` path absent at the same rev. The entry's pending section now states that
  the entry, the S102/S103 rows, and the three scout bodies must land in one integration
  commit (or entry first, bodies included).
- **S103's two dates are now separated in the entry's prose.** Saved HTML line 2011
  self-reports `2025-07-10T09:07:55Z`; the HTTP `Last-Modified` header is the serving layer's
  `2026-10-24T01:31:18Z`. Neither is presented as a publication date; the body sha256 is named
  as the only revision identity, which is also the only thing the entry's bindings use.

`kumitate-r52.CritC2` closed its review of the draft with one standing limitation, recorded
here verbatim in substance: **D52 does not establish substance** — twelve identical bound
bullets can pass E2 — so final admission still requires a substantive read plus the completed
commit-time bindings. Nothing in this report claims otherwise: the 18 hashes prove those
blobs exist and are unchanged, not that the prose they support is good.

## Findings

1. **Integration-mutated blobs must never be bound at freeze hashes.** `scripts/receipt-attest.mjs`
   (v2 bytes replace the v1 pin `44919763…`), `corpus/SOURCES.md`,
   `SCORECARD.md`, `corpus/README.md`, `SKILL.md`, `corpus/QUALITY.md`, `LOG.md`, and
   `corpus/lessons/round-52.md` all change at integration; binding their `f539a71e` hash is a
   guaranteed E2 hash-miss at R1. The draft says so explicitly and binds none of them. This
   is the sharpest E2 hazard of the round.
2. **`build/` is untracked at the freeze commit.** `git ls-tree f539a71e .ufo/waves/round-52`
   lists only `base/*`, `plan.md`, `probe/*`; `build/` and `w1/` are `??`. E2 reads blobs via
   `git show`, so the scout bodies, this seat's transcripts, and every sibling seat artifact
   cannot be bound until L1 commits `build/`. The eight FILL lines carry the already-measured
   working-tree hashes as substitution values, so promotion is mechanical.
3. **Absent peer artifacts at draft time (dependencies, not claims).**
   `.ufo/waves/round-52/build/ExecClockSweep/` held only `clock-sweep.mjs` (no transcript);
   `.ufo/waves/round-52/build/MutCounter52/` held `pristine.mjs`, `baseline.out`,
   `baseline.err`, `mutants/` but no `counter-mutant.txt` (B5c's input);
   `.ufo/waves/round-52/receipts/` does not exist yet. The entry evidences the sweep class
   with this seat's own transcript and treats the three receipt runs as
   FILL-AT-INTEGRATION-5/6/7 exactly as the plan schedules them.
4. **Frozen probe header is mechanically wrong about month 13.** `attest52-probe.mjs:20-22`
   says "V8 Date.parse rolls month 13 into January 2027". Measured on node v24.21.0 and
   v26.12.0: `Date.parse('2026-13-01T00:00:00.000Z')` → `NaN`; the *constructor* rolls
   (`new Date(Date.UTC(2026,12,1))` → `2027-01-01`), and `Date.parse` rolls only day overflow
   (`2026-02-30` → `2026-03-02`). B1c's verdict is unaffected — NaN defeats both of v1's
   guards, so v1 still answers `RECEIPT: VALID`, the measured `B1c MISS` — but the header
   sentence should be corrected by plan addendum, never by editing the frozen probe.
5. **The fail-open mechanism is worth a lesson row.** v1's guards are spelled so NaN passes
   them (`NaN < x` and `NaN > x` are both false); the same bounds spelled
   `!(ms >= low && ms <= high)` reject NaN. Fail-closedness is a property of the guard's
   *form*, not of its bounds — a candidate `## Mistakes` line for `corpus/lessons/round-52.md`.
6. **R52-8 is now a verdict measurement, not an inference.** The draft initially argued from
   `Date.parse` alone that the verdict would flip. Running the v1 bytes under three TZs
   produced the actual flip (`VALID` / `TAMPERED` / `TAMPERED`, exit 0 / 1 / 1) on one
   receipt with identical bytes — stronger than the inference and reproducible with
   `node .ufo/waves/round-52/build/ScribeEntry/tz-verdict.mjs <v1>`. Scope limit: it is a
   single genuine receipt per TZ (no statistical battery), and it demonstrates verdict
   dependence, not that any CI runs cross-TZ.
7. **S103 tier is stated honestly as B.** MDN is secondary guidance; the entry uses it for
   exactly one proposition (absent offset + time → system-local) and says in-line that it is
   not normative grammar and not evidence of any verifier's real verdict. If `ScoutTierAudit`
   assigns tier C or re-scopes S103, one clause and the sources paragraph need the matching
   edit; the grammar claim does not depend on S103.
8. **Novelty boundary is structural.** Round 51 already owns prelude/digest separation, the
   window, its −60,000/+60,073 ms tolerance, ordering, and the Q39 ceiling; the entry states
   that up front and keeps its new ground to the parser boundary (grammar ≠ parse ≠ bytes)
   and the TZ boundary, with the measured flip as the basis for the second.

## Touched surfaces

Written by this seat: the entry draft, `clock-sweep.txt`, `clock-sweep.mjs`, `tz-verdict.mjs`,
`v1-receipt-attest.mjs` (all under `build/ScribeEntry/`), and `w1/ScribeEntry.md`. No lane
source, `corpus/`, `scripts/`, jj/git state, `MANIFEST.json`, `.ufo/state`, or sibling lane
was modified; no commit, push, or publish. No tool installs or upgrades (nothing was needed).

## Out of scope for this seat (named, per plan)

`corpus/SOURCES.md` rows S102/S103 (`mined`, used-by the entry) — `ScribeSources`; moving the
entry into `corpus/knowledge/` and every pin/stanza/registry update — L1 integration;
`corpus/README.md` map row, `SKILL.md` row, `SCORECARD.md` stanza, `corpus/lessons/round-52.md`,
`corpus/QUALITY.md` Q44, `LOG.md`.

## Artifact paths

- `.ufo/waves/round-52/build/ScribeEntry/fail-closed-clock-validation.md` (draft entry,
  sha256 `dbaed764f234427436052627e485c35f11348393f164bb7c9b24ca5c7f09d672`)
- `.ufo/waves/round-52/build/ScribeEntry/clock-sweep.txt` (transcript,
  sha256 `a775d5f3d89f1f0b4a83361d54616f4089610075a0cb6ceb839489bc0409ff46`)
- `.ufo/waves/round-52/build/ScribeEntry/clock-sweep.mjs`, `tz-verdict.mjs` (re-runnable)
- `.ufo/waves/round-52/build/ScribeEntry/v1-receipt-attest.mjs` (v1 bytes,
  sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`)
- `.ufo/waves/round-52/w1/ScribeEntry.md` (this report)

Limits: the verdict above is a **replica** of D52's E1/E2 only, run against `f539a71e` with
`git show`; D52 itself was not and could not be run on an uncommitted draft, and E3/E4/E5
remain unproven by this seat. The draft is not the admitted entry: it becomes C2 evidence
only when L1 moves it to `corpus/knowledge/fail-closed-clock-validation.md`, adds the SOURCES
rows, and the frozen probe reads `DOCTRINE52_HELD held=5/5` at the measured rev.
