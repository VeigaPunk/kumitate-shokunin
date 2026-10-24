# ScoutFrontier — reconnaissance evidence

Observation time: 2026-10-24T04:05:15Z (`date -u +%Y-%m-%dT%H:%M:%SZ`). Paths below are rooted at `/home/vgpnk/Projects/shokunin/` unless absolute. These are source/document observations, not fresh behavioral test results.

## Search method and full sibling scope

Requested search: `grep -rl 'rfc3339\|RFC 3339' /home/vgpnk/Projects/shokunin/*-shokunin/corpus 2>/dev/null`.

Used the required specialized `functions.grep` instead of invoking shell grep. Parameters: `pattern="rfc3339|RFC 3339"`, `case=true`, `gitignore=false`, `skip=null`. The initial wildcard-directory request timed out after 30 seconds; it is NOT evidence of absence. Recovery used five successful, independently scoped calls, each with four explicit corpus-directory paths separated by semicolons:

| Batch | Corpus roots | Observed result |
|---|---|---|
| 1 | audio-shokunin/corpus; chousa-shokunin/corpus; game-dev-2d-shokunin/corpus; game-dev-3d-shokunin/corpus | No matches found |
| 2 | kaidoku-shokunin/corpus; kake-shokunin/corpus; kagi-shokunin/corpus; kama-shokunin/corpus | Matches only in kake, listed below |
| 3 | kasegi-shokunin/corpus; kengaku-shokunin/corpus; kotoba-shokunin/corpus; kotodama-shokunin/corpus | No matches found |
| 4 | lore-shokunin/corpus; mado-shokunin/corpus; mori-shokunin/corpus; revenger-shokunin/corpus | Matches only in mori, listed below |
| 5 | souji-shokunin/corpus; tabi-shokunin/corpus; tameshi-shokunin/corpus; tsukuroi-shokunin/corpus | No matches found |

Inventory grounding: `functions.glob` over `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/*.md` returned these 20 sibling roots plus kumitate. `functions.read` of the fleet directory (two ranges, 1–170 and 171–400) supplied the complete immediate-root listing and showed the same sibling lane directories. This is the requested immediate `*-shokunin/corpus` scope, not nested similarly named directories, wave reports, or external source trees.

Matching sibling files (equivalent file list for the successful scoped searches):

```text
kake-shokunin/corpus/README.md:334
kake-shokunin/corpus/SOURCES.md:40,180
kake-shokunin/corpus/knowledge/security-txt-publishing.md:48
kake-shokunin/corpus/knowledge/static-canonical-preflight.md:194
kake-shokunin/corpus/lessons/round-24.md:31
kake-shokunin/corpus/lessons/round-26.md:63
mori-shokunin/corpus/evidence/recheck-r32/S014.src:199
mori-shokunin/corpus/evidence/recheck-r32/S045.src:10497
```

Important search limitation: the case-sensitive requested pattern does not match `RFC3339` (uppercase, no space) or `RFC-3339`. Follow-up case-insensitive topic search and a focused read of the kake hit's consumer were therefore necessary; they exposed the substantive prior art at lines 157–180, although most of that section does not match the original exact pattern.

Follow-up search on kake/mori/kagi/kasegi corpora:

```text
pattern=fail.closed.{0,70}(clock|time|stamp)|(clock|timestamp).{0,70}(validat|verif)|round.trip.{0,40}(date|time)|zone.less
case=false; gitignore=false
```

Load-bearing hit: `kake-shokunin/corpus/QUALITY.md:161` (quoted below). Other matches concern mori commit-heading dating and kagi source-release recheck clocks, not invocation-receipt validation.

## Local lineage — directly observed text

- `kumitate-shokunin/PROVINCE.md:17–22`: frontier is named ground entered by sourced entries; its durable-execution and multi-agent failure research line names idempotency, timeouts and failure taxonomies.
- `kumitate-shokunin/corpus/knowledge/invocation-attestation.md:7–9`: admitted round 51, scope is what invocation receipts must bind so copying a body and rewriting the display prelude is machine-detectable, plus the ceiling left open.
- Same entry, lines 25–30: whole-file sidecar; canonical semantic digest; CLOCK_MONOTONIC ordering witness, existing prelude/body wall-window binding and nonce/digest ledger behavior. Line 28 already discusses ordering and the accepted prelude tolerance; those alone are NOT new round-52 knowledge.
- Same entry, line 37: "attestation proves record integrity and ledger nonce freshness, NOT temporal truth"; records are "author-attested invocation records, not cryptographic temporal proof."
- `kumitate-shokunin/.ufo/waves/round-52/plan.md:80–84`: CLOCK adds finite `Date.parse` and exact `toISOString()` round-trip; ordering and window semantics otherwise unchanged.
- Same plan, lines 71–76 and 100–109: explicit prelude shape and new entry's grammar/parse/finite+round-trip/ordering/window-binding teaching; R52-1/R52-8 case study and S102/S103 grounding.
- `kumitate-shokunin/.ufo/waves/round-51/w2/RevInstrument.md:32–87`: prior investigator reports regex-shaped impossible clocks accepted, NaN comparisons disabling ordering/window checks, and separate parse-normalization examples. Lines 64–68 report Feb 30 and 24:00 rolling over, but month 13 producing NaN. These are historical reported measurements, NOT re-executed here.
- `kumitate-shokunin/.ufo/waves/round-51/w2/MutReceiptBytes.md:222–288`: historical four-zone comparison reports zone-less prelude VALID under UTC and TAMPERED under three other zones, while the original Z-suffixed receipt remains VALID in all four. NOT re-executed here.

