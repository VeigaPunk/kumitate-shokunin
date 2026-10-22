RESULT ScribeQualityCriteria rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drafted criteria=4

# Draft QUALITY.md criteria for the round-41 routed defects (R41-1, R41-4, R41-5, R41-7)

Text only. `corpus/QUALITY.md` was read at `b237e3f09c9559e130c7367bd2efa981c4ea516f` and is
unmodified; this report is the only file this seat wrote inside the lane.

Shape read: `corpus/QUALITY.md` has `## Entry criteria` (Q1–Q9), `## Round criteria` (Q10–Q15),
`## How to apply`, `## Post-review clarification (round 34)`, then Q16–Q20 appended as bullets.
The last id is **Q20** (`corpus/QUALITY.md:173` in the `b237e3f` snapshot), so the next free
numbers are **Q21–Q24**; the file ends at line 208, so the block below appends after the Q20
bullet. Q16–Q20 set the precedent that appended criteria may sit under one short heading; the
suggested heading is optional and keeps the four addressable.

Each criterion names who checks, the command or field that decides it, and what fails. Every
criterion cites `corpus/lessons/round-41-verifier-spotcheck.md` and is shown failing on the
round-41 artifact it targets (measurements in `## Red-before evidence`).

## Draft (paste-ready, append after Q20)

```markdown
## Round criteria — round 41 routed defects (R41-1, R41-4, R41-5, R41-7)

- **Q21 — a round that rejects nothing says so, and every reject carries the criterion it
  missed and the flip condition.** A `## Gate` section that records only admits and re-opens
  leaves the outside check nothing to sample for discernment, so the round cannot show the
  admit-and-reject agreement `LEARNING.md` asks for. The defect is a missing record, not a
  missing rejection: a round that rejected nothing states why, so the next round can sample
  either a same-round reject or a named standing one. Grounding:
  `corpus/lessons/round-41-verifier-spotcheck.md` R41-1 and its `## Discernment spot-check`
  (the round-41 `## Gate` holds three decisions, all admits or re-opens, and the round made no
  reject).
  - **Who checks.** The lane L1 before the round lesson commits; the non-author closure's
    discernment spot-check, which samples the same section.
  - **Field.** In `corpus/lessons/round-<N>.md`, every decision bullet in `## Gate` opens
    with `Admit`, `Re-open`, `Reject` or `Hold` and names the candidate (an `S###` id or a
    path), the criterion it met or missed (a `Q<n>` id or a named gate term), and the
    re-opened source with what it returned. A registry logging bullet
    (`**New row, logged:**`) is not a decision and carries no verdict word. A `Reject` or
    `Hold` also names what would flip the verdict. When nothing was rejected or held, one
    line reads `no reject this round — <why>` and the
    section names at least one standing reject it re-opened, with the re-adjudication result.
  - **Command.**
    `sed -n '/^## Gate/,/^## /p' corpus/lessons/round-<N>.md | grep -cE '^- \*\*(Reject|Hold)'`;
    when that reads 0,
    `sed -n '/^## Gate/,/^## /p' corpus/lessons/round-<N>.md | grep -c '^- no reject this round'`
    must read 1, and the section must name the standing reject it re-opened.
  - **Fails when.** The count is 0 and the no-reject line is absent (round 41: `0` and `0`,
    measured); a reject names no criterion or no flip condition; the no-reject line names no
    re-opened standing reject, so the outside check still has no sample.

