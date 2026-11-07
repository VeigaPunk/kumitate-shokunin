source: S27x (the two grounding rows drafted this round — git gitrevisions, `<sha1>` entry: an abbreviated object name is repository-relative; GitHub Docs, getting permanent links to files: the commit id is a URL path segment; ids assigned at integration); S267, S268, S269 (the oh-my-pi rows whose `79fa222e8390aed3494f4bc6746814e6c74c21cf` pin round 93 cites)
verified-at: 73317eca18c3927fc3c92fe492cd882dc4cda953 (round-94 freeze: plan.md, probe94-c1.mjs, controls, open/ receipts); lane gate `scripts/round-gate.mjs` contract `kumitate-round-gate-v1`; filed-report population 77 kumitate reports (fleet pin 87de49a6); `<L1: integrated tool sha256, counter verdict line and `--selftest` count at the round-94 integration commit M>`
recheck: `node scripts/round-gate.mjs --round 93 --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin --origin /home/vgpnk/Projects/ufo-fsd-alpha` → `ROUND_GATE: CLEAN` with `declared=2` in the citation detail; the same command for rounds 12 46 53 57 61 62 63 → the same `unresolved` sets as before the rule; `node scripts/round-gate.mjs --selftest` → `VERDICT: PASS`. Re-open the two S27x rows and re-run the counter in `.ufo/waves/round-94/probe/probe94-c1.mjs` when the upstream pages change.

# Round-gate declared pins

## The class

A filed round report is full of backticked hashes. The lane gate reads every backticked span, splits it on
`..`/`...`, keeps the parts that match `^[0-9a-f]{7,40}$`, and treats each as a claim that a commit with that
prefix exists somewhere the lane can probe: its own repository, then the fleet's main repo, then the origin
tree. That is right for the lane's own work and wrong for the upstream a lane deliberately cites: a source it
opened elsewhere is pinned by a commit id that lives in another repository, which the gate never probes. Before
round 94 the only outcomes were *resolves* (ancestor of the lane HEAD, or external in main/origin) or
`COMMIT_CITED_UNRESOLVED`; a lane that pinned the exact source it opened read red for being precise.

Round 93 is the case in hand. Its report cites the oh-my-pi pin `79fa222e` and its full form
`79fa222e8390aed3494f4bc6746814e6c74c21cf` (the pin of S266–S269); the gate reads `cited=11 unresolved=2
[… 79fa222e 79fa222e8390…]` and exits 1 — both at the lane base `a6e4da96` and at the round's own M
`2f8475cd` (`.ufo/waves/round-94/open/round-gate-r93-before.txt`; `K94ScribeLesson/receipts/q88-r93-fail.txt`).
The erratum the lane appended does not clear the finding, and cannot: it quotes the full pin, so the erratum
*adds* a second unresolved token to the report it is explaining (the filed erratum reports `cited=10
unresolved=1`; the bytes as filed read `cited=11 unresolved=2`). A report cannot talk its way out of a
citation.

Round 94 adds one non-finding class between "resolves in origin" and "unresolved": a pin the lane's own
source registry declares. It changes nothing else in the gate.

## The frozen rule (verbatim, `.ufo/waves/round-94/plan.md`)

```
A cited token that resolves in no probeable repo is `declared` (never a finding; listed in `--json`
`citations.declared`) iff it is a prefix of a 40-hex string that is a complete path segment — the URL
split on `/`, `?`, `#` — of an `http(s)://` URL on a `corpus/SOURCES.md` registry row
(`^ {0,3}\|\s*S\d{3,}\s*\|`) whose status cell (8th column) is not `rejected`. No SOURCES.md → no
declared pins. Everything else is unchanged.
```

## What the gate reads, and why

- **Token extraction is untouched.** Backticked spans only, split on `..`/`...`, each part `^[0-9a-f]{7,40}$`.
  A hash written without backticks, shorter than 7 or longer than 40 hex is invisible to the gate — the rule
  cannot declare what the extractor never yields.
- **Resolution order is lane → main → origin → declared.** A token that names a lane commit is
  ancestry-checked and never declared, even if it happened to share a prefix with a registry pin: real
  resolution outranks a declared pin. Main and origin keep their old meaning (`citations.external`, never a
  finding).
- **The declared step reads one file, lazily.** `<repo>/corpus/SOURCES.md`, read at most once per run and
  only if some token reached the step. A registry row is a line matching `^ {0,3}\|\s*S\d{3,}\s*\|`; its
  status cell is the 8th `|`-separated field, trimmed, and the row declares nothing when it reads
  `rejected` (case-insensitive). URLs on the row are `https?://[^\s|)`'"<>]+`, split on `/`, `?`, `#`; a
  segment declares a pin only if it is exactly 40 lowercase hex. A token is declared iff a declared pin
  starts with it.
