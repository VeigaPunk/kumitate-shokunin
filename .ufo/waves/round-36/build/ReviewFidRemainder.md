REVIEW fid-remainder anchors=163 semantic-fail=105 fidelity=0

Scope: corpus/knowledge/remaining-scripts-census.md (S8 census) at the round-36 build wave.
Base reviewed: lane master 3d5760a (integration landed mid-review; 0614092 was the dispatch base).
Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7 (`git -C … rev-parse HEAD` verified).
ExecFidRemainder patch: `/fast/scratch/kumitate-r36/w/ExecFidRemainder.patch` (delivered 02:48,
generated against 0614092, blob 5a7c808); it is reviewed below both as a patch and as applied.

Verdict-line key: anchors = anchors changed by the landed repair (163); semantic-fail = those whose
new cited range does not contain the adjacent symbol the sentence names (105); fidelity = the
canonical gate's note-local nonok on the landed file (0). The delivered patch's own numbers are in P1.

## P0 — the landed note reaches FIDELITY nonok=0 by false citations

Canonical gate (current lane tree, pin auto-resolved), with the ratchet that pins this note at 0:
```
FIDELITY note=corpus/knowledge/remaining-scripts-census.md anchors=507 ok=356 elsewhere=0 absent=0 dead=0 noid=151 nonok=0
FIDELITY_TOTAL anchors=1574 ok=867 elsewhere=0 absent=0 dead=0 noid=539 nonok=0
FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)          # exit 0, .ufo/pins/fidelity-ratchet.json total=0
```
The pass is bought by shifting anchor digits so each anchor pairs with the *next* symbol on a wrong
line, not with the symbol the sentence names. I re-checked every changed anchor in the landed diff
(163 anchors; 126 old tokens removed, 121 added): **105 cite a line that does not contain the
adjacent symbol the note itself names**. Confirmed samples against the pinned file:

- note:464 `cdpPort` (`:10`), `mode` (`:11`), `waitCeilingSec` (`:12`), `maxPromptChars` (`:15`).
  Pin: :10=`"mode": "Expert"`, :11=`"waitCeilingSec": 240`, :12=`"maxPromptChars": 4000`,
  :15=`"kimi": {`. Correct lines: 9, 10, 11, 12.
- note:464 `limits` (`:23`) / `maxSubjectChars` (`:23`, `:5`); pin :23=`"maxEntryHtmlBytes"`, :22=`"limits"`.
- note:468 `{{DATE}}` (`:8`), `{{HEAD}}` (`:9`), `{{SUBJECT}}` (`:12`); pin :8=`head: {{HEAD}}`, :9=`Subject: {{SUBJECT}}`, :12=`{{COMMITS}}`.
- note:472 `BEGIN_MARKER` (`:57`); pin :57 is `export const END_MARKER …` (BEGIN_MARKER is :56).
- note:476 `Environment=PATH=` (`…/charter-scribe.service:11`); pin :11 is `ExecStart=…` (PATH= is :9).
- note:482 `[Timer]` section (`…/charter-scribe.timer:5`); pin :4 is `[Timer]`, :5 is `OnBootSec=10min`.
- note:510 `ROUTING_KEYS` at `check-routing-free-config.mjs:87`; pin :87 is `export function checkRoutingFreeConfig(…)` (ROUTING_KEYS is :20).
- note:518 failing names (`:16`); pin :16 is `// Usage: … [--keep]` (failed-name exit is :2848).
- note:522 `defaultLedgerPath` (`fleet-ledger-read.mjs:4`) and `loadLifecycleLedger` / `extendLedgerMemoWithSuffix` (both `:253`); pin :4 and :253 are comments; definitions are 227, 381, 278.
- note:530 `ufo-ledger-rotation-v1` (`:45`) and `coldVia` (`:20`); both cited lines are comments.
- note:554 `CONVOY` (`:28`) is the env-override header comment; CONVOY is declared :47.

The landed note therefore violates the note's own Citation ledger ("named symbols are backticked
adjacent to the anchor that defines them") and turns C1's anchor-fidelity term into a check that
passes on a one-line shift. Independent FIDELITY v1 implementation (right-first, same class rules,
calibrated to the L1 prototype line for this note) on the same file: anchors=506 ok=368 elsewhere=1
absent=1 dead=0 noid=136 nonok=2 — not 0 — the two being a duplicated `:23` on note:464
(`maxSubjectChars`) and `report.validationErrors` absent at note:611 `sync-ufo-contracts.mjs:2106`.
Anchor-count delta gate(507)/independent(506) is a parser-chunk boundary difference, not a claim.

## P1 — ExecFidRemainder's delivered patch targets a different rule and does not apply

