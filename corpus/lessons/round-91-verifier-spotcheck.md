# kumitate round 91 — verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Round: kumitate 91 (attempt 1, hyaku run 15). Lane HEAD before: `0bff4babeec90dd57ea36efeaa94b66db9af381d`;
after: `1325caf47a25567afd076a49a232564485e4171e`. Report: `.ufo/reports/round-91/kumitate.md` (fleet commit
`09adf3b7b20e38956398f98bd54b160183af7d52`, lane identity, committed 19:13:32-03:00 — after the lane final
commit 19:13:24-03:00 and before the watchdog complete line 19:14:11-03:00). I did not author this round; I
re-derived the numbers below from committed bytes and did not execute the lane's gates (probe91, selftest,
round-gate, class-sampler) — their committed receipts are quoted with verdict and revision.

Watchdog digest (copied from the dispatch prompt; the live log is mutable):
`2026-11-05T17:42:07-03:00 launch kumitate round=91 pgid=1633679 driver=hyaku-inline attempt=1`;
`2026-11-05T19:14:11-03:00 complete kumitate round=91; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | result | evidence |
|---|---|---|
| report committed by lane identity in fleet repo | PASS | `git log --format='%an %ae %H %cI' -- .ufo/reports/round-91/kumitate.md` → `kumitate-shokunin kumitate@shokunin.local 09adf3b7… 2026-11-05T19:13:32-03:00` |
| `## SHONEN` heading, one line per box | PASS | `grep -c '^## SHONEN'` → 1; four `- [~]` lines (report lines 72–75); `git diff --stat 0bff4bab 1325caf4 -- PROVINCE.md SHONEN.md` → empty |
| cited lane commits exist and are ancestors of the branch ref | PASS | `git cat-file -t` → commit and `git merge-base --is-ancestor <h> master` → OK for `2b1b8bf3` (freeze), `2df92d8d` (spec+dispatch), `77ebfe37` (M), `74423664` (close), `1325caf4` (final), `0bff4bab` (base) |
| no uncommitted round work; lane pushed | PASS | `scripts/hyaku/jj-lane.sh state` → `branch=master local=remote=1325caf4… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` → empty; `ls-remote origin refs/heads/master` → `1325caf4…` |
| prompt carries the template contract | PASS | `diff` of `templates/round-prompt.md` lines 1–140 vs `.ufo/prompts/kumitate-round-91.md` lines 1–140: only placeholder substitutions (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); §§1–5 headings identical; hyaku addendum §6 plus §7 and run-15 notes follow |
| frozen instruments unchanged after freeze | PASS | `git diff --stat 2b1b8bf3 1325caf4 -- .ufo/waves/round-91/{probe,controls,plan.md}` → empty; `probe91-c1.mjs` sha256 `3bd88e8efe4bb085…3f4c` at both revisions |
| interleaved non-lane commit | NOTE | `cfd62867` (operator, `considerthese/2026-11-05.md`, 08:47:58-03:00) sits between base and freeze; not round work, not lane debt |

Defects barring admission: none. Not a marker report.

## 2. Claim re-check — C1 operability, capability acquisition `receipt-bind` v5 (UNMET confirmed)

Lane-owned gates are evidence-verified, not executed (PROTOCOL §Gate standard, Closure consequence).
Re-measured by me over committed bytes:

| item | command (mine) | observed | reported | match |
|---|---|---|---|---|
| shipped instrument bytes | `git show <r>:scripts/receipt-bind.mjs \| sha256sum` | `0bff4bab` → `35f4f25e…`; `77ebfe37` = `1325caf4` → `f39aab5c3de0e708…66cc5e1` | v4 `35f4f25e…`, v5 `f39aab5c…6cc5e1` | yes |
| SCORECARD pin | `git diff 0bff4bab 1325caf4 -- SCORECARD.md` | `pin.receipt-bind` 35f4f25e → f39aab5c; `A_wave` 1253 → 1319; `C2`/`C2_total` 230 → 233; no axis-integer line changed | same | yes |
| SOURCES rows | `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` at both revs | 200 → 203 (S263, S264, S265, tier A, `mined`) | 200 → 203 | yes |
| census | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` (run now) | `kumitate ok`, exit 0 (7 W04 duplicate-url warnings, pre-existing) | `kumitate ok` exit 0 | yes |
| CriticA reproduction bundles | `git bundle list-heads` on `capwindow`, `dirhash`, `extsh-gate-fifo` bundles extracted from `1325caf4` | heads `41abf2d3…`, `b82af777…`, `9a40cc29…` | `K91CriticA/repro-heads.txt` same | yes |
| procfs size premise | `stat -c %s /proc/kallsyms /proc/self/pagemap`; `wc -c </proc/kallsyms` | `0`, `0`; 22489015 bytes | `st_size` 0 is not a read bound; kallsyms 22489015 | yes |

Evidence-verified (committed receipts at `1325caf4`, revision named in each `cmd=` line):
- do-nothing `controls/ctl-base-v4-at-rev.txt` → `C91_C1: UNMET held=52/56` exit 1, failing `ext-zero ext-null ext-fifo ext-overcap`.
- predicate at M `77ebfe37`: `close/probe1.txt`, `close/probe2.txt` → `C91_C1: HELD held=56/56` exit 0 (both `--rev 77ebfe37…`).
- selftest `close/selftest.txt` → `RECEIPT_BIND_SELFTEST: PASS held=84/84` incl. `external-pseudo-file-unbounded ok exit=2` on `/proc/self/pagemap`.
- kill clause (d) text in frozen `plan.md` (line 62ff at `2b1b8bf3`); `close-l1/l1-rerun-criticA-repros.txt` shows the reproductions (`CLEAN … external=1` exit 0 where refusal was due; exit 124 no verdict) and a 56/56 score → clause (d) fired. UNMET is the correct verdict.
- `controls/table.txt`: 12 non-positive controls below 56/56, positive control `HELD 56/56` (clause (b) did not fire).
- `close-l1/round-gate-r91-final.txt` → `ROUND_GATE: CLEAN (round=91 … errors=0)` exit 0.
- `K91CriticB/harm.md` → `RULING: NO HARM`, scoped to the positive control vs v4 (not to the shipped v5 bytes; the close battery's `RECEIPT_BIND: CLEAN matched=12` at M covers v5 on live receipts).

Axis verdicts: **operability unchanged** (integer 9 → 9; claim UNMET, honestly stopped); **coverage unchanged**
(rows 10 → 10; no coverage claim). No axis harmed.

## 3. Discernment spot-check (`corpus/lessons/round-91.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| QUALITY Q85 (class sampling) | admit | `corpus/QUALITY.md` Q85 at `1325caf4`; receipt `close-l1/class-sampler.txt` | agree | Grounded in this round's failure (three token-keyed constructions at 56/56); receipt shows it can fail: extsh-gate 26/36, 25/36; capwindow 30/36 ×2; dirhash 31/36, 34/36; v4 24/36 ×2; v5 and positive control 36/36 ×2. Its `Limit` honestly states sampling bounds, not enumerates, the token space |
| knowledge `receipt-bounded-external-reads.md` on S263 | admit | https://man7.org/linux/man-pages/man7/fifo.7.html re-fetched now (`curl -sSL`) | agree | sha256 of the live page `9c9bbe3240e79d08…500749f` equals the committed capture's; quote "opening for read-only succeeds even if no one has opened on the write side yet" (15 words, ≤ 25) present in the tag-stripped text; entry opens with `source:`, `verified-at:`, `recheck:` |
| positive control `ref-fd-fstat.mjs` as shipping design | reject | `K91Sentinel/receipts/R1.kallsyms.ref.rep1.txt` and `.fix.rep1.txt`; `stat -c %s /proc/kallsyms` → 0 | agree | ref binds `/proc/kallsyms` `CLEAN … external=1` exit 0 while the integrated fix prints `FAIL-CLOSED … external instrument too large: /proc/kallsyms`; an `st_size`-only cap cannot bound a procfs read |
| scribe draft "fstat size = read size for every regular file" | reject | `stat -c %s /proc/self/pagemap` → 0; `wc -c </proc/kallsyms` → 22489015 | agree | a regular procfs file reports size 0 but yields 22 MB, so the claim is false as stated |

SOURCES row re-opened: S263 (row 218 at `1325caf4`): URL, tier A, anchor (§ DESCRIPTION, capture
`close-l1/sources/fifo.7.html`, line 88 of the rendered text, sha256) all resolve; the verbatim quote lives in
the lesson's `### Sources opened this round` and `close-l1/sources/quote-locations.txt` (`88: opening for
read-only succeeds …`); the row's `teaches` cell is a paraphrase, as its column intends. Append-only corrections
also re-checked: S255 location → `grep -n "symbolic link that points to the process"
.ufo/waves/round-89/open/proc-root.html` → `75:` (correction says 75; agree).

Spot-check result: 4/4 agree (2 admits, 2 rejects).

## 4. Trend verdicts

- **expansion — unchanged.** One knowledge entry and +3 rows deepen the held receipt-binding band; no
  capability row, no frontier row advanced (`SCORECARD.md` diff: no capability row added).
- **quality — improved.** The shipped instrument is superseded by a stronger one with red-before (v4 52/56,
  class sampler 24/36) and green-after (56/56 ×2 at M, 84/84, class sampler 36/36 ×2); two falsified
  locations/quotes (S255 line 70 → 75, S260 verbatim) received append-only corrections, S255 re-verified
  by me. No admitted entry failed its re-check.
- **discernment — improved.** The non-author spot-check agrees with the gate on both admits and both
  rejects; the round's own miss (M7, single-token class arms) became a grounded criterion (Q85) with a
  receipt shown able to fail.

## 5. Routed defects (lane owes next round)

1. Mutation tally arithmetic: `K91Mutation/mutants.txt` prints `KILL RATIO: 7/11`, but its own rows show 6
   killed (m01, m03, m04, m05, m06, m09) and 5 survivors (m02, m07, m08, m10, m11) of 11. The "7 killed"
   propagated into the report and the SCORECARD round-91 table; append a named correction (6/11) next round.
2. Survivor list drift: the report routes "m02/m07/m10" while `## Gate` and `mutants.txt` list five
   (m02/m07/m08/m10/m11). m08 (`catch` swallows `FailClosed`) is a fail-open mutation; arm it or justify
   equivalence explicitly.
3. Harm scope: `K91CriticB/harm.md` compares v4 with the positive control, not with the shipped v5
   (`f39aab5c…`); next round's harm check should run on the shipped bytes.
4. Carried as the lane routed them: K91Reviewer F1 (external symlink-leaf arm), F2; CriticA `cand-shy-strip`
   (U+00AD); `extsh-gate-devalias`; RD-1, RD-5; adopt this spot-check before the round-92 freeze (M8).
5. tabi adjacency (`check-receipt-provenance.mjs:53`, RD-2 class) — routed to tabi by the integrator, not
   edited here.

SHONEN note for the operator: the four `[~]` boxes cite resolvable pointers (SKILL.md gate row and checklist,
LOG round-91 section, close battery, PROVINCE unchanged) and look checkable by a non-author; promotion stays
operator-owned.

Verdict: **status ok, admitted false — rejected-honest-stop** (C1 UNMET by frozen kill clause (d); no axis harmed).