- **The registry today.** 208 rows; 24 rows carry a complete 40-hex URL path segment; 10 distinct pins;
  exactly one pin-carrying row is `rejected` (S045, pin `e7f1a99f…`), so that pin declares nothing. No two
  of the 10 pins share their first 7 hex (`cut -c1-7 | sort | uniq -d` → empty). A pin-looking id that is
  not a complete segment declares nothing: S203's `…/commit/10bce690….patch` ends in `.patch`, and the
  capture sha256s written in cells (e.g. S265 `c175e0e7…`) are not URL segments at all
  (`K94ScribeLesson/receipts/registry-inventory.txt`).
- **Reporting.** A declared token is not a finding. `--json` gains `citations.declared` (always present,
  empty when nothing is declared); text mode appends `declared=<n>` to the `COMMIT_CITED_UNRESOLVED` detail
  when n > 0, on a green line too (`cited=11 unresolved=0 declared=2`). The existing arrays
  (`checked`, `external`, `unresolved`, `notAncestor`, `unverifiable`) keep their meanings, and the contract
  id stays `kumitate-round-gate-v1`: the rule narrows one error and removes no field.
- **No SOURCES.md → no declared pins.** Absent, unreadable or non-registry text yields an empty pin set and
  the pre-round-94 behaviour, never an internal error. A fixture or a clone without `corpus/` therefore
  cannot accidentally declare anything.
- **Declared beats unverifiable.** In the implementation under test the declared test runs before the
  "main and origin are probeable" guard, so a registry-declared token classifies as `declared` even when
  the fleet or origin repo is missing. With both probeable — the counter's conditions — this changes
  nothing. (Candidate bytes: `.ufo/waves/round-94/K94ExecTool/round-gate.mjs`; the final sha is pinned at
  integration.)
- **What a round sees.** Round 93 under the frozen predicate (clause a): `declared=2` and a clean citation
  check. The seven rounds 12 46 53 57 61
  62 63 keep their exact `unresolved` sets (see `K94ScribeLesson/red-rounds.md`). Every other filed report
  keeps its `(id, ok)` vector and exit code; `declared` is empty for them (frozen predicate clause c).

## Why a registry pin and not an allow-list file

An allow-list file would hold bare tokens: anyone can append one without opening anything, and a reviewer
has nothing to re-open. The registry is the lane's only record of sources it *opened*, and CORPUS.md rule 1
makes that literal:

> **A row is a claim.** Write it only after opening the source in the round that writes the row. The round
> lesson's `## Gate` records, for every new row, the URL, the access date, and a ≤25-word quote with its
> location grounding `teaches`. Non-author verification re-opens a sample.

A registry row carries the URL, kind, tier, scope, anchor, a grounded `teaches`, a status, an opened date, a
recheck cadence and the `used-by` paths (SOURCES.md header). It is already checked by the lane
(`scripts/sources-check.mjs`: E01–E12, W02/W03 — row shape, id, kind/tier/status enums, dates, used-by
paths) and by the fleet census, so a declared pin inherits row validation a token list would not have. And
the status filter is not cosmetic: a `rejected` row is kept as evidence of taste (`REJECTED: <reason>;
flip: <what would change the verdict>`), so without the filter a rejected source's pin could launder a
citation.

[INFERENCE] The policy reading is therefore "declared means the lane can show it opened this source", not
"the token is convenient". That is why round 94 puts the escape in SOURCES.md rather than in a new file, and
why it is paired in the same round with the two grounding rows (S27x: the gitrevisions row for the
abbreviation semantics, the GitHub permanent-links row for the pin-as-URL-segment shape). It also fixes the
class cheaply: a lane that cites an upstream pin must already have a row for the source it read.

## The seven rounds that stay red

One line each; provenance, object probes and gate receipts in `K94ScribeLesson/red-rounds.md`. None of the
tokens is a prefix of any registry pin, and none is a typo or stale short of a real lane/fleet commit (0
objects sharing even the first 6 hex in any of the three ODBs).

- **12 — `23e476e21`**: an origin-lane commit id dated 2026-09-24, cited for
  `conformance/vectors/native/judge-wave.json:1368`; the probeable origin's history no longer holds it.
- **46 — `7af3d978`**: the short of sandbox commit B `7af3d978d89d5b3bf71b5955d963f30b1ebafcbb` from round
  46's control sandbox (`.ufo/waves/round-46/build/CtlC2LabelKeyed.md:4`), a synthetic repo commit.
- **53 — `b717dc03…`: a scratch-clone revision** of the Q43/M5 conformant post-state witness (`/tmp`
  clone), cited as "scratch repo rev".