- **Q22 — verdicts are keyed by axis, and the counted-claim count is the number of axes that
  carry a claim.** `AXES.md:31-33` makes the axis the counting unit ("two claims on one axis
  in one round count as one claim"); a report keyed by claim id forces the closure to re-key
  it and can hide that two claims are one counted claim. Grounding:
  `corpus/lessons/round-41-verifier-spotcheck.md` R41-4 and its `## Claims` section (both
  claims land on operability, so the round carries one counted claim).
  - **Who checks.** The non-author closure at the claims step, which grades each axis; the
    lane L1 runs the set comparison before committing the report.
  - **Field.** The fleet report `.ufo/reports/round-<N>/kumitate.md` (fleet root
    `/home/vgpnk/Projects/shokunin`) carries `## Per-axis verdicts` with the table columns
    `| axis | verdict | claims | basis |`: exactly the `## Axes` first-column names of
    `SCORECARD.md`, one row each; `verdict` is one of `improved`, `harmed`, `unchanged`,
    `unprovable-but-better`, `unprovable`; `claims` names every `C<n>` the round placed on
    that axis, or `—`; one line reads `counted claims=<n>`, where n is the number of rows
    whose `claims` column names a claim. Every `C<n>` declared in
    `.ufo/waves/round-<N>/plan.md` appears in the section; a duplicated axis row is caught
    by the axis-set diff below, which compares sorted lists without deduplicating. Where the
    plan heading names an axis (`## C<n> — <axis>`), the row's axis equals it, and a
    `capability` heading has its axis declared in the row.
  - **Command.** The axis set must match the scorecard:
    `diff <(awk -F'|' '/^## Axes/{f=1;next}/^## /{f=0}f&&$2~/[a-z]/{v=$2;gsub(/^[ \t]+|[ \t]+$/,"",v);sub(/:+$/,"",v);if(v!="Axis")print v}' SCORECARD.md | sort) <(sed -n '/^## Per-axis verdicts/,/^## /p' .ufo/reports/round-<N>/kumitate.md | awk -F'|' '$2~/[a-z]/{v=$2;gsub(/^[ \t]+|[ \t]+$/,"",v);sub(/:+$/,"",v);if(v!="axis")print v}' | sort)`
    prints nothing. Every declared claim is keyed:
    `diff <(grep -oE '^## C[0-9]+' .ufo/waves/round-<N>/plan.md | tr -d '# ' | sort) <(sed -n '/^## Per-axis verdicts/,/^## /p' .ufo/reports/round-<N>/kumitate.md | grep -oE 'C[0-9]+' | sort -u)`
    prints nothing. The stated count must equal the rows:
    `sed -n '/^## Per-axis verdicts/,/^## /p' .ufo/reports/round-<N>/kumitate.md | awk -F'|' '$4~/C[0-9]+/{n++} END{print n+0}'`.
  - **Fails when.** Either diff prints a line (round 41: no `## Per-axis verdicts` section,
    `grep -c` = 0; claim diff `1,2d0 < C1 < C2`, exit 1); verdicts are keyed by claim (four
    `- **C<n>**` bullets in the round-41 report); `counted claims` disagrees with the rows
    (round 41: two claims, one axis, so 1); or a capability claim's axis is left implicit.

- **Q23 — `## Round shape` accounts for every committed dispatch file, and separates payload
  from spawned.** A payload proves validation, not dispatch (round 39's validated 46-seat
  payload never spawned), and a shape written only in prose cannot be reconciled with the
  dispatch receipts or the seat gate. Grounding:
  `corpus/lessons/round-41-verifier-spotcheck.md` R41-5 and its `## Round shape` section
  (the §3 floor unmet in wave 1; falsify dispatched although the build wave never dispatched,
  undisclosed in the report; a third v1 wave, disclosed).
  - **Who checks.** The lane L1 before the report commit; the non-author closure re-derives
    each line from the dispatch JSON and the seat-gate evidence.
  - **Field.** In the report's `## Round shape`, one line per
    `.ufo/waves/round-<N>/<wave>-dispatch.json` shaped
    `WAVE <wave> payload=<counts.spawn> spawned=<n> returned=<n> dead=<n> gate=<granted|never granted>`,
    with `<wave>` exactly the file's `.wave`; one line
    `FLOOR wave1 spawned executor=<n>/3 scribe=<n>/1 scout=<n>/1 connector=<n>/1 reviewer=<n>/1 critic=<n>/1 verdict=<met|unmet>`
    counted from spawned seats, not from the payload; one line `spawned total=<n> (<=100)`;
    and one bullet per deviation from the allowed shapes (two v1 waves, one v2 wave, a
    residual call of at most 8 reviewer or critic seats), naming the rule, the observed
    counts and the cause, including any wave dispatched before its predecessor returned.
  - **Command.**
    `for f in .ufo/waves/round-<N>/*-dispatch.json; do w=$(jq -r .wave "$f"); sed -n '/^## Round shape/,/^## /p' .ufo/reports/round-<N>/kumitate.md | grep -q "^WAVE $w " && echo "ok $w" || echo "MISSING $w"; done`
    must print only `ok` lines;
    `sed -n '/^## Round shape/,/^## /p' .ufo/reports/round-<N>/kumitate.md | grep -cE '^(FLOOR|spawned total)'`
    must read 2.
  - **Fails when.** Any `MISSING <wave>` (round 41: all three MISSING — the section is prose);
    a payload `seats=` figure is written as spawned (round 41: `wave-census` reads `seats=106`
    against 72 spawned); a wave dispatched without its predecessor returning is not a deviation
    bullet (round 41 names the third wave but not the build-to-falsify order); `spawned total`
    exceeds 100; a floor role at 0 is not reflected as `unmet`.

- **Q24 — a cited receipt names the bytes it measured, and its label must equal its digest.**
  A header that names a commit whose blob does not hash to the stated digest certifies bytes
  that never existed at that commit, so the number cannot be regenerated from the named
  source. Grounding: `corpus/lessons/round-41-verifier-spotcheck.md` R41-7 and its `## Claims`
  evidence section (the `a2-census-*` receipts say "over master fae386aa" while their digest
  is the blob that landed in `fb7046ca`).
  - **Who checks.** The seat that writes the receipt, at write time; the non-author closure
    re-derives one cited receipt per claim.
  - **Field.** Every receipt the report or lesson cites for a number carries, on its first two
    lines, `<path> sha256 <64-hex>` or `rev=<40-hex>`; when it also carries a label
    (`over master <rev>`, `at <rev>`), `git show <rev>:<path> | sha256sum` in the lane equals
    the stated digest. `working-copy` is allowed only together with a digest.
  - **Command.** `git -C <lane root> show <rev>:<path> | sha256sum` against the header digest;
    `grep -L -E '(rev=[0-9a-f]{40}|sha256 [0-9a-f]{64})' <cited receipts>` prints nothing.
  - **Fails when.** A cited receipt carries no digest (round 41: 13 of the 18 `.txt` files
    under `.ufo/waves/round-41` carry none in their first three lines, measured); the label's
    commit hashes differently from the stated digest (round 41: label `fae386aa`, digest
    `d6068d1b…` = `fb7046ca`'s blob, while `fae386aa` hashes `3a32dd34…`); or the digest
    belongs to a different file than the one the numbers came from.
```

## Red-before evidence (commands and observed output, all at `b237e3f`)

1. `git rev-parse --short=12 HEAD` → `b237e3f09c95`; the plan and receipts in this directory
   were read at that revision.
2. `git show b237e3f:corpus/QUALITY.md | grep -n '^- \*\*Q' | tail -8` → last line
   `173:- **Q20 — a verdict guard is pinned by a selftest case, and the mutant that drops it is`,
   so Q21 is free. `wc -l corpus/QUALITY.md` → `208`.
3. Q21, round-41 lesson: `sed -n '/^## Gate/,/^## /p' corpus/lessons/round-41.md | grep -cE '^- \*\*(Reject|Hold)'`
   → `0`; `... | grep -c '^- no reject this round'` → `0`. Bullet prefixes present:
   `1 Admit`, `1 New` (a logging note, not a decision), `2 Re-open`. The criterion fails on
   this text.
4. Q22, round-41 report: `grep -c '^## Per-axis verdicts' /home/vgpnk/Projects/shokunin/.ufo/reports/round-41/kumitate.md`
   → `0`; `grep -nE '^- \*\*C[0-9]+\*\*' <report>` → four claim-keyed bullets at lines 113,
   119, 214, 220. Plan-versus-report claim diff → `1,2d0`, `< C1`, `< C2`, exit 1.
5. Q22 axis set (control, the command works on a real table):
   `git show b237e3f:SCORECARD.md | awk -F'|' '/^## Axes/{f=1;next}/^## /{f=0}f&&$2~/[a-z]/{v=$2;gsub(/^[ \t]+|[ \t]+$/,"",v);sub(/:+$/,"",v);if(v!="Axis")print v}'`
   → `operability coverage coverage:script-layer coverage:runtime-layer coverage:kimi-layer`
   (5 rows). Run against the committed blob, so a concurrent working-tree edit cannot move it.
6. Q23, wave set: `jq -r .wave` over `.ufo/waves/round-41/{build,falsify,verify}-dispatch.json`
   → `kumitate-r41-build`, `kumitate-r41-falsify`, `kumitate-r41-a2-verify`; the shape check
   printed `MISSING kumitate-r41-build`, `MISSING kumitate-r41-falsify`,
   `MISSING kumitate-r41-a2-verify` (3/3 fail).
7. Q23, count lines: `grep -cE '^(FLOOR|spawned total)' <round-41 report>` → `0`.
8. Q23, payload-versus-spawned: `node scripts/wave-census.mjs --round 41` printed
   `WAVE round=41 wave=build … seats=34 … reports=0/34`,
   `WAVE round=41 wave=falsify … seats=34 … reports=27/34`,
   `WAVE round=41 wave=verify … seats=38 … reports=38/38`; the report's own prose reads
   `seats=106` against `72 spawned seats`. The instrument read only; it wrote nothing.
9. Q24, label-versus-digest: `head -2 .ufo/waves/round-41/final/a2-census-repair-mutants.txt`
   → `# at 2026-10-22T18:42:06Z, lane working copy over master fae386aa
   (scripts/wave-census.mjs sha256 d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204)`;
   `git show fae386aa:scripts/wave-census.mjs | sha256sum` → `3a32dd345f9a9f52290f608b9d98fe5a1583026bba45c3997f7e489796e37ee4`;
   `git show fb7046ca:scripts/wave-census.mjs | sha256sum` → `d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204`
   (the header's digest is `fb7046ca`'s blob, not the labeled `fae386aa`'s).
10. Q24, digest coverage: `find .ufo/waves/round-41 -name '*.txt' | wc -l` → `18`; of those,
    13 carry no `rev=<40-hex>` or `sha256 <64-hex>` in their first three lines (loop over
    `head -3 | grep -qE … || echo`). The cited `cite-mutants-*` receipts do carry
    `rev=fae386aa9e0542710b7a893d84c8e92e86fc079b`; `wave-recount-final.txt` names the same rev
    on line 1.

## Findings

- Four criteria drafted, one per routed defect: Q21 (R41-1), Q22 (R41-4), Q23 (R41-5),
  Q24 (R41-7). No id is reused; Q20 remains the last existing id.
- Every criterion is red-before on the artifact the defect names, with the exception that
  Q21's failure is a missing line rather than a wrong value (the measured `0`/`0` pair).
- Q22 is the only criterion whose subject is the fleet report rather than a lane file; its
  path is written out so the lane gate's `--reports-dir` ambiguity (the lane's own
  `.ufo/reports` holds only round 33) does not change which file is checked.
- Q23 deliberately prescribes a line format the round-41 report does not use: the current
  section is prose, and all three waves fail the grep. The format is the checkable part, not
  a claim that round 41 was wrong to write prose.
- Q24's scope is receipts cited as evidence, not every file under `round-<N>/`: the 13 of 18
  without a digest include open-receipts logs and counter scripts that carry no measured
  number. Scoping to cited receipts keeps the criterion about certifying numbers and does not
  require a retroactive backfill.
- [INFERENCE] No criterion can be mechanically enforced yet by an existing lane gate:
  `scripts/round-gate.mjs` checks SHONEN/Findings/commit citations only (its finding ids are
  `REPORT_HEADINGS`, `REPORT_SHONEN_MISSING`, `COMMIT_*`, `UNPUSHED`, `TREE_DIRTY`, and the
  scorecard/log checks), and none of these four fields is in it. The checks are closureside
  or L1-side until a future instrument reads the fields.
- The exact `## Axes` extraction command is validated as a control (5 rows); the report-side
  arms of Q22 return empty on round 41, which is the failure the criterion reports.

## Touched surfaces

- Written inside the lane: this file, `.ufo/waves/round-42/build/ScribeQualityCriteria.md`
  (untracked build-wave artifact, as the item asks).
- Read only in the lane at `b237e3f`: `corpus/QUALITY.md`, `corpus/lessons/round-41.md`,
  `corpus/lessons/round-41-verifier-spotcheck.md`, `SCORECARD.md`, `.ufo/waves/round-41/*`,
  `.ufo/waves/round-42/plan.md`, `.ufo/waves/round-42/open/receipts.txt`.
- Read only outside the lane: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-41/kumitate.md`,
  `.ufo/prompts/kumitate-round-41.md`, `.ufo/prompts/kumitate-round-42.md`,
  `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/AXES.md`,
  `protocol/PROTOCOL.md` (§Evidence standard, §Gate standard).
- Lane working tree: `git status --porcelain` shows four untracked round-42 build-wave paths
  from other seats (`build-dispatch.json`, `build-spec.json`, `build/`,
  `evidence-seat-gate.txt`); no tracked file is mine. One intermediate status call showed
  ` M SCORECARD.md` and ` M corpus/README.md`, and the next call showed neither and an empty
  `git diff`: a concurrent seat's transient write, not this seat's. All measurements above
  are pinned to the `b237e3f` blobs through `git show`, so the churn cannot move them.
- No tool install or upgrade. No pacman transaction (host-wide pause respected). No network
  fetch. No git or jj write in the lane or the fleet repo.

## Out of scope

- `corpus/QUALITY.md` was not edited; the block above is a draft to paste.
- No lane gate or selftest was run as an admission check: the only instrument executed was
  `scripts/wave-census.mjs --round 41`, a read-only counter, whose WAVE lines are quoted.
- No patch file: the item is text-only, so nothing needs applying to `b237e3f`.
- R41-2, R41-3 and R41-6 are other seats' items and are not turned into criteria here.
