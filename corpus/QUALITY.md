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