- **57 — `1cd6d667…`: the same witness class**, a scratch conformant post-state commit in a `/tmp` clone.
- **61 — `ab902da2…` and `4247d2d`**: a fabrication fixture repo revision (`/tmp/kumitate-r61/…`) and the
  7-hex short of the forged commit `4247d2da…`, which is `HEAD` of
  `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` (`git bundle list-heads`).
- **62 — `4247d2da…`**: the same forged bundle's revision, named as a bundle revision with its size and
  `git bundle verify` status.
- **63 — `9237a72`**: Q51's grounding hash in `corpus/QUALITY.md:903`; the report itself lists it as "the
  Q51 grounding hash that resolves nowhere", and the Q52 sweep confirmed 0 hits in `git log --all` and
  `git fsck --lost-found` and absence from the fleet ODB (its companions `01b70bb`, `c432cc9` resolve).

They stay red because the only new escape is a registry pin, and a registry row is a claim written after
opening a source: a scratch sandbox, a forged bundle or a dead hash cannot honestly produce one. Adding rows
for them would make the gate green by policy, not evidence.

## Limits

- **Prefix, not identity.** A 7-hex token is declared when it prefixes any pin on a non-rejected row. There is
  no uniqueness clause: if two pins shared the token's prefix the token would still be declared, and
  `citations.declared` names the token, not the pin or the upstream it matched (none of the 10 pins share a
  7-hex prefix today).
- **Declared is not verified.** The gate never goes to the network: a declared token says the registry row
  exists, not that the pinned commit exists, is the one the report meant, or is reachable. The row's
  capture/quote/recheck is the evidence; the gate only stops calling the token an error.
- **The registry is read at `--repo`, not at the report's round.** Deleting a row or flipping its status to
  `rejected` re-reds every old report that cites its pin, and no history is consulted. Deletion is forbidden
  by the append-only rule (only `status`, `recheck`, `used-by` change in place), but a status flip is a
  legal edit — which is exactly why S045's rejected pin declares nothing.
- **Only complete URL path segments declare.** A 40-hex digest in a `teaches`/`anchor`/quote cell, a
  `?key=<40hex>` query value (not a complete segment after the split on `?`), a `git@host:` URL, a pin with
  a suffix (`…/commit/<40hex>.patch`, S203's real row) or a pin inside a non-`http(s)` link declares
  nothing.
- **A malformed row can shift the status cell.** The gate splits the line on `|` and reads field 8; an extra
  `|` inside a cell moves the status. `scripts/sources-check.mjs` refuses rows whose split-field count is not
  13, but the round gate does not run sources-check, so a malformed row can silently declare a pin or drop a
  legitimate one.
- **The extractor's floor is binding.** A 6-hex token is not extracted and cannot be declared; a 41+-hex
  string is not extracted either. For a token that *is* declared, the remaining characters are not checked
  against the report's intent: a mistyped short that happens to prefix a registry pin would be declared
  (the false-declared risk, the mirror of a real commit outranking a declared pin).
- **No SOURCES, no escape.** A lane clone without `corpus/SOURCES.md` gets the old behaviour; the rule is not
  available in a bare fixture.
- **`--selftest` proves the rule's text, not upstream reality.** Its arms (prefix-in-segment, full pin,
  `#fragment`, digest-only, prose URL, rejected row, mid-pin, no-SOURCES) pin the parser; they say nothing
  about whether the upstream serves the pinned bytes.

## Routed / integration

- **Target path:** `corpus/knowledge/round-gate-declared-pins.md` (this file). the two S27x rows' `used-by` cell
  should name it; S267–S269 keep their existing `used-by` for the seat-route entry and are cited here only
  for the concrete pin.
- **README map (Q48 — same change):**
  `| \`knowledge/round-gate-declared-pins.md\` | Round-gate declared upstream pins: lane → main → origin → \`corpus/SOURCES.md\` pin, the frozen rule, and the seven rounds that stay red | S27x, S267–S269; \`.ufo/waves/round-94/\` (plan, probe, controls, open) |`
- **`pin.round-gate`** in `SCORECARD.md` moves to the candidate's sha256 at integration; the old
  `09d4d792…` stays named in the round-94 row as the base.
- **Q88** (`K94ScribeLesson/lesson-draft.md`) makes the gate-at-M verdict a check; this entry is what makes
  the r93 case resolvable in the first place.
- **Not this entry's repair:** S273 (`retry-fallback-chains.ts`) closes M93-2 and belongs to
  `corpus/knowledge/seat-route-retry-fields.md`; its `chain` paragraph should re-point at S273 when the L1
  integrates.