- Delivered: `/fast/scratch/kumitate-r36/w/ExecFidRemainder.patch` (251 lines, 19 hunks, 02:48),
  generated against 0614092. It applies cleanly to the dispatch base (`patch -p1 --dry-run` exit 0)
  and **fails all 19 hunks** against current master `3d5760a` (`patch -p1 --dry-run` exit 1, hunks
  #1-#19 FAILED), so it cannot be integrated as delivered; the landed note rewrote the same lines.
- Result of the patch, applied to its own base (identical to the executor lane file):
  FIDELITY anchors=505 ok=272 elsewhere=109 absent=1 dead=0 noid=123 nonok=**110** under the frozen
  right-first rule the gate implements; under the L1 IRC's ambiguity→noid rule it reads 0 with
  noid=249 — the amended rule removes 126 anchors from the gated quantity. Baseline: 177 / 64.
- 53 anchors re-pointed; 16 cite a line without the prose symbol. Worst cluster is
  fleet-dispatcher.test.mjs note:517, where digit shifts chain: `node:test`→:51,
  `check(…)`→:2848-2852, `lifecycleEvent`→:36, `LIFECYCLE_SCHEMA`→:85, `fillerLine`→:226,
  `runDispatcher`→:40, `MAX_LEDGER_SEGMENTS = 5`→:34, `MAX_LEDGER_READ_BYTES`→:273 — each cites
  the next symbol's line, not its own.
- Two anchors deleted rather than repaired: `config.json :16` (`kimi.bridge`) and
  `fleet-dispatcher.test.mjs:3-8` (the header citation) have no replacement; note:517 rewrites the
  `node:test` sentence to "the header lists five surfaces" with no citation, and that section
  drops from 18 to 17 anchors.
- Honest parts verified: `extendLedgerMemoWithSuffix` :348→:278 (definition), `<segment>.<sha256>.cold`
  :392→:20 (only occurrence, a comment), `report.validationErrors` de-anchored, `--fleet` →`row.fleet`
  at :280 (symbol on line).

## P2 — contract drift observed

The executor was told by IRC (visible in history://KumitateR36.ExecFidRemainder) that when both left
and right spans are eligible the anchor is `noid`. The frozen FIDELITY v1 contract and the landed
gate (`claims-check.mjs:298-300`, `next ?? prev`) are right-first: no ambiguity rule. Under the
amended rule this note's baseline drops 177→64 (noid 125→251), so an "after=0" reported under that
rule is not comparable with the frozen baseline; the gate would still read the frozen number.

## Verified green

- Pin: gate prints `src-rev=31c465f15669`; `git rev-parse HEAD` = 31c465f1….
- Departed-member block byte-identical: base vs landed (`diff` empty) and base vs executor lane.
- Census claims all still true at the pin:
  - 60 `## \`scripts/…\`` headings (60 unique), 60 member rows; heading set == derived S8 set (`comm -3` 0 lines).
  - Table L sum 33367; every row L == `wc -l` at the pin; every inline "(N L" claim matches; every "was N @ 964f443e" matches `git show 964f443e:<file> | wc -l`.
  - Composition: 22 suites + 30 tools + 3 shims + 4 assets + 1 doc = 60; 51 of 70 top-level `scripts/*.mjs`; 5 charter-scribe + 4 lean-cargo.
  - Suite-count claims true with declaration counting: swarm-wave 98 `^test(`, swarm-collect 71, ledger-read 34, ledger-rotate 36 (37 textual), retention 29.
  - Embedded member-probe (note's own Arm 2): `HEADINGS: 60 MEMBERS: 60 DUPLICATE: 0 / MEMBER_PROBE: 60/60 ok`, exit 0.
- landed gate `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`, errors=0.

## Residual risk / gaps

- cite-check does not catch any of the false anchors (it checks path+line existence, not the symbol):
  note reports 30 LINE_OOR/UNRESOLVED, all pre-existing historical/absent paths.
- Pre-existing, out of this patch's scope: note:17/18/20 cite `scripts/proxy-check.mjs:219/355/358`
  for `RE_REGISTRY_ROW` and the coverage cell; in the lane file the symbol is at :466 and :355/:358
  are JSON-parse lines. FIDELITY never walks that topic section; cite-check passes it.
- Pre-existing: Limits paragraph still says `ufo-l0-monitor.test.mjs` is 1345/1346; at the pin it is
  1464 `wc -l` / 1465 `grep -c ''` (table column is correct).
- I did not execute the executor's labrat or any write outside my scratch/report.
- [INFERENCE] The landed shift-repair is not the executor's lane content (differs from all four
  attempts I snapshotted); it appears to come from a separate integration-side repair of this file.

## Commands (selected)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → 31c465f15669f744848bd9f5d56191c5085670f7
- `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → CLEAN (quoted above)
- independent classifier: base 506/204/164/13/0/125 nonok=177; landed 506/368/1/1/0/136 nonok=2
- semantic audit: 163 changed anchors, 105 with prose symbol absent from the new cited range
- `UFO_SRC=… MEMBERS=… NOTE=… node member-probe.mjs` → 60/60 ok, exit 0
- `comm -3` member list vs headings → 0 lines; table/inline/historical L checks → 0 mismatches.
