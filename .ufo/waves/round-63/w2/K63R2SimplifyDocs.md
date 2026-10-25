VERDICT: The seven documents round 63 added carry 2 919 bytes of restatement, seat-report detail and unactionable prose; the proposed trim keeps every byte a gate or counter reads and the trimmed fixture still reads `TOPOLOGY63_HELD 7/7`, `README_MAP: CLEAN`, `CITE_SOURCES: CLEAN`, `SOURCES_CHECK: CLEAN`.

## Evidence

**Method.** `git archive a9531c8e | tar -x` into two scratch fixtures under `/tmp/kumitate-r63/K63R2SimplifyDocs/`
(`base`, `trim`), each its own `git init` repo (`git -C <D> rev-parse --show-toplevel` → `<D>` before the first
commit). Edits applied to `trim` only; the lane worktree was read, never written (`git -C <lane> status
--porcelain` shows no target file as modified by me).

**Frozen C2 counter, same command, both fixtures:**
```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /tmp/kumitate-r63/K63R2SimplifyDocs/base HEAD
TOPOLOGY63_HELD held=7/7 checks=7 rev=eb6c6ecf652806a39023ad82f4903423fb07fb26 rule=T63   (exit 0)
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /tmp/kumitate-r63/K63R2SimplifyDocs/trim HEAD
TOPOLOGY63_HELD held=7/7 checks=7 rev=4c93033ac5b5c959868709f88b7fff1eecbbbebc rule=T63   (exit 0)
```
**Gates that read README rows / entry headers, cwd = trimmed fixture:**
```
README_MAP: CLEAN files=153 rows=153 covered=153            (exit 0)
CITE_SOURCES: CLEAN cited=190                               (exit 0)
SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 status=queued:13,mined:104,rejected:19 entries_with_source=20 legacy=38)  (exit 0)
```
**Region proof (gated bytes byte-identical):**
```
diff <(sed -n '1,5p' base/corpus/knowledge/multi-agent-coordinator-topologies.md) <(sed -n '1,5p' trim/…)  → empty
diff <(sed -n '/^## Located quotes/,$p' base/…) <(sed -n '/^## Located quotes/,$p' trim/…)                → empty
```
**Measured deltas** (`wc -c`, base → trim): lessons/round-63.md 12004→10017 (−1987) · QUALITY.md 99483→99263
(−220) · SKILL.md 84295→84127 (−168) · PROVINCE.md 4461→4351 (−110) · corpus/README.md 75722→75454 (−268) ·
multi-agent-coordinator-topologies.md 8890→8742 (−148) · CHANGES-AFTER-FREEZE.md 1465→1447 (−18). **Total
286 320 → 283 401, −2 919; 31 insertions / 33 deletions** (`git diff --numstat`).

**Counts cited by the rows I edited, re-run rather than trusted:**
```
node scripts/inline-dispatch-evidence.mjs --selftest → INLINE_DISPATCH_SELFTEST: PASS (48/48)   (exit 0)
bash scripts/plan-before-ready.sh --selftest         → PLAN_BEFORE_READY_SELFTEST: PASS (10/10) (exit 0)
ls .ufo/waves/round-63/controls/inline | wc -l       → 44
awk -F'|' '/^\| [a-z0-9-]+ \| gate \|/{c++} END{print c}' SKILL.md → 22   ("Twenty-two are gates" is true)
```

## Findings

