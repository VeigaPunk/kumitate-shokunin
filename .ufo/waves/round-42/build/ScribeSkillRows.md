RESULT ScribeSkillRows rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drafted

# ScribeSkillRows — C1 prose: registry row, two checklist items, capability row

Scope: prose only, inside this report. No lane file was edited, no gate of the new instrument
exists at the measured revision, and this seat ran none of the gate-mutants counting commands.
Every `GATE_MUTANTS:` verdict quoted in a draft is the plan's declared counting command
(`.ufo/waves/round-42/plan.md`, C1), not an observation made here.

Measured revision for all counts below: `b237e3f09c9559e130c7367bd2efa981c4ea516f` (lane revision
for this wave), in a private clone at
`/fast/scratch/hyaku/kumitate-r42/seats/ScribeSkillRows/lane`. `scripts/gate-mutants.mjs` is
absent at that revision, so the drafts describe the plan's `kumitate-gate-mutants-v1` contract.

## 1. Gate-registry row (SKILL.md, five cells, append after the `| wave-census | …` row at :607)

```markdown
| gate-mutants | gate | `node scripts/gate-mutants.mjs [--rev COMMIT]` → `GATE_MUTANTS: CLEAN\|SURVIVED` (header names the measured revision, or `working-copy`, and each target's sha256 of the bytes actually mutated, per R41-7; per mutant `MUTANT <target>:<id> killed\|survived\|nomatch\|crash\|timeout`, carrying the observation it fired on, e.g. `cases=74/75 fail_lines=1`; killed = the mutated copy's `--selftest` printed a failing observation — a `FAIL ` case line, a pass count below the case count, a `VERDICT: FAIL` line, or a non-zero exit; survived = every case passed, `VERDICT: PASS`, exit 0; `nomatch` = the `from` literal does not occur exactly once in the measured bytes; a crash (no `cases passed` line), a runtime error or a timeout is reported apart and is NOT a kill; read the case lines, not only the exit code — 5 of the 41 frozen mutants exit 0 by construction (`cite-check` `suite-group-verdict`, `suite-any-fail`, `suite-exit-text`; `wave-census` `V382-pass-count`, `V387-exit-const`)). Exit 0 clean, 1 any survivor, 2 `nomatch`/crash/timeout/failing control, 64 usage. The default measures the working copy; `--rev` measures a committed revision's `scripts/`; each mutant runs in its own temp copy of that `scripts/`, with a scrubbed environment (no `KUMITATE_*` inherited), its own process group, a per-mutant timeout and cleanup by group | `--selftest` (hermetic: writes only `mkdtemp` fixtures, runs no mutant, inherits no `KUMITATE_*`; `VERDICT: PASS`) | the frozen manifest embedded in the script — 41 single-literal mutants, each `from` literal required to occur exactly once: `cite-check` 16 (`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`), `wave-census` 25 (`.ufo/waves/round-41/final/a2-census-{repair,survivor,findings,exits}-mutants.txt`, 3/10/10/2, ids `<group>/<id>`); not a `kumitate-proxy-v1` pin |
```

### Adjacent prose the row forces (same table, two sentences)

- `SKILL.md:589` reads "All nine are gates (each can exit 1 on a real defect; `anchor-truth` added
  round 38, `wave-census` round 41)." → "All ten are gates (… `wave-census` round 41, `gate-mutants`
  round 42)."
- `SKILL.md:593` reads "Verdict map for all nine: `0` → clean, `1` → failed, `2` (fail-closed) and
  `64` (usage) → could-not-evaluate." → "Verdict map for all ten: …". The existing map is exactly the
  gate's own map, so no new arm is introduced.
