# SKILL.md `## Verifiable checklist` — items 31–32, item 30's grammar repair, header-count repair

The list ends at **item 30** (round 60, `dispatch-evidence`); bullets are the only numbering, so the two new
items are **31** and **32**. The parser is `surface-probe.mjs`'s frozen v1 grammar (`scripts/surface-probe.mjs:278`):

    ^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$

One command per line, no backtick inside the command, no text after the `expect` backticks, and `expect` is a
substring of stdout+stderr while `exits` is a set. Every bullet below was tested against that regex
(`/tmp/kumitate-r64/K64ScribeLogSkill/grammar-check.mjs`):

    MATCH exits=0 expect=DISPATCH_EVIDENCE_SELFTEST: PASS cmd=node scripts/dispatch-evidence.mjs --selftest
    MATCH exits=0 expect=REPORT_RECEIPT_SELFTEST: PASS cmd=node scripts/report-receipt-diff.mjs --selftest
    MATCH exits=0 expect=JJ_SEAT_DEMO: DONE cmd=bash scripts/jj-seat-demo.sh

---

## 1. Live defect this round must also repair: item 30 is already malformed

`SKILL.md:727` (item 30, round 60) carries **two** commands and a trailing clause, so it does not match the
grammar. Measured over the current file:

    MALFORMED SKILL.md:727 :: - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-eviden…
    task-lines=30 malformed=1

`surface-probe.mjs --checklists` therefore prints `CHECKLIST  ERROR  SKILL.md:727 grammar (…)` and a
`CHECKLIST_GRAMMAR` error finding, and the round-60 item **never runs**. Repair (one bullet, nothing lost — the
real-run command is already the registry row's entry command):

Old (`SKILL.md:727`, verbatim):

    - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-evidence.mjs --selftest` → exit 0 + `DISPATCH_EVIDENCE_SELFTEST: PASS`, and `node scripts/dispatch-evidence.mjs --root <lane> --round <N> --wave <w>` over the round's committed launcher record → exit 0 + `DISPATCH_EVIDENCE: CLEAN`

New:

    - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`; the real run over a round's committed launcher record is the registry row's command, `--root <lane> --round <N> --wave <w>`) — `node scripts/dispatch-evidence.mjs --selftest` → exit 0 + `DISPATCH_EVIDENCE_SELFTEST: PASS`

With that line and the two below, the list reads `task-lines=32 malformed=0`.

## 2. Item 31 (C1's surface — the suite; the real run is the registry row)

    - [ ] Report-vs-receipt diff suite (round 64; contract `kumitate-report-receipt-diff-v1`; findings `PLACEHOLDER`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT`; the real diff runs `--lane . --round N --rev <tip> --report <round report>` before filing) — `node scripts/report-receipt-diff.mjs --selftest` → exit 0 + `REPORT_RECEIPT_SELFTEST: PASS`

## 3. Item 32 (C2's ground)

    - [ ] jj seat-containment demo re-run (round 64; contract `kumitate-jj-seat-demo-v1`; 15 keys; exits 0 done or 2 fail-closed and never 1, so it is a demo and not a gate) — `bash scripts/jj-seat-demo.sh` → exit 0 + `JJ_SEAT_DEMO: DONE`

## 4. Header sentence repair (already stale before this round: 30 bullets under a "Twenty-six items" sentence)

Old text (verbatim, `SKILL.md:680-682`):

    Twenty-six items (round 56; item 26 is the SOURCES duplicate-URL ratchet; item 25 is the opened-source byte-persistence gate; item 24 is the frozen-counter registry gate; item 23 remains the receipt-attest hermetic suite).

New text:

    Thirty-two items (round 64; item 32 is the jj seat-containment demo re-run, item 31 the report-vs-receipt
    diff, item 30 the round dispatch-evidence gate, item 29 the README source-id citation gate, item 28 the
    receipt-evidence gate, item 27 the corpus coverage-map bimap gate; item 26 is the SOURCES duplicate-URL
    ratchet; item 25 is the opened-source byte-persistence gate; item 24 is the frozen-counter registry gate;
    item 23 remains the receipt-attest hermetic suite).

## 5. Where the real runs live (they cannot be checklist bullets)

The frozen grammar takes one command per line and no trailing prose, so the round-scoped invocations stay in
the registry rows and in `skill-rows.md` §3–§4. The two an agent needs:

```bash
# before filing a round report, after its close/ receipts are committed
node scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --round <N> --rev <lane-tip> --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md

# on a jj release: the demo, then the entry comparison
bash scripts/jj-seat-demo.sh
diff <(bash scripts/jj-seat-demo.sh | grep '^JJ_SEAT: ') \
     <(sed -n '/^## Demo outcomes/,/^## /p' corpus/knowledge/jj-workspace-seat-containment.md \
       | grep '^- ' | sed 's/^- /JJ_SEAT: /')
```

## 6. Notes for whoever integrates this

- Item 31's `--rev` is a **lane** revision; the report path is the fleet's `.ufo/reports/round-N/kumitate.md`.
  Run from the lane root with `--lane .` so `--fleet` defaults to the fleet root (the lane's parent with `.git`).
- Item 31 must never run on a seat report: seat reports carry none of the six headings and read
  `SECTION_MISSING` by design.
- Item 32 exits 2 on a host without `jj`/`git`; the checklist's existing convention already reads exit 2 as a
  tool/environment fault, not a claim failure.
- Neither item may enter `gate-mutants`' frozen manifest: item 31's suite prints no `VERDICT: FAIL` (only
  `REPORT_RECEIPT_SELFTEST: FAIL (n/m)`), so K43 would read every mutant of it as survived.
