# Round 52 — lesson

Lane: kumitate. Round 52 (hyaku run 5, watchdog attempt 1). Base
`02c01258464cac3804faf177d0cfbf113cd59706` (the round-51 verifier spot-check tip at round
open); freeze `f539a71e236a4d66810851c1f2fb6e1abe61ec19` ("round-52: freeze — plan (2
claims, v2 wave of 64), counters A52/D52 v1, executed base receipts (Q43)"). Plan
`.ufo/waves/round-52/plan.md`; frozen counters
`.ufo/waves/round-52/probe/attest52-probe.mjs` (rule A52, v1, thirteen checks B1..B6) and
`probe/doctrine52-probe.mjs` (rule D52, v1, five checks E1..E5), both executed at the base
before data (`base/attest52-base.txt` held=5/13, `base/doctrine52-base.txt` held=0/5).
Round shape: **ONE v2 wave of exactly 64 seats** (orchestrator/operator steer 2026-10-24,
supersedes the earlier 32+32 v1 plan), validated under `scripts/hyaku/ufo-wave-policy-v2.json`
(band 64–128, ≥25% attack roles; this wave carries 24 attack-role seats = 37.5% by reviewer+critic+mutation-tester (25 counting the revenger, 39.1%)), dispatched as
exactly ONE task call; the §3 planner seat is held by the L1 (orchestrator ruling
2026-10-19: the validator rejects `planner` as a swarm role).

Two claims. **C1 — operability (capability deepening): `receipt-attest` v2**,
`scripts/receipt-attest.mjs`, contract `kumitate-receipt-attest-v2` (SHAPE / CLOCK / STDIN
/ LEDGER / SELFTEST additions; v1 semantics preserved), predicate `ATTEST52_HELD` (rule
A52, thirteen checks). **C2 — frontier coverage (learning, sourced):**
`corpus/knowledge/fail-closed-clock-validation.md` resting on SOURCES rows opened this
round (S102 = RFC 3339, tier A; S103 = MDN `Date.parse()`, tier assigned honestly),
predicate `DOCTRINE52_HELD` (rule D52, five checks). Round-51 closure routed defects
R52-1..R52-11 are honored in the close; R52-11's citation discipline is this round's
close sequence (plan §Close sequence), and QUALITY Q44 freezes it for future rounds.

## Mistakes

