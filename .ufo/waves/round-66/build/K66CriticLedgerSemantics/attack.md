# K66CriticLedgerSemantics — attack on the C1 data model

Seat: K66CriticLedgerSemantics (kumitate r66 w1, critic). Target: `scripts/routed-ledger.mjs`
(contract `kumitate-routed-ledger-v1`, sha256 f92a364d…3bf5, unchanged since freeze) and the C1
plan text. Method: 11 fixture attacks (driver: `attack.mjs` in this dir, read-only wrt the lane)
plus line-level audit of the frozen counter. No lane files edited.

Axes named: (a) binding soundness — a row/answer must not be accepted where it does not bind;
(b) completeness — no routed item silently missed; (c) amendment stability — ordinals/bindings
fail loud, never silently re-point; (d) frozen-counter compatibility — every proposed
strengthening keeps L1–L6 passing unchanged; (e) schema economy — 7 cells is pinned.

Every repro below is runnable: `node .ufo/waves/round-66/build/K66CriticLedgerSemantics/attack.mjs`
(driver imports the lane tool's exported `routedItems`/`ledgerRows`/`evaluate`; fixtures are
synthetic rounds 101+ under a TMPDIR, no lane writes). Verbatim outputs are quoted per finding.

## F1 (HIGH, completeness) — a second routed section in one spot-check is silently ignored

`routedItems` breaks at the FIRST heading match (`scripts/routed-ledger.mjs:78`:
`{ start = i; level = m[1].length; break; }`), and the UNLEDGERED sweep only iterates the parsed
items of that first section (`:226`). A verifier amending a spot-check append-only BELOW the
section (an erratum under a new `## Routed items (amended)` heading) routes new items the tool
never counts — no finding, exit 0.

Repro (driver A1): spot-101 has `## Routed defects` with D1, then `## Notes`, then
`## Routed items (amended)` with D2; ledger rows cover D1 only. Verbatim:

    === A1 second routed section
    exit=0
      ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=1 rows=1 open=1 closed=0 wontfix=0

D2 is routed and unledgered and the gate says CLEAN — a mis-read of a real section class
("an item missed") that the plan's ratchet says must be fixed by strengthening.
Real-data check: all 11 spot-checks 55..65 have exactly one HEAD_RE heading each (grep
`^#{1,6}\s+.*\brouted\s+(defects?|items?)\b` case-insensitive per file), so the fix is currently
vacuous on real data and judge-safe.

Smallest safe correction: keep first-section parsing (the plan's declared rule; a sub-heading
like `### Routed items carried` INSIDE a section must not split it), but scan the rest of the
file for further HEAD_RE matches and emit a non-exit `WARN extra-routed-heading round-N` line.
Judge-invisibility of WARN lines: the frozen harness reads only the last stdout line
(`ledger66-probe.mjs:138` for L2, `:250` for L4) and `FINDING ` lines (`:252`) — a WARN line
changes neither. New selftest case (text):
`second routed heading → WARN line printed, verdict still CLEAN, exit 0` (first section's items
alone stay authoritative). A HARD fail here is NOT judge-rejected but is rejected by me: it would
make a benign second mention of "routed items" (e.g. a notes heading) DRIFT; WARN is the right
severity for a status-neutral tool.

## F2 (MED, stability — declared tradeoff, keep loud) — mid-section amendment shifts ordinals

Assigned vector: "a closure appends an erratum INSIDE it". Driver A2 inserts `- **D1b — …**` as
new item 2 of a 3-item section whose ledger bound items 1 and 3. Verbatim:

    === A2 mid-section insert (ledger bound pre-insert)
    exit=1
      FINDING UNLEDGERED round-101-item-2
      ROUTED_LEDGER: DRIFT … findings=1 first=UNLEDGERED:round-101-item-2

