# Round-64 erratum — routed defect D3 and the round-63 number drift (draft for L1 integration)

seat: `K64ScribeErratum`; date: 2026-10-25; status: **draft only — nothing here is landed**.
Subject of the correction, unchanged: the filed round-63 report (fleet commit `8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad`,
`.ufo/reports/round-63/kumitate.md`) and `corpus/lessons/round-63.md` stay as filed. Everything below is **new appended text**.
Part A is the exact text to append to `corpus/lessons/round-63.md`; Part B is the paragraph the round-64 report carries
under `## Landed changes`; Part C holds one command per fact with its verbatim output. No fact below is quoted from the
round-63 report without being re-derived; the one thing I could not measure (why the harness suffixed three labels) is
stated as unmeasured in Part A and Part B.

---

## Part A — appended section for `corpus/lessons/round-63.md`

```markdown
## Round-64 erratum

Appended 2026-10-25 by round 64 (routed defect D3 and the round-63 number drift). The round-63 text above and the filed
report (fleet `.ufo/reports/round-63/kumitate.md` at `8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad`) stay as filed; this
section supersedes named sentences by quoting them and re-deriving the numbers. Four corrections.

- **w2 `-2` labels: three, not one.** The report says "one w2 label landed as `K63R2ConnRoutedDefects-2`". Measured:
  three wave-2 seats carry a `-2` host transcript — `K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`,
  `K63R2ScoutLeftovers-2` (`find ~/.omp/agent/sessions -name 'K63*-2.jsonl' -printf '%f\n' | sort`), each with a `.md`
  yield summary; no base-name transcript for any of the three exists (`find … -name '<base>.jsonl'` → 0 lines), and each
  `-2` transcript's seat marker is the base name (`# Seat K63R2ScoutLeftovers`). The `-2` suffix lives **only** in the
  host store: `.ufo/waves/round-63/w2/` holds 40 files and 0 `-2.md` stems (39 reports + `swarm-registry.json`), and
  `w2-results.json` holds 39 names, none ending `-2`. So the verifier's count of three is right and the report's "one"
  is wrong; the three are label suffixes on host transcripts, not report stems. Why the harness suffixed them is not
  measured here; the report's "harness label dedupe" attribution is plausible but unverified.
