ATTACK corpus/knowledge/remaining-scripts-census.md:590 (## `scripts/gates-plan.mjs`) verdict=partial defects=3

Scope: round-35 edit of the member section (heading `:590`, body `:592`) and its
population row (`:137`). Source read only via `/fast/scratch/kumitate-r35/src` at
`31c465f1` (`rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`). No lane
edit, no git mutation; scratch only `/fast/scratch/kumitate-r35/w/SecGatesPlan/`.
No tools installed. LSP unavailable (no `lsp` device): source evidence is direct reads
of the pinned blob with `git show`.

No NEW false behavioral claim: every stated behavior is true of the file at the pin,
the population row is exact, both removed symbols left traces. The three defects are
citation/wording: two anchors do not host the named item/behavior, one causal clause
misattributes the tables. D1 and D3 are carried from master; D2's parenthetical is
carried but its new anchor sits on a comment that says the opposite.

## D1 (P3, carried) — field-quartet anchor covers 1 of 4 named tokens

census `:592`: "`touched=`, `basis=`, `group=`, `note=` (`scripts/gates-plan.mjs:6`)".

$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/gates-plan.mjs | nl -ba | sed -n '4,7p'
```
     4	//   touched=<n|unknown>   size of the touched-path set
     5	//   basis=<sources>        which diff sources contributed
     6	//   group=<name>           selected suite group (repeatable)
     7	//   note=<text>            human-auditable selection reason (repeatable)
```
Only `group=` is at `:6`. Emit sites: `:200` `touched=` (ternary `"unknown"`), `:201`
`basis=`, `:202` `group=`, `:203` `note=`.
Fix: `(`scripts/gates-plan.mjs:6`)` -> `(:4-7)`.

## D2 (P3, new anchor choice) — "empty string means unknown" not in `:87-90`; cited comment says the opposite

census `:592`: "`UFO_GATES_TOUCHED` (`:87-90`) pins the set explicitly (empty string means unknown)".

$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/gates-plan.mjs | nl -ba | sed -n '87,90p;126p;200p'
```
    87	// UFO_GATES_TOUCHED (newline/comma-separated repo-relative paths) pins the
    88	// selection explicitly — a fleet lane gates its OWN diff, not sibling
    89	// churn that happens to share the worktree. Empty string = empty set.
    90	let touchedEnv = process.env.UFO_GATES_TOUCHED;
   126	    if (files.length === 0) return { files: null, basis: "env:UFO_GATES_TOUCHED(empty)" };
   200	out.push(`touched=${touched.files === null ? "unknown" : touched.files.length}`);
```
The claim is true (empty env -> `files:null` `:126` -> `selectAllGroups` `:180-181` ->
`touched=unknown` `:200`) but lives at `:126`/`:200`, not in the cited block; `:89`
says "Empty string = empty set", contradicting the note. FidGatesPlan recorded
"empty-set->null->`touched=unknown` verified at `:126`/`:200`", yet neither is cited.
Fix: cite `(:87-90, :126)` for that clause.

## D3 (P3, carried) — "GROUPS/IGNORE_RES/RULES feed selectAllGroups" is not the code

census `:592`: "`GROUPS` (`:20`), `IGNORE_RES` (`:37`) and ordered `RULES` (`:46`) feed
`selectAllGroups` (`:175`)."

$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/gates-plan.mjs | nl -ba | sed -n '175,177p;183,194p;197p;202p'
```
   175	const selectAllGroups = (why) => {
   176	  selectAll = true;
   177	  notes.push(`all-groups: ${why}`);
   183	  for (const file of touched.files) {
   184	    if (IGNORE_RES.some((re) => re.test(file))) continue;
   186	    for (const rule of RULES) {
   189	      if (rule.all) selectAllGroups(`${file} (${rule.why})`);
   190	      for (const g of rule.groups ?? []) groups.add(g);
   193	    if (!matched) selectAllGroups(`unmapped path ${file}`);
   197	if (selectAll) for (const g of GROUPS) groups.add(g);
   202	for (const g of GROUPS) if (groups.has(g)) out.push(`group=${g}`);
```
`selectAllGroups` only sets a flag and pushes a note; it takes no table input. Of the
three, only `RULES` calls it (`rule.all`, `:189`), plus the uncertainty arms `:181`/
`:193`; `IGNORE_RES` filters and `GROUPS` is read only at `:197`/`:202`.
Fix: "feed the selection loop whose uncertainty sink is `selectAllGroups` (`:175`)".

## Verified (no defect)

1. Row `:137` `| `scripts/gates-plan.mjs` | 204 | tool |`; `... show 31c465f1:scripts/gates-plan.mjs | wc -l` -> 204 (equal); top-level non-test -> `tool` holds.
2. Membership rebuilt with the note's own formula -> `S_members 88`, `S1–S7 28`, `S8 60`; `scripts/gates-plan.mjs` ∈ S8 and ∉ S1–S7; headings 60, duplicates 0.
3. Anchor symbols at their cited lines: `:120` `function touchedPaths() {`; `:20` `const GROUPS = [`; `:37` `const IGNORE_RES = [`; `:46` `const RULES = [`; `:175` `const selectAllGroups = (why) => {`; `:180-181` `if (touched.files === null) {` / `selectAllGroups(\`touched set unreadable ...\`)`; `:193` `if (!matched) selectAllGroups(\`unmapped path ${file}\`)`; `:204` `process.stdout.write(out.join("\n") + "\n");`; `:70` `const USAGE = "usage: node scripts/gates-plan.mjs [--root <dir>] [--touched-file <f>]";`.
4. Behaviors: union (`:145-160` adds worktree-diff, untracked, `origin/main...HEAD`; no-origin fallback diffs the empty tree); fail-safe (non-git/unreadable throw caught `:166-168` -> `files:null` -> `:180-181`; `rule.all`/unmapped also select all; `:197` adds every `GROUPS`); "EPIPE is not absorbed" (`grep -c EPIPE` -> 0; only stdout call `:204`); `scripts/gates.sh:699` `plan_out="$(node scripts/gates-plan.mjs)" || fail ...`.
5. Removed clauses: `grep -c IGNORE_ESCAPE` -> 0, `grep -c writeStdout` -> 0 at the pin; both also 0 at `964f443e` (pre-existing drift), but the traces as written ("absent at 31c465f1") are accurate.
6. Revision label: master's section (`git show master:...:554`) carried NO revision label, so none was dropped; the new text adds "re-anchored at 31c465f1 (round 35)". The section states no size, so the `was N @ 964f443e` convention does not apply; the 200->204 move survives only in git.
7. `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8` -> `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)`; gates-plan entry `anchors=11 live=true symbolHit=true`. That gate checks anchor liveness and a symbol anywhere in the file (`scripts/claims-check.mjs:376-386`), so it cannot see D1/D2 — consistent with `corpus/lessons/round-35.md:20`.
8. Note's own arm reproduced: `node w/SecGatesPlan/member-probe.mjs` (verbatim from census `:262-320`) with the pinned `UFO_SRC` -> `HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0` / `MEMBER_PROBE: 60/60 ok` (rc 0); S8 line sum 33367 matches the current-census block.

## Observations (not counted)

- O1: the traces justify removal by absence at the pin, not at the base; "(absent at both pins)" would be more faithful, though what is written is not false.
- O2: master's fail-safe clause also carried "so a fast run can only over-test, never silently under-test"; the rewrite dropped that rationale (entailed by the retained sentence) without a marker — style loss, not a falsehood.

## Minimal fix set (one-line edits; no counts change)

1. census `:592`: `(`scripts/gates-plan.mjs:6`)` -> `(:4-7)`.
2. census `:592`: `(`:87-90`)` -> `(:87-90, :126)` for the empty-string clause.
3. census `:592`: "feed `selectAllGroups`" -> "feed the selection loop; `selectAllGroups` (`:175`) is the uncertainty sink".
