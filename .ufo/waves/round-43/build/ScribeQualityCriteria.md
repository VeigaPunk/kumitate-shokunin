RESULT ScribeQualityCriteria verdict=drafted criteria=4

Draft only. Nothing in `corpus/QUALITY.md` was edited; this file is the only lane write. Four criteria
continue the file's numbering after Q24, in QUALITY's own shape (statement, grounding, who checks,
field, command, fails when). Every check command below was run in its concrete form against the lane
revision `e5ffcbe7f155b89cb1870f9da7b0d671d092948b` in an isolated clone
(`/fast/scratch/hyaku/kumitate-r43/seats/ScribeQualityCriteria/lane`, no lane or fleet writes), with
placeholders such as `<lane>` and `<pin>` substituted, and the observed line is quoted with the
command. Scratch receipts remain under
`/fast/scratch/hyaku/kumitate-r43/seats/ScribeQualityCriteria/`.

---

**Q25 — a mutation battery has one kill predicate, frozen before any counted run and stated
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

**Q26 — an operability claim needs a pass-sensitive counter; listed-line and file-count terms are
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

**Q27 — no untracked wave report at report filing, checked by a command.** A delivered report that
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

**Q28 — a knowledge section that a coverage term counts passes only if it cites a source row
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

---

## Evidence lines (command → observed)

```
$ git -C <clone> rev-parse HEAD → e5ffcbe7f155b89cb1870f9da7b0d671d092948b
$ grep -oE '^\*\*K[0-9]+' .ufo/waves/round-43/plan.md | head -1 | tr -d '*' → K43
$ sed -n '1,24p' scripts/gate-mutants.mjs | grep -c K43 → 2
$ grep -oE "check\('k43-[a-z0-9-]+'" scripts/gate-mutants.mjs | wc -l → 7
$ grep -oE '\([a-d]\)' .ufo/waves/round-43/plan.md | sort -u | wc -l → 4
$ grep -cE '^\([a-d]\) case [a-z0-9-]+' .ufo/waves/round-43/plan.md → 0
$ node scripts/gate-mutants.mjs --selftest   (bounded; KUMITATE_GATE_MUTANTS_TMP=scratch/gm-tmp)
  GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0 → VERDICT: PASS, exit=0
$ <drop clause (a) `if (run.timedOut) return 'timeout';`> --selftest
  FAIL timeout-and-process-group-cleanup survived timeout=100ms group_clean=true → 27/28, VERDICT: FAIL, exit=1
$ <drop clause (b) `&& run.status !== 0`> --selftest
  FAIL k43-exit-zero-with-verdict-fail-is-survived killed exit=0 verdict=FAIL … confirm=same → 27/28, exit=1
$ <drop clause (c) `&& hasLine(run.stdout, 'VERDICT: FAIL')`> --selftest
  FAIL k43-nonzero-with-verdict-pass-is-survived killed → 27/28, VERDICT: FAIL, exit=1
$ <drop clause (d) `&& failNames(second.stdout) === failNames(first.stdout)`> --selftest
  FAIL k43-confirmation-other-names-or-pass-disagrees other names / pass on rerun → 27/28, exit=1
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
  PROXY: MATCH (A=10 C=19 operability=9; C1=19/19 C2=95/95 coverage=10; S=88/88 …; K=53/53 …; pins=6 match; src-rev=31c465f15669)
$ <blind copy: `: > scripts/wave-census.mjs`; SKILL.md item 677 command `false`> proxy-check --json
  terms {"A":10,"C":19,…,"operability":9,…} — identical to clean
$ <receipt fixture: 4 items, 3 exit=0, summary PASS 3/4> → declared=3 ; exit0=3 ; items=4
$ git status --porcelain -uall -- .ufo/waves/round-43 | wc -l → 0
$ <plant .ufo/waves/round-43/falsify/ProbeUntracked.md> git status --porcelain -uall … | wc -l → 1
  ?? .ufo/waves/round-43/falsify/ProbeUntracked.md ; removed again → 0
$ <round-42: find … -name '*.md' | sort versus git ls-files … | sort> diff → no output, 64 on disk, 64 tracked, exit 0
$ git --no-optional-locks -C /home/vgpnk/Projects/shokunin status --porcelain -uall -- .ufo/waves/round-42 .ufo/reports/round-42
  → no output, exit=0
$ <occurrence-aware new-section scan, base 16a5441, corpus/knowledge/kimi-*.md>
  corpus/knowledge/kimi-skills-plugins.md:173: ## `~/.kimi-code/skills/cursor-lane`
$ <strip S041/S042 inside the locks section, scratch copy> proxy-check --json + sources-check
  K_sections=53 coverage_kimi=10 ; SOURCES_CHECK: CLEAN (rows=45 … legacy=38)
$ pgrep -af kumitate-r43/seats/ScribeQualityCriteria | grep -v pgrep | wc -l → 0 ; ls gm-tmp | wc -l → 0
```

## Scope, limits, conflicts

- Draft and report only. No edit to `corpus/QUALITY.md`; outside this report the lane and the fleet
  were read-only, and the clone is detached at `e5ffcbe`. No commit, push, checkout or index write
  in the lane or fleet.
- Executing checks: seven `gate-mutants --selftest` runs (one clean, four single-clause drops, one
  outside-`scripts/` copy run twice), five `proxy-check` runs and one `sources-check` run. Each
  ran under `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600`; the
  three-copy batch measured 1.77 s wall. After them: no process matches the scratch path, `gm-tmp`
  holds 0 entries.
- Q25's clause-to-case map arm and Q28's gate-side exclusion arm are drafted as targets, not
  existing behaviour; the measured lines above show both as open at `e5ffcbe`. Q26's pass receipts
  do not exist yet (the checklist is listed in SKILL.md, not executed as a suite).
- One conflict for the canonical Rust judge, reported verbatim from the plan: the plan says K43 and
  the counter "are never amended this round" while also disclosing "The do-nothing control was
  dry-run once on these exact counter bytes before this commit (2026-10-22T22:08Z, 44.6 s …)". The
  plan commit is `0f4108b` at `19:11:35 -0300` (22:11:35Z), so the predicate bytes were fixed
  before the disclosed dry run and the plan commit followed it; the criterion's "before any counted
  run" arm treats a disclosed pre-commit dry run of identical bytes as allowed and requires the
  disclosure to name its time and bytes, as this plan does.
- This report is itself an untracked lane file until the L1 commits it, so a Q27 check run before
  that commit will list it; the criterion's report-filing sweep is the L1's, after all seat reports
  land.
- Tool installs or updates: none.
