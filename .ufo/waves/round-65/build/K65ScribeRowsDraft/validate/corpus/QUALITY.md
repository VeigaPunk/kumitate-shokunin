# QUALITY — kumitate admission bar

Claim admission for this lane lives here. Tier definitions live in
`corpus/SOURCES.md` per the frozen fleet contract `SOURCES-CONTRACT-v1` rule 3;
the research method stays chousa's. A criterion is a gate: an entry that misses
one is rejected or held, and the reason is kept in the round's `## Gate`.
`SCORECARD.md` line pointers below resolve at `16a5441` (the base this file was
written on); `LOG.md` and lesson pointers resolve at any later revision.

## Entry criteria

- **Q1 — header triple.** Top of every admitted entry: `source:` (S### ids,
  URL, exact anchor), `verified-at:` (ISO date plus the revision/version
  observed), `recheck:` (a re-runnable command or citation). A missing header
  is a reject. Grounding: the "Unadopted contract surfaces" row in
  `corpus/lessons/round-34.md` (pre-round: 38 of 38 knowledge notes lacked the
  triple; 0 `recheck:` lines).
- **Q2 — every external fact cites an opened `corpus/SOURCES.md` row.** Tier C
  is never sole support; `community` is never tier A (tiers are scoped, per
  `SOURCES-CONTRACT-v1` rule 3). Grounding:
  `corpus/lessons/round-18.md:32-40` — the first wave was rejected with 80
  citation-form errors and re-admitted only at 0.
