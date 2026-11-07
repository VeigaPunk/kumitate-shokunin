# kumitate round 97 — lesson draft (scribe seat `K97ScribeLesson`)

Not the filed lesson. This is the draft the L1 lands as `corpus/lessons/round-97.md`: the `## Gate`
skeleton, the **Mistakes** row this round mined, the r96 closure sweep, and the new QUALITY criterion
**Q91** with its command. `verified-at`/`M` and every admit/reject decision are the L1's — nothing here
is an admission.

Lane base `477afff790787cd2ce48ccf976afafcb5aef0cbc`; plan freeze `38eb197c17de7ce0dc562539f2f31f41bea037ec`.
Base tool bytes sha256 `5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434`; census
`3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`.

## Gate (skeleton — L1 decides)

- **admit — `scripts/sources-check.mjs` rule R97** (one reader for the lane's registry section): the section
  state is read from `sourceText.split('\n')` with the census `row_pass` test; `ROW_OUTSIDE_REGISTRY`,
  row detection and per-row checks unchanged; contract id `kumitate-sources-v1` unchanged. Frozen counter
  `probe/probe97-c1.mjs` at M must print `C97_C1: HELD` (K1). Knowledge entry to cite:
  `corpus/knowledge/sources-check-registry-section.md` (draft at
  `.ufo/waves/round-97/K97ScribeLesson/knowledge-sources-check-registry-section.md`).
- **admit — S276** ECMAScript 2025 Language Specification (ECMA-262),
  https://tc39.es/ecma262/2025/ — opened 2026-11-07 (UTC), body sha256
  `c1f9a15946c7dd94b13f56564fa6549cc6f212fd35101f8f5e38a32a0efbefe1` (7 330 686 bytes, HTTP 200).
  Quotes ≤ 25 words, re-located by this seat with body byte offsets
  (`.ufo/waves/round-97/K97ScribeLesson/receipts-ecma262-quotes.txt`):
  §22.1.3.32.1 TrimString (17 words): "Let T be the String value that is a copy of S with leading white
  space removed." (byte 4976920) — `String.prototype.trim` removes ECMAScript white space;
  §12.2 Table 35 (9 words): "U+000B LINE TABULATION <VT> U+000C FORM FEED (FF) <FF>" (byte 2401303) and
  Note 1 (12 words): "U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>."
  (byte 2402224) — the class is `<TAB> <VT> <FF> <ZWNBSP> <USP>`, strictly wider than the census `[ \t]`;
  §12.3 Line Terminators (22 words): "Line terminators are included in the set of white space code points
  that are matched by the \s class in regular expressions." (byte 2405152).
  Row draft and row-level evidence: `.ufo/waves/round-97/K97ScribeSources/row.md` (id S276, `NF=13`,
  `status mined`, `recheck on-release`, `used-by corpus/knowledge/sources-check-registry-section.md`).
- **admit — QUALITY Q91** (see below), shown able to fail on the r94–r96 counters, which drew no seed.
- **reject — a CommonMark- or ECMA-native section reader** (S275/S276): it would accept rows the census
  calls E12 (`## Registry ##`, `## Registry\r`, a `## ` inside a fence, `##<TAB>Registry` refusal). Flip:
  the census adopts CommonMark/ECMA heading classes. Evidence: `receipts-section-reader-divergence.txt`
  (BASE refuses `S011/S014/S015` the census accepts; accepts `S012/S013` the census refuses).
- **rows touched:** New S276 only. No existing row's `status`, `recheck` or `used-by` changes.
- **Q90** (new rows carry their registry URL):
  `bash .ufo/waves/round-96/K96ScribeLesson/lesson-urls-cmd.txt corpus/lessons/round-97.md` → expect
  `LESSON_URLS: CLEAN new=1`. The URL above must survive into the filed lesson verbatim.
- **Q89** (quote word counts): the counts printed beside each S276 quote above are this seat's count over
  the located text; re-derive with `.ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt` at filing.
- **Q88** (gate at M): `.ufo/waves/round-94/K94ScribeLesson/q88-gate-at-m.sh 97 <M>` → `Q88: PASS`. Name
  `M` **once** in every receipt — r96's routed item 1 (see the sweep below).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M97-1 — the frozen counter was keyed on fixed fixture identities, so a tool that hardcodes one run's fixture text reached HELD** (the `hardcode-fixtures` survivor of the class M94/M95/M96-2, fourth round of the same class). Rounds 94, 95 and 96 counters had no `--seed` and no entropy source (`grep -n 'seed\|randomBytes'` → only a per-token `hex(seed)` hash helper in each), so FIX-A's token names, ids and titles were constants a construction could replay. | `.ufo/waves/round-96/K96CriticA/constructions.md` row 8 (`hardcode-fixtures`: "recognises `fixture r96 A/B` titles and replays canned lists"); `.ufo/waves/round-96/K96CriticA/receipts/hardcode-fixtures.txt` (`C96_C1: HELD … tool_sha256=4daf2e0c…`, rc=0, selftest 89/89 — a wrong gate passes); `.ufo/waves/round-96/close-l1/integration-remut.txt` (30/31, the survivor) | Q85/Q86 (class sampling, arm every field class): the battery drew each clause from the plan's list and the counter fixed what the class did not — **input identity** was never sampled | nonce counter: `probe97-c1.mjs` draws ids, URLs, titles and case order from `randomBytes(8)` per run, prints `seed=`, and `--seed` replays a run; the battery is derived from the census grammar's classes. Criterion: QUALITY Q91. |

### M97-1 detail

Three rounds of counter hardening fixed the *clause* axis (a battery per clause) and left the *identity* axis
constant: FIX-A/B were literal arrays (`probe96-c1.mjs:114-161`), so a tool keyed on their text could return
the counter's own expected lists. The counter's verdict is a comparison of the candidate's output with the
**census's live output**, so the only thing a hardcoding tool has to recognise is the fixture, not the rule —
which is what `hardcode-fixtures` did, and it read `C96_C1: HELD` with `selftest 89/89`.

What breaks the class is not a longer clause list but removing the constant: the r97 battery draws ids,
URLs, titles and case order per run and prints the seed, and the seed is replayable, so a verdict is still
reproducible from its receipt. Observed on the r97 counter: the same BASE bytes scored at two explicit
seeds produce different fixture digests (`F_A_sha256 cc86a956…` vs `5d80fb64…`), disjoint printed disagreement
sets (0 of 12 shared per arm), and a C-arm agreement that moves 16478 → 16475, with the verdict `UNMET` in both
(`receipts-counter-nonce.txt`) — a list keyed on one seed's ids cannot be the answer to another seed's file.
The construction that must now fail is the replay shape itself (routed to `K97CriticA`; the r96 receipt above
is the observed evidence that the shape reached HELD on a fixed-identity counter).

### Sweep — the r96 lesson's `M` against the r96 Q88 receipt

r96 closure spot-check §5 item 1: `close/q88-r96.txt` labels `M=4a57390d…` while the lesson, report and
SCORECARD name M = `09de6791…`. Re-derived here (`.ufo/waves/round-97/K97ScribeLesson/receipts-r96-m-name-sweep.txt`):

```
## corpus/lessons/round-96.md naming
7:M = `09de67917b5b7731aa06ae019c7e9b94359981c9` (`scripts/round-gate.mjs` sha256

## grep -n "M=" .ufo/waves/round-96/close/q88-r96.txt
2:Q88: PASS round=96 M=4a57390d6f71a603c25588cffe9762c403b98c9d gate_sha256=edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135

## round-gate.mjs sha256 at each rev
edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135  09de67917b5b7731aa06ae019c7e9b94359981c9
edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135  4a57390d6f71a603c25588cffe9762c403b98c9d

## is 09de6791 an ancestor of 4a57390d?
yes
```

Both revs carry identical gate bytes, so the r96 verdict holds; the label is inconsistent — one name for
`M` per round, named once in every receipt (round-97 routed item, honoured by name `M` once in each of this
seat's receipts).

No other mistake in this seat's scope: the r96 lesson's other routed items (counter battery, lane section
reader, census `\r`) are this round's C1 and its L0 question, not new classes.

## QUALITY Q91 (draft)

### Q91 — a frozen counter draws its fixture identities per run and prints the seed (round 97)

- **Rule.** A counter that decides a claim scores at least one fixture whose **identities** — row ids, URLs,
  titles, case order, and any other token the rule does not fix — are drawn at run time from an
  entropy source, and it prints the seed so the run is replayable (`--seed <hex>`). A construction keyed on
  one run's identities must read `UNMET` on a fresh seed. Clause batteries (Q84/Q85/Q86) constrain what is
  *scored*; this rule constrains what is *constant* while scoring it.
- **Grounding.** Rounds 94–96 counters were fixed arrays (`probe9{4,5,6}-c1.mjs`: no `--seed`, no entropy
  source), so `hardcode-fixtures` — a wrong gate that replays the counter's canned lists — read
  `C96_C1: HELD` (`.ufo/waves/round-96/K96CriticA/receipts/hardcode-fixtures.txt`) and survived the r96
  re-mutation (`close-l1/integration-remut.txt`: 30/31). Q85/Q86 sampled the clause axis and never sampled
  input identity.
- **Who checks.** The L1 before the freeze: run the counter twice on the same tool at a fresh seed each
  time and confirm the printed seed and the fixture digest differ; confirm `--seed <s>` replays run `s`
  byte-identically. A critic seat then builds the replay construction.
- **Command.**
  `node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <T> --work <scratch>/a --freeze <FREEZE> --rev <M>`
  twice (two printed `seed=` / `F_A_sha256=` pairs, both verdicts unchanged); then
  `... --seed <seed-of-run-a> --work <scratch>/b` reproduces run `a`'s `F_A_sha256`; and a construction
  keyed on run `a`'s ids must print `C97_C1: UNMET` at a fresh seed.
- **Fails when.** The counter's fixture ids/titles/order are source constants; a seed is printed but not
  consumed; `--seed` does not replay; or a construction keyed on one run's identities reads `HELD`.
- **Shown able to fail.** r94/r95/r96 counters, by construction (`grep -n 'seed\|randomBytes'` over the three
  probes: only a per-token `hex(seed)` helper; no `randomBytes`, no `--seed`), with the r96
  `hardcode-fixtures` receipt as the observed HELD. Round-97 evidence of the fix:
  `receipts-counter-nonce.txt` — same BASE bytes, two explicit seeds, different `F_A_sha256`
  (`cc86a956…` / `5d80fb64…`), disjoint printed disagreement sets, a C-arm agreement 16478 vs 16475, while
  `C97_C1` stays `UNMET` for BASE in both. Caveat, observed: the a/b agreement counts coincide across seeds
  (18721 / 14239) because the class grid is frozen — the digest and the case lists, not the totals, are the
  nonce evidence.
- **Limit.** A nonce bounds the token space a construction can key on; it does not enumerate it. The class
  grid itself stays frozen plan text (a construction keyed on the grid rather than on an identity survives
  by design). Nonce identities also mean a verdict is only reproducible with its seed — the receipt must
  carry `seed=` (this seat's receipts do).

## Hand-off

Files produced by this seat (all under `.ufo/waves/round-97/K97ScribeLesson/`):
`knowledge-sources-check-registry-section.md`, `lesson-draft.md`, and the receipts
`receipts-section-reader-divergence.txt`, `receipts-real-registry-lf.txt`, `receipts-ecma262-quotes.txt`,
`receipts-quote-wordcounts.txt`, `receipts-controls-verdicts.txt`, `receipts-r96-m-name-sweep.txt`,
`receipts-counter-nonce.txt`, and the two drivers `scripts/divergence.py`, `scripts/ecma-quotes.py`.
The knowledge entry must land in the same integration commit as the S276 row (`K97ScribeSources` finding 2:
the row's `used-by` is that path; `validate` prints `E11 S276 missing used-by` otherwise).