Existing local related coverage is also present, so the topic must not be framed as kumitate's first encounter with timestamp validation: `corpus/knowledge/native-transcript-ledger-seats.md:60–65` describes strict shape before chrono and dropping invalid stamps; `corpus/knowledge/runtime-remainder-census.md:445–468` describes `require_rfc3339`/`strict_timestamp` and leap-second refusal. These are existing code-census notes, not the new Node invocation-receipt doctrine.

## Material sibling prior art — directly observed text

`kake-shokunin/corpus/SOURCES.md:40`:

> S032 — RFC 3339: Date and Time on the Internet: Timestamps — https://www.rfc-editor.org/rfc/rfc3339.txt; tier A; scope: Calendar and offset grammar for timestamp fields in publishing receipts; anchor: sections 5.6 and 5.7; mined; used-by: corpus/knowledge/static-canonical-preflight.md, corpus/lessons/round-24.md.

`kake-shokunin/corpus/knowledge/static-canonical-preflight.md:157–159`:

> Receipt replay hardening — round 24 (2026-10-21). Sources: S032 (RFC3339 §5.6–5.7) ... The former lexical timestamp prefix comparison accepted malformed and future strings ... The round-23 producer fix did not fix that separate reader.

Same entry, line 173:

> c1 observedAt permits RFC3339's full-date production as well as date-time ... c2 fetchedAt requires date-time with offset. Values are parsed, not prefix-compared: real calendar/clock fields, ASCII digits, UTC lower bound 2026-10-21 and no later than the revision's committer instant ... Runtime-supported calendar/seconds are the local profile; leap-second spellings are not evaluated as valid instants.

Same entry, line 180: acceptance authenticates neither the GET event nor a claim's truth; receipt completeness is not publication readiness.

`kake-shokunin/corpus/QUALITY.md:161`:

> Parse every receipt field against its documented grammar and JSON type before method calls or comparisons. Timestamp fields use real calendar/offset validation and the declared commit-time bound, never a date prefix ... A nonzero process exit accompanied by a Python traceback is a crash, not a successful rejection.

This is substantive receipt-reader timestamp-validation prior art, NOT merely an incidental RFC citation. By contrast, kake's `security-txt-publishing.md:48–50` is an Expires-field rule; mori's two `.src` hits describe journal output and jj author-date input formats, not the proposed entry topic.

## Frozen receipts and current missing dependencies

Read, did not execute:

```text
.ufo/waves/round-52/base/attest52-base.txt:1
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1
B1c detail in that line: MISS exit=0 last="RECEIPT: VALID"

.ufo/waves/round-52/base/doctrine52-base.txt:1
DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=D52 | E1 MISS entry-absent
```

At this scout's inspection, exact grep for `S102|S103|fail-closed-clock-validation` in kumitate's `corpus/SOURCES.md` and `corpus/README.md` returned no matches; exact-path glob for `corpus/knowledge/fail-closed-clock-validation.md` returned Path not found. This is a point-in-time dependency, not a finding about later integration or a reason to wait.

## Tool availability and limits

- `functions.read(path="xd://lsp")` returned: `No such tool: xd://lsp. Mounted devices: ast_edit, debug.` No LSP server/device was available; no cold empty result was treated as absence. Symbol names above are documentary text, not semantically resolved definition/reference proof. No source-contract change was made.
- A directory-only glob ending `/corpus/` unexpectedly returned no files despite the observed directories; the issue was reported via `xd://report_issue`, then recovered using `corpus/*.md` and the complete immediate-root directory read.
- No tests, builds, gates, counters, code probes, external source admission, or source modifications were performed. No tools installed or updated. No mutating git/jj command or background job was used.

## Peer clarification (attributed, not independently rechecked)

`kumitate-r52.ConnOverlap` reports that kake S032 / `static-canonical-preflight.md:157–180` is settled round-24 publishing-receipt replay, and that kake round-45 `w1-spec.json` has no receipt_replay / RFC 3339 / S032 claim. The peer classifies it as adjacent prior art, not a live contest, and agrees that invocation-body finite/exact-UTC-round-trip validation and the zone-less prelude are a distinct delta. This scout directly read the prior-art corpus passages but did not repeat the peer's live-claim scan.