**K63R2SimplifyDocs-1 (HIGH — blocks the close's own citation check).** `corpus/lessons/round-63.md` carries two
unfilled template tokens at the measured revision, `{{CLAIMS}}` (line 23) and `{{CENSUS}}` (line 47), while Q52's
command half cannot see them: `grep -cE '__[A-Z][A-Z0-9_]*__' corpus/lessons/round-63.md` → `0`, and
`grep -oE '\{\{[A-Z_]+\}\}' corpus/lessons/round-63.md | sort | uniq -c` → `1 {{CENSUS}}`, `1 {{CLAIMS}}`. The
criterion's prose forbids "a template token such as `__TIP__`"; its regex only forbids the double-underscore
spelling. Not patched (frozen criterion, L1 close): the L1 must fill both tokens before filing or the lesson
fails Q52 by class while passing Q52 by command. Attacks: Q52's ability to fail.

**K63R2SimplifyDocs-2 (MEDIUM — a false record inside the round's own lesson).** Line 13 says the staged
`§ agents 条目字段` locator "w[as] cut", but the adopted entry still carries it:
`grep -c '§ agents 条目字段' corpus/knowledge/multi-agent-coordinator-topologies.md` → `1` (source line 1), and
`grep -c 'agents 条目字段' corpus/lessons/round-63.md` → `1` (the claim itself). A reader comparing the two
documents finds the ledger contradicting its own artifact. Fixed in the cut proposal (anchor kept, claim corrected);
attacks: the lesson's cut-list as evidence.

**K63R2SimplifyDocs-3 (MEDIUM — stale statement about the round's own deliverable).** Line 53's fix cell calls
`scripts/plan-before-ready.sh` "the drafted command … (uncommitted at `b38a2065`; …), and it counts only once
committed". It is committed: `git -C <lane> log -1 --format=%H -- scripts/plan-before-ready.sh` →
`05b3176915de4175bb211b4b1422d8e56cf16888`, and SKILL row 628 already registers it as a gate.
`grep -c 'uncommitted at `b38a2065`' corpus/lessons/round-63.md` → `1`. Fixed in the cut proposal; attacks: the
mistake ledger's accuracy about round 63 itself.

**K63R2SimplifyDocs-4 (MEDIUM — PROVINCE band contradicts its own entry).** `PROVINCE.md:23` claimed the band owns
"what the arrangement costs" and closed the same sentence with "cost per topology stay unspecified by both
sources", while the entry's `## Limits` states S197 "reports no cost, latency or wall-clock comparison" and S196
"states no … cost". A band that owns a question neither source answers invites a claim no source can ground.
Repro: `sed -n '23p' PROVINCE.md` against `sed -n '/## Limits/,/## Located quotes/p' corpus/knowledge/multi-agent-coordinator-topologies.md`.
Fixed by dropping the cost clause and the restated tail; attacks: C2's frontier-band statement.

**K63R2SimplifyDocs-5 (LOW — registry row mislabels its contract).** SKILL row 628 reads "contract Q58 (round 63)"
in the cell where all 21 other gate rows name a `kumitate-…-v1` string, and the script declares none:
`grep -c 'contract' scripts/plan-before-ready.sh` → `0`. Also `) , contract` (space before comma). Proposal:
"criterion QUALITY Q58 (round 63)". Attacks: the registry's schema consistency.

**K63R2SimplifyDocs-6 (LOW — two sentence fragments a reader cannot act on).** `corpus/lessons/round-63.md:61`
embeds "— whether `Q54` is extended to the transcript-derived set" and "— whether the arm names a dead seat on
this round's own waves" mid-sentence, and `:33` began a sentence lowercase ("…at all. landed in the round-63 work
commit"). `grep -rn ' — whether ' corpus/lessons/*.md | wc -l` → `1` (this line only, so it is not a house
convention). Proposal rewrites both without losing a fact; attacks: readability of the ledger.

## Artifacts

- `.ufo/waves/round-63/build/K63R2SimplifyDocs/cuts.md` — per-file old→new text, byte deltas, gate proof, and the
  list of bytes deliberately not cut.
- `.ufo/waves/round-63/build/K63R2SimplifyDocs/proposed.diff` — 201-line unified diff of the whole proposal
  (`git diff` inside the trimmed fixture; 7 files, +31/−33).
- Scratch: `/tmp/kumitate-r63/K63R2SimplifyDocs/{base,trim}` (fixture repos; `base` = `a9531c8e` bytes).

## Limits

- No lane file was edited; the proposal is text for the L1 to integrate, so its deltas are measured in the scratch
  fixture, not in the lane.
- I trimmed prose only; I did not re-verify the round's factual claims beyond the ones named in Findings 2–5
  (e.g. the quarantine verdicts, the staged-diff seat findings, the `controls/inline-real-hosts.txt` sweep).
- T5 (live fetch) ran against live arXiv/Bailian during both probe runs; a network-side change would move that
  arm, not this trim.
- C1 (`inline63-probe.mjs`) was not run: my changes touch no wave receipt, transcript, dispatcher log or
  `results.json`, and the frozen probe needs real host records the fixture cannot carry.
- No tool was installed or upgraded for this seat.
