ATTACK round-35-doc-appends verdict=partial defects=3

Axes: operability (the docs are the operator interface); coverage statements checked as context.
Target: the three round-35 appends (SKILL.md:727-731, member-claims-gate.md:113-115,
executable-scorecard.md:309-312), their selftest case references, and the checklist count.
Lane tree read-only; scratch `/fast/scratch/kumitate-r35/w/ReviewDocAppends/`.
Runtime node v24.21.0; no tools installed or updated.

## Substantive claims — all hold

1. Distinct derivation (SKILL.md:727-729; MCG:113-114; ESC:309-310).
   Code `scripts/proxy-check.mjs:593` `const sections = { S: new Set(), R: new Set() }`;
   `:600` adds `s.file` only when `s.inFamily === true && typeof s.file === 'string'`;
   `:605`/`:607` read `.size`. This is literally distinct in-family `section.file` identities.
   Live: `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` →
   `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)`, exit 0.

2. Duplicate-one/drop-one mutation is killed for S and R (ESC:311-312). Independent live A/B on
   an rsync copy (`lane-copy`): duplicated the S8 `scripts/charter-scribe/config.json` section and
   dropped `scripts/charter-scribe/prompts/kimi-update.prompt.txt`; duplicated the R8
   `native_transcript.rs` section and dropped `native_ledger.rs`.
   - round-35 proxy, `--self . --src <pin> --json` → `{"S":87,"R":82,"covS":9,"covR":8,
     "findings":["S_SECTIONS_DRIFT","R_SECTIONS_DRIFT","COVERAGE_SCRIPT_DRIFT",
     "COVERAGE_RUNTIME_DRIFT","AXES_DRIFT","AXES_DRIFT","PIN_UNPINNED"]}`, exit 1.
   - master proxy (`/fast/scratch/kumitate-r35/master-tree/scripts/proxy-check.mjs`) on the same
     copy → `{"S":88,"R":83,"covS":10,"covR":9,"findings":["K_MEMBERS_DRIFT",
     "K_SECTIONS_DRIFT","PIN_UNPINNED"]}` — no S/R finding. (The K drift is master's
     pre-round-35 K1=3 rules against the round-35 stanza, unrelated to the mutation.)
   → S 88→87, R 83→82 exactly as claimed: old occurrence sum 0/2, new distinct count 2/2.

3. Selftest case numbers 15–17 (SKILL.md:730). `node scripts/proxy-check.mjs --selftest`:
   `PASS [15/107] distinct S sections … S_SECTIONS_DRIFT`, `PASS [16/107] distinct R sections …
   R_SECTIONS_DRIFT`, `PASS [17/107] distinct control … findings=0`; tail
   `PROXY_SELFTEST: 107/107 pass` / `VERDICT: PASS`, exit 0. Numbering and fired kinds verbatim.

4. Claims gate `sections=` is still an occurrence count (SKILL.md:730-731; MCG:115).
   `scripts/claims-check.mjs:491` `sections: rows.reduce((n, r) => n + (r.sections?.length ?? 0), 0)`;
   the sole dedupe is `:401`, scoped to the declared-count arm. Live
   `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src` →
   `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`, exit 0.

5. Checklist count unchanged. `grep -c '^\s*- \[' SKILL.md` → `13`; `git show master:SKILL.md | grep -c '^\s*- \['` → `13`;
   `git diff master --numstat -- SKILL.md corpus/knowledge/executable-scorecard.md corpus/knowledge/member-claims-gate.md`
   → `5 0` / `4 0` / `3 0`: prose-only appends, zero task lines. Live proxy reports C=13.

6. The ESC citation `SCORECARD.md ## Move log round 35` is valid: `## Move log` starts at
   SCORECARD.md:395, round-35 rows are :399-:401, and they carry `MUTATION_KILLS 0/2` (master,
   S 86→86, R 83→83) and `MUTATION_KILLS 2/2` (round tree, S 88→87, R 83→82).

## Defects

D1 — corpus/knowledge/executable-scorecard.md:312, inside the round-35 append:
"The table row above keeps its round-16 wording." This is false; the referenced row
(corpus/knowledge/executable-scorecard.md:63) was rewritten in round 17.
Command: `git blame master -L 63,63 -- corpus/knowledge/executable-scorecard.md`
→ `c860887 (… 2026-09-29) … | S_sections / R_sections …` (whole line authored by the round-17 commit).
`git show c860887^:corpus/knowledge/executable-scorecard.md | sed -n '63p'` →
"Σ member sections … (74 script-layer + **60** runtime-layer; the raw all-section total is 137 …)".
`git show c860887:corpus/knowledge/executable-scorecard.md | sed -n '63p'` →
"Σ in-family section **occurrences** … 74 script-layer + **69** runtime-layer; raw total 146 …
Limit found round 17 … until the queued distinct-numerator hardening lands".
The row is round-17 text, and its occurrence definition plus "until the queued … lands" clause are
precisely what round 35 supersedes; the note misdates the stale text and does not name the two
clauses a reader must now disregard.
Minimal fix: replace "round-16" with "round-17" (or: "The table row above still defines the term
as Σ occurrences and calls the hardening 'queued'; this note supersedes both clauses.").

D2 — SKILL.md:721-722, same claims-check bullet, immediately above the append:
"`proxy-check` currently counts occurrences while the gate dedupes only for declared-count findings".
That is now false and contradicts SKILL.md:727 ("`proxy-check` now derives … DISTINCT").
The append does not mark the antecedent as superseded, unlike this repo's own correction convention
(SCORECARD.md:52-53: "the sentence above is the round-19 reading and stays as written").
Minimal fix: "`proxy-check` counted occurrences through round 34 (see the round-35 note below)".

D3 — corpus/knowledge/member-claims-gate.md:108, same shape: "`proxy-check` currently sums the
occurrences." contradicted by the append at :113-114.
Minimal fix: "`proxy-check` summed occurrences through round 34; the round-35 note below supersedes this."

## Notes

- Case 17 is the no-drift control (3 occurrences, 2 distinct); only 15 and 16 fire. The
  "cases 15–17" range is accurate as a range; the firing cases are strictly 15–16.
- `scripts/proxy-check.mjs.orig` litter is already filed by CriticC1Final.md; not counted here.
- The mutation ran only against the scratch copy; no lane file was modified, and this report is
  my only lane write. No package transactions, services, or config changes were performed.
