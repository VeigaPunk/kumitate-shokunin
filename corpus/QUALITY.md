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
    must meet the round's pre-registered minimum. Identical receipts are copies, not independent runs.
  - **Command.** `node .ufo/waves/round-50/probe/repairs50-probe.mjs <lane> <rev> --fleet <fleet>` (R4).
  - **Fails when.** A timestamp is absent/unparseable, any bytes repeat, any run fails, or the measured span
    is below the frozen minimum.
  - **Shown able to fail.** Round-49 `sha256sum r49/L1-score-0526f898.txt r49/ReRunCounter49-2.txt
    r49/ReRunCounter49-3.txt` → `03a258d6…` ×3; the round-50 control is `R4 MISS files=0`
    (`.ufo/waves/round-50/controls/CtlR50-base-ff40d7d-r2.txt`).
  - **Limit.** `run-at` is captured evidence, not a cryptographic timestamp; this check cannot defeat a
    forger who rewrites the timestamp and output together.

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