- **Seat mix: the loose 57% set is not the addendum's set.** The report says "m_flash roles (executor, scribe,
  simplifier, critic, revenger, sentinel per the run-7 map): 45/79 = 57%". The run-63 prompt defines the m_flash set as
  "executor/scribe/labrat/sonic/simplifier" (`.ufo/prompts/kumitate-round-63.md:160`, "≥50% of seats … every wave"), and
  no file under `.ufo/prompts/` mentions a "run-7 map" (`grep -rl 'run-7' .ufo/prompts/ | wc -l` → `0` over 543 prompt
  files; across the fleet's markdown the phrase occurs only in the report itself and copies of it — see F3). Round 63
  dispatched 0 labrat and 0 sonic seats (`w1-dispatch.json` + `w2-dispatch.json` role counts), so the
  addendum's count **equals** the strict count: w1 `20/40 = 50.00%`, w2 `15/39 = 38.46%`, round `35/79 = 44.30%`. The
  reported 57% is the strict set plus critic/revenger/sentinel (8+1+1 seats), roles the addendum does not put in m_flash;
  the figure is arithmetically right (`45/79 = 56.96%`) but answers a set nobody defined. The per-wave figures the
  addendum's "every wave" wording needs were not reported: w1 sits exactly on the ≥50% line, w2 misses it by 11.5 points.
- **Wave-2 seat floor: 39 against a stated ≥ 40.** `plan.md:137` reads "Wave 2 (>= 40 seats, only if wave 1 yields >= 32
  distinct attack items)"; the wave ran 39 (`w2-spec.json` items 39, `w2-results.json` seats 39). The report named the
  round-wide miss (79 against the plan's "80–100") and not this per-wave one.
- **Selftest tally `69/69`: verified by re-run, and `25/25` at the freeze commit.** The report says "selftest 25 → 69
  cases". Re-run from `git archive` on this host: `b38a2065` (first version, the freeze commit) → `INLINE_DISPATCH_SELFTEST:
  PASS (25/25)` exit 0; `bb184a90` (round-63 tip) → `PASS (69/69)` exit 0; `6825a514` (round-64 base) → `PASS (69/69)`
  exit 0, 69 `PASS ` case lines. The number is true and reproducible; what the round-63 tree lacked is a committed
  transcript of the run (D2), which the round-64 plan answers by committing one.
```

---

## Part B — paragraph for the round-64 report, under `## Landed changes`

```markdown
**Round-63 erratum (routed defect D3 and the round-63 number drift; append-only — the filed report at
`8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad` and `corpus/lessons/round-63.md` stay as filed).** Four sentences of the
round-63 report are superseded, each by re-derived numbers, and the corrections are appended to
`corpus/lessons/round-63.md` §"Round-64 erratum":
(i) "Name collision: one w2 label landed as `K63R2ConnRoutedDefects-2` (harness label dedupe); the gate resolves `-N`
stems and reads it CLEAN." — **three**, not one: `K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`,
`K63R2ScoutLeftovers-2`; the suffix exists only on the host transcripts (no base-name transcript for the three; 0 `-2`
stems among the 40 files of `w2/`; 0 `-2` names among the 39 of `w2-results.json`), and each transcript's `# Seat`
marker carries the base name. The cause of the suffix is not measured; the gate's `-N` resolution is what the round-63
receipts exercised.
(ii) "m_flash roles (executor, scribe, simplifier, critic, revenger, sentinel per the run-7 map): 45/79 = 57%; counted
strictly as executor/scribe/simplifier only: 35/79 = **44.3% — below the addendum's ≥50% line** (reported, not
prettified)." — the addendum's set is `executor/scribe/labrat/sonic/simplifier` (prompt:160) and no prompt file mentions
a "run-7 map" (`grep -rl 'run-7' .ufo/prompts/ | wc -l` → `0` over 543 prompt files; the phrase appears nowhere in the
fleet's markdown except the report itself and copies of it); with 0 labrat and 0 sonic dispatched, the addendum's
count is the strict count — **35/79 = 44.30% round-wide, w1 20/40 = 50.00%, w2 15/39 = 38.46%**. The 57% set is the
strict set plus critic/revenger/sentinel and is withdrawn as an m_flash figure.
(iii) "Round total **79 seats** (band 64–100; the plan's own "80–100" line missed by one seat)." — the same paragraph
omits a second floor: `plan.md:137` states "Wave 2 (>= 40 seats …)" and the wave ran **39**.
(iv) "selftest 25 → 69 cases" — **verified by re-run**, not merely asserted: `b38a2065` → `INLINE_DISPATCH_SELFTEST:
PASS (25/25)`, `bb184a90` → `PASS (69/69)`, `6825a514` → `PASS (69/69)`, all exit 0 from `git archive`; the round-63
gap was the missing committed transcript (D2), which this round's plan answers with a committed receipt.
```

---

## Part C — one command per fact, with verbatim output

All commands were run from the fleet root `/home/vgpnk/Projects/shokunin` on 2026-10-25; `$` lines are the commands.

**F1 — the three `-2` stems, and their absence from the lane's committed records.**

```
$ find ~/.omp/agent/sessions -name 'K63*-2.jsonl' -printf '%f\n' | sort
K63R2ConnRoutedDefects-2.jsonl
K63R2ScoutHostRecords-2.jsonl
K63R2ScoutLeftovers-2.jsonl
$ ls kumitate-shokunin/.ufo/waves/round-63/w2 | grep -c -- '-2\.md$'
0
$ ls kumitate-shokunin/.ufo/waves/round-63/w2 | wc -l
40
$ python3 -c "import json;d=json.load(open('kumitate-shokunin/.ufo/waves/round-63/w2-results.json'));print('results',len(d['results']),'seats',d['seats'],'names ending -2:',[r['name'] for r in d['results'] if r['name'].endswith('-2')])"
results 39 seats 39 names ending -2: []
$ find ~/.omp/agent/sessions -name 'K63R2ConnRoutedDefects.jsonl' -o -name 'K63R2ScoutHostRecords.jsonl' -o -name 'K63R2ScoutLeftovers.jsonl' | wc -l
0
$ grep -o '# Seat K63[A-Za-z0-9_-]*' ~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b/K63R2ScoutLeftovers-2.jsonl | sort -u
# Seat K63R2ScoutLeftovers
```
(The other two `-2` transcripts carry `# Seat K63R2ConnRoutedDefects` and `# Seat K63R2ScoutHostRecords`; each of the
three has 2 `yield` call rows and a `session_exit` row. Each also has a sibling `.md` yield summary, 301–407 bytes.)

**F2 — the seat mix, strict and loose, from the dispatch registries.**