- **M1 — R52-11: a measured close revision filed without a receipt executed at that
  revision.** Class: close-citation integrity / freeze-evidence gap. Evidence: the round-51
  close receipt
  `.ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt` reads
  `ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=57333ead13b1b39419bdb1cf6502fad0aa8523ff
  rule=A51 version=v3 | A1 PASS | … | A5 MISS pin match;proxy exit=1 PROXY: DRIFT
  (A_DRIFT term=A declared=81 computed=71 …` with `a51=1` (its `DOCTRINE51` line reads
  `held=5/5`; `d51=0`). The filed report
  (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-51/kumitate.md:99-100`) instead cites
  `ATTEST_HELD held=9/9 checks=9 rev=fef67079… rule=A51 version=v3` and names
  `close/FINAL-*.txt` as its receipt. The citation is wrong twice over: (a) the committed
  FINAL receipt reads 8/9, not 9/9 (A5 MISS on the transiently pinned declared A=81); and
  (b) the file did not exist in the cited tree at all —
  `git cat-file -e fef67079:.ufo/waves/round-51/close/FINAL-57333ead….txt` fails ("exists
  on disk, but not in 'fef67079'"); `git ls-tree --name-only fef67079
  .ufo/waves/round-51/close/` lists only `A51-cd7f69d3.txt` and `D51-cd7f69d3.txt`, and
  the FINAL file lands in `cb6c472` ("round-51: final harm+census receipts"), a descendant
  of the cited rev. The 9/9 evidence is the earlier `cd7f69d3` receipt (run-at
  2026-10-24T02:48:31Z), i.e. the 9/9 at `fef67079` is compositional, not receipted.
  Captured by: Q43's close-gap — the counter was executed but the receipt was not
  committed at the cited rev; the non-author verifier spot-check
  (`corpus/lessons/round-51-verifier-spotcheck.md:36,71`) filed R52-11 with the same
  reading ("compositional, not receipted"). Fix: the R52-11 close sequence — R1 = the
  integration tip, run A52 + D52 against R1 and commit `close/FINAL-<R1>.txt`; R2 = that
  receipt commit, re-run both counters against R2 and commit
  `close/IDEMPOTENCE-<R2>.txt`; the report and SCORECARD cite the measured close revision
  R1, name R2/R3, and quote the committed FINAL line verbatim — plus QUALITY Q44, which
  freezes the discipline for every future round.

- **M2 (ADJudicated by the L1 addendum, repair 11) — the frozen predicate is not
  the declared predicate.** Class: freeze-prose defect / predicate identity (the round-51
  M1 lineage). Evidence: plan lines 51–53 require the C1 predicate sentence to be
  byte-identical in the probe header, but CritFreeze's literal membership test is false for
  both counters: `attest52-probe.mjs:76-81` carries `Predicate ATTEST52_HELD = held=13/13,
  exit 0` and `doctrine52-probe.mjs:30-32` carries `Predicate DOCTRINE52_HELD = held=5/5,
  exit 0`, neither of which contains the frozen sentence (`build/CritFreeze/
  predicate-comparison.json`). The same seat's F2 records that replaying both probes at the
  freeze revision `f539a71e` does not reproduce the committed base receipts byte-for-byte
  (first differing offsets A52 49 / D52 51 — the revision field; A52's B5 detail also
  shifts from `C2_TOTAL_DRIFT … 117` to `A_DRIFT … 71→73`, scores and exits unchanged).
  Captured by: seat CritFreeze F1/F2. Fix (APPLIED, addendum item 11): both headers now carry the frozen predicate sentences
  byte-identical with plan §Claims; both counters re-executed at base and the fresh receipts
  committed over base/. (The seat's F2 receipt-revision deltas are expected — receipts are
  rev-bound by construction.)

- **M3 (ADJudicated by the L1 addendum, repairs 1-2) — a frozen fixture cannot be
  satisfied together with the contract it scores.** Class: counter-vs-contract collision.
  Evidence: A52's B4c fixture copies a receipt plus its **unchanged** sidecar to
  `orig.txt`/`orig.txt.sha256` and then requires the original to read REPLAY
  (`attest52-probe.mjs:369-377`), while the declared SHAPE contract (plan:75–78) makes a
  sidecar-name ≠ receipt-basename pair TAMPERED — so a conformant v2 answers TAMPERED and
  B4c fails; the twin's ledger scan also loses `orig.txt` as attested evidence, and the
  three arms are asserted together (`b4cok = twinValid && replay1 && replay2`, `:377`).
  A second collision: B3c rewrites the prelude to `2020-01-01T00:00:00.000Z (rewritten by
  probe B3c)` (`:290`) and demands TAMPERED/1 (`:295`), but that parenthetical violates the
  declared prelude grammar, whose declared result is UNREADABLE/2. A third, softer one
  (RevCompat F3): "exactly the whitelist" lists ten fields with `stdin_sha256?` optional
  while v1 records nine, so the equality reading breaks B6 and the "allowed" reading is the
  only one that keeps it green. All are frozen-text traces ([INFERENCE] in the seats'
  wording), not executed mutants. Captured independently by CritC1 (b), RevCounterA X1
  ("contract ↔ counter contradiction; 13/13 unreachable for a conformant v2"; it also shows
  the base receipt's `B4c PASS` was graded under v1 semantics, where verify never resolves
  the recorded sidecar name), and RevCompat F2/F3. Fix (APPLIED, addendum items 1-2 and contract wording): B4c re-points the copied
  sidecars' name fields; B3c uses a same-basename copy with an in-window grammar-valid
  prelude so the sidecar arm is the only possible reject; the whitelist is stated as
  required-nine-plus-optional-stdin_sha256. Fresh base receipts committed; the scratch-HELD
  witness (ExecProbeA52) later proved 13/13 reachable against the repaired counter.

- **M4 (adjudicated) — two scope attacks, one repair and one recorded limit.** CritC2 (c)
  (D52 E2 accepts twelve copies of one binding) is a REAL defect — Fix APPLIED (addendum
  item 12): bound paths must be DISTINCT and verify as blobs. CritC2 (d) (S102 tier-A scope)
  is correct curation, not a defect — recorded as a withheld claim in the entry and the
  SOURCES row scope (RFC 3339 grounds grammar/offset only; the round-trip policy is the
  lane's own, citing S103 for the JS behavior).

- **M5 — freeze-time fixture crafts were never executed against the contract they score
  (the Q43 lesson, one level deeper).** Class: unrun-fixture-treated-as-frozen (M1/M2
  lineage). Evidence: the frozen B3c/B4c crafts (M3) shipped UNEXECUTED at f539a71e — the
  base receipts graded them under v1 semantics (which ignores recorded sidecar names), so
  the collision was invisible until a builder seat tried to CONFORM (ExecInstrumentV2) and
  the adversarial seats traced it (CritC1, RevCounterA X1, RevCompat F2/F3, RevInstrumentV1
  ceiling ≤11/13). Captured by: nothing at freeze time — the L1 froze crafts authored
  against v1 semantics without a conformant-v2 witness run; wave seats caught all of them
  within minutes. Fix: Q43 now covers crafts — from round 53 the freeze commit must include
  a scratch-HELD witness of the counter against a synthetic conformant post-state (the
  ExecProbeA52 protocol), not only base UNMET receipts.

Mine queue (snapshot 2026-10-24T04:06:12Z, fifteen of 64 reports present; extended by three
late arrivals — RevCounterA, RevCompat, ConnOverlap — with 39 present when the draft was
finalized at 04:07:38Z), grouped: freeze/counter attacks — CritFreeze (M2 above), CritC1
(M3 above, plus A2e provenance: the frozen arm checks the instrument's nonce and a
separate `/bin/cat` run, so the recorded stdout hash is a consistency check, not capture
of the instrument-spawned child), RevCounterA / RevCompat (independent M3 captures, plus
RevCompat's whitelist-ambiguity note and its verdict that the frozen counter is "NOT a
sound scorer of the frozen contract"), CritC2 (M4 queue); freeze sanity — ExecProbeSanity
(A52 `held=5/13`, D52 `held=0/5`, expected patterns, "no freeze defect found"; its B5
detail difference is F2's, above); sources — ScoutRfc3339 / ScoutCompanion (S102/S103 rows
proposed, `## Gate`), ScoutCensus (live census 101 rows, A:87/B:6/C:8, exit 0 at
2026-10-24T04:04:02Z; frozen `SOURCES_CHECK: CLEAN (rows=101 …)`), ScoutSibling, ConnOverlap
(a C2 sentence claiming the fleet had no RFC 3339 receipt-timestamp source is contradicted
by kake `SOURCES.md:40` — kake S032, mined 2026-10-21, is prior art that the entry must
name); scope/safety — SentScope (low: five `w1-*.json` coordinator paths outside the
allowlist; medium: fleet worktree not clean, attribution explicitly not established);
scribe duplicate — ScribeQuality (same R52-11 ground as M1; it also records that the
655-byte FINAL file is two-tree — a rev-bound `held=8/9 … declared=81 computed=71` line
beside an un-rev-bound `PROXY: MATCH (A=81 …)` line no committed tree can produce — and
that line 1 is truncated mid-token at `delt`, a Q24 adjacency). The other 49 seats of the
snapshot had not reported at 04:06:12Z; the wave was still in flight.