- **Q3 — every count carries its counting command and a dated re-run** (for
  this admission round, 2026-10-19), or an explicit `recalled` label. Grounding: SCORECARD.md:1197-1208 ("a recalled
  count is a claim; re-run it or label it as recalled"); the round-34
  "Recalled counts" and "Stale prose" rows.
- **Q4 — inferences are labelled `[INFERENCE]`; unknowns are named UNKNOWN.**
  Grounding: `corpus/lessons/round-18.md:60` (binary-strings evidence labelled
  INFERENCE-from-docs rather than passed as observed behavior).
- **Q5 — secret/credential-bearing surfaces are shape-only**: stat facts
  (size, mode, mtime), never content; no credential material, password-manager
  secret references, tokens, or private URLs. Grounding:
  `corpus/lessons/round-19.md:41-44` (shape-only covers durable artifacts and
  transient output; "count, never print values").
- **Q6 — gate-clean.** The entry adds 0 cite-check errors (per-file command in
  How to apply) and any gated family it touches reads MATCH on the strict/row
  check, not just the aggregate. `CLAIMS: MATCH` alone is not
  section-honesty. Grounding: `corpus/lessons/round-19.md:69-73` (errata
  added fresh citation errors; the sweep ran after, not before) and the
  round-34 "Gate blind spot" row (LOG.md:1297).
- **Q7 — a DRIFT line that motivates the entry is quoted whole, with its
  date.** Never a summary of the terms. Grounding:
  `corpus/lessons/round-20.md:35-44` (a summary glossed two causes; the
  durable rule became full-line capture) and LOG.md:1048.
- **Q8 — version skew is named.** When a fact comes from upstream `main` or
  current docs, name the installed host binary/version actually observed and
  the revision gap. Grounding: `corpus/lessons/round-15.md:91` (the origin
  tree moves under the citations; re-probe, do not trust) and
  `corpus/lessons/round-20.md:71` (OMP re-census parked as carried debt).
- **Q9 — one domain.** Cross-domain evidence is reported, not absorbed
  (PROVINCE Refuses). Grounding:
  `corpus/lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md:24`
  (no owning province: route to the integrator/operator, do not fix locally).

## Round criteria

- **Q10 — the round record passes the lane's own `scripts/round-gate.mjs`
  before close.** A `##`-section record that the gate cannot parse is DRIFT,
  not a completed round. Grounding: the round-34 "Own round-gate fails own
  record" row (live `--round 32` → 3 errors, exit 1).
- **Q11 — every landed candidate has a dated LOG admission entry** naming the
  round identity, the work revision and the gate lines. A commit without the
  entry is an unadmitted candidate regardless of its content. Grounding: the
  round-34 "Admission-status ambiguity" row (SCORECARD.md:378,458; `16a5441`
  unmentioned in LOG.md/SCORECARD.md).
- **Q12 — every round commit carries the lane identity**
  `kumitate-shokunin <kumitate@shokunin.local>`, verified at close with
  `git log --format='%ae' | sort | uniq -c`. Grounding: the round-34
  "Attribution / identity defect" row (2026-10-19 histogram: 26 lane of 75).
- **Q13 — DRIFT at round open is re-run and dispositioned before close.**
  Run `scripts/proxy-check.mjs` and `scripts/kimi-census.mjs` at open; capture
  the full line with its date; name each term's disposition. Grounding: the
  round-34 "Substrate mutation" row (LOG.md:1015-1017, 1048) and Q7.
- **Q14 — evidence pointers never live under `/tmp`** and never use the
  pre-move lowercase `projects/` path; they are repo-relative or under the
  live repo root. Grounding: the round-34 "Dead pointers" row (15 lowercase
  paths in LOG.md; 6 + 2 `/tmp/kumitate-r*` pointers).
- **Q15 — origin-tree counts name their pinned revision.** Every count read
  from the upstream tree (S/R members, sections, anchors) names the immutable
  revision it was measured at, taken from a private read-only clone pinned to
  that revision, never the operator's moving checkout; a pre-registered number
  is re-measured at round open before work starts. Grounding: the round-35
  "Pre-registered baseline measured on a tree that then moved" row
  (`corpus/lessons/round-35.md`; 91/91 pre-registered, 86/88 measured).

## How to apply

Run from the lane worktree; capture each full verdict line and its date.

1. **Open.** `node scripts/proxy-check.mjs`; `node scripts/kimi-census.mjs`;
   `node scripts/round-gate.mjs --round <N> --reports-dir .ufo/reports
   --main-repo .`. Quote every DRIFT line whole; disposition each term before
   close (Q7, Q13).
2. **Admit an entry.** Check Q1-Q5, then the per-file citation delta (Q6):

   ```sh
   node scripts/cite-check.mjs --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const f of JSON.parse(s).files){const e=f.findings.filter(x=>x.severity==="error").length;if(e)console.log(e,f.file)}})'
   ```

   The entry's file must print 0. Then the strict row:
   `node scripts/claims-check.mjs --row <ID> --strict` → `CLAIMS: MATCH` with
   `adv=0`, plus `node scripts/proxy-check.mjs` for the section count.
3. **Verify counts.** Re-run the counting command today; put the command and
   date in the entry, or write `recalled` (Q3).
4. **Verify pointers.** No new hit for the entry in
   `grep -rn '/tmp/kumitate-r\|vgpnk/projects/' LOG.md SCORECARD.md corpus`
   (Q14).
5. **Close.** `node scripts/round-gate.mjs --round <N> --reports-dir .ufo/reports
   --main-repo .` → `ROUND_GATE: CLEAN`; add the dated LOG admission entry
   naming round identity, work revision and gate lines (Q10, Q11); verify the
   identity histogram (Q12).
6. **Reject or hold.** Record the candidate, the criterion it missed and what
   would flip the verdict in the round's `## Gate`; a rejection is taste
   evidence, not an omission.

## Post-review clarification (round 34)

Q1 still applies to every new admission. The no-header legacy count is limited
to the 38 direct `corpus/knowledge/*.md` identities present at frozen base
`16a5441`, listed immutably in `scripts/sources-check.mjs`; those paths remain
exempt-but-counted even when later text is appended. Appended text in one of
those files is not a new sourced entry and cannot support an expansion claim.
Any non-base knowledge path without a nonempty `source:`, `verified-at:`, and
`recheck:` trio fails the source gate.

- **Q16 — a gate that admits anchors is checked against symbol-on-line truth before landing.**
  A fidelity term whose pairing can be satisfied by shifting an anchor onto a neighbouring symbol
  is not a fidelity gate. Before a green line is cited as anchor truth, re-measure the moved
  anchors with an independent parser against the pinned revision (`corpus/lessons/round-36-verifier-spotcheck.md`
  D1/D2; round-36 lost 123 previously true anchors this way). The check must be a committed command with its recorded output — a throwaway
  parser or the gate's own CLEAN line is not evidence for this criterion. Grounding: the same note's
  adjudication (§Claims, anchor truth), Verify4, and `corpus/lessons/round-37.md`.

- **Q17 — a ratchet that equals the current debt is not a gate. The anchor floor is frozen,
  per anchor, and only shrinks.** A ceiling regenerated from the measured debt at landing
  certifies that debt. Round 37's `fidelity-ratchet.json` summed to exactly its `nonok` (200),
  so `FIDELITY: CLEAN` could not fail (`corpus/lessons/round-37-verifier-spotcheck.md`, §Claims
  and R2).
  - Anchor expectations live per anchor in `.ufo/pins/anchor-truth.json`.
  - The checklist runs `anchor-truth --base <frozen commit>`, so a note's debt may never rise
    and its `true` count may never fall against that floor.
  - A re-pin refuses any anchor that was true and is no longer true (`PIN_REGRESSION`).
  - Each such arm has a selftest fixture whose mutant must fail.
  - A repair is admitted only with zero true→false transitions against the round-open
    revision. The count is computed by the gate over both revisions and recorded with its
    command. Grounding: `corpus/lessons/round-38.md` (`## Mistakes` rows 1–2); S033 (a link is
    only stable against a commit id, never a moving head).

- **Q18 — lexical anchor truth is necessary, not semantic claim admission.** A definition
  token on a cited line does not prove a guarantee about its body, an error code, or a range
  covering both halves of a check. Read the body and the whole described assertion range.
  Grounding: round-38 falsifiers Check21 (cached preflight is not a network-never-needed
  guarantee; reap needs the age/lock/removal range), Check52 (uncoded Error, not a default
  typed code), and Check71 (tail-file readback lies one line past the cited range);
  `corpus/lessons/round-38.md`. The lexical gate must never be relabelled a prose oracle.

- **Q19 — a floor matches what it protects by an identity the protected change cannot edit.**
  Round 38's `--base` floor found each base-true anchor by its pin key, and the key is built
  from the paired token. A current pin that changed that entry's token and key, and dropped it
  to `unchecked`, escaped the per-anchor check while the per-note totals still passed
  (`corpus/lessons/round-38-verifier-spotcheck.md`, R38-1; round 39 ran it against the
  round-open gate: `FLOOR_PROBE accepted=6/6`, `.ufo/waves/round-39/final/floor-probe-open.txt`).
  - Identity for an anchor is its raw text, its resolved path and its occurrence index, never
    the token, the key or any other field the edit under test can rewrite.
  - Per raw text and path that held a true anchor at base, the count of non-true anchors may
    not grow, so an inserted true copy cannot mask the original.
  - A `pair` token must equal the note's own pairing, and an entry source is `pair` or
    `review:<seat>` with a token.
  - Each arm is admitted only with a fixture that fails on the old logic and a mutant that a
    test kills. A mutant that only crashes the run is a runtime error, not a kill (S034).
  Grounding: `corpus/lessons/round-39.md` (`## Mistakes` row 1); S034.

- **Q20 — a verdict guard is pinned by a selftest case, and the mutant that drops it is
  killed.** A gate's verdict expression is a set of guards; each guard must be the reason
  some named case reads the way it reads. A guard no case depends on is untested: the
  suite is green whether the guard is present or dropped, so the gate can report a
  verdict its own tests never checked.
  - Every term of a verdict expression (`filesScanned > 0`, `totals.resolved > 0`,
    `!drift`, and any term added later) must have a case whose asserted outcome changes
    when that term alone is removed.
  - The fix is shown able to fail before it counts. A claimed repair ships one red-before
    state in which the same command exits non-clean for the named reason, with the fix as
    the only delta, and the observed failure text is committed. A mutant that only crashes
    the run is a runtime error, not a kill (S034).
  - A case that asserts a verdict must assert it on the shape the guard protects: a
    scanned document with zero resolved citations and no drift is a different input from an
    empty scan set, and only the first exercises the `resolved` guard.
  - Grounding: R39-5, routed from the tameshi r26 closure
    (`tameshi-shokunin/corpus/lessons/round-26-verifier-spotcheck.md:172-179`);
    `corpus/lessons/round-39-verifier-spotcheck.md` R39-5. Measured at `f69817e`: dropping
    only `&& totals.resolved > 0` from `scripts/cite-check.mjs:1590` left the suite at
    `62/62 cases passed (hermetic)`, `VERDICT: PASS`, exit 0, while a scanned document with
    zero resolved citations and no drift read `VERDICT: FAIL` on the base and
    `VERDICT: PASS` under the mutant. With the round-40 fix in place the same mutant reads
    `63/64 cases passed (hermetic)`, `VERDICT: FAIL`, exit 1 — killed by the named
    zero-resolved case; the patched suite reads `64/64`, `VERDICT: PASS`, exit 0. One
    further mutant, `totals.filesScanned >= 0 && totals.resolved > 0 && !drift`, survives,
    and is an equivalent mutant of that expression: `resolved` only increments inside the
    per-document loop, so `resolved > 0` already implies `filesScanned > 0`. An equivalent
    mutant is a survivor, not a kill (S034), and it is recorded rather than hidden.
  - Round-40 falsify correction (seat CritQualityCriterion): the sentence above that "one
    further mutant … survives" is narrower than the sweep. Two more cite-check mutants survive
    the 64-case suite: dropping the `opts.strict && totals.warn > 0` part of `drift`, and
    dropping only `opts.strict &&` (no selftest passes `--strict`); and in
    `scripts/sources-check.mjs` forcing the JSON verdict to `CLEAN` passes 46/46. Each part of a
    compound term (here `drift`) is a term under this rule; these three are open and
    pre-registered for round 41.


## Round criteria — round 41 routed defects (R41-1, R41-4, R41-5, R41-7)

Run every command below from the lane root (`kumitate-shokunin/`); the fleet report is reached as
`../.ufo/reports/round-<N>/kumitate.md` (falsify seat ReviewQualityQ21Q24, round 42).

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
    `diff <(awk -F'|' '/^## Axes/{f=1;next}/^## /{f=0}f&&$2~/[a-z]/{v=$2;gsub(/^[ \t]+|[ \t]+$/,"",v);sub(/:+$/,"",v);if(v!="Axis")print v}' SCORECARD.md | sort) <(sed -n '/^## Per-axis verdicts/,/^## /p' ../.ufo/reports/round-<N>/kumitate.md | awk -F'|' '$2~/[a-z]/{v=$2;gsub(/^[ \t]+|[ \t]+$/,"",v);sub(/:+$/,"",v);if(v!="axis")print v}' | sort)`
    prints nothing. Every declared claim is keyed:
    `diff <(grep -oE '^## C[0-9]+' .ufo/waves/round-<N>/plan.md | tr -d '# ' | sort) <(sed -n '/^## Per-axis verdicts/,/^## /p' ../.ufo/reports/round-<N>/kumitate.md | grep -oE 'C[0-9]+' | sort -u)`
    prints nothing. The stated count must equal the rows:
    `sed -n '/^## Per-axis verdicts/,/^## /p' ../.ufo/reports/round-<N>/kumitate.md | awk -F'|' '$4~/C[0-9]+/{n++} END{print n+0}'`.
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
    counted from spawned seats, not from the payload; one line `spawned total=<n> (<=128)`
    (the operator raised the round cap from 100 to 128 on 2026-10-22);
    and one bullet per deviation from the allowed shapes (two v1 waves, one v2 wave, a
    residual call of at most 8 reviewer or critic seats), naming the rule, the observed
    counts and the cause, including any wave dispatched before its predecessor returned.
  - **Command.**
    `for f in .ufo/waves/round-<N>/*-dispatch.json; do w=$(jq -r .wave "$f"); sed -n '/^## Round shape/,/^## /p' ../.ufo/reports/round-<N>/kumitate.md | grep -q "^WAVE $w " && echo "ok $w" || echo "MISSING $w"; done`
    must print only `ok` lines;
    `sed -n '/^## Round shape/,/^## /p' ../.ufo/reports/round-<N>/kumitate.md | grep -cE '^(FLOOR|spawned total)'`
    must read 2.
  - **Fails when.** Any `MISSING <wave>` (round 41: all three MISSING — the section is prose);
    a payload `seats=` figure is written as spawned (round 41: `wave-census` reads `seats=106`
    against 72 spawned); a wave dispatched without its predecessor returning is not a deviation
    bullet (round 41 names the third wave but not the build-to-falsify order); `spawned total`
    exceeds 128; a floor role at 0 is not reflected as `unmet`.

- **Q24 — a cited receipt names the bytes it measured, and its label must equal its digest.**
  A header that names a commit whose blob does not hash to the stated digest certifies bytes
  that never existed at that commit, so the number cannot be regenerated from the named
  source. Grounding: `corpus/lessons/round-41-verifier-spotcheck.md` R41-7 and its `## Claims`
  evidence section (the `a2-census-*` receipts say "over master fae386aa" while their digest
  is the blob that landed in `fb7046ca`).
  - **Who checks.** The seat that writes the receipt, at write time; the non-author closure
    re-derives one cited receipt per claim.
  - **Field.** Every receipt the report or lesson cites for a number carries, in its first three
    lines, `<path> sha256 <64-hex>` or `rev=<40-hex>`; when it also carries a label
    (`over master <rev>`, `at <rev>`), `git show <rev>:<path> | sha256sum` in the lane equals
    the stated digest. `working-copy` is allowed only together with a digest.
  - **Command.** `git -C <lane root> show <rev>:<path> | sha256sum` against the header digest;
    `for f in <cited receipts>; do head -3 "$f" | grep -qE '(rev=[0-9a-f]{40}|sha256 [0-9a-f]{64})' || echo "$f"; done` prints nothing.
  - **Fails when.** A cited receipt carries no digest (round 41: 13 of the 18 `.txt` files
    under `.ufo/waves/round-41` carry none in their first three lines, measured); the label's
    commit hashes differently from the stated digest (round 41: label `fae386aa`, digest
    `d6068d1b…` = `fb7046ca`'s blob, while `fae386aa` hashes `3a32dd34…`); or the digest
    belongs to a different file than the one the numbers came from.

Q25–Q28 were added in round 43 and are in force from the round-44 plan. Round 43 measured itself
against them (falsify seat ReviewQualityQ25Q28): Q25 fails (no clause-to-case map lines in the frozen
plan; the (a) case carries no `k43-` prefix), Q26 fails on receipt naming (the close receipt is
`final/checklist-84cb1d5d.txt`), Q27 passes, Q28 fails (one uncited section,
`corpus/knowledge/kimi-skills-plugins.md:173`). Open, not hidden.

- **Q25 — a mutation battery has one kill predicate, frozen before any counted run and stated
  identically in the plan, the code and the selftest case names.** A predicate stated three ways is
  three predicates: the round is scored under the sentence the plan froze, and no artifact may state
  a narrower or wider rule beside it. Grounding: `corpus/lessons/round-42-verifier-spotcheck.md`
  §Claims C1 — plan `b237e3f0:.ufo/waves/round-42/plan.md:21-22` reads "killed = exit non-zero with a
  `VERDICT: FAIL` line", amendment A1 reads "at least one `FAIL ` case line", and the code at
  `c9a084bf:scripts/gate-mutants.mjs:426-434` reads `if (run.failLines > 0) return 'killed'`; under
  the frozen sentence the seven named survivors read `exit=0` or `VERDICT: PASS`. Also
  `corpus/lessons/round-42.md` `## Mistakes` row 3; routed defect D2.

  - **Who checks.** The lane L1 at plan commit, before any seat runs the counter; the non-author
    closure re-scores at least one clause from the committed receipt.
  - **Field.** (1) The plan states the predicate once, as `**K<nn> …**`, with clause letters `(a)`–`(d)`.
    (2) `scripts/gate-mutants.mjs` names the same `K<nn>` in its header. (3) Every case that asserts a
    predicate term carries the id as a lowercase prefix in its case id (`k<nn>-…`), and the plan
    carries one line per clause, `(x) case <case-id>`, naming that clause's binding case. (4) Each
    named case goes red when its clause alone is removed; the receipt is committed with the patch line
    quoted. (5) Nothing about the predicate changes after any seat or L1 has run the counter; a
    post-data change is an appended correction, and the counter is reported under the frozen text.
  - **Command.**
    ```sh
    N=43; P=$(grep -oE '^\*\*K[0-9]+' .ufo/waves/round-$N/plan.md | head -1 | tr -d '*'); p=$(printf '%s' "$P" | tr 'A-Z' 'a-z')
    sed -n '1,24p' scripts/gate-mutants.mjs | grep -c "$P"                       # header names the predicate
    grep -cE "check\('$p-[a-z0-9-]+'" scripts/gate-mutants.mjs                   # predicate cases, by id prefix
    grep -oE '\([a-d]\)' .ufo/waves/round-$N/plan.md | sort -u | wc -l            # clause count
    grep -cE "^\([a-d]\) case [a-z0-9-]+" .ufo/waves/round-$N/plan.md || true   # clause-to-case map, one per clause
    ```
    Clause binding is shown, not asserted: remove one clause from a copy of the gate inside a copy of
    `scripts/` (so the fixture siblings resolve) and run `--selftest`; the clean copy must read
    `GATE_MUTANTS_SELFTEST: 28/28 pass` exit 0, and each single-clause drop must read
    `27/28 pass`, `VERDICT: FAIL`, exit 1, with exactly one `FAIL k…` or named case line.
  - **Fails when.** Two artifacts state different predicates (round 42: three); a clause has no case
    that goes red when it is removed, or the receipt is absent; the predicate is edited after data and
    the round is scored under the edit; a predicate-asserting case carries no id prefix, or the plan
    carries no clause-to-case map.
  - **Measured at `e5ffcbe`.** Plan id `K43`; header mention count 2; seven `k43-…` case ids; four
    clause letters; clause-to-case map lines 0 (open arm). Clean selftest 28/28, exit 0. Single-clause
    drops: (a) `timeout-and-process-group-cleanup` fails, (b)
    `k43-exit-zero-with-verdict-fail-is-survived` fails, (c)
    `k43-nonzero-with-verdict-pass-is-survived` fails, (d)
    `k43-confirmation-other-names-or-pass-disagrees` fails; each 27/28, exit 1. The (a) binding case
    carries no `k43-` prefix, so the naming arm is also open.

- **Q26 — an operability claim needs a pass-sensitive counter; listed-line and file-count terms are
  not evidence.** A count of listed checklist lines, or of files with a runnable extension, moves when
  text or a filename moves and does not move when a check stops passing, so it cannot evidence a
  capability. Grounding: `corpus/lessons/round-42-verifier-spotcheck.md` §Claims "Terms counter,
  re-measured" — `C` counts `^\s*- \[` lines and `A` counts any `.mjs|.js|.sh|.py` file, so a
  zero-byte `.mjs` reads `PROXY: MATCH … operability=9`; `corpus/lessons/round-42.md` `## Open limits`
  ("an unsourced stub section would pass every C2 counter"); routed defect D3.

  - **Who checks.** The lane L1 before the report commit; the non-author closure re-runs the blindness
    probe on the claimed counter.
  - **Field.** The claim cites `.ufo/waves/round-<N>/open/checklist-pass.txt` and `.../final/checklist-pass.txt`,
    each carrying one line per SKILL.md checklist item, `<item-id> exit=<n>`, plus a summary
    `PASS <n>/<m>` where n is the number of `exit=0` lines. The claim's delta names the item ids that
    flipped and their exit codes. The round also commits a blindness receipt: one named check broken in
    a scratch copy moves the claimed counter (or turns it non-clean); a counter that does not move is
    cited as context only and carries no claim.
  - **Command.**
    ```sh
    F=.ufo/waves/round-<N>/final/checklist-pass.txt
    awk '/^PASS [0-9]+\/[0-9]+$/{split($2,a,"/");print a[1]}' "$F"    # declared passed; must equal:
    grep -c ' exit=0$' "$F"                                           # counted from exit statuses, not listed lines
    # blindness: break one named check, re-run the claimed counter, require a different value
    B=$(mktemp -d); cp -a . "$B/blind" && : > "$B/blind/scripts/<governed>.mjs"
    node "$B/blind/scripts/proxy-check.mjs" --src <pin> --json | jq '.terms.operability'
    ```
  - **Fails when.** The claim's only number is a listed-line or file count (round 42: `C` 17 → 19, `A`
    9 → 10, integer 8 → 9); the counter reads the same under the named break; the pass receipts are
    absent, or their summary disagrees with the `exit=0` lines; an item is counted as passed while its
    command exits non-zero.
  - **Measured at `e5ffcbe`.** Clean: `PROXY: MATCH (A=10 C=19 operability=9; … )`. Blind copy with
    `scripts/wave-census.mjs` zero bytes and SKILL.md item "Citation gate verdict" changed to run
    `false`: `terms {"A":10,"C":19,…, "operability":9, …}` — identical. Synthetic receipt fixture:
    declared 3, `exit=0` lines 3, listed items 4, so a listed count is not a pass count.

- **Q27 — no untracked wave report at report filing, checked by a command.** A delivered report that
  sits untracked is not evidence and cannot be weighed by a closure; a report that says "cancelled …
  unperformed" while three delivered reports lie untracked misstates the round. Grounding:
  `corpus/lessons/round-42-verifier-spotcheck.md` §Step-1 conformance, defect D1 — `CritC1Claim`,
  `CritSeparabilityTip`, `CritTradesTip` untracked with mtimes 18:16:29–18:18:04 -03 after lane close
  `43f54c16` at 18:13:51, while the report read "cancelled … attacks are unperformed"; the same mtimes
  and digests are re-committed in `.ufo/waves/round-43/open/receipts.txt`. Also
  `corpus/lessons/round-42.md` `## Mistakes` (misroot row); routed defect D1.

  - **Who checks.** The lane L1 immediately before the report commit; the non-author closure repeats
    the disk-versus-tracked diff and the fleet-side sweep.
  - **Field.** At the report's revision, every `.md` file under `.ufo/waves/round-<N>/` on disk is
    tracked, and `git status --porcelain --untracked-files=all` for that directory prints nothing. A
    report delivered after the sweep is committed as late evidence with a `late-delivered <ISO>` line
    and the report's disposition line is corrected in the next round's report. The fleet-side
    `.ufo/waves/round-<N>` and `.ufo/reports/round-<N>` are swept the same way (misroot).
  - **Command.**
    ```sh
    d=$(mktemp); t=$(mktemp)
    find .ufo/waves/round-<N> -name '*.md' -printf '%P\n' | sort > "$d"
    git ls-files .ufo/waves/round-<N> | sed 's#^\.ufo/waves/round-<N>/##' | grep '\.md$' | sort > "$t"
    diff "$d" "$t"; rm -f "$d" "$t"                                               # prints nothing
    git status --porcelain --untracked-files=all -- .ufo/waves/round-<N>          # prints nothing
    git --no-optional-locks -C <fleet> status --porcelain --untracked-files=all -- .ufo/waves/round-<N> .ufo/reports/round-<N>
    ```
  - **Fails when.** Any `??` or `M` line under the wave directory at the report commit (round 42:
    three `??` falsify reports); the disk set and the tracked set differ; a report names a file whose
    bytes are not committed; a late delivery is argued as cancelled rather than committed and named.
  - **Measured at `e5ffcbe`.** Round 43 wave dir: status 0 lines; a planted
    `.ufo/waves/round-43/falsify/ProbeUntracked.md` produced exactly one `?? …` line, and removal
    restored 0. Round 42: 64 `.md` files on disk, 64 tracked, diff exit 0. Fleet sweep of
    `.ufo/waves/round-42 .ufo/reports/round-42`: no output, exit 0.

- **Q28 — a knowledge section that a coverage term counts passes only if it cites a source row
  (unsourced-stub hole).** The admission unit for a knowledge note is its section, not its file: a
  section that names a declared member moves `K_sections` (and `coverage_kimi`) even when nothing in
  the section is sourced, so a stub can be counted as governance. Grounding:
  `corpus/lessons/round-42-verifier-spotcheck.md` §Routed defects D7 ("an unsourced stub section
  passes every C2 counter (CritC2Claim objections 3–5)"; "S041 binding is a manual grep") and
  `corpus/lessons/round-42.md` `## Open limits` (same sentence). The base exemption takes Q19's
  identity rule: identity is (file, heading text, occurrence index), and the count at base may not
  grow, so a duplicate heading cannot mask a new one.

  - **Who checks.** The seat that adds or retitles a section; the lane L1 before the report commit;
    the non-author closure re-runs the scan and the blindness probe.
  - **Field.** A counted section is a `##` heading in `corpus/knowledge/kimi-*.md` that names a K
    member (`K_sections` unit; same heading-binding rule as the `K_sections` derivation in
    `scripts/proxy-check.mjs`, whose ambiguous case is the `K_SECTION_AMBIGUOUS` warning).
    Base `16a5441` fixes the exempt count per (file, heading text). An occurrence beyond the base
    count is new and passes only if, inside its own bounds, it cites at least one `S###` whose
    `corpus/SOURCES.md` row reads `status=mined` and names this file in `used-by`; otherwise the
    section reads `K_SECTION_UNSOURCED`, is excluded from `K_sections`, and cannot raise a coverage
    term. Readme rows and file counts are not section evidence.
  - **Command.**
    ```sh
    IDS=$(sed -n '/const K_MEMBER_RULES/,/^];/p' scripts/proxy-check.mjs | grep -oE "path: '[^']+'" | cut -d"'" -f2)
    # base heading counts per file; print each occurrence beyond base with no S### inside its bounds
    for f in corpus/knowledge/kimi-*.md; do b=$(mktemp); git show 16a5441:"$f" 2>/dev/null | grep '^## ' > "$b"; \
      awk -v F="$f" -v B="$b" -v IDS="$IDS" '
        BEGIN{nid=split(IDS,ids,"\n");while((getline l < B)>0)base[l]++}
        /^## /{if(sec!=""&&newsec&&nc==0)print F":"ln": "sec;sec=$0;ln=FNR;nc=0;binds=0;
               for(i=1;i<=nid;i++)if(ids[i]!=""&&index(sec,ids[i])){binds=1;break};
               seen[sec]++;newsec=binds&&(seen[sec]>base[sec]);next}
        /S[0-9][0-9][0-9]/{nc++}
        END{if(sec!=""&&newsec&&nc==0)print F":"ln": "sec}' "$f"; rm -f "$b"; done   # prints nothing
    awk -F'|' '$2 ~ /^ *S041 *$/{s=$9;u=$12;gsub(/^ +| +$/,"",s);gsub(/^ +| +$/,"",u);print s, u}' corpus/SOURCES.md
    ```
  - **Fails when.** A new counted section cites nothing (measured: one); the cited id is `rejected`,
    unknown, or its row does not name the file; the counter counts an uncited section (measured: the
    stripped-citation probe leaves `K_sections` unchanged).
  - **Measured at `e5ffcbe`.** Scan prints one line:
    ``corpus/knowledge/kimi-skills-plugins.md:173: ## `~/.kimi-code/skills/cursor-lane` `` (base file
    has 13 headings; this heading is absent at base). The round-42 `locks/` section passes: `S041
    status=mined` and its `used-by` names `corpus/knowledge/kimi-session-state.md`. Hole still open at
    the gate: deleting `S041`/`S042` from inside that section in a scratch copy leaves
    `K_sections=53 coverage_kimi=10` and `SOURCES_CHECK: CLEAN (rows=45 … legacy=38)`.

- **Q29 — an operability counter must reject named skip-work controls before data.** A counter that passes
  only because a control skips the claimed work is not evidence; round 43's junk J4 returned
  `GATE_MUTANTS: CLEAN` with synthetic failures (`.ufo/waves/round-43/build/ExecJunkControls.md:22-29`;
  `corpus/lessons/round-43.md`, `## Mistakes` and `## Open limits`).
  - **Who checks.** The L1 before the first data run; the non-author closure replays the committed receipts.
  - **Field.** The frozen plan names absent, constant, junk, no-reader and label-keyed shortcut controls. Each runs
    against the frozen counter before data; its receipt names the control and counter revision and is committed
    before the measured receipt. Any control returning the counter's success verdict requires redesign before data
    or an explicit exploratory claim; no data run under the old counter supports the claim.
  - **Command.**
    ```sh
    L=...; P=<plan commit>; C=<control-receipt commit>; R=<measured-receipt commit>
    F=(<committed control receipt paths>)
    git -C "$L" log --format='%H %s' --ancestry-path --reverse "$P^..$R"
    if ! git -C "$L" merge-base --is-ancestor "$P" "$C" || ! git -C "$L" merge-base --is-ancestor "$C" "$R"; then
      echo 'Q29: FAIL plan/control/measured commits are out of order'; exit 1
    fi
    for f in "${F[@]}"; do git -C "$L" cat-file -e "$C:$f" || exit 1; done
    if git -C "$L" grep -n -E '[A-Z][A-Z0-9_]*: (MET|CLEAN)' "$C" -- "${F[@]}"; then
      echo 'Q29: FAIL a control met the counter'; exit 1
    fi
    ```
    The log must order plan → controls → measured; the final grep must print nothing. `CLEAN` is included to
    recognize round 43's positive token; round 44 uses `MET`.
  - **Fails when.** A named control is omitted, a receipt is absent or committed after measurement, or any
    control produces the success verdict; a hit requires redesign before data or an explicit exploratory claim.
  - **Demonstrated at round 43.** The J4 receipt commit `fb3eab40` precedes measured `84cb1d5d`; its `CLEAN`
    line makes this check exit 1 (`.ufo/waves/round-43/build/ExecJunkControls.md:26`).

- **Q29 ordering note (round 45, routed defect R44-2).** The round-44 closure asked for control receipts "in a commit
  earlier than the counter they score, not in the same one". A receipt that scores frozen counter bytes cannot
  precede the counter's freeze commit, so the field reads: each control receipt lands in its **own** commit, a
  descendant of the counter's freeze commit and an ancestor of the measured receipt, and never in the counter's
  freeze commit. Round 44's receipts shared `32b7fd56` with p44d; that fails this note (recorded, not re-judged).
  Add to the Q29 command, with `K=<counter path>` (the line exits 1 when the receipt commit also last touched the
  counter):
  ```sh
  test "$(git -C "$L" log -1 --format=%H "$C" -- "$K")" != "$C" || { echo 'Q29: FAIL receipts share the counter commit'; exit 1; }
  ```
  On round 44 (`C=32b7fd56`, `K=.ufo/waves/round-44/probe/p44d-count.mjs`) it prints the FAIL line. (A draft of this
  note read `git log -1` without `"$C"` and ended in `|| echo`, so it measured HEAD and never exited 1 — round-45
  seat ScoutErrataCheck item 3.)

Q30–Q32 were added in round 45 (routed defects R44-1 and R44-3, and the round-45 mined mistake) and are in force from
the round-46 plan. The round-45 receipts named below are attempt-2 seats under `.ufo/waves/round-45/a2-control/`.

- **Q30 — a counter's CLEAN cases must not recur across seeds (catalog hole); necessary, not sufficient.** A counter
  whose CLEAN shapes are few and repeat from run to run can be met by a program that memorises those shapes instead of
  applying per-member rules. Grounding: `corpus/lessons/round-44-verifier-spotcheck.md` § Routed defects 1 (R44-1);
  `.ufo/waves/round-44/falsify/CtlPostDataA.md` (three catalog programs read `P44_COUNT: MET (passed=207 cases=207)`
  under p44d after data).
  - **Who checks.** The L1 before the counter freeze; the non-author closure re-runs the command on the frozen bytes.
  - **Field.** The frozen plan names the counter's listing command and two seeds; the command below must print
    `CATALOG_GATE: PASS`. Before freeze the plan also scores, as controls against the counter itself, the round-44
    skip-work shapes adapted to the new counter (CtlPostDataA's three catalog programs, CtlLabelKeyedA/B,
    CritV3LabelB, CritV3Boundary) **and a junk-variation catalog** (a fixed catalog plus one random irrelevant member
    per seed); each must read the counter's failure verdict (Q29 receipts).
  - **Command.** `.ufo/waves/round-45/probe/catalog-check.mjs.txt` (sha256
    `51e11b8f73929b49a07f14401eb9f3c9dcb50a6bb9dfa1b342a736c57cd8a63a`; copy to `catalog-check.mjs`). The
    `--require-fresh` flag is required: without it the script prints `CATALOG_GATE: PASS` even after
    `CATALOG: REUSED` (CtlQ30Reproduce risk 1).
    ```sh
    node catalog-check.mjs --label <counter> --cmd "node <counter>.mjs --census {CENSUS} --shape {SHAPE} --seed {SEED} --list" \
      --shape <shape.tsv> --seed-a 0011223344556677 --seed-b aabbccddeeff0011 --require-fresh; echo exit=$?
    ```
    It hashes each CLEAN case's whole expected shape (sorted name, kind, mode lines; ids, case order and DRIFT
    cases ignored) under both seeds: `CATALOG: REUSED` + `CATALOG_GATE: FAIL` (exit 1) when any CLEAN shape recurs,
    `CATALOG: FRESH` + `CATALOG_GATE: PASS` (exit 0) otherwise; an unrebuildable listing exits 2.
  - **Fails when.** Any CLEAN shape recurs across the two seeds; the listing cannot be rebuilt (exit 2); a named
    control, including the junk-variation catalog, meets the counter.
  - **Measured in round 45 (re-derived by attempt-2 seat CtlQ30Reproduce, same bytes).** p44d (`32b7fd56`):
    `CATALOG: REUSED (clean=19 recurring=9)`, `CATALOG_GATE: FAIL`, exit 1; fresh-variation toy
    (`probe/toy-count.mjs.txt`): `CATALOG: FRESH (clean=12 recurring=0)`, exit 0; the toy with its seed pinned:
    `REUSED (clean=12 recurring=12)`, exit 1.
  - **Limit (control CtlQ30Shortcuts).** Id-only and order-only variation of a fixed catalog read `REUSED` (killed),
    but appending one junk member `zz-<seed>` to every fixed shape reads `CATALOG: FRESH (clean=12 recurring=0)`,
    `CATALOG_GATE: PASS`, exit 0. The gate tests whole-shape novelty, not novelty of the members the counter's rules
    inspect, so it cannot certify a counter alone; the junk-variation control against the counter (Field) is what
    closes that hole. A rule-relevant fingerprint (drop members no census rule names) is proposed, not built.

