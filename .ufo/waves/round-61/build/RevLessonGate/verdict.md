# RevLessonGate — round-61 lesson `## Gate` format, draft-verify (Q21)

Seat: RevLessonGate (reviewer, round 61, w1). Reviewed 2026-10-25.
Target: `.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md`, pinned copy of the reviewed
bytes `build/RevLessonGate/lesson-draft.reviewed.md`, sha256
`753ea1ea556bf37261cb533878ca8b4c24eaae6f2a0c642692900e73d02dddf4` (223 lines; `## Gate` at
lines 58–126). Line numbers below refer to these bytes. The draft was revised three times during review (sha256 `826a66a0…`, `5c5e5b6d…`,
`41670423…`, then `753ea1ea…`); every format finding below holds on all four revisions.
Last observed revision before filing: sha256 `447efa8a886845de19477d34860be12e2a05954ca26bbee8ae483c56abde7d1e`
(content added after l.85 and l.108, so later line numbers shift by ≥11). On those bytes the Q21
command still reads `0` / `0`, `/tmp/` still appears 2×, and `re-derive at the measured` still
appears 1×, so A1–A7 hold unchanged. Its new finding (the package holds 2609.29095 twice, as `S204`
and `S211`) strengthens A3's Q47 criterion and should be named in that bullet.
Rule: `corpus/QUALITY.md:215-241` (Q21). Exemplar of a conforming Gate: `corpus/lessons/round-42.md`
`## Gate — admits and rejects` (bold bullets, `Criterion met/missed: Q<n>`, `Flip:`).
Checker: `build/RevLessonGate/gate-check.sh` → `build/RevLessonGate/gate-check.out`.

**Verdict: `GATE_FORMAT: AMEND` — Q21 literal command reads `Reject|Hold bullets=0`,
`no-reject line=0` (fails as written); the content (1 admit, 2 standing rejects re-opened with
flips, located quote, hashes) is sound and needs re-shaping, not re-adjudication.**

## Checklist

| # | check | result | evidence |
|---|---|---|---|
| 1 | decision bullets open with `Admit`/`Reject`/`Hold` | **FAIL** | the three decisions are unbulleted uppercase paragraphs `ADMIT …` (l.64), `REJECT …` (l.99), `REJECT …` (l.113). Q21 command `sed -n '/^## Gate/,/^## /p' … \| grep -cE '^- \*\*(Reject\|Hold)'` → **0**. Same count measured on committed lessons: rounds 46–49, 51 and 54–60 read 0 (round 60 included); 42–45 read 5/5/2/4; 50/52/53 read 1 |
| 2 | each names its candidate | PASS (shape) | paths named; the admit names `S195` only in the table — the bullet must name `S195` + path |
| 3 | each names the criterion met/missed (`Q<n>` or named gate term) | **FAIL** | admit cites only "frozen check E4"; reject 1 names no Q-id ("one paper under two ids"); reject 2 cites "one theme", a lesson convention (round-59.md:17, round-60.md:40) not a QUALITY criterion, and no Q-id for its second bar |
| 4 | every Reject/Hold names a flip | PASS | both rejects end with "Flip condition: …" |
| 5 | ≥1 admit | PASS | S195 → `temporal-worker-versioning-pinning.md`; quote verified at `ScoutSourceWorkerVersioning/body.md:39`, 1 occurrence, 13 words; body sha256 `8ef2ee5f…f8fc` equals the row pin; `row-S195.txt` NF=13 |
| 6 | ≥1 reject, standing reject re-opened with re-adjudication result | PASS (substance) | both round-60 rejects re-opened, result "stays refused"; package re-numbering S141→S211, S130/S132→S200/S202 confirmed in `shokuknow/merge/kumitate/SOURCES.append.md` (155 rows; S130/S132/S141 absent) |
| 7 | `no reject this round` line when no new reject | **FAIL** | no new candidate was rejected this round (S195 was the only new candidate and was admitted); `grep -c '^- no reject this round'` → **0** |
| 8 | no placeholder tokens | PASS in `## Gate`; **residue elsewhere** | Q52 `__X__` tokens: 0. Outside Gate: see A6–A8 |