The inserted item is caught (UNLEDGERED); pre-bound rows keep binding because the tail ordinals
did not shift in this fixture — but any insert NOT at the tail re-points ordinals and the
affected rows fail QUOTE_ABSENT (fail-closed, loud). The plan declares the assumption
(`plan.md:61`: "Item ordinals assume the spot-checks stay append-only"). Classification:
declared tradeoff, not a defect — the binding (round, ordinal, quote) fails loud rather than
silently re-pointing, which is the correct safety direction. Smallest correction: pin the
behavior with a selftest case (text): `insert an item mid-section → pre-bound tail rows
QUOTE_ABSENT or UNLEDGERED, exit 1` so a future "helpful" change cannot silently weaken it.
No schema change: content-addressed item ids would need an 8th cell — frozen-counter-rejected
(see F6).

## F3 (HIGH, soundness) — quote binding is substring-based: no word boundaries, no minimum length

`scripts/routed-ledger.mjs:211`: `if (!norm(s.items[k - 1]).includes(norm(row.quote)))` —
plain substring. Two attacks:

* A3a: item text "the map drifted north today.", quote `"map drift"` → CLEAN (exit 0).
* A3b: quote `"drift"` (one word) → CLEAN (exit 0). "drift" binds inside "drifted".

* A4 (non-injective binding): two items both containing "the readme row vanished"; BOTH rows
  quote that exact phrase, one per item → CLEAN (exit 0). Either row could be re-pointed at the
  other item and still bind; the quote proves membership, not identity. A 3-word quote that
  appears in two items of the same round binds ambiguously — exactly the assigned vector.

Frozen-counter compatibility of the fix: all 14 L4 fixture quotes are 3–4 words
(`ledger66-probe.mjs:207-228`, `slice(0,3)`/`slice(1,4)`/…) sitting at whitespace/punctuation
boundaries after norm, so a `>= 3 words AND word-boundary match` rule passes every frozen
fixture (L4 unchanged), and L3's counter check has no minimum (`ledger66-probe.mjs:154` `nwords(r.quote) > 25`
upper bound only) so tool-strict stays counter-compatible. Migration cost is tool-side only:
two existing selftest rows use a 2-word quote `"x y"` (`routed-ledger.mjs:301-302`, the
ITEM_ABSENT cases) and would newly get ROW_MALFORMED — the L1 rewrites those two cases with
3-word quotes (selftest is tool-side; L1 needs n ≥ 30, currently 33).
Smallest safe correction: `words(quote) >= 3` else ROW_MALFORMED; containment test becomes
word-boundary regex match of the normalized quote. New selftest cases (text):
`quote "map drift" vs item "map drifted" → QUOTE_ABSENT`; `one-word quote → ROW_MALFORMED`;
`same 4-word quote on two items → second row QUOTE_ABSENT (ambiguous quote rejected)` — the last
needs care: rejecting a quote that occurs in >1 item of the same round requires counting
occurrence-bearing items; implement as "quote must be found in exactly one item of that round's
section". All L4 fixtures: each mutated quote occurs in exactly one item (decoy/swap/prose/
nested mutants expect rejection for other reasons and still get them).

## F4 (MED, soundness) — answer binding proves location, not answer; 'closed' is self-attestable