- **Q31 — a counter's sandbox bounds environment, native memory, total time and leftovers; the selftest decides.**
  Grounding: `corpus/lessons/round-44-verifier-spotcheck.md` § Routed defects 3 (R44-3: SentinelSandboxEscape,
  SentinelProcLeak); `corpus/knowledge/agent-isolation-substrates.md` M5 and M6 (round-45 demos RedoDemoBwrapEnv and
  RedoDemoNativeMemCap).
  - **Who checks.** The L1 before freezing a counter that runs code under test; the non-author closure re-runs the
    source guards and the runner's selftest.
  - **Field.** The counter (or the runner it calls) runs `env -i PATH=… HOME=…` as the immediate parent of bwrap, and
    `--clearenv --setenv` for the command (`systemd-run --scope` outside `env -i` passes the caller environment into
    the scope, S072); each case runs in a cgroup scope with `MemoryMax` and `MemorySwapMax=0`; a total budget still
    prints one verdict line; the work directory is removed on SIGTERM/SIGINT. Behavioural selftest: a planted
    environment marker is absent from `/proc/1/environ` inside the sandbox, and a 512 MiB Buffer under a 256M scope
    exits 137.
  - **Command.** Source guards over the counter file `F` (a tripwire; each missing guard prints a FAIL line):
    ```sh
    bad=0
    grep -q 'env:' "$F" || { echo 'Q31: FAIL explicit launcher environment'; bad=1; }
    grep -Eq 'MemoryMax=|memory\.max|cgroup|counter-sandbox' "$F" || { echo 'Q31: FAIL native-memory cgroup'; bad=1; }
    grep -Eq 'TOTAL_BUDGET|totalBudget|deadline|--budget' "$F" || { echo 'Q31: FAIL verdict-preserving total budget'; bad=1; }
    grep -Eq "process\.on.*SIG(TERM|INT)|trap .*(TERM|INT)" "$F" || { echo 'Q31: FAIL signal cleanup handler'; bad=1; }
    test "$bad" -eq 0
    ```
    plus the behavioural selftest receipt of the runner. The guards alone are not proof (control
    CtlQ31GuardShortcut): p44d with the four strings added only as comments passes all four greps, and
    `env: process.env` passes the environment guard while passing the host environment. Both are rejected only by
    the selftest clause in **Fails when**.
  - **Fails when.** Any guard line prints; the runner's selftest receipt is absent or not PASS; the marker is found in
    `/proc/1/environ`.
  - **Measured in round 45.** On p44d (`32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs`) all four guards print
    FAIL, exit 1 (CtlQ31GuardShortcut, `p44d_fails=4/4`). No runner exists yet (attempt-1 seat ExecCounterSandbox
    died without a report and was not resent), so no counter can pass Q31 until a runner and its selftest land.
  - **Known residual channels (SentinelBwrapEnvI).** Even with `env -i` and `--clearenv`, sandboxed code can read
    `/proc/1/cmdline` (bwrap's argv), inherited file descriptors (fds pointing at the launcher's tty) and any
    explicitly bound runtime directory. A runner passes no secret in argv, closes inherited fds or runs with
    `--new-session`, and binds no `/run` or `$XDG_RUNTIME_DIR`.