- The `Named legacy gaps` paragraph at `:609` ("the original seven gates do not ship the §Gate
  standard digest-checked frozen-snapshot replayer") stays as written: `gate-mutants` is not one of
  the seven and claims no replayer.

## 2. Two checklist items (SKILL.md `## Verifiable checklist`, after item 17 at :691)

```markdown
- [ ] Gate-mutants battery — `node scripts/gate-mutants.mjs` → exit 0 + `GATE_MUTANTS: CLEAN`
- [ ] Gate-mutants hermetic suite — `node scripts/gate-mutants.mjs --selftest` → exit 0 + `VERDICT: PASS`
```

Both lines parse under the frozen checklist grammar (`scripts/surface-probe.mjs:262`,
`CHECKLIST_RE`), verified by executing that regex on the two literal lines: label, command, exit set
and expect substring all captured, no backticks inside command or expect. They are items 18 and 19,
so `grep -c '^\s*- \[' SKILL.md` moves 17 → 19 and the proxy term `C` with it.

Preamble rewrite (`SKILL.md:660`, the sentence that opens the list): replace "Seventeen items
(round 41)." with "Nineteen items (round 42)." and extend the item map with: "items 18–19 (round 42)
are the frozen 41-mutant battery over this repo's own gate suites (16 `cite-check` ids + 25
`wave-census` ids, each mutant in a temp copy of `scripts/` under its own process group and a
timeout) and its hermetic suite; like item 11 they need no origin tree."

The existing paragraph's fault sentence ("Exit 2, or no verdict line at all, is a tool/environment
fault") already covers a failing control and a `nomatch`, so no new sentence is needed there.

## 3. SCORECARD `## Capabilities` row (append after the `wave-census` row at :1680)

```markdown
| `gate-mutants` | Re-run a frozen manifest of 41 single-literal mutants against this repo's own gate suites, so a suite is shown to observe the condition it claims to pin: for each id it copies the measured revision's `scripts/` into a temp dir, requires the `from` literal to occur exactly once (else `nomatch`), applies that one substitution, and runs the copy's `--selftest` in its own process group under a per-mutant timeout with a scrubbed environment, cleaning up by group; per mutant `killed\|survived\|nomatch\|crash\|timeout`; exit 0 clean, 1 survivor, 2 could-not-evaluate, 64 usage; `--rev COMMIT` measures a committed revision, the default the working copy, and the header names the revision (or `working-copy`) plus each target's sha256 of the bytes actually mutated. Limits: **literal only** — one exact string substitution per mutant, no arithmetic, statement, return-value or operand operators — and the manifest is **frozen and embedded**, so a refactor of a measured gate reads `nomatch` (exit 2) rather than silently passing; a **crash, runtime error or timeout is reported apart and is never a kill**; `killed` says the suite observed that literal, not that its cases are right or complete; the battery covers 2 of the 9 gates registered beside it (`cite-check`, `wave-census`), the other 7 have no frozen mutant set yet; and the default run measures uncommitted bytes, which its `working-copy` header states | `node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN` with all 41 frozen ids `killed`; `node scripts/gate-mutants.mjs --selftest` → `VERDICT: PASS`; shown able to fail on real code: with the R41-3 skip-bypass mutants in the manifest, `--rev dfabe92bcec021f5beec457fb50cec484e047e35` (round-open bytes) exits 1; ids lifted from `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (16) and `.ufo/waves/round-41/final/a2-census-{repair,survivor,findings,exits}-mutants.txt` (3/10/10/2); `## Gate registry` row and checklist items 18–19 in `SKILL.md` | round 42 |
```

Row count check (plan's own command): `awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' SCORECARD.md | wc -l`
reads 2 at `b237e3f` and 3 once this row lands.

## Conflicts (verbatim, for the canonical Rust judge)

