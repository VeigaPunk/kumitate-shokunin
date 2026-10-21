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