## Must amend before the lesson is final

**A1 (Q21 field — blocking).** Convert the three decision paragraphs to bold bullets. The table
may stay; bullets are what the command counts.

**A2 (Q21 — blocking).** Add, inside `## Gate`, exactly one line starting `- no reject this round — `
saying why (S195 the only new candidate, admitted) and naming both standing rejects re-opened and
their result. Without it the two `Reject` bullets read as same-round rejects and the discernment
sample is mis-stated.

**A3 (Q21 criterion — blocking).** Name criteria by id:
- Admit S195: Q1 (header trio), Q2 (opened row), Q46 (committed capture bound by hash) — frozen
  D61 E2–E4; state that it holds only once `body.md` and the row are committed (both untracked
  now: `git ls-files --error-unmatch` fails).
- Reject exactly-once-attribution.md: **Q47** (a second row on `arxiv.org/abs/2609.29095` creates a
  new duplicate-URL group with lane S134). l.108 says "the reject rests on the id duplication
  alone" while l.103–105 also gives the unread measured claim as a reason — pick one: either cite
  Q2 for the measured claim as a second criterion, or call it a consequence, not a reason.
- Reject multi-agent-coordinator-topologies.md: the round's frozen one-theme scope
  (`.ufo/waves/round-61/plan.md:93-97`) **and Q33** (the staged quote is not at its locator: the
  splice confirmed by ScoutQuarantineRegister, entry `multi-agent-coordinator-topologies.md:41`).
  Also state that the entry's own `coverage-map` claims band 4 and `PROVINCE.md:22` band 4 does
  include "multi-agent failure research" — so the refusal is theme, not band. l.116 "this round
  is one theme (band-4 durable execution)" otherwise reads as off-band.