1. **Kill definition.** The plan states: "killed = exit non-zero with a `VERDICT: FAIL` line; a crash
   or timeout is not a kill." The round-41 receipts that define the frozen ids record kills at exit 0:

   - `.ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt`:
     `MUTANT suite-group-verdict killed exit=0`, `MUTANT suite-any-fail killed exit=0`,
     `MUTANT suite-exit-text killed exit=0 cases=74/75 fail_lines=1`; summary
     `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=fae386aa9e0542710b7a893d84c8e92e86fc079b`.
   - `.ufo/waves/round-41/final/a2-census-survivor-mutants.txt`:
     `MUTANT V382-pass-count … killed exit=0 … WAVE_CENSUS_SELFTEST: 26/26 pass VERDICT: PASS failing=WC24`
     and `MUTANT V387-exit-const … killed exit=0 … 25/26 pass VERDICT: FAIL failing=WC24`.

   Consequence: 5 of the 41 frozen ids cannot print `killed` under the plan's literal sentence, so
   the plan's own counting command ("each of the 41 frozen ids printing `killed`") would read
   `GATE_MUTANTS: SURVIVED` and exit 1 on a good tree. The drafts above use the disjunctive rule the
   round-41 probe used (any failing observation: `FAIL ` case line, pass count below the case count,
   `VERDICT: FAIL`, or non-zero exit) and keep crash/timeout apart, because a mutated summary or exit
   arm deliberately hides the failure in the summary line. If the judge rules the plan's sentence
   governs instead, those 5 ids must be dropped or re-anchored, and the 41/41 claim shrinks.

2. **Expect literal of item 19.** The plan names `--selftest` as hermetic and gives no verdict
   literal; the assignment fixes `VERDICT: PASS`. The suite the executor ships must therefore print
   that house literal, not only a `GATE_MUTANTS_SELFTEST: n/m` line, or item 19 fails as a substring
   miss while the suite is green.

## Limits (carried in the prose, not hidden)

- Literal mutants only, one exact substitution each; the manifest is frozen and embedded, so a
  renamed or reworded literal turns the instrument red (`nomatch`, exit 2) rather than passing.
- Crash, runtime error and timeout are reported apart and are not kills.
- A `killed` proves the suite observes that literal; it proves nothing about the rightness or
  completeness of the suite's cases.
- Item 18 runs the whole battery inside `surface-probe`'s per-item cap
  (`CHECKLIST_TIMEOUT_MS = 120_000`, `scripts/surface-probe.mjs:241`). Measured components at
  `b237e3f`: `cite-check --selftest` 0.96 s, `wave-census --selftest` 1.69 s, a `scripts/` copy
  (724 KiB) ~0.0 s. Arithmetic over the 41 frozen ids: 16 × ~0.95 s + 25 × ~1.7 s ≈ 58 s, about
  half the cap. `[INFERENCE]` — extrapolated from one run per target, not from a battery run; if the
  manifest grows or the host is loaded, item 18 fails as a spawn timeout, which reads as a failed
  item, not as a survivor.
- Item 18 measures uncommitted bytes; the gate's `working-copy` header is the only marker of that.
- The other 7 registered gates have no frozen mutant set; this instrument does not close them.

## Evidence (commands and observed output)