## Gate

Candidates: S102 (RFC 3339, rfc-editor.org) and S103 (MDN `Date.parse()`), both opened by
wave-1 scouts this round. **Decision status: proposals only** — the scouts wrote proposed
rows and did not edit the registry; admission belongs to the integrating seat / non-author
gate, and the values below are the scouts' measured fields, not admissions.

- **S102 — PROPOSED (tier A).** `https://www.rfc-editor.org/rfc/rfc3339.txt`, HTTP 200,
  35,064 bytes, sha256 `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a`,
  fetched 2026-10-24T04:03:35Z (saved bytes
  `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt`). Proposed quote (5 words), §5.6
  "Internet Date/Time Format", saved line 422:
  `date-time       = full-date "T" full-time` — with `full-time` requiring `time-offset`
  (line 420) and `time-offset` selecting the UTC designator or a signed numeric offset
  (lines 414–415). Proposed status `mined`; used-by
  `corpus/knowledge/fail-closed-clock-validation.md`.
- **S103 — PROPOSED (tier B).** MDN Web Docs, `Date.parse()`, HTTP 200, 172,329 bytes,
  body sha256 `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`, fetched
  2026-10-24T04:03:47Z; unversioned page (`Last-Modified: Sat, 24 Oct 2026 01:31:18 GMT`),
  saved bytes `.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html`. Proposed
  quote (14 words), § Using `Date.parse()`, saved HTML line 1765: `will be set to
  2019-01-01 at 00:00:00 in the local timezone of the system`. Tier B proposed because
  MDN describes JavaScript behavior rather than serving as normative RFC 3339/ECMAScript
  authority; proposed status `mined`; used-by the same entry.
- **Tier scoping recorded by CritC2 (d):** S102's tier A is defensible only for RFC 3339
  §4 local-offset semantics and §5.6/§5.7 grammar and calendar restrictions — not for
  JavaScript `Date.parse` normalization, NaN handling, Node TZ behaviour, or the lane's
  exact-byte profile. RFC-valid but lane-illegal examples (`1985-04-12T23:20:50.52Z`,
  `1996-12-19T16:39:57-08:00`) must not be presented as accepted by the instrument.
- **Entry-shape requirement recorded by CritC2 (b):** S103's load-bearing clause must say
  that with the UTC offset absent, JavaScript date-time forms are read as local time while
  date-only forms are read as UTC, so a verifier must reject the zone-less prelude before
  host-local parsing can influence its verdict; a bare "timestamps should have zones" gloss
  leaves S103 filler.