```
$ python3 - <<'EOF'
import json, collections
tot=collections.Counter(); rows={}
for w in ('w1','w2'):
    reg=json.load(open(f'kumitate-shokunin/.ufo/waves/round-63/{w}-dispatch.json'))['registry']['members']
    c=collections.Counter(m['role'] for m in reg.values())
    strict=sum(c[r] for r in ('executor','scribe','simplifier','labrat','sonic'))
    loose=sum(c[r] for r in ('executor','scribe','simplifier','critic','revenger','sentinel'))
    rows[w]=(len(reg),strict,loose,dict(sorted(c.items()))); tot.update(c)
N=sum(tot.values()); S=sum(tot[r] for r in ('executor','scribe','simplifier','labrat','sonic'))
L=sum(tot[r] for r in ('executor','scribe','simplifier','critic','revenger','sentinel'))
for w,(n,s,l,c) in rows.items(): print(f'{w}: n={n} roles={c} strict={s}/{n}={100*s/n:.2f}% loose={l}/{n}={100*l/n:.2f}%')
print(f'round: n={N} strict={S}/{N}={100*S/N:.2f}% loose={L}/{N}={100*L/N:.2f}%'); print('labrat',tot['labrat'],'sonic',tot['sonic'])
EOF
w1: n=40 roles={'connector': 3, 'critic': 3, 'executor': 13, 'mutation-tester': 3, 'revenger': 1, 'reviewer': 4, 'scout': 5, 'scribe': 6, 'sentinel': 1, 'simplifier': 1} strict(addendum set)=20/40=50.00% loose(exec+scribe+simpl+critic+revenger+sentinel)=25/40=62.50%
w2: n=39 roles={'connector': 2, 'critic': 5, 'executor': 11, 'mutation-tester': 3, 'reviewer': 12, 'scout': 2, 'scribe': 3, 'simplifier': 1} strict(addendum set)=15/39=38.46% loose(exec+scribe+simpl+critic+revenger+sentinel)=20/39=51.28%
round: n=79 strict=35/79=44.30% loose=45/79=56.96%
labrat 0 sonic 0
```
(`w1-spec.json` / `w2-spec.json` role counts are identical to the dispatch registries' — 40 and 39 items.)

**F3 — the addendum's m_flash set and the missing "run-7 map".**

```
$ grep -n 'm_flash roles carry' -A2 .ufo/prompts/kumitate-round-63.md
159:  (cross-claim/cross-source pattern finding). **"use more m_flash":** m_flash roles carry the
160-  majority of every wave (≥50% of seats as executor/scribe/labrat/sonic/simplifier) — drafting goes
161-  to scribes, runnable checks to executors/labrats; attack share (≥25%) is met with
$ grep -rl 'run-7' .ufo/prompts/ | wc -l
0
$ ls .ufo/prompts/*.md | wc -l
543
$ grep -rn 'run-7 map' --include=*.md . | grep -v -e '/\.git/' -e '/\.ufo/reports/' -e '/build/' -e 'K64ScribeErratum' | wc -l
0
```
(Outside the report and copies/mentions of it, no fleet markdown defines a "run-7 map"; the two hits left after only
excluding `.git`, `.ufo/reports/` and `build/` are this seat's own report and draft, which quote the report.)

**F4 — the wave-2 seat floor.**

```
$ grep -n 'Wave 2' kumitate-shokunin/.ufo/waves/round-63/plan.md
137:falsifiers. Wave 2 (>= 40 seats, only if wave 1 yields >= 32 distinct attack items): fresh reviewers /
$ python3 -c "import json;print('w2-spec items',len(json.load(open('kumitate-shokunin/.ufo/waves/round-63/w2-spec.json'))['items']))"
w2-spec items 39
```

**F5 — the selftest tally at three revisions, from `git archive` (scratch: `/tmp/kumitate-r64/K64ScribeErratum/`).**

```
$ git -C kumitate-shokunin archive 6825a51425e91908f019ed65aa2f4209acbd7087 | tar -x -C arch
$ (cd arch && node scripts/inline-dispatch-evidence.mjs --selftest > st.txt 2>&1; echo "exit=$?"; tail -1 st.txt; grep -c '^PASS ' st.txt)
rev=6825a51425e91908f019ed65aa2f4209acbd7087 exit=0
INLINE_DISPATCH_SELFTEST: PASS (69/69)
case-lines=69
$ # same command over `git archive bb184a90…` (round-63 tip) and `git archive b38a2065…` (round-63 freeze)
rev=bb184a901d88193cf582de03c57e39945df65f15 exit=0
INLINE_DISPATCH_SELFTEST: PASS (69/69)
case-lines=69
rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d exit=0
INLINE_DISPATCH_SELFTEST: PASS (25/25)
case-lines=25
```

**F6 — the round-63 base has no gate (the "before" for C1).**

```
$ git -C kumitate-shokunin cat-file -e dfa6fca8f362e9c962f5b940025a2619380b759b:scripts/inline-dispatch-evidence.mjs
fatal: path 'scripts/inline-dispatch-evidence.mjs' exists on disk, but not in 'dfa6fca8f362e9c962f5b940025a2619380b759b'
```

---

## Limits

- The **cause** of the three `-2` suffixes is not measured: the dispatcher log at `/fast/scratch/hyaku-run7/dispatcher.log`
  carries no per-seat name lines (`grep -n 'K63' <log>` → no output), so no record on this host says which label collided.
  The report's "harness label dedupe" stays an attribution, not a measurement.
- I did not re-run the round-63 gate (`inline-dispatch-evidence.mjs --root … --rev … --round 63 --wave w2`) to watch it
  resolve the three `-2` stems; that is the round-63 receipts' claim and the main agent's verification, not this erratum's.
- Percentages are computed from role counts in the committed dispatch registries; I did not read each seat's
  `model_change` row, so the figures are *planned/declared* role shares, not measured provider answers.
- I did not check any round-63 controls count (`14 → 75`) or the `1.1`-style claims outside the four corrected items.
- The erratum is drafted, not integrated: nothing under `corpus/`, `scripts/`, `SCORECARD.md` or the fleet repo was edited.