1. Clone: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks <lane> lane`
   + `checkout -q --detach b237e3f…` → `git rev-parse HEAD` → `b237e3f09c9559e130c7367bd2efa981c4ea516f`.
2. `ls scripts/gate-mutants.mjs` → `No such file or directory` (instrument absent at the revision).
3. `grep -c '^\s*- \[' SKILL.md` → `17` (C before; drafts make 19).
4. `awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' SCORECARD.md | wc -l` → `2` (rows before).
5. `awk '/^## Gate registry/{f=1} f && /^\| [a-z-]+ \| gate \|/{n++} END{print n}' SKILL.md` → `9` (gate rows before).
6. Grammar: `CHECKLIST_RE.exec` on both drafted lines → `PARSE ok label="Gate-mutants battery" cmd="node scripts/gate-mutants.mjs" exits=0 expect="GATE_MUTANTS: CLEAN"` and `PARSE ok label="Gate-mutants hermetic suite" cmd="node scripts/gate-mutants.mjs --selftest" exits=0 expect="VERDICT: PASS"`.
7. `node scripts/cite-check.mjs --selftest` in the clone (own process group, 60 s cap) → exit 0, `75/75 cases passed (hermetic)`, `VERDICT: PASS`, wall 0.96 s, group leftovers 0.
8. `node scripts/wave-census.mjs --selftest` → exit 0, `WAVE_CENSUS_SELFTEST: 26/26 pass`, `VERDICT: PASS`, wall 1.69 s, group leftovers 0.
9. One-mutant proxy: copy `scripts/` (724 KiB) to `mkdtemp`, run `node scripts/cite-check.mjs --selftest` there → exit 0, `75/75`, wall 0.91 s, leftovers 0, temp removed.
10. `du -sh lane/scripts` → `724K`; copy wall ~0.0 s.
11. `sed -n '241p;262p' scripts/surface-probe.mjs` → `const CHECKLIST_TIMEOUT_MS = 120_000;` and the frozen checklist regex at :262 (label, em dash, command, arrow, exit set, `+`, expect substring; anchored; `u` flag).
12. `sed -n '477,478p' scripts/proxy-check.mjs` → `const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;` and `const RE_CHECKLIST = /^\s*- \[/;` — `A` is a file-extension count over the repo, `C` a task-line count, so the drafts move 9 → 10 and 17 → 19 without any other edit.
13. `grep -o 'MUTANT [^ ]* [a-z-]* exit=[0-9]*' .ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt` → three `killed exit=0` rows (`suite-group-verdict`, `suite-any-fail`, `suite-exit-text`); 13 rows `exit=1`.
14. `tail -3` of that receipt → `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=fae386aa9e0542710b7a893d84c8e92e86fc079b`; `suite-exit-text` line reads `cases=74/75 fail_lines=1`.
15. `.ufo/waves/round-41/final/a2-census-survivor-mutants.txt` → `V382-pass-count … killed exit=0 … 26/26 pass VERDICT: PASS failing=WC24`; `V387-exit-const … killed exit=0 … 25/26 pass VERDICT: FAIL failing=WC24`.
16. Census mutant counts per file: `a2-census-repair-mutants.txt` 3 `MUTANT` rows, `-survivor-` 10, `-findings-` 10, `-exits-` 2 (each file's own `KILLED n/n` line: 3/3, 10/10, 10/10, 2/2).
17. Cite mutant ids: `M = [ … ]` in `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` → 16 entries, same literals as the draft's provenance cell.
18. `SKILL.md:589` and `:593` read "nine" (quoted in §Adjacent prose); `:599` (cite-check row) carries the "read those lines, not only the exit code" precedent the draft row extends.
19. Tool installs or upgrades: none. No package manager, no `uv`, no `npx` was run; the clone used the system `git` and the host `node` already in `PATH`.

## Touched surfaces

- Written: this report only. No patch file — the deliverable is prose, so there is no diff to apply
  against `b237e3f`.
- Intended landing surfaces (for the integrator, not edited here): `SKILL.md` gate-registry table
  (row at `:607` boundary, preamble at `:589`/`:593`), `SKILL.md` `## Verifiable checklist`
  (items after `:691`, preamble at `:660`), `SCORECARD.md` `## Capabilities` (row after `:1680`).
- Read-only reads: the lane tree as checked out at `b237e3f`, `.ufo/waves/round-41/*` receipts,
  `.ufo/waves/round-42/plan.md`, `corpus/lessons/round-41-verifier-spotcheck.md`.

## Out of scope (not drafted, not measured)

- `## Axes` operability row (8 → 9) and the proxy stanza: their arithmetic is 29/32 ≈ 0.906 ⇒ 9, but
  the row text is not this seat's item and the stanza edits are the proxy-seat's.
- The `scripts/gate-mutants.mjs` implementation, its `--selftest` case list, the `--rev` red-before
  run, and the `PIN_UNPINNED` question (R41-2) — no gate-mutants file exists at the measured
  revision, so nothing about its behavior was observed here.
- `surface-probe.mjs` needs no edit for the two items: it parses the list from `SKILL.md` at run time.