- **Prior-art requirement recorded by ConnOverlap:** kake has mined RFC 3339 as its own
  lane-local S032 (2026-10-21) for publishing-receipt calendar/offset parsing, so the C2
  entry must name that prior art and must not claim the fleet had no RFC 3339
  receipt-timestamp source (kake `SOURCES.md:40`); kumitate S102 stays a distinct
  obligation (invocation-receipt wall clocks: finite parse, exact UTC `toISOString`
  round-trip, `Z`-only millisecond prelude) and is not a renumber of S032. Sibling lanes
  are read-only for this round; source-id collisions across lane-local registries are not
  file collisions.
- **Admitted:** `<pending — record the gate decision with tier, open date and used-by>`.
- **Withheld claims (recorded, not admitted):** S102's excerpt does not mandate finite
  `Date.parse` results, `toISOString()` round-trips, receipt ordering or receipt-window
  bounds — those are application policy (the scout's own limit note); the lane's fixed
  three-digit uppercase-UTC prelude is a narrower policy than RFC 3339 §5.6 (variable
  fractional precision, lowercase letters, signed offsets are all RFC-legal). S103's
  local-time reading must not be generalized to date-only input (UTC per the same page)
  nor to malformed strings. `<add or strike at gate time>`.
- **Rejected:** `<pending>`.
- **Spot-check:** `<pending — a non-author wave seat re-opens S102/S103 from a fresh fetch
  and compares saved-byte hashes and quote line numbers>`.

## Gate

Candidates: S102 (rfc-editor.org RFC 3339) and S103 (MDN `Date.parse()`), opened by scout
seats this round and mined for `corpus/knowledge/fail-closed-clock-validation.md`. Rows
before: 101; after: 103 (tiers A 87→88, B 6→7, C 8 unchanged).

- **S102 — ADMITTED, tier A.** URL `https://www.rfc-editor.org/rfc/rfc3339.txt`; opened
  2026-10-24T04:03:35Z (UTC stamps from `date -u` immediately around a
  `curl --location --fail --max-time 120`); HTTP 200; 35,064 bytes; sha256
  `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a`; RFC 3339,
  Standards Track, July 2002. Located quote (5 words), §5.6 Internet Date/Time Format,
  saved text line 422: "date-time = full-date "T" full-time" — line 420
  (`full-time = partial-time time-offset`) and lines 414–415
  (`time-offset = "Z" / time-numoffset`) make the offset mandatory in that production.
  Second located fragment (21 words, abridged after `"23"`), §5.7 Restrictions, saved text
  lines 496–498: "Although ISO 8601 permits the hour to be "24", this profile of ISO 8601
  only allows values between "00" and "23"" [elided tail: "for the hour in order to reduce
  confusion"]. Row encoding: `kind` `spec` (the initially requested `standard` is outside
  the frozen enum; `KIND_ENUM` E05). Status `mined`; used-by
  `corpus/knowledge/fail-closed-clock-validation.md`.
- **S103 — ADMITTED, tier B.** URL
  `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse`;
  opened 2026-10-24T04:03:47Z; HTTP 200; 172,329 bytes; sha256
  `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`; unversioned page —
  HTTP `Last-Modified: Sat, 24 Oct 2026 01:31:18 GMT` (serving layer) and the page's own
  "last modified" 2025-07-10T09:07:55Z (saved HTML line 2011), etag
  `"10d26b33e7ac709650d165ff09537b4d"`. Located quote (14 words), § Using Date.parse()
  (`#using_date.parse`, saved HTML line 1759), saved HTML line 1765: "will be set to
  2019-01-01 at 00:00:00 in the local timezone of the system"; line 1766 supplies the
  offset-less example `Date.parse("2019-01-01T00:00:00")`, lines 1760–1763 the date-only
  UTC contrast, line 1747 "Other formats are implementation-defined". Status `mined`;
  used-by `corpus/knowledge/fail-closed-clock-validation.md`.
- **Withheld claims (recorded, not admitted).** S102 establishes grammar, calendar bounds
  and the mandatory offset; it does NOT establish JavaScript `Date.parse` round-tripping,
  exactly three fractional digits, uppercase-only `Z`/numeric offset, receipt ordering, or
  the ±60,000/+60,073 ms window — the v2 policy is a strict subset of RFC 3339 (§5.6
  permits variable fractional precision and notes lowercase `t`/`z`). S103 is secondary
  documentation of JS behaviour, not normative text; ECMA-262 §21.4.3.2 is the primary and
  was not opened this round (leftover lead).
- **Rejected.** None this round.
- **Spot-check.** Both access stamps are scout-produced; L1/verifier re-opens both URLs and
  compares the recorded sha256 against a fresh fetch.