**A4 (Q21 "re-opened source with what it returned").** Each reject bullet must say what was
re-opened and what it returned: the package entry (`source:` reads S211 / S200+S202) **and** the
documents re-fetched this round by ScoutQuarantineRegister (`build/ScoutQuarantineRegister/verdicts.md:96-112,181-182`:
2609.29095 e-print HTTP 200, 112,394 bytes, title verbatim; 2512.08296 §4.1 "180 experiments across
four representative benchmarks"). Currently l.92 says only "re-opened against the package".

**A5 (labelling).** Mark each Reject bullet `(standing since round 60; re-opened round 61; stays
refused)` so the count of Reject bullets (2) is not mistaken for new rejects.

**A6 (Q14 — evidence under `/tmp`, blocking for a committed lesson).** l.134
`/tmp/kumitate-r61/ScoutCollisionGuard/` and l.164 `/tmp/kumitate-r61/ScoutQuarantineRegister/fetch/`
are cited as evidence. Lane copies at last check (draft sha256 `f6cefff2…`, where these
sit at l.157 and l.187):
- Collision guard: now in the lane at `.ufo/waves/round-61/build/ScoutCollisionGuard/`
  (`collisions.txt` 0 bytes, `reg-ids.txt`, `staged-ids.txt`, `guard-proof.md`). Cite that path and
  commit it, or commit the post-append run under `.ufo/waves/round-61/assimilation/` as the draft
  proposes.
- Quarantine fetches: still only under `/tmp`. The lane holds just `build/ScoutQuarantineRegister/verdicts.md`.
  Copy the three spot-checked captures (`s116.html`, `s118.src`, `types.ts`) into the lane and
  commit them, or cite `verdicts.md` alone and drop the `/tmp` path.

**A7 (unfilled blanks).** l.9–11 and l.40 `After: *re-derive at the measured revision*` plus the two
`[INFERENCE]` after-expectations (`A=111 B=15 C=8 rows=134`, W04 stays 6) must be replaced by the
measured after-lines before final; the uncommitted markers (l.9, l.74, l.134, l.159) must be
resolved by commits or the dependent numbers dropped. Delete the "Draft status" preamble.

**A8 (Q52 hash half, low).** l.178 `…/0b5c27ab…/…/client.ts` is an elided hex that resolves to no
lane commit and no pin; write the full commit `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` with the
full URL, or label it an external-repo revision.

## Should amend (calibration, non-blocking)

- Quoted truncations inside decisions (`56% and 74% …"`, `"We conducted 260 experiments across six
  benchmarks …"`) cut a measured claim mid-number; quote the ≤25-word span whole or drop the
  numbers.
- l.53 (Census) the proxy line is paraphrased with `…`; `base/proxy-before.txt:5` has the full
  `PROXY: DRIFT (…)` line — quote it whole (Q7 spirit).

## Resolved during review (no action)

- Rev `5c5e5b6d…` used register S118 `payload-absent` as an extra reject reason and told a future
  topology round to "verify that quote by hand"; rev `41670423…`/`753ea1ea…` corrected both (S118
  false ABSENT, not a reason; S116/S202 splice confirmed and added to the flip).

## Proposed `## Gate` bullets (shape verified against Q21: Reject|Hold=2, no-reject=1)

```markdown
- **Admit S195** — `corpus/knowledge/temporal-worker-versioning-pinning.md` (Temporal Worker
  Versioning docs, tier A, `new → mined`, used-by this entry only). Opened 2026-10-25 (seat
  ScoutSourceWorkerVersioning): HTTP 200, 9645 bytes, sha256
  `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`. Quote, § Versioning
  behaviors → § Pinned Workflows (`body.md:39`, 1 occurrence): "A **Pinned** Workflow is
  guaranteed to complete on a single Worker Deployment Version." (13 words). Criterion met: Q1,
  Q2, Q46 (frozen D61 E2–E4), at the measured revision where capture and row are committed.
- **Reject exactly-once-attribution.md** (standing since round 60; re-opened round 61; stays
  refused). Package `S211` = arXiv 2609.29095, the document the lane holds as S134 (title-page
  scope). Re-opened: the package entry's `source:` reads S211; the e-print re-fetched this round
  (HTTP 200, 112,394 bytes) carries the title verbatim, so register S118 `payload-absent` is a false
  ABSENT and not a reason. Criterion missed: Q47 (a second row on the same URL is a new
  duplicate-URL group). Flip: a later band-4 round opens the measured body and moves that scope
  onto S134 (one id per document) through the item-10 pipeline; no second id for 2609.29095.
- **Reject multi-agent-coordinator-topologies.md** (standing since round 60; re-opened round 61;
  stays refused). Package S200 (Bailian managed-agents-multiagent) and S202 (arXiv 2512.08296).
  The entry claims band 4, and band 4 (`PROVINCE.md:22`) includes multi-agent failure research,
  so the refusal is theme, not band. Criterion missed: the round's frozen one-theme scope
  (`plan.md:93-97`), and Q33: the entry's quote (`:41`, "We conducted 260 experiments across six
  benchmarks") is not at its locator; §4.1 re-fetched this round reads "We conducted 180
  experiments across four representative benchmarks". Flip: a round whose one theme is
  coordinator topology re-opens S200 and S202 by document, replaces the spliced quote with a
  located span, and adopts through the item-10 pipeline.
- no reject this round — S195 was the round's only new candidate and it was admitted; the two
  Reject bullets above are round-60 standing rejects, re-opened and re-adjudicated this round
  (both stay refused).
```

## Reproduce

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
f=.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md
sed -n '/^## Gate/,/^## /p' $f | grep -cE '^- \*\*(Reject|Hold)'     # 0 at 753ea1ea → must be ≥1
sed -n '/^## Gate/,/^## /p' $f | grep -c '^- no reject this round'   # 0 → must be 1
grep -cE '__[A-Z][A-Z0-9_]*__' $f                                    # 0
grep -n '/tmp/' $f                                                   # l.134, l.164 → must be empty
.ufo/waves/round-61/build/RevLessonGate/gate-check.sh $f
```