Assigned vector. A6: closed row answers `` `notes/a.md:2` — "the readme row is missing" `` where
line 2 is an old TODO laundry list containing the item's own words. Verbatim: exit 0, CLEAN,
`closed=1`. The plan DECLARES this hole (`plan.md:59-60`: "an answer line that quotes itself as
an answer passes L3 if it is new and located"). What minimal extra binding makes 'closed' mean
something? Two candidates, one frozen-blocked:

* **Universal "answer line must contain the row id"** — REJECTED by the frozen counter: the L4
  good fixture's answer line is ``answer ${items101[0].split(' ')[0]} ${phrase(5)}`` with row id
  `A1` nowhere in it (`ledger66-probe.mjs:204`); requiring the id would make the good fixture
  DRIFT → L4 MISS → claim fails. The canonical judge must reject this strengthening.
* **Shape-conditional id check**: when the row id matches `/^R\d+-D\d+$/`, the answer line (±2
  window) must contain the id. Frozen fixtures use ids `A1..A9` (`:207-212`) → unaffected → L4
  unchanged; counter L3 doesn't check ids → compatible. The L1 controls the real ledger's ids
  (`R65-D1`…), so the L1 lands compliant data. This is the smallest binding under which
  'closed' attests "a human wrote THIS item's id at this located, post-base line" — a wrong-item
  or self-quoting closure must now at least name the item it claims to close.
* **Optional git-newness** (all closed rows, not just round-65): when the root is a git repo,
  resolve the commit that last touched the row's spot-check file and require the answer quote to
  be absent from the answer path at that commit. L4 fixtures are plain dirs → check vacuous
  there (counter cannot exercise it; harmless). Worktree and `--rev` modes both already shell to
  git (`routed-ledger.mjs:124-141`). This directly operationalizes "be in a file changed after
  the spot-check commit".
New selftest cases (text): `closed row id R7-D1 with answer line lacking "R7-D1" → ANSWER_DEAD
(new reason id-not-at-answer)`; `answer line carrying the id → CLEAN`; git-fixture case
`answer quote already present at the spot-check's commit → finding` (extend the existing `--rev`
git selftest fixture, `:330-338`).

## F5 (MED, soundness) — the ±2 answer window admits a pointer at an unrelated line

`routed-ledger.mjs:220`: the quote is searched in `AL.slice(line-3, line+2)` — up to 2 lines
off. A7: row says `` `notes/a.md:2` — "hotel india juliett" `` but line 2 is unrelated; the
quote is on line 3. Verbatim: exit 0, CLEAN. The plan/counter declare ±2 (`plan.md` L3 text),
but the counter is LOOSER (±2) than the proposed tool check, so tightening the tool to
exact-line keeps L3 satisfied (exact ⊂ ±2) and keeps every L4 fixture passing (their good
answer quote sits exactly at the pointed line, `:204-205` rows[0].answer = `` `notes/a.md:3` ``
with ansQuote from ansLines[2]). Smallest correction: quote must be ON the named line
(findings reason `answer-quote-not-at-line:N`); keep ±2 nowhere. Selftest case (text):
`answer quote one line below the pointer → ANSWER_DEAD`.

## F6 (schema pinned — judge-rejected "fixes") — status set and the 7-cell row are frozen

Assigned vector: is `wontfix` needed; what about 'carried'? Evidence:
`ledger66-probe.mjs:110` — any ledger row whose cell count ≠ 7 is pushed as `{bad:true}` and
makes L3 MISS; `:158` — any status outside `{closed, wontfix}` is an L3 problem; the tool
likewise ROW_MALFORMEDs open rows with an answer (`routed-ledger.mjs:198`). Driver B2:
an 8th cell carrying `carried:R99-D1` → tool `malformed: ["line7:cells=8"]`; `status=carried`
parses structurally but fails both evaluate and L3. Conclusion: `wontfix` IS needed (it is the
only machine-recognized disposition for a located rationale that is not a fix, e.g. "round-59
prose note not ledgered"); a `carried` STATUS or an added LINK CELL is impossible without
failing the frozen counter — judge-rejected. Carried recurrence is already first-class in the
7-cell schema: one row per occurrence (occurrences are distinct defects of distinct rounds),
linked by the free-text `class` key, aggregated by `--classes`/`RECURRENT` at ≥ 4 rounds
(`routed-ledger.mjs:239-245`). What IS missing (driver A5): nothing prevents one item carrying
two contradictory rows — same (round, item, class), one `open`, one `closed` — and the gate
reports CLEAN:

    === A5 open+closed on same item, same class
    exit=0
      ROUTED_LEDGER: CLEAN … items=1 rows=2 open=1 closed=1 wontfix=0

`covered` is a Set (`:212`) so the second row adds nothing; the tool's own selftest blesses two
rows on one item only for two CLASSES (`:301`). Smallest correction: at most one row with
status ≠ open per (round, item) — additional non-open rows get a new finding
`ROW_CONTRADICTED`; multi-class double coverage (both open) stays CLEAN, matching the existing
selftest case and all L4 fixtures (none has two rows on one (round,item) except the `dup` id
mutant, which still gets ROW_DUPLICATE first). Selftest case (text): `open+closed same
(round,item,class) → ROW_CONTRADICTED exit 1`; `two open rows, different classes → CLEAN`.

## F7 (LOW, hygiene) — row id is unbound to its round; answer path/ledger-path asymmetry

Driver A10: id `R99-D1` with `round=101` → CLEAN. The id is decorative; nothing checks it
encodes the round. Frozen fixtures use `A1..A9` → a shape-conditional check (id matching
`/^R(\d+)-/ ⇒ group(1) === row.round`) is L4-inert and tool-cheap. Severity low: the (round,
item, quote) triple already binds the row; a lying id misleads only human readers. Optional —
bundle with F4's shape-conditional pass. Also noted: the answer-path guard compares against the
CONFIGURED ledger path only (`routed-ledger.mjs:215`), while the frozen L3 hard-codes
`corpus/routed-ledger.md` (`:162`); moot at the default path the claim uses, but a `--ledger`
override would let an answer point at the default ledger file. Cosmetic; document.

## F8 (INFO, declared acceptance) — a spot-check with no routed section passes CLEAN

Driver A9: `## Notes` only → `CLEAN spotchecks=1 sections=0 items=0`, exit 0. The frozen L4
mutant `no-section` REQUIRES exit 0 (`ledger66-probe.mjs:242` `['no-section', 0, null]` and
`:253` the sections=1 regex) — a hardening to FAIL-CLOSED would make the frozen good-path
fixture miss → judge-rejected within this round. Same class as the plan's declared round-59
prose section. Classification: accepted tradeoff (verifiers routing nothing is legal;
spot-check bytes are committed and non-author-reviewed). Optional: the F1 WARN pass can also
warn `no-routed-section round-N` at WARN level — judge-invisible per the F1 argument, but it
risks nagging on legitimately empty rounds; recommend AGAINST, keep silent.

## Extra observations (limits, not findings)

* Norm asymmetry: tool `norm()` unescapes `&amp;`→`&` etc.; the counter's `norm()`
  (`ledger66-probe.mjs:48-52`) does not. Driver A11: a quote `the A&B pair` against item text
  `A&amp;B` passes the tool and would MISS counter L3 — a self-DoS direction only (a row the
  tool accepts the counter rejects), never a false CLEAN. Real spot-checks 55..65 contain no
  `&`-entities (grep count 0). Optional: align the tool's norm to the counter's. Also both norms
  strip `<…>` tags identically, so the `<report>`-style placeholders in round-65 are harmless.
* `wontfix` rows and L3's round-65 clause (`answeredNow`, `ledger66-probe.mjs:170`) already
  force "new since base" for round-65 answers; F4's optional git-newness generalizes it to all
  rounds tool-side.

## Compatibility matrix (proposal → frozen counter)

| proposal | L1 | L2 | L3 | L4 | verdict |
|---|---|---|---|---|---|
| F1 WARN on extra routed heading | n/a | last-line only | n/a | last-line/FINDING only | SAFE |
| F3 ≥3 words + word-boundary + single-item uniqueness | selftest n≥30 holds | fixture quotes all ≥3 words | counter-looser | all fixtures pass | SAFE (2 tool selftest rows rewritten) |
| F4 shape-conditional id-at-answer | n/a | n/a | counter doesn't check | ids A1..A9 unaffected | SAFE |
| F4 git-newness when repo known | n/a | n/a | r65 clause already stricter | fixtures are non-git dirs, vacuous | SAFE (unexercised by counter) |
| F5 exact-line answer | n/a | n/a | counter ±2 is looser | good fixture exact | SAFE |
| F6 ≤1 non-open row per (round,item) | n/a | n/a | n/a | no fixture case | SAFE |
| F2/F8 hard-fail variants | n/a | n/a | n/a | contradicts plan:61 / no-section fixture | REJECTED |
| universal id-at-answer / 8-cell row / carried status / FAIL on missing section | n/a | n/a | L3 | L4 good fixture / :110 / :158 / :237 | REJECTED |