- **Q32 — every corpus note has a README row at every round commit, including non-author closure files.** Mined in
  round 45 (`corpus/lessons/round-45.md` § Mistakes): eight round-open receipts (rounds 35, 36, 40–45) record a
  `C2_TOTAL_DRIFT` caused by the previous round's `round-<N-1>-verifier-spotcheck.md` landing without a README row
  (seat ScoutDriftCause). The non-author file is never edited; the lane adds its README row in the round's first
  lane commit that touches `corpus/`.
  - **Who checks.** The L1 at each corpus commit; the non-author closure at the round tip.
  - **Command.** Prints every note without a row, exits 1 if any:
    ```sh
    REV=<lane commit>; export LC_ALL=C
    out=$(comm -23 <(git -C "$L" ls-tree -r --name-only "$REV" corpus/knowledge corpus/lessons | grep '\.md$' | sed 's#^corpus/##' | sort) \
      <(git -C "$L" show "$REV":corpus/README.md | grep -oE '^\| `(knowledge|lessons)/[^`]+`' | sed 's/^| `//; s/`$//' | sort -u))
    [ -z "$out" ] || { printf '%s\n' "$out"; echo 'Q32: FAIL note without README row'; exit 1; }
    ```
  - **Fails when.** Any line prints.
  - **Shown able to fail.** At `3632602c` it prints `lessons/round-44-verifier-spotcheck.md`; at `6cda8c35` it
    prints `lessons/round-43-verifier-spotcheck.md` (L1 runs, round 45).

- **Round-45 attempt-3 replay notes on Q30–Q32 (history replays in wave `a3-falsify`; the criteria above are not
  reworded).**
  - **Q30 — fixed CLEAN cases always recur (ReplayQ30History).** Run as written on the round-44 counters, p44
    (`361d4492`) and p44b (`292d9266`) exit 2 (their CLI has no `--seed`, and without it the listing cannot be rebuilt:
    `reconstructed 38 entries, listing says 39`); p44c (`28e29bbe`) reads `CATALOG: REUSED (clean=19 recurring=9)`,
    exit 1. The nine recurring ids are the seed-independent fixed shapes (`control`, `control-end`, `no-chains`,
    `no-sidecars`, five `src:*`), and an alternate seed pair returns the same nine. So any counter with one fixed CLEAN
    case (an unmodified root, a sourced reference shape) reads `REUSED` whatever its other cases do: as written Q30
    cannot pass a counter that keeps a do-nothing CLEAN case. Reading from round 46, until the script gains an
    allow-list: the frozen plan names its fixed CLEAN case ids before the run; `REUSED` passes only when every recurring
    id is in that list and the non-fixed CLEAN cases number at least the counter's floor; any other recurring id fails.
    That reading is checked by hand against the script's printed ids.
  - **Q31 — the source greps are blind out of sample (Q31OutOfSample).** On 34 real launchers (lane scripts, round
    probes, tameshi runners) the four greps gave 11 false passes and 3 false fails; a mutant that spreads
    `...process.env` into `claims-check.mjs`'s child environment survived the environment grep while a behavioural
    marker probe caught it (`ENV_BUILDER: FAIL MARKER present`). The selftest clause of **Fails when** is the criterion;
    the greps are a reminder list and never pass or fail a runner on their own.
  - **Q32 — replay agrees (ReplayQ32History).** Over the 22 round boundaries of rounds 35–45 every base fails with
    exactly the previous round's `round-<N-1>-verifier-spotcheck.md` and every tip passes; against the eight recorded
    round-open proxy receipts, 0 false negatives and 0 false positives; over 96 commits Q32 fails at exactly the 31
    where declared and computed `C2_total` differ. Limits: Q32 checks that a row exists, not that the declared total
    matches (a declared-only drift passes Q32), and it does not detect phantom or duplicate rows (a row whose note no longer exists); a note renamed with its row
    left behind does fail Q32 while the proxy reads MATCH.
  - **Revision after residual review (RevQualityNotes; the bullets above stay as written).** (1) The Q30 fixed-case
    reading above is gameable: declaring every CLEAN case "fixed" satisfies it, and "the counter's floor" is defined
    nowhere in this file. Bounded reading from round 46: at most **two** fixed CLEAN ids, each named in the frozen plan
    with the reason it cannot vary (an unmodified root, one sourced reference shape); at least **20** non-fixed CLEAN
    cases (round 44's case floor); any recurring id outside the named pair fails; the junk-variation control of the
    Field still has to read the counter's failure verdict. (2) The Q31 sentence "never pass or fail a runner on their
    own" narrowed **Fails when**: a printed guard line still fails the runner as Q31 states; the greps never pass a
    runner without the behavioural selftest, and the three false fails above are recorded so a runner can avoid those
    spellings (shell `env -i`, Python `env=`, a multiline `process.once` loop).

Q33–Q34 and the frozen-checklist rule were added in round 46 (routed defects D2 and D4 of
`corpus/lessons/round-45-verifier-spotcheck.md` § 5) and are in force from round 47. Drafts: scribe ScribeQuality;
commands and their fail/pass runs: executor ExecQualityFailCmds (`.ufo/waves/round-46/build/`).

- **Q33 — a SOURCES row's `teaches` is checked against every locator in its anchor cell before the entry commit.**
  Grounding: the K3′ ruling on S073 and D2 (`corpus/lessons/round-45-verifier-spotcheck.md:61-71,123-125`).
  - **Who checks.** The entry author checks every locator before committing the entry. A non-author re-opens every
    row's quote and `teaches` cell before the freeze (round 46 did this for all 77 rows: the `Sweep*` receipts in
    `.ufo/waves/round-46/build/`).
  - **Field.** Open every locator in the anchor cell. Check each clause of the `teaches` cell against the located
    bytes, and record which locator supports it. Narrow or split an unsupported clause before the commit. One locator
    never stands in for another.
  - **Command** (a tripwire over committed check lines; it proves a check was recorded, not that it was right):
    ```sh
    .ufo/waves/round-46/quality/q33-locator-coverage.sh <lane> <rev> corpus/lessons/round-<N>.md
    ```
    For each row admitted in the lesson's `## Gate`, every anchor locator must be co-named with the row id in a
    committed check line (the lesson or a `.ufo/**/*.md` receipt). `Q33 FAIL`, exit 1, on any uncovered locator.
  - **Fails when.** The command prints `Q33 UNCOVERED`; or a re-open finds a clause that no locator states.
  - **Shown able to fail.** At `6b2a4517` with `corpus/lessons/round-45.md`: `Q33 UNCOVERED S073
    anchor-locators-checked=1/4 missing=[buffer.html,getrlimit,prlimit]` (also S068 1/5, S072 2/3), exit 1; on a
    fixture where both locators of one row are checked: `Q33 COVERED S901 locators=2/2`, exit 0.
  - **Limit.** The locator tokenizer is heuristic: an anchor that names only sections yields zero locators and passes
    trivially, so the re-open half of **Fails when** carries those rows.

- **Q34 — a guard prescribed in an entry or a wave context is byte-identical to the guard in the receipt that
  tested it.** Grounding: D4 and erratum X4 (`corpus/lessons/round-45-verifier-spotcheck.md:38-43,128-130`;
  `.ufo/waves/round-45/a3-falsify/AblScrubRow.md`).
  - **Who checks.** The author copies the tested bytes and cites the receipt. A non-author compares the two before
    the freeze.
  - **Field.** Copy the whole tested guard, quoting, redirections and wrapper arguments included. If any byte changes,
    re-test the changed guard and cite the new receipt.
  - **Command.**
    ```sh
    .ufo/waves/round-46/quality/q34-guard-bytecmp.sh <entry-file> <row-ere> <receipt-file> [guard-ere]
    ```
    Prescribed = the longest backtick span on the matched table row; tested = the first fenced-block line of the
    receipt matching the guard pattern; `cmp`. `Q34 FAIL`, exit 1, on any difference.
  - **Fails when.** `Q34 MISMATCH`; no receipt is cited; the cited receipt does not contain the guard.
  - **Shown able to fail.** Entry row 3 at `6b2a4517` against the receipt `SentinelSeatEnvScrub.md`:
    `Q34 MISMATCH … (212B) vs (306B)`, differing at byte 3, exit 1; a fixture with the same 54-byte guard on both sides:
    `Q34 IDENTICAL`, exit 0.
  - **Limit.** One span per row: a row that prescribes two guards needs one run per guard.

- **Frozen-checklist rule (D2).** Every item of a frozen claim checklist states, before the freeze, whether an
  appended erratum can cure its failure, and if so what qualifies. An item that states nothing is not curable. A later
  correction never changes an item's frozen failure, and no item borrows another item's erratum clause. Round 46 has
  no prose checklist: both obligations of its claim are counters (`.ufo/waves/round-46/plan.md` § A2/A3), and their
  kill rule admits no erratum.

Q35 was added in round 47 (routed defect R46-1 of `corpus/lessons/round-46-verifier-spotcheck.md`).

- **Q35 — an existing `SOURCES.md` row is append-only except for `status`, `recheck` and `used-by`.** Grounding: fleet
  `CORPUS.md:116-118` Rule 2 and R46-1: round 46 rewrote 13 existing rows in place without `supersedes` rows.
  - **Who checks.** The author runs the comparison from the revision before the round's first registry edit to the
    candidate before committing a correction. A non-author checks the same receipt at close and confirms that each
    correction is a new row whose `teaches` opens `supersedes S0NN —`.
  - **Field.** For every registry id present at base, the cells `id`, `source`, `kind`, `tier`, `scope`, `anchor`,
    `teaches` and `opened` stay byte-identical at tip (padding trimmed); a removed base row also fails. Only `status`,
    `recheck` and `used-by` may change in place.
  - **Command.**
    ```sh
    .ufo/waves/round-47/quality/q35-append-only.sh <lane> <base-rev> <tip-rev>
    ```
    It reads committed `corpus/SOURCES.md` at both revisions and prints `Q35 rewritten=<n> removed=<m>` plus one line
    per offending id; exit 1 when n+m>0, 0 when clean, 2 on usage or Git errors.
  - **Fails when.** Any frozen cell differs or a base row is removed; no receipt is cited.
  - **Shown able to fail.** `2b2bf7bb 9b33e03e` → `Q35 rewritten=13 removed=0` (S003, S004, S013, S041, S047,
    S051–S055, S061, S073, S076), exit 1; sandbox fixtures: a `teaches` edit and an `opened` edit exit 1, a row removal
    exits 1, a `used-by` edit, an appended `supersedes` row and padding only exit 0
    (`.ufo/waves/round-47/build/ExecQ35AppendOnly.md`).
  - **Limit.** Committed revisions only, keyed by id; it does not judge whether a `supersedes` row is correct — the
    non-author re-open does. A restoration of rewritten rows (round 47) reads as rewritten against the revision that
    carried the rewrite; run it against the revision before the rewrite (`2b2bf7bb` for round 46's).
- **Q36 (round 48, 2026-10-23; amended wording per `r48/ReviewQualityDraft.md`).** A frozen-counter success verdict is scoreable only with N≥2 committed receipts for the same frozen command/revision, every run exit 0 with byte-identical success summaries, complete trace parsing/pairing, and per-site counts equal to the plan-pinned base counts; otherwise no success verdict is scoreable. Command: the receipt pair is re-derived by re-running the frozen command; shown able to fail: the r47 A2 re-runs at f00cf278 (`r48/ScribeReceipts-a2-rerun-{1,2,3}.txt`, 3/5, 3/5, 4/5) score nothing.
- **Q37 (round 48, 2026-10-23).** Wave-seat receipts are claims until the L1 recomputes their bytes: the L1-owned manifest `.ufo/waves/round-48/r48/L1-receipts.sha256` binds every wave/close receipt at integration; 0-byte or trailer-less receipts count as claims only (SentinelReceipt; the 0-byte class observed live by MutRunnerLooseMem).

Q38 was added in round 49 (C2; the doctrine entry is the first object it judges).

- **Q38 — a knowledge entry's clause is bound to a committed receipt by content hash, and the entry scores only when a
  frozen probe verifies every binding at the scored revision.** Grounding: the round-48 discipline lived in
  round-scoped receipts and scorecard prose; `corpus/knowledge/counter-amendment-discipline.md` states it as clauses
  whose evidence is a sha256 token.
  - **Who checks.** The author writes each clause with a `receipt:<repo-path>@sha256:<64 hex>` token computed from the
    committed blob; the C2 probe verifies all of them at the scored revision, and a non-author re-reads the prose
    against the receipts.
  - **Field.** One token per clause line; the token names a path under a frozen round directory (never the lane's
    moving documents, whose hash changes at the next edit).
  - **Command.**
    ```sh
    node .ufo/waves/round-49/probe/doctrine49-probe.mjs <lane> <rev> [--file <entry>]
    ```
    It prints `DOCTRINE49: HELD clauses=<n>/<n> rows=<m> entry_sha256=<sha>` exit 0, or `DOCTRINE49: UNMET reason=…`
    exit 1; floors `clauses>=10`, `rows>=2` with status `mined`; exit 2 on an unreadable revision.
  - **Fails when.** Any token's hash differs or its path is absent; any cited row is not `mined`; the clause or row
    floor is missed.
  - **Shown able to fail.** At `589d25e4` the entry reads `HELD clauses=15/15 rows=3` exit 0; the same entry with one
    hex digit changed reads `UNMET reason=receipts misses=.ufo/waves/round-48/plan.md=hash-mismatch(6faa34ab!=6faa34ab)`
    exit 1 (`.ufo/waves/round-49/r49/C2-doctored-control-589d25e4*.txt`).
  - **Limit.** The probe checks binding, not truth: a well-bound false clause passes, and the non-author re-read
    carries that half. `--file` verifies a worktree entry against a revision's receipts, so it is a control mode, not
    a scoring mode.

Q39–Q41 were added in round 50 (r49 verifier-spotcheck defects 4–5 and the R50-6 bind-view finding;
`corpus/lessons/round-50.md` M2–M4).

- **Q39 — a claim of time-spaced re-runs needs a distinct, captured invocation receipt for each run.**
  Grounding: the three round-49 C1 receipts have one sha256 (`corpus/lessons/round-49-verifier-spotcheck.md:63-66`),
  so their bytes do not establish the report's “three time-spaced runs”.
  - **Who checks.** The author records the UTC start time, exact command, output and exit code in each
    separate receipt. The non-author compares hashes and re-derives the timestamp span from those receipts.
  - **Field.** Each receipt begins with `run-at=<ISO-8601 UTC>`; hashes must be distinct and the elapsed span
    must meet the round's pre-registered minimum. Identical output-only receipts do not establish
    independent invocations; genuine deterministic runs can emit identical output.
  - **Command.** `node .ufo/waves/round-50/probe/repairs50-probe.mjs <lane> <rev> --fleet <fleet>` (R4).
  - **Fails when.** A timestamp is absent/unparseable, any bytes repeat, any run fails, or the measured span
    is below the frozen minimum.
  - **Shown able to fail.** Round-49 `sha256sum r49/L1-score-0526f898.txt r49/ReRunCounter49-2.txt
    r49/ReRunCounter49-3.txt` → `03a258d6…` ×3; the round-50 control is `R4 MISS files=0`
    (`.ufo/waves/round-50/controls/CtlR50-base-ff40d7d-r2.txt`).
  - **Limit.** `run-at` is captured evidence, not a cryptographic timestamp, and `CritB49CounterAttack`
    executed this frozen R4 block in memory over one old deterministic body with three rewritten preludes:
    `PASS files=3 distinct=3 held=3 span_s=600`, `body_distinct=1` — a prelude-only replay satisfies R4.
    The receipts are author-attested invocation records; defeating a forger needs a separately frozen
    captured-invocation design, not a text check.

- **Q40 — a runner must not rebind a sandbox-managed mount root, explicitly or through its implicit cwd bind.**
  Grounding: S095 says filesystem actions apply in argument order; `ScoutCapRunVisibility` found that
  `--bind /tmp /tmp` after `--tmpfs /tmp` re-exposes host `/tmp`, and `LabratSystemd` reproduced the same
  escape through cap-run's automatic `--bind cwd cwd` when cwd was `/tmp` (`corpus/lessons/round-50.md` M4).
  - **Who checks.** The author guards both the parsed bind and the implicit cwd path; the hermetic suite checks
    both surfaces, and the L1 re-runs G50 at the committed candidate.
  - **Field.** Explicit whole-root binds and cwd resolved to `/`, `/tmp`, `/proc`, `/sys`, `/dev` or `/run`
    exit 64 before a child runs; a bind of a real subdirectory under `/tmp` still works.
  - **Command.** `node scripts/cap-run.mjs --selftest`; `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> <rev>` (G2/G3/G4).
  - **Fails when.** Any protected root reaches the child, a legal `/tmp` subdirectory bind is refused, or G50
    is not `GUARD_HELD`.
  - **Shown able to fail.** The pre-guard child wrote `/tmp/r50-host-tmp-exposed` through `--bind /tmp`
    (`.ufo/waves/round-50/controls/CtlExposure-base-ff40d7d.txt`); `LabratSystemd.md` reproduced a host write
    from cwd `/tmp`; base G50 read `GUARD_UNMET held=5/8` (`CtlG50-base-ff40d7d-r1.txt`).
  - **Limit.** This guards cap-run's own API, not direct bwrap callers.

- **Q41 — every gate-count sentence in the SKILL registry is reconciled against the `kind=gate` rows.**
  Grounding: the r49 non-author closure found `Twelve are gates` beside two stale “all eleven” sentences
  (`corpus/lessons/round-49-verifier-spotcheck.md:144-145`).
  - **Who checks.** The author counts the registry's `gate` rows and searches every prose count in the same
    section; a non-author compares the count and the full search output before closure.
  - **Field.** `grep -c '| gate |' SKILL.md` is the row count; `grep -iEn 'eleven|twelve|[0-9]+ gates?' SKILL.md`
    enumerates the count assertions, case-insensitively, for comparison.
  - **Fails when.** A count differs from the registry rows or any stale occurrence survives the sweep.
  - **Shown able to fail.** At r49 open, the registry said Twelve while `SKILL.md:595` and `:598` each said
    “all eleven”; the exact conflicting lines are in the verifier-spotcheck artifact above.
  - **Limit.** The text sweep is scoped to `SKILL.md`; it does not discover count claims in other documents.
- **Q43 — a frozen counter is not frozen until it has been executed, and its declared
  controls must be executed against it.**
  Classes caught: unrun-check (A51 v1 could not parse; D51 v1 unsatisfiable — both found
  by seats within minutes of wave 1), vacuous kill rule (the plan's "a stub cannot clear
  A1/A3" fell to a print-stub; the full-tree forger scored held=5/5).
  Fix: at freeze time the L1 runs the counter at base and commits the receipt
  (`base/attest-base-v3r6.txt`, `held=0/9`); every freeze repair re-runs it; every declared
  do-nothing control is executed by a seat before data, not asserted. From round 51 on, a
  counter whose before-state receipt is absent from the freeze commit is a conformance
  defect, not a predicate.
  - **Fails when.** A freeze commit lacks the executed before-receipt, or a declared
    control was never run.
  - **Shown able to fail.** The round-51 wave-1 seats: two independent findings for D51's
    index bug; CritC1's stub reading; RevCounterA's held=5/5 forger.
  - **Limit.** The rule binds the L1's freeze discipline; it does not make static arms
    unforgeable (see round-51 report, forgery boundary). Enforcement is MANUAL — the L1
    commits the before-receipt at freeze and the non-author closure verifies it; no lane
    gate mechanically rejects a freeze commit that lacks one (seat CritQ43, round 51).
- **Q44 — a round's FINAL claim receipt must be executed against the measured close
  revision it cites, and the receipt commit must carry an idempotence re-run.**
  Classes caught: receipt-rev ≠ cited-rev (R52-11: round-51's FINAL receipt cites
  `57333ead`, was committed at `cb6c472` — one commit after the measured close rev
  `fef67079` and two after the rev it cites — and no A51/D51 receipt exists at
  `fef67079`, so the 9/9 filed there was compositional); compositional citation
  masquerading as measured (the same 655-byte FINAL file joins a rev-bound `held=8/9`
  line whose A5 records `PROXY: DRIFT … declared=81 computed=71` with an un-rev-bound
  `PROXY: MATCH (A=81 …)` line — at the rev it names `SCORECARD.md` declares A=81
  against a computed 71, and at `fef67079` it declares A=71, so no committed tree
  yields that MATCH [INFERENCE: the transient seat scratch named by commit `fef6707`]).
  Fix: the R52-11 close sequence (round-52 plan `## Close sequence`). R1 is the
  integration tip; A52 and D52 run against R1 and both receipts are committed as
  `close/FINAL-<R1>.txt`. R2 is that receipt commit; both counters re-run against R2
  and the transcript is committed as `close/IDEMPOTENCE-<R2>.txt` (R3). The report and
  SCORECARD cite measured close revision R1, name R2/R3 as the receipt/idempotence
  commits, and quote the committed FINAL verdict line verbatim — the cited rev and the
  receipt rev are the same tree by construction, and the tip carries a re-run against
  its own bytes.
  - **Fails when.** The FINAL verdict's `rev=` is not the cited close revision; no
    receipt file exists at the cited rev; one transcript mixes lines from different
    tree states (an un-rev-bound line, or a line contradicting the stanza declared at
    the rev it names); the receipt commit carries no idempotence transcript; a FINAL
    line is re-wrapped or truncated mid-token.
  - **Shown able to fail.** Round-51's own FINAL receipt:
    `.ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt`
    (`sha256 0c1f9b22…`, 6 lines / 655 bytes) reads
    `ATTEST51: ATTEST_UNMET held=8/9 … rev=57333ead…` and was added by `cb6c472`.
    `grep -rn 'rev=fef67079' .ufo/waves/round-51` prints nothing and
    `find .ufo/waves/round-51 -iname '*idempot*'` prints nothing; its line 1 is 280
    bytes and ends mid-word at `delt`. The spotcheck files the route itself
    (`corpus/lessons/round-51-verifier-spotcheck.md:71`).
  - **Limit.** `rev=` is a self-declared field: this binds rev identity, file presence
    and transcript consistency, not byte provenance, and a forger who writes a
    receipt-shaped file naming the right rev still passes (the r49 forgery boundary);
    only a probe-emitted digest-bound receipt (A52's B2 arm class) narrows that.
    Enforcement is MANUAL — the L1 runs both counters at R1, commits FINAL and
    IDEMPOTENCE, and the non-author closure compares cited rev to receipt rev and the
    receipt commit to the transcript; no lane gate mechanically rejects a close commit
    whose FINAL receipt cites another revision (seat ScribeQuality, round 52).

- **Q45 — a pending non-author spot-check pointer is closed by an append-only named correction when its separate artifact lands.** Grounding: `corpus/lessons/round-53.md`'s `## Gate` still said `<pending>` after the non-author re-open had landed separately in `corpus/lessons/round-53-verifier-spotcheck.md` §3 (R53-1 in this round's `corpus/lessons/round-54.md`).
  - **Who checks.** In the next lane round, the author appends a correction naming the committed spot-check artifact and its verdict; the non-author confirms that both the pointer and the verdict resolve. The original pending line stays unchanged.
  - **Field.** One appended `## Gate correction (round N)` section names the artifact, section, sampled admits/rejects and `AGREE`/`DISAGREE` with reason; it never rewrites the old `## Gate` text.
  - **Command.** `grep -nE 'round-53-verifier-spotcheck\.md.*AGREE|AGREE.*round-53-verifier-spotcheck\.md' corpus/lessons/round-53.md` → the appended correction line.
  - **Fails when.** At the round-53 base `383ad787`, `grep -n '<pending' corpus/lessons/round-53.md` finds the open marker while `grep -n 'round-53-verifier-spotcheck.md' corpus/lessons/round-53.md` finds nothing, despite the separate check artifact; the correction is still required even when the reviewer artifact already exists.
  - **Shown able to fail.** Base `383ad787`: the Gate line is `<pending>` and the pointer sweep is empty; this round appends the round-54 Gate correction pointing at the non-author §3 source re-open, without changing the old line.
  - **Limit.** The command checks the durable pointer and verdict text, not whether the named reviewer actually re-opened the evidence; the non-author re-reads the cited artifact.

- **Q46 — an opened SOURCES row is bound to committed capture bytes (or an explicit exemption); a URL alone is not a resolvable location at closure.** Grounding: `corpus/lessons/round-54-verifier-spotcheck.md` §5 item 1 (routed defect R54-C1): S108's reject rested on bytes that were never committed, so a non-author could not re-open the adjudicated evidence.
  - **Who checks.** The `source-capture` gate (`node scripts/source-capture.mjs`, contract `kumitate-source-capture-v1`) verifies it mechanically: every `S###` row in `corpus/SOURCES.md` must resolve to exactly one binding — a `.ufo/pins/source-captures.json` capture (committed bytes + sha256 + byte size + capture date) or an exemption naming the reason — and no binding may name a row that does not exist.
  - **Command.** `node scripts/source-capture.mjs` → exit 0 + `SOURCE_CAPTURE: CLEAN captures=<n> exemptions=<m>`; `node scripts/source-capture.mjs --selftest` → `SOURCE_CAPTURE_SELFTEST: PASS (13/13)`.
  - **Fails when.** Any S### row is uncaptured and unexempted; a capture's bytes are absent, symlinked, hash- or size-mismatched, or escape the registry base; a binding names a row that does not exist; the registry is malformed (duplicate sourceId, capture+exemption conflict, version ≠ 1) — the last is FAIL-CLOSED, could-not-evaluate, never CLEAN.
  - **Shown able to fail.** At base `c562d28` the registry and gate did not exist and `node scripts/source-capture.mjs` exited non-zero; the gate's 13-case hermetic selftest fires each drift arm (capture-absent, hash-mismatch, not-a-regular-file, bytes-mismatch, path-escape, uncaptured, orphan-capture, captures-empty) and each fail-closed arm (malformed/version/dup/conflict/unreadable-sources) once.
  - **Limit.** The gate binds bytes and identity, not truth: a committed capture could still mis-quote the source (the non-author re-read carries that half); pre-rule rows S001–S107 are exempt by declaration, not proof their bytes were ever read.

- **Q47 — a SOURCES duplicate-URL group exists only as a pinned `known` entry.** Grounding: the maintained census (`scripts/sources-census.sh validate`) reports W04 same-URL-across-scopes as a *warning* that never gates, so the lane's registry drifted to four live duplicate groups (S023+S034, S047+S084, S060+S068, S069+S095) — each a source admitted twice under different scopes, splitting which row is authoritative. Routed-adjacent class of R55-V2 (a number or set the lane asserts must be re-derived over committed bytes, and the assertion itself must become mechanical where it recurs).
  - **Who checks.** The `source-dupes` gate (`node scripts/source-dupes.mjs`, contract `kumitate-source-dupes-v1`) verifies it mechanically: the live duplicate-group set computed over `corpus/SOURCES.md` Registry rows must equal the pinned `known` set in `.ufo/pins/source-dupes.json` — new group = DRIFT `new-duplicate`, resolved group = DRIFT `stale-known` until its pin is removed, member/url shape mismatch = DRIFT `known-mismatch`, malformed pin set = FAIL-CLOSED.
  - **Command.** `node scripts/source-dupes.mjs` → exit 0 + `SOURCE_DUPES: CLEAN groups=<n> known=<n>`; `node scripts/source-dupes.mjs --selftest` → `SOURCE_DUPES_SELFTEST: PASS (12/12)`.
  - **Fails when.** A new `S###` row re-uses an already-registered URL under a different scope; a pinned group's members are edited so it stops duplicating without the pin being retired; a `known` entry's ids/url do not match the live group it covers; the registry is malformed, version ≠ 1, or a row id is covered by two pins.
  - **Shown able to fail.** The gate's 12-case hermetic selftest fires each arm (new-duplicate, stale-known, known-mismatch, known-url-mismatch, empty-known-with-live-dup, empty-clean, normalization parity, malformed JSON, version ≠ 1, overlapping pins, sources absent). Live: at round-56 open the census printed exactly the four pinned W04 groups and `node scripts/source-dupes.mjs` reads `CLEAN groups=4 known=4`.
  - **Limit.** The gate pins the *set*, not the rightness of keeping a duplicate: resolving a pinned group is deliberate lane work (supersede or re-anchor one row, then remove the pin) — the gate enforces that the resolution is visible, not that it happens fast.

- **Q48 — a corpus file lands only with its `corpus/README.md` map row and its `covered` pin, in the same change.** Grounding: `corpus/lessons/round-56-verifier-spotcheck.md` §6 routed defect R56-V3 — the third recurrence (r52, r55, r56 verifier spotchecks) of a corpus file landing post-close without a coverage-map row; the count-only C2 term in `proxy-check` caught the drift one count at a time and could not name WHICH file lacked a row.
  - **Who checks.** The `readme-map` gate (`node scripts/readme-map.mjs`, contract `kumitate-readme-map-v1`) verifies it mechanically: the live bimap over `corpus/knowledge` + `corpus/lessons` must satisfy three conjuncts — every `*.md` carries exactly one `| `path` |` README row, every such row names a live file, and every live file is pinned in `.ufo/pins/readme-map.json`'s `covered` set; `uncovered` / `orphan-row` / `duplicate-row` / `format-unmapped` / `stale-covered` / `unpinned` are DRIFT, a malformed registry/README/corpus-dir is FAIL-CLOSED.
  - **Command.** `node scripts/readme-map.mjs` → exit 0 + `README_MAP: CLEAN files=<n> rows=<n> covered=<n>`; `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (14/14)`.
  - **Fails when.** A corpus file lands without a row or a pin; a row names a deleted file; a path is double-mapped; a covered file loses its row or disappears; the registry is malformed, version ≠ 1, or a covered entry leaves the `knowledge|lessons` namespace.
  - **Shown able to fail.** The gate's 14-case hermetic selftest fires each arm (clean, uncovered, orphan-row, duplicate-row, format-unmapped, stale-covered, unpinned, empty-covered, malformed registry, version ≠ 1, covered-scope escape, README absent, corpus dir missing, non-corpus rows ignored). Live at round-57 base `7178bfd3`: the r56 verifier spotcheck file was `uncovered` — recomputed by `comm` over `find corpus/… -name '*.md'` vs README rows, 133 files / 132 rows; the row is added this round and the gate reads `CLEAN files=135 rows=135 covered=135`.
  - **Limit.** The gate binds the mapping, not the row's content: a row that exists but mis-describes its file is still CLEAN — description truth stays a reviewer/spot-check concern, same boundary the census keeps between well-formedness and taste.

- **Q49 — an admitted source's pinned capture is re-fetchable from outside the fleet's own verifier, and the re-fetch is recorded.** Grounding: `considerthese/2026-10-24.md` §Self-improvement ideas item 4 (independent source re-fetch — "a check outside the fleet's own verifier"), taken as the round's one considerthese proposal and grounded by demonstration, not by the reflection's say-so.
  - **Who checks.** The lane at round close (or the non-author spot-check): re-fetch one admitted source's URL live, sha256 the fresh bytes, and compare with the `.ufo/pins/source-captures.json` capture sha for that row; the located Gate quote is re-searched in the fresh bytes' tag-stripped normalized text. A source-capture gate CLEAN plus a byte-identical independent re-fetch is a two-observer claim; a drifted page is recorded as drift, never silently re-pinned in the same act.
  - **Command.** `curl -fsSL <url> -o /tmp/refetch.html && sha256sum /tmp/refetch.html` vs the row's capture sha; normalized quote search over the fresh bytes (python3 tag-strip). Round-58 demonstration (S122, 2026-10-24): fresh sha256 `ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41`, byte-identical to the pinned capture, 268296 bytes both, quote re-found.
  - **Fails when.** The URL no longer resolves; the fresh bytes' sha diverges from the pinned capture without the divergence being recorded; the located quote is absent from the fresh bytes' normalized text. A paywalled or vanished page fails the re-fetch arm honestly — the capture pin stands as the historical record and the drift is named.
  - **Shown able to fail.** The round-58 demonstration could have failed on all three arms (fetch, sha, quote); its passing output is recorded in `corpus/lessons/round-58.md` §considerthese. A synthetic divergence case is trivially constructible (flip one byte of the capture) and is the spot-check's cheapest re-derivation.
  - **Limit.** One source per round, sampled — this is a discernment tripwire, not a census; it binds nothing mechanically and does not replace `source-capture` (which binds committed bytes, not live truth).

- **Q50 — a tier or row count quoted in a lesson is the histogram re-derived from `corpus/SOURCES.md`, not a figure copied from a report.** Grounding: `considerthese/2026-10-24.md` item 1 (recount every number quoted), taken this round; the defect it would have caught is R58-V4 (the round-58 report said tier counts 96→99 A; the census histogram at that tip was A=102 B=13 C=8).
  - **Who checks.** The frozen counter `repair59-probe.mjs` arm B7: the lesson line `TIER59: A=<n> B=<n> C=<n> rows=<n>` must equal the probe's own count of registry rows at the measured rev.
  - **Command.** The probe, or the same split: a `| S### |` row's fourth cell is the tier. Round-59 after-state is `TIER59: A=104 B=14 C=8 rows=126`.
  - **Fails when.** The lesson line is absent, or any of the four integers disagrees with the registry at that rev. A hand-copied "96→99" fails.
  - **Shown able to fail.** At base `0f66ecd4` the lesson is absent, so B7 misses (`want TIER59: A=102 B=13 C=8 rows=123`). A one-integer lie in the line misses the same way.
  - **Limit.** It binds the one TIER59 line, not every number in the report. The report still has to quote the command.

- **Q51 — every lane commit between a round's base and its tip is named in that round's report's *Landed changes*, or an errata names it.** Grounding: `considerthese/2026-10-24.md` §Self-improvement ideas item 5 (post-report commit check — "diff the report's 'Landed changes' list against the commits between the round's base and the next spot-check, and list any unnamed commit"), taken as the round's one considerthese proposal and grounded by opening the instances it names (r49: `01b70bb`, `9237a72`, `c432cc9`; r55: `e7a0711`, `26c886d`, R55-V1 — bookkeeping commits the reports did not name), not by the reflection's say-so.
  - **Who checks.** The lane at round close: `git -C <lane> log --format=%H <base>..<tip>` against the hashes quoted in the fleet report's *Landed changes* section; the non-author spot-check repeats the comparison against the next spot-check's base.
  - **Command.** `git -C <lane> log --format=%H <base>..<tip>` and a grep of the report for each hash; a commit in the range with no name in the report is a defect.
  - **Fails when.** The range holds a commit the report does not name, and no errata names it either. The instances are real: the r49 and r55 reports each omitted bookkeeping commits the reflector had to list by hand.
  - **Shown able to fail.** Round-60's own range is the demonstration: the lane's report must name the freeze commit, the work commit, the wave-evidence commit and the close-receipt commit, and the count is re-derived from the range rather than asserted.
  - **Limit.** It binds the *naming* of commits, not their content, and it reads the report as filed bytes — a correction lands as an erratum appended after the filed bytes, never as a rewrite of them.

- **Q52 — every citation in a committed report, scorecard section or lesson names a real object (commit hash, file, line); a template token such as `__TIP__`, `__MEASURED__` or `__COMMITS__` is rejected.** Grounding: `corpus/lessons/round-60-verifier-spotcheck.md:171-174` (routed defect R60-V2) and its §1 row at `:26` — the filed round-60 report (`.ufo/reports/round-60/kumitate.md` at fleet commit `7b0581ed`) cites the lane tip, the measured revision and the third landed change by placeholder at lines 4, 5, 73, 88, 96 and 190, so none of those claims names an object a non-author can open.
  - **Who checks.** The lane before filing (report, the round's `SCORECARD.md` section, `corpus/lessons/round-<N>.md`); the non-author spot-check repeats it on the filed bytes. Verifier spot-check files are out of scope: they quote the tokens as the defect's subject, not as a citation.
  - **Command.** `grep -nE '__[A-Z][A-Z0-9_]*__' <file>` → empty; then every hex token cited as a commit resolves: `grep -oE '\b[0-9a-f]{7,40}\b' <file> | sort -u | while read h; do git -C <lane> cat-file -e "$h^{commit}" || echo "MISS $h"; done` → every `MISS` is a content digest found in `.ufo/pins/*.json`, never an unresolved commit; every cited path exists at the cited revision (`git cat-file -e <rev>:<path>`).
  - **Fails when.** Any template token survives into committed bytes; a hex token cited as a commit does not resolve and is not a pinned digest; a cited path is absent at the cited revision.
  - **Shown able to fail.** The round-60 report gives 6 placeholder hits (`grep -cE '__[A-Z][A-Z0-9_]*__'`). It still fails at lane HEAD `be4a820c`: the committed `SCORECARD.md` round-60 section keeps `__MEASURED__` at lines 2833 and 2847. Its hash half passes: 6 commit tokens resolve, and the one miss, `c7f7c401`, is the S126 capture's sha256 prefix, pinned twice in `.ufo/pins/source-captures.json`.
  - **Limit.** It binds the existence of a cited object, not whether that object supports the claim; that half belongs to Q53 and Q55. Filed bytes are never rewritten; a defect found after filing is repaired by an appended erratum that names the real objects.

- **Q53 — a report's claimed score equals its committed receipt and the round's `SCORECARD.md` section, for the same revision.** Grounding: `corpus/lessons/round-60-verifier-spotcheck.md:175-177` (routed defect R60-V3) and §2 at `:77-78` — the round-60 report's line 85 says the work commit `a745a3b0` reads `held=9/10`, "the only miss is A10", while the committed receipt `.ufo/waves/round-60/close/dispatch60-work.txt` and `SCORECARD.md:2830` both read `held=8/10` with A7 and A10 missed.
  - **Who checks.** The lane before filing; the non-author spot-check re-derives all three numbers from committed bytes and never accepts the report's own number.
  - **Command.** For each revision the report scores: `grep -oE 'held=[0-9]+/[0-9]+'` over the report's line for that revision, over the first line of the receipt it cites (`git show <tip>:<receipt>`, whose `rev=` field must equal that revision), and over the SCORECARD section's sentence for that revision → three identical `N/M` pairs. A miss list the report quotes ("the only miss is A10") must equal the receipt's `MISS` arms.
  - **Fails when.** Any of the three numbers differs, the receipt's `rev=` names another revision, the cited receipt is uncommitted, or the report's miss list omits a `MISS` arm in the receipt.
  - **Shown able to fail.** Round 60 at `165b8304` (the commit that landed the work receipt): report `held=9/10` (line 85) ≠ receipt `held=8/10 … rev=a745a3b0… | A7 MISS row-absent | A10 MISS exit=2` = `SCORECARD.md:2830` `held=8/10`; the report's miss list (A10 only) omits A7.
  - **Limit.** It binds agreement across the three artifacts, not the truth of the receipt; a receipt is evidence only when it was produced by the frozen command (Q43/Q44). When the receipt and the report disagree, the receipt wins and the report is corrected by an erratum.

- **Q54 — a claim that a wave was dispatched cites a committed dispatch record in the `dispatch-evidence` gate's schema, and every dead seat is named in the report with its last error text.** Grounding: `corpus/lessons/round-60-verifier-spotcheck.md:181-185` (routed defect R60-V5) and `:186-191` (R60-V6), with §2 at `:59-75`. Round 60 has no `dispatch-actual.json`. The launcher wrote `w1/swarm-registry.json`, whose `members` is an object with `agentId: null` on all 32 seats; the gate reads that as `REGISTRY_UNREADABLE:members-absent`, and its `NOT_A_DISPATCH` arm also applies. 27 of 32 seats settled `exit=-9 session=null`, and `w1-launcher.log` ends in a `ValueError` traceback, yet the report names no dead seat and says "the parent stayed alive until settlement" (line 10).
  - **Who checks.** The lane at round close; the non-author spot-check re-derives the dead set from `launcher-progress.tsv` at the committed tip.
  - **Command.** Schema half: `node scripts/dispatch-evidence.mjs --root <lane> --round <N> --wave <w>` → exit 0 `CLEAN` over committed bytes, which needs `.ufo/waves/round-<N>/<w>/dispatch-actual.json` with `members` as an array and a non-null `agentId` per dispatched seat. Without running the gate, use `jq -e '(.members|type=="array") and all(.members[]; .agentId != null)' dispatch-actual.json`. Dead-seat half: `awk -F'\t' '$4 != "exit=0" {print $1}' launcher-progress.tsv` gives the dead set, and each name must appear in the report as dead next to the text of its row's `err=` field. A launcher crash (`Traceback` in the launcher log) must be stated in the report.
  - **Fails when.** The dispatch record is absent, uncommitted or in another schema; any seat with `exit≠0` or `session=null` is missing from the report's dead list or has no error text; the report credits a dead seat; a launcher traceback goes unstated.
  - **Shown able to fail.** Round 60 at `165b8304`: `dispatch-actual.json` absent; `jq '.members|type' w1/swarm-registry.json` → `object`, non-null `agentId` count `0`; `awk` → `exit0=5 dead=27`. Of the 27 dead names, only `ConnectorSiblings` appears in the report at all, as a path to its seat report (line 198), not as dead; `w1-launcher.log:68` reads `ValueError: dictionary update sequence element #6 has length 1; 2 is required`.
  - **Limit.** The gate binds the record's shape and its agreement with the progress file. Whether the reported error text is the seat's real cause is still a reader's check against `<seat>.err` and the stream. A seat recorded dead after it committed useful bytes is still dead for crediting; its bytes count only where a live seat or the L1 re-derives them.

- **Q55 — a tip/after receipt cited by a report exists as a committed file at the measured revision's tip and carries the real observed line the report quotes.** Grounding: `corpus/lessons/round-60-verifier-spotcheck.md:178-180` (routed defect R60-V4) and §2 at `:67-69`. The round-60 report cites `close/dispatch60-tip.txt` and `close/doctrine60-tip.txt` (lines 89, 97) as the after-receipts for `DISPATCH60_HELD held=10/10` and `DOCTRINE60_HELD held=6/6`. Neither file existed anywhere in the repo at filing.
  - **Who checks.** The lane before filing; the non-author spot-check opens the receipt at the committed tip and never re-runs the counter to fill a gap.
  - **Command.** `git -C <lane> cat-file -e <tip>:<receipt>` → exit 0. The receipt's first line has `rev=<measured>`, where `<measured>` is the full hash the report names as its measured revision (not a placeholder, per Q52). The report's quoted after-line is a fixed-string substring of the receipt: `git show <tip>:<receipt> | grep -cF '<quoted line>'` → ≥ 1.
  - **Fails when.** The cited receipt is absent or uncommitted at the tip; its `rev=` differs from the report's measured revision; the report's quoted verdict, held count or exit code is not in the receipt's bytes.
  - **Shown able to fail.** At round-60 filing (`a745a3b0`, report `7b0581ed`) both cited receipts were absent (`find . -name '*tip.txt'` matched only rounds 36/41/51/57/58/59). Round 61 committed them in `be4a820c`, so the existence arm now passes. The content arm still fails for dispatch: `close/dispatch60-tip.txt` reads `DISPATCH60_UNMET held=8/10 … rev=a745a3b0…`, and `grep -cF 'DISPATCH60_HELD held=10/10'` → `0`, against the report's line 88. `close/doctrine60-tip.txt` carries `DOCTRINE60_HELD held=6/6 … rev=a745a3b0…`, which agrees with the report's held count. Its `rev=` match still cannot be checked, because the report's measured revision is `__MEASURED__`.
  - **Limit.** It binds the receipt to the report's quoted line and revision, not to a fresh run: the receipt must come from the frozen command (Q43/Q44) and be L1-bound (Q37). A receipt committed after filing repairs the citation only through an erratum that quotes the receipt's actual line, even when that line is worse than the claim.

- **Q56 — quarantine rows are bound to registry entries by document identity, never by numeric id.** Grounding: `corpus/lessons/round-61.md` §Mistakes (round 60 compared campaign ids from a separate namespace to lane ids and called rows "lane's own" without document matching).
  - **Who checks.** The lane before any quarantine disposition; a non-author spot-check re-opens the cited URL/DOI and compares it with the lane's source row.
  - **Command.** For each quarantine row, resolve its cited URL/DOI against `corpus/SOURCES.md` source cells and write `register-id → lane-id` or `no lane row` in the lesson; compare by normalized URL/DOI, not S-id equality.
  - **Fails when.** An id match is treated as document identity, or a shared document is missed because the two registries assigned different ids.
  - **Shown able to fail.** The round-60 lesson's S109/S116/S118 claim is false by document identity; round 61 maps register S109→lane S125, S118→lane S134 and S178→lane S194, while the ids themselves differ.
  - **Limit.** URL/DOI identity may miss source revisions or distinct claims on the same canonical URL; the lesson must still state scope and anchor.

- **Q57 — a frozen counter must reject a do-nothing control that skips the claimed activity, and must distinguish its honest-input control from an adversarial one.** Grounding: `corpus/lessons/round-61.md` §Mistakes (C1's fabricated zero-seat record reads HELD; C2's honest row misses while a forged record reads HELD).
  - **Who checks.** Before any seat scores, the lane freezes one positive control and one do-nothing/adversarial control; the non-author reviewer re-runs both against the same counter.
  - **Command.** Run the exact frozen counting command on the honest fixture and on the do-nothing fixture; record full verdict lines and exits in separate committed receipts.
  - **Fails when.** The do-nothing fixture reaches the declared HELD target, or the honest fixture cannot reach it under the frozen schema.
  - **Shown able to fail.** Round 61's `CritControlC1.md` reads `DISPATCH61_HELD held=4/4` for the zero-seat fabrication; `CritControlC2.md` reads 4/6 for honest work and 6/6 for a forged capture.
  - **Limit.** The controls test the declared predicate and its data path; they do not prove the external runtime's behavior unless the counter binds an independently emitted dispatch record.

- **Q58 — a round's `plan.md` is committed before that round's first wave marker, and the command that
  says so exits 0 for a closed round.** Grounding: `corpus/lessons/round-62-verifier-spotcheck.md`
  §Verdict (routed defect 1) — round 62 read "no 1–3 frozen claim sentences or counting predicates" in its prompt as "no
  claims declared" (`round-62-verifier-spotcheck.md:15`; routed defect 1 at `:57`) and filed a zero-claim round; it committed no `.ufo/waves/round-62/plan.md` at all,
  while `.ufo/waves/round-62/w2-dispatch.json` is committed at
  `6d8faede281e509a2201de504ffcb0f7781256fe`. Nothing in the lane could fail on that until this command
  existed. Measured at lane tip `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (2026-10-25):
  `--round 62` → exit 1 `reason=NO_PLAN`.
  - **Who checks.** The lane L1 before it commits a wave's `.ready`, and again at close; the non-author
    closure re-runs the command at the round's tip revision and pastes the full verdict line.
  - **Field.** `.ufo/waves/round-<N>/plan.md` committed; the oldest commit that adds it is an
    ancestor-or-equal of the oldest commit that adds a top-level `.ufo/waves/round-<N>/*.ready`
    (fallback, only when no `.ready` was ever added: a top-level `*-dispatch.json`), and its committer
    time is `<=` that marker's. Pathspecs are glob-restricted (`:(glob)`) so a nested fixture marker
    under `controls/` can never stand in for the round's marker.
  - **Command.** `bash scripts/plan-before-ready.sh --round <N> --rev <tip> --earliest-marker` (the strictest reading: the earlier of the first `.ready` and the first `*-dispatch.json`; without the flag a `*-dispatch.json` committed before the plan passes whenever a later `.ready` exists) → one line
    `PLAN_BEFORE_READY: PASS rev=<tip> round=<N> ... plan=<sha> marker=<sha>` and exit 0. Self-test of the
    command itself: `bash scripts/plan-before-ready.sh --selftest` →
    `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` exit 0. Standing sweep: `bash scripts/plan-before-ready.sh --all`.
  - **Fails when.** Exit 1: `NO_PLAN` (a marker is committed and the plan never was — round 62),
    `PLAN_NOT_ANCESTOR` (the marker commit precedes the plan commit — the wrong-order fixture), or
    `PLAN_CT_AFTER_MARKER`. Exit 2 is **not** a pass for a closed round: `NO_MARKER` means the round
    committed no wave marker at all, so the ordering was never demonstrated (round 63 at `b38a206`
    reads `NA reason=NO_MARKER` until wave 1's `.ready` is committed).
  - **Shown able to fail.** `--round 62 --rev dfa6fca8` → exit 1, `reason=NO_PLAN`, marker
    `6d8faede281e509a2201de504ffcb0f7781256fe`; the selftest case `wrong-order-ready-first` (a fixture repo the script builds itself; its commits are throwaway and not citable) → exit 1 `reason=PLAN_NOT_ANCESTOR`; `--all` at `b38a206` → exit 1 with
    `failed=35,36,37,38,39,40,62`.
  - **Epoch.** The first round with a committed `plan.md` is round 41 (`34fccc170c73264faf5c27aaf7650d3419765ae0`);
    rounds 35-40 predate the convention and `--all` reports them `NO_PLAN` by design. The criterion
    applies from round 41 onward; a pre-41 round is not re-judged. The same `--all` run reads `NA` for rounds
    49 and 52-60 (`NO_MARKER`: their waves ran but committed no top-level marker) — their ordering is never judged;
    there is no check that turns "closed round with reports and no marker" into FAIL.
  - **Limit.** A plan and a marker committed together (round 50: `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`
    adds both `plan.md` and `r50-dispatch.json`) reads PASS, which cannot distinguish a pre-dispatch
    freeze from a same-commit write after dispatch; pair it with the round's `base/` freeze receipt and
    with C1's `inline-dispatch-evidence` gate, which binds seats to records the lane does not author.
    Committer time is lane-controlled and is a secondary arm only — the ancestry test is the real one. A
    history rewrite that makes the plan an ancestor of the marker is invisible to ordering alone, so the
    closure must pin the tip hash it judged.

- **Q59 — a dispatch claim is backed by host records the lane does not author (per-seat session transcripts, the orchestrator dispatcher log, committed bytes only), and the dead-seat set read from the transcripts is named in the report.** Grounding: `corpus/lessons/round-60-verifier-spotcheck.md` R60-V5/V6 (`:181-191`) — round 60's registry read `NOT_A_DISPATCH`, 27/32 seats settled `exit=-9 session=null`, and the report named no dead seat — with `considerthese/2026-10-25.md` idea 3 (audit seat deaths).
  - **Who checks.** The lane at round close, after committing the wave's `<wave>.ready`, `<wave>.ready.dispatched`, `<wave>-dispatch.json`, `<wave>-results.json` and seat reports; the non-author spot-check re-runs the same gate against the same host records and re-derives the dead set from the transcripts, never from `results.json`.
  - **Command.** `node scripts/inline-dispatch-evidence.mjs --root <lane> --rev <tip> --round <N> --wave <w> --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md` → exit 0 `INLINE_DISPATCH: CLEAN (seats=… sessions=… done=… reports=… dead=…)`; when it also prints `DEAD <names>`, every name appears in the report beside its last error text.
  - **Fails when.** A seat's transcript is absent, foreign, ambiguous or shares a session id with another seat; a `spawned` or `done` log line is missing or its count disagrees; a seat report is absent, under 64 bytes or byte-identical to another's; a dead seat's name is absent from the `--report` file; the dispatch/ready/results/context disagree (`READY_MISMATCH`, `DISPATCH_MISMATCH`, `RESULTS_MISMATCH`, `PARENT_MISMATCH`, a `done` line twice); a transcript is corrupt (`SESSION_CORRUPT`) or fails a shape arm (`SESSION_HEADER`, `SESSION_TOOL_JOIN`, `SESSION_ROWGRAPH`, `SESSION_TIMELINE`, `SESSION_TEMPLATE`); the wave reads `NOT_A_DISPATCH` or fail-closed (`WAVE_ABSENT`, `REV_UNREADABLE`, `DISPATCH_UNREADABLE`, `RESULTS_UNREADABLE`, `SESSIONS_ROOT_ABSENT`, `LOG_UNREADABLE`). A dead seat's own missing report is not a finding (it is named, not credited). Relation to Q54: Q54 binds the launcher-era record; Q59 binds the inline-era host records and carries the dead-seat clause forward.
  - **Shown able to fail.** The 75 committed controls (`controls/inline/`, 14 at the freeze plus the wave-1 and wave-2 ratchet cases; see `.ufo/waves/round-63/controls/CHANGES-AFTER-FREEZE.md`) each exit as their `expect` names — `honest` → `CLEAN` exit 0, `forged-no-sessions` → `NOT_A_DISPATCH`, `cheap-40-seats` (a 40-seat forgery of five hand-written rows per seat) → `SESSION_TOOL_JOIN`, `session-id-dup` → `SESSION_ID_DUP`, `reports-28-bytes` → `REPORT_TINY`, `results-name-swap` → `RESULTS_MISMATCH`; the real-host sweep `controls/inline-real-hosts.txt` reads `CLEAN` on kengaku r35 build/falsify and mori r47 w2, `DRIFT` on older dispatcher generations.
  - **Limit.** The limit `plan.md` states: a lane that also writes faithful transcripts into the host session store and lines into the orchestrator's log defeats the gate; those two records live outside the repository and the non-author closure re-derives them. The `--report` arm is a substring test on a file read live from disk (not `git show REV:`), so a report that names a dead seat anywhere, even in a success roster, satisfies it; `finished()` counts a seat that yielded and has no `session_exit` row as finished (wave 1: 6 of 40 seats were still idle when the dispatcher settled the wave) and no committed control locks that choice. The committed controls do not exercise the `DEAD_UNNAMED` arm (they run without `--report`); that arm is shown only by the gate's `--selftest` (`dead-unnamed-in-report` → `DRIFT [DEAD_UNNAMED]`, `dead-named-in-report` → `CLEAN dead=1`).

- **Q60 — a round's plan is not frozen while `readme-map` is red at the commit that carries it.** Grounding: the
  R56-V3 `reference-drift` class at round start, not after close — round 63's verifier spot-check file landed
  without its `corpus/README.md` row (`corpus/lessons/round-63-verifier-spotcheck.md:87`, routed defect D1), so
  round 64's own plan commit reads `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2
  first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1 (`.ufo/waves/round-64/base/readme-map-before.txt`);
  `corpus/lessons/round-64.md` §Mistakes row 1 records the class (`reference-drift`, captured-by `readme-map`
  after the fact) with this criterion as its fix. Q48 catches the missing row at close; nothing caught it at the
  freeze until this arm existed.
  - **Who checks.** The lane L1 before it commits the round's `plan.md`; the non-author closure re-runs the
    command at the round's tip and pastes the full verdict line. It is Q58's command with one more arm, so it
    runs at the same two moments.
  - **Field.** `PLAN` = the oldest commit that adds `.ufo/waves/round-<N>/plan.md`
    (`git log --diff-filter=A --format=%H -- ':(glob).ufo/waves/round-<N>/plan.md'`). The map is judged at `PLAN`,
    over `git archive PLAN` extracted to a temp dir, never over the worktree and never over the tip: a later
    repair cannot make a red freeze green, and a tip read cannot make a green freeze red.
  - **Command.** `bash scripts/plan-before-ready.sh --round <N>` → `PLAN_BEFORE_READY: PASS rev=<tip> round=<N> …
    plan=<sha> … map=CLEAN files=<n> rows=<n> covered=<n>` exit 0 (for `<N> >= PBR_MAP_FROM`, default 65; for `<N> < PBR_MAP_FROM`, `map=SKIP reason=MAP_PRE_EPOCH_ROUND` unless `PBR_MAP_FROM=0` is set). The map arm runs `node scripts/readme-map.mjs`
    inside the archive of `plan=<sha>` and requires exit 0 plus `README_MAP: CLEAN`; a red map fails the round
    **before** the marker/ordering arms, so a round still in flight (plan committed, no `.ready` yet: the freeze
    moment) cannot read `NA` over a red map. Standing sweep: `--all` (and `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --all` for the historical pre-epoch audit).
  - **Fails when.** The archived gate reads DRIFT (`reason=MAP_DRIFT`, the line carries
    `map=DRIFT map_exit=1 map_first=<arm>:<path>`), FAIL-CLOSED (`reason=MAP_FAIL_CLOSED`), prints exit 0 without a
    `CLEAN` verdict (`reason=MAP_NO_VERDICT`), cannot run (`reason=MAP_UNRUNNABLE`), or the gate existed before
    `PLAN` yet is missing at `PLAN` (`reason=MAP_ABSENT`). Exit 2 is never a pass for a frozen plan. Q58's own arms
    (`NO_PLAN`, `PLAN_NOT_ANCESTOR`, `PLAN_CT_AFTER_MARKER`) still fail the same run.
  - **Shown able to fail.** Measured at lane freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` with the arm's
    draft (`build/K64ExecReadmeGuard/plan-before-ready.sh`, equivalent to `PBR_MAP_FROM=0`):
    round 64 → `PLAN_BEFORE_READY: FAIL … round=64 … reason=MAP_DRIFT plan=dd1a3e6f… marker=- … map=DRIFT
    map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md`, exit 1; round 63 → the same reason at
    its own plan `b38a2065ab8ac5b198f6569b9013d04411c3d40d`, `map_first=uncovered:lessons/round-62-verifier-spotcheck.md`.
    Under `PBR_MAP_FROM=0`, `--all` → `pass=10 fail=12 na=8 rounds=all(30) … failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64`, of which five are
    this arm: rounds 58, 60, 61, 63, 64 — four of the five on the *previous* round's spot-check file (58 is
    `orphan-row:lessons/round-58.md`, its own lesson). The pass side is live history too, not only a fixture:
    under `PBR_MAP_FROM=0`, round 57's plan `f0dc6d1160e66af65355bd353665adac22bbf4a9` reads `map=CLEAN files=135 rows=135 covered=135` and
    round 59's plan `c54943320249b76a7fef97404a50f130336e511c` reads `map=CLEAN files=141 rows=141 covered=141`
    (both `NA reason=NO_MARKER` for want of a wave marker, the map arm green). As landed at `2ed8a5f8`: `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 64` → `FAIL … reason=MAP_DRIFT` exit 1, default `--round 64` → `PASS … map=SKIP reason=MAP_PRE_EPOCH_ROUND` exit 0, default `--all` → `pass=13 fail=7 na=10 rounds=all(30) … failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60 map_red=` exit 1, selftest `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)` exit 0 (`.ufo/waves/round-64/build/K64ExecReadmeGuard/receipts/10-selftest.txt`, `.ufo/waves/round-64/build/K64R2ReviewQuality/receipts/plan-before-ready-r64.txt`). Draft-arm receipts: `build/K64ScribeQuality/q60-readme-map-at-plan-commit.txt`, `q60-draft-arm-run.txt`, `q60-draft-arm-sweep.txt`.
  - **Limit.** It binds the map, not the row's content (Q48's limit, unchanged): a row that exists but mis-describes
    its file is CLEAN. `covered` is lane-authored, so a plan commit that deletes a file *and* its row and its pin
    reads CLEAN — a drift tripwire, not a coverage proof. It judges the plan commit only; a corpus file that lands
    later in the round without its row is still Q48's catch at close. **The arm's own `--selftest` fires it:** `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)` (`MAP_FROM=0` inside `run_selftest`) includes a red-map fixture (`MAP_DRIFT`), a silent-zero counter (`MAP_NO_VERDICT`), a fail-closed counter (`MAP_FAIL_CLOSED`), a removed gate (`MAP_ABSENT`), a green fixture and a pre-epoch fixture (`map=SKIP reason=MAP_PRE_EPOCH`).
  - **Epoch.** Enforced from round 65 (`PBR_MAP_FROM`, default 65, in `scripts/plan-before-ready.sh`). By default (`PBR_MAP_FROM=65`), rounds 35–40 read `map=SKIP reason=NO_PLAN` and every round 41–64 with a committed `plan.md` short-circuits before `map_at_plan` with `map=SKIP reason=MAP_PRE_EPOCH_ROUND`, so default `--all` keeps Q58's historical verdicts (`pass=13 fail=7 na=10`). Round 64 is the RED-BEFORE case: its
    plan was frozen at `dd1a3e6f` over a red map before the arm existed, so `bash scripts/plan-before-ready.sh --round 64` reads
    `map=SKIP reason=MAP_PRE_EPOCH_ROUND` PASS by default (once `w1.ready` is committed; `NA reason=NO_MARKER` at `dd1a3e6f`) and `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 64` reads
    `FAIL reason=MAP_DRIFT … map_first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1 (named, not hidden by the epoch). Under `PBR_MAP_FROM=0`, rounds 35–40 read
    `map=SKIP reason=NO_PLAN` and rounds 41–56 `map=SKIP reason=MAP_PRE_EPOCH` (the gate post-dates their plans);
    rounds 49, 52–57 and 59 read `NA` for want of a wave marker, so the map arm is judged on seven historical rounds —
    57 and 59 CLEAN, 58, 60, 61, 63, 64 DRIFT. Those five keep their `MAP_DRIFT` verdict under `PBR_MAP_FROM=0` as historical evidence of
    the recurrence, not as retroactive rejection under the default epoch.
  - **Supersedes.** None. Q58's marker-ordering test, its selftest floor and its epoch are unchanged; Q48 stays the
    close-time gate.

- **Q61 — a round's report is diffed against the committed receipts it cites before it is filed, and the diff reads CLEAN.** Grounding: round-60's report as filed (fleet commit `7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b`, `.ufo/reports/round-60/kumitate.md`) carries six template tokens — `__TIP__` at line 4, `__MEASURED__` at 5, 88, 96, 190 and `__COMMITS__` at 73 — and line 88 reads `DISPATCH60_HELD held=10/10` while the lane's own committed receipt `.ufo/waves/round-60/close/dispatch60-tip.txt` reads `DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60` (R60-V2/V3/V4), with `considerthese/2026-10-25.md` idea 2 ("diff reports against receipts") and `corpus/lessons/round-64.md` §Mistakes row 2 (`unreceipted-tally`, `:13`) / §What round 64 changes (`:20`). Q52, Q53 and Q55 named those three defects one at a time and by hand; this is their mechanical counterpart, one command over the report's bytes.
  - **Who checks.** The lane before it files the round's report, and again before it commits the round's close receipts (the diff reads receipts at the tip, so a receipt that lands after filing must be re-diffed); the non-author spot-check re-runs the same command on the filed bytes and never accepts the report's own numbers.
  - **Command.** `node scripts/report-receipt-diff.mjs --lane <lane> --round <N> --report <file> --rev <lane tip>` → `REPORT_RECEIPT: CLEAN (round=<N> rev=<tip> bytes=<n>)` exit 0. DRIFT prints one line per finding and exits 1; exit 2 is fail-closed (unreadable report or rev); exit 64 is usage. Finding ids: `PLACEHOLDER`, `TALLY_UNRECEIPTED`, `TALLY_CHECKS_MISMATCH`, `RECEIPT_MISSING`, `RECEIPT_EMPTY`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT` (contract `kumitate-report-receipt-diff-v2`). `--fleet <dir>` adds the fleet repo to hash resolution.
  - **Fails when.** Any of the nine findings fires: a template token (`PLACEHOLDER`: `__name__`, `{{NAME}}`, `LANE_HASH`, `TBD`, `XXXX`, `to be filled`, `<measured>`/`<measured_rev>`/`<tip_hash>`/`<rev_hash>`/`<placeholder>`/`<tbd>`/`<todo>`); a labelled `<LABEL>_HELD|UNMET held=x/y` that no committed receipt line (or none of the receipts cited on the claim's own line) carries with the same label *and* the same x/y (`TALLY_UNRECEIPTED`); a claim's `checks=k` that disagrees with the receipt carrying that pair (`TALLY_CHECKS_MISMATCH`); a `.ufo/waves/round-<N>/(base|close)/<file>` path the report names that is absent at the rev, escapes with `..`, is a symlink, or is an empty dir/unmatched glob (`RECEIPT_MISSING`); a cited receipt that exists at the rev but has no non-whitespace bytes (`RECEIPT_EMPTY`); a 39- or 40-hex hash (outside URL path components) that resolves in neither repo (`HASH_DEAD`), or a 40-hex hash that resolves in the lane but is not an ancestor of the rev (`HASH_ORPHAN`); one of the six required headings (`Work performed`, `Landed changes`, `Before → after measurements`, `Sources & frontier`, `Trend verdicts`, `SHONEN`) absent outside fenced blocks (`SECTION_MISSING`); the `SHONEN` heading not occurring exactly once in prose or carrying fewer than four box markers inside its section (`SHONEN_COUNT`). A cited receipt that is missing is a finding even when the report's number happens to be right.
  - **Shown able to fail.** Run now at lane rev `dd1a3e6f`: the round-60 report as filed → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f… bytes=13611)` exit 1, with exactly six `PLACEHOLDER` lines and `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10` — matching an independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` of the same bytes (6); the round-63 report as filed (fleet `8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad`) → `REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f… bytes=17479)` exit 0. The v2 tool's `--selftest` reads `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit 0 (v1 at freeze read `PASS (20/20)` in `build/K64ScribeQuality/q61-r63-report-clean.txt`), and `.ufo/waves/round-64/controls/receipt/` holds 37 committed cases (16 frozen `c0-honest` … `c15-honest-two-receipts` plus 20 forgeries `k1`…`k20` and `c16`, `controls/CHANGES-AFTER-FREEZE.md`), each exiting as its `expect` names across 8 distinct finding ids. Receipts: `build/K64ScribeQuality/q61-r60-report-drift.txt`, `q61-r63-report-clean.txt` (v1), `build/K64R2ReviewQuality/receipts/q61-v2-selftest-and-controls.txt` (v2).
  - **Limit.** The tool's declared limits, restated and one of them measured: only labelled tallies are compared — a bare `held=9/10` cannot be told from a plan's target, so an unlabelled overstatement passes (probe now: a report whose body claims `held=9/10` twice, diffed against round 64's base receipt which reads `held=0/5`, returns `REPORT_RECEIPT: CLEAN (round=64 rev=dd1a3e6f… bytes=437)` exit 0 — `q61-cheap-lie-bare-tally.txt`), and a selftest tally like `PASS (69/69)` is likewise outside `<LABEL>_HELD|UNMET` (`corpus/lessons/round-64.md:13`); a receipt the lane itself wrote is trusted as written, so a report and a receipt that agree on a wrong number read CLEAN (Q43/Q44's frozen-command rule still binds the receipt); `HASH_DEAD` cannot resolve a hash of an external repository, so a foreign commit hash is a finding only when it is 39- or 40-hex (outside a URL) and absent from both repos; the `--report` bytes are read from disk, not from `git show REV:`, so the file must be diffed as filed. The `--rev` arm trusts the lane's own history: `HASH_ORPHAN` catches a commit on another branch, not a hash that is an ancestor of the tip but supports nothing the report says. The unlabelled-tally hole is the ratchet's first candidate: a control pinning that behaviour (a report with a bare `held=x/y` that disagrees with its receipt reads CLEAN) would make any future strengthening visible instead of silent.
  - **Supersedes.** None. Q52 (tokens and resolvable citations), Q53 (report = receipt = SCORECARD section) and Q55 (a cited receipt exists and carries the quoted line) stay in force; Q61 makes their token, tally, receipt-path and hash arms mechanical and leaves Q53's third-copy comparison against `SCORECARD.md` and Q55's `rev=` agreement to their own rows.

- **Q51-C1 — correction to Q51's grounding (append-only; Q51's bytes are not rewritten).** Grounding: `corpus/lessons/round-63-verifier-spotcheck.md:91` (routed defect D5) and `corpus/lessons/round-64.md:114` (`## Open items carried`). Q51's grounding opens the r49 instances it names as `01b70bb`, `9237a72`, `c432cc9`. `9237a72` resolves in neither repository: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72`, exit 128, and the same in `/home/vgpnk/Projects/shokunin`; no object in the lane's object database begins `9237`. The object Q51 meant is the round-49 record addendum `923a172` (a digit transposition), which the r49 spot-check file cites correctly at `corpus/lessons/round-49-verifier-spotcheck.md:10` — "`01b70bb0` (C2 addendum, C16 + prior art), `923a172` (record addendum, re-score 16/16), `c432cc9` (ConnSiblingOverlap seat report)" — and which resolves in the lane as `round-49: record addendum — C2 re-scored 16/16 at 01b70bb0, LOG line for prior-art citations and the mount-binds disambiguation`. Q51's other cited instances resolve (`01b70bb`, `c432cc9`, `e7a0711`, `26c886d`: `commit` in the lane, absent in the fleet, as expected for lane commits).
  - **Who checks.** The lane before citing a commit in any QUALITY grounding; the non-author spot-check re-resolves the commit-shaped hex tokens of the row it is judging.
  - **Command.** For each hex token the row presents as a commit: `git -C <lane> cat-file -e <h>^{commit} || git -C <fleet> cat-file -e <h>^{commit}` → exit 0. `9237a72` fails both.
  - **Fails when.** A token presented as a commit resolves in neither repo, or resolves to a non-commit object. A token presented as a content digest, sha256 prefix or selftest seed is out of scope, exactly as Q52's pin carve-out states.
  - **Shown able to fail.** The blanket sweep `grep -oE '\b[0-9a-f]{7,40}\b' corpus/QUALITY.md | sort -u` (55 unique tokens at `dd1a3e6f` before Q60–Q51-C1 were appended; 64 at `2ed8a5f8` after appending Q60–Q51-C1, all 9 newly added tokens resolving as commits in the lane or fleet) yields nine non-resolving tokens: `0011223344556677` and `aabbccddeeff0011` (selftest seeds, line 546), `03a258d6`, `0c1f9b22`, `3a32dd34`, `6faa34ab`, `d6068d1b` (content digests, lines 766, 845, 320, 745, 320), `c7f7c401` (pinned in `.ufo/pins/source-captures.json` and `source-dupes.json`) and `9237a72` — the only one presented as a commit and resolving nowhere. Receipt: `build/K64ScribeQuality/q51-hash-resolution.txt`.
  - **Limit.** It corrects the pointer, not the rule: Q51 (every lane commit between a round's base and its tip is named in the report) is unchanged and its r49/r55 instances stand once `9237a72` is read as `923a172`. It also shows Q52's scope does not cover `corpus/QUALITY.md` (Q52 names "report, scorecard section or lesson"), which is why a broken grounding hash could sit in the admission bar — the L1 may extend Q52's scope rather than rely on this row.
  - **Supersedes.** Q51's grounding pointer only; Q51's rule is untouched.
