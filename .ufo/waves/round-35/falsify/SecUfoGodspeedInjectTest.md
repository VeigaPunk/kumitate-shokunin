ATTACK corpus/knowledge/remaining-scripts-census.md:671-673 (S8 section `scripts/ufo-godspeed-inject.test.mjs`) + table row :158 verdict=holds defects=0

Target claims, all re-derived against the pinned upstream clone
`/fast/scratch/kumitate-r35/src` (detached at 31c465f1):

# Anchor verification (every anchor in the section)

Section text (note:673, verbatim):
`Live S8 member (180 L, suite; was 127 @ 964f443e) re-censused 2026-10-14
against origin HEAD \`964f443e\`. Primary surface symbol \`loadHandler\` at
\`scripts/ufo-godspeed-inject.test.mjs:33\`; \`DIRECTIVE\` at \`:52\`;
directive-led pins now pass rather than remain marked todo. re-anchored at
31c465f1 (round 35)`

1. `scripts/ufo-godspeed-inject.test.mjs:33` -> `loadHandler`
   $ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | sed -n '33p'
   function loadHandler() {
   OK — named symbol verbatim on the cited line; the function (33-44) is
   `/** Register the hook against a fake pi ... */` returning the `tool_call`
   handler, which is what the sentence calls the primary surface helper.

2. `:52` (sticky owner = the member path just cited) -> `DIRECTIVE`
   $ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | sed -n '52p'
   const DIRECTIVE = readFileSync(join(REPO, "ssot", "godspeed-core", "directive.md"), "utf8").trimEnd();
   OK — symbol verbatim; `:52` continues the last full path in reading order.

3. Behaviour claim "directive-led pins now pass rather than remain marked todo"
   $ git show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | grep -n todo
   none
   $ git show 964f443e:scripts/ufo-godspeed-inject.test.mjs | sed -n '120,123p'
   test("directive-led native assignment passes byte-identically ...", {
     todo: "SUB-1 hook half: hasInvocation matches only /skill:godspeed; ..."
   }, async () => {
   At the pin the same test is a plain `async () => {` pin (31c465f1:120) that
   asserts `await call({ task: assignment }) === undefined` (:122).
   Executed the pinned tree (extracted `git archive 31c465f1 | tar -x`):
   $ node --test scripts/ufo-godspeed-inject.test.mjs
   ℹ tests 12   ℹ pass 12   ℹ fail 0   ℹ todo 0   exit=0
   OK — "now pass" is observed, not inferred; the 964f443e todo arm existed.

# Population-table row

$ sed -n '158p' corpus/knowledge/remaining-scripts-census.md
| `scripts/ufo-godspeed-inject.test.mjs` | 180 | suite |
$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | wc -l
180
$ ... | awk 'END{print NR}'
NR=180        # trailing newline present, so no wc/awk divergence
Class `suite` holds: `import { test } from "node:test"` (:24), 12 `test(` at pin.

# Revision label and removed-clause trace

$ git diff master -- corpus/knowledge/remaining-scripts-census.md  (section hunk)
- Live S8 member (127 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. ...; also `DIRECTIVE` at `:52`.
+ Live S8 member (180 L, suite; was 127 @ 964f443e) re-censused 2026-10-14 against origin HEAD `964f443e`. ...; `DIRECTIVE` at `:52`; directive-led pins now pass rather than remain marked todo. re-anchored at 31c465f1 (round 35)
- Original revision label kept verbatim (`964f443e`, twice).
- No clause was removed: the old `127 L` survives as `was 127 @ 964f443e`
  (verified: `git show 964f443e:... | wc -l` = 127); the `DIRECTIVE` clause is
  retained. The edit is additive, so no departure trace was owed.

# Liveness / membership (the "Live S8 member" predicate)

Re-ran the note's own derivation at the pin:
  S_members layer 88 (70 top-level *.mjs + 18 under scripts/*/), S1-S7 live 28,
  S8 members 60, S8 member lines 33367.
$ grep -x 'scripts/ufo-godspeed-inject.test.mjs' /tmp/gs-members.txt
scripts/ufo-godspeed-inject.test.mjs
All 28 S1-S7 paths exist at the pin; this file is not in S1-S7. OK.
Heading count = 60, table row present once (:158), section present once (:671).

# Mechanical gates

- Scoped member-probe (Arm-2 logic, section only): heading_present true,
  section_present true, anchors [[member,33,33],[member,52,52]],
  own_anchors_live true, symbols ["964f443e","loadHandler","DIRECTIVE"],
  symbol_verbatim_in_file true.
- cite-check (--src /fast/scratch/kumitate-r35/src --symbols) line 673:
  all five findings severity=note kind=OK, including
  "loadHandler present on scripts/ufo-godspeed-inject.test.mjs:33" and
  ":52 -> scripts/ufo-godspeed-inject.test.mjs (180 lines)". No error on 673.
  (cite-check exits 1 corpus-wide from 79 pre-existing errors in this note,
  e.g. historical departed paths at :407-421 and LINE_OOR at :543; none is on
  the target section and none is introduced by it.)

# Non-blocking observation (not counted as a defect)

note:673-674 removed the blank line that master had between the paragraph and
`## \`scripts/ufo-l0-monitor-hook.test.mjs\``. Twelve other sections in the
same note share that shape (482/642/645/660/698/749/760/763/766/769/772/775
neighbourhoods), and both consumers split on `/^## /m`
(member-probe) or `note.split(/^## /m)` (claims-check), so headings still
parse; CommonMark ATX headings may interrupt a paragraph. Cosmetic only.
Minimal fix if the house wants uniformity: insert one blank line after
note:673.

# Wave-1 input check

`.ufo/waves/round-35/build/FidUfoGodspeedInjectTest.md` flagged two items —
stale `127` table row and section-level count/todo framing. Both are fixed in
the integrated text (:158 = 180; :673 = 180 L + todo framing); its stale
"note:137/note:688" references are wave-1 scratch line numbers, not note
claims.

Confidence: high. No tools installed or upgraded. No files outside this
report and /fast/scratch/kumitate-r35/w/KumitateR35.SecUfoGodspeedInjectTest/
were written.
