RESULT ExecQualityFailCmds rev=516977af verdict=both q33_fail_exit=1 q33_pass_exit=0 q34_fail_exit=1 q34_pass_exit=0

Two shown-able-to-fail commands for the new QUALITY criteria routed by
corpus/lessons/round-45-verifier-spotcheck.md §5 D2 and D4. Both were run from
scratch clone /fast/scratch/hyaku/kumitate-r46/seats/w1-ExecQualityFailCmds/lane
(detached at 516977af2216b1cc426ee970d260dee53714bf4f), scripts under
.../seats/w1-ExecQualityFailCmds/work/. Every demonstration ran under
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900`.
No tools installed or updated (bash, git, grep/awk/sed, cmp only). No lane writes;
no leftover processes (`pgrep -f w1-ExecQualityFailCmds` -> none after runs).

## Q33 (D2): a SOURCES row's `teaches` is checked against every locator before the entry commit

Command `q33-locator-coverage.sh <repo> <rev> <lesson>` (full script below). Rule:
for each row admitted in the lesson's `## Gate` table (decision cell contains
"admit"), take the row's `anchor` cell in `corpus/SOURCES.md` at <rev>, extract
locators (file-like tokens `path/name.ext`, matched by basename; man tokens
`name(n)`, matched by `name`), and require, per locator, a line in the lesson or
in any `.ufo/**/*.md` committed at <rev> that names the row id as a word AND the
locator. Exit 1 lists every uncovered (row, locator) pair.

FAIL run (round-45 state at the judged commit, item's X-case):

```sh
$ ./q33-locator-coverage.sh <lane> 6b2a45178c72a4565bb9d98e09f4c36b95ca1521 corpus/lessons/round-45.md
Q33 COVERED S013 locators=0/0
... (S027,S062,S063,S065,S066,S067,S071,S074 locators=0/0; S064 1/1; S069 1/1; S070 1/1)
Q33 UNCOVERED S068 anchor-locators-checked=1/5 missing=[isolation-runner.ts,lib.rs,rcopy.rs,settings.ts]
Q33 UNCOVERED S072 anchor-locators-checked=2/3 missing=[systemd-run.html]
Q33 UNCOVERED S073 anchor-locators-checked=1/4 missing=[buffer.html,getrlimit,prlimit]
Q33 FAIL rev=6b2a45178c72a4565bb9d98e09f4c36b95ca1521 uncovered locators present (a row's teaches was not checked against every locator)
exit=1
```

S073's anchor names `cli.html`, `buffer.html`, `getrlimit(2)`, `prlimit(1)`; the
gate line covers only `cli.html`. `a2-control/ReopenS073.md` does not rescue the
rest: its per-locator lines read "Row locator `...`" and never co-name `S073` on
the same line (filename `ReopenS073` does not count as a check line; line 29's
`buffer-v24.21.0.html` is not the string `buffer.html`). S068/S072 gaps are real
under the same rule — no pre-entry receipt line co-names those locators with the
row id. Both corroborate D2: teaches cells were committed without per-locator
checks.

PASS run (fixture repo, one admitted row, two locators, each with a check line —
one in the gate row, one in a receipt line co-naming the row):

```sh
$ ./q33-locator-coverage.sh <fixture-repo> 8c20250db2f06e29494b03e119375f31b5d56dfe corpus/lessons/round-99.md
Q33 COVERED S901 locators=2/2
Q33 PASS rev=8c20250d... rows=1 all-locators-checked
exit=0
```

## Q34 (D4): a prescribed guard is byte-identical to the guard in the receipt that tested it

Command `q34-guard-bytecmp.sh <entry-file> <row-ere> <receipt-file> [guard-ere]`
(full script below). Prescribed = longest backtick-quoted span on the matched
table row with the markdown `\|` escape restored; tested = first line matching
<guard-ere> inside a fenced code block of the receipt; compared with `cmp`.

FAIL run (X4 case: entry decision-table row 3 at 6b2a4517 vs the
SentinelSeatEnvScrub receipt it cites; both inputs taken via `git show`):

```sh
$ ./q34-guard-bytecmp.sh entry-6b2a.md 'edit code, run a gate that writes' receipt-sentinel.md
Q34 MISMATCH row=/edit code, run a gate that writes/ entry-6b2a.md:162 (212B) vs receipt-sentinel.md (306B)
Q34 cmp: differ: byte 3, line 1
Q34 prescribed: _g=$(git rev-parse --local-env-vars) || exit; [ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }; unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
Q34 tested    : _git_local_env=$(git rev-parse --local-env-vars 2>/dev/null) || exit; [ -z "$_git_local_env" ] || { mapfile -t _git_local_env_names <<< "$_git_local_env" && unset "${_git_local_env_names[@]}"; } || exit; unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
Q34 FAIL exit=1
exit=1
```

This is exactly AblScrubRow D4: the receipt tested `_git_local_env`/`_n`-named
variables with `2>/dev/null` and a second `|| exit`; the row prescribes the
`_g`/`_n` form — different bytes from byte 3.

PASS run (fixture entry row and receipt carrying the same 54-byte guard):

```sh
$ ./q34-guard-bytecmp.sh fix34-entry.md 'edit code, run a gate' fix34-receipt.md 'rev-parse --local-env-vars'
Q34 IDENTICAL row=/edit code, run a gate/ fix34-entry.md:3 vs fix34-receipt.md bytes=54
Q34 PASS exit=0
exit=0
```

## Limits

Q33's locator set is a tokenizer heuristic (file extensions + man sections);
pure-section anchors yield 0 locators and pass trivially — a future check should
require >=1 locator per anchor. A check line must co-name row and locator;
file-level naming (receipt title only) does not count, matching the per-locator
line discipline D2 prescribes. Q34 extracts the longest backtick span per row —
multi-guard rows need one invocation per guard span.

## Command 1: q33-locator-coverage.sh

```sh
#!/bin/bash
# q33-locator-coverage.sh — Q33: for each SOURCES row admitted in a round lesson's
# "## Gate" table, every locator in the row's `anchor` cell must have a check line,
# at the named revision, in the lesson or in a committed .ufo/**.md receipt, that
# names the row id AND the locator on the same line.
# Usage: q33-locator-coverage.sh <repo-dir> <rev> <lesson-path>
# Exit 0 = all admitted rows fully covered; 1 = uncovered locator(s); 2 = usage.
set -u
[ $# -eq 3 ] || { echo "usage: $0 <repo> <rev> <lesson-path>" >&2; exit 2; }
repo=$1 rev=$2 lesson=$3
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT

git -C "$repo" show "$rev:$lesson" > "$work/lesson.md" 2>/dev/null || {
  echo "Q33 ERROR: cannot read $rev:$lesson" >&2; exit 2; }
git -C "$repo" show "$rev:corpus/SOURCES.md" > "$work/SOURCES.md" 2>/dev/null || {
  echo "Q33 ERROR: cannot read $rev:corpus/SOURCES.md" >&2; exit 2; }

# admitted row ids: gate-table rows whose decision cell contains "admit"
mapfile -t rows < <(awk -F'|' '/^\| S[0-9]+ \|/ && /admit/ {gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}' "$work/lesson.md" | sort -u)

# candidate check lines: whole lesson + every committed .ufo **/*.md at rev
cat "$work/lesson.md" > "$work/checklines.txt"
while IFS= read -r f; do
  git -C "$repo" show "$rev:$f" 2>/dev/null
done < <(git -C "$repo" ls-tree -r "$rev" --name-only -- '.ufo' | grep '\.md$') >> "$work/checklines.txt"

fail=0
for id in "${rows[@]}"; do
  # anchor = column 6 of the row's SOURCES.md line
  anchor=$(awk -F'|' -v id="$id" '$0 ~ "^\\| "id" \\|" {gsub(/^[ \t]+|[ \t]+$/,"",$7); print $7}' "$work/SOURCES.md")
  [ -n "$anchor" ] || { echo "Q33 WARN: $id admitted but no SOURCES row at $rev" >&2; continue; }
  # locators: file-like tokens (basename with real extension) or man tokens name(n)
  mapfile -t locs < <(printf '%s\n' "$anchor" \
    | grep -oE '[A-Za-z0-9_/.-]+\.(html|adoc|md|xml|ts|c|rs|json|txt|sh)|[a-z_][a-z0-9_-]*\([0-9][a-z]*\)' \
    | sed 's/[():].*$//; s|.*/||' | sort -u)
  # lines naming the row (word boundary so "a2-ReopenS073" does not count)
  grep -E "(^|[^A-Za-z0-9])${id}([^A-Za-z0-9]|$)" "$work/checklines.txt" > "$work/lines.$id" || true
  n=0; missing=()
  for L in "${locs[@]}"; do
    if grep -qF "$L" "$work/lines.$id"; then n=$((n+1)); else missing+=("$L"); fi
  done
  total=${#locs[@]}
  if [ "${#missing[@]}" -gt 0 ]; then
    fail=1
    echo "Q33 UNCOVERED $id anchor-locators-checked=$n/$total missing=[$(IFS=,; echo "${missing[*]}")]"
  else
    echo "Q33 COVERED $id locators=$total/$total"
  fi
done
if [ "$fail" -eq 0 ]; then echo "Q33 PASS rev=$rev rows=${#rows[@]} all-locators-checked"; exit 0; fi
echo "Q33 FAIL rev=$rev uncovered locators present (a row's teaches was not checked against every locator)"
exit 1
```

## Command 2: q34-guard-bytecmp.sh

```sh
#!/bin/bash
# q34-guard-bytecmp.sh — Q34: a guard prescribed in an entry (or wave context) must
# be byte-identical to the guard in the receipt that tested it.
#   prescribed := longest backtick-quoted span on the matched table row, with the
#                 markdown cell escape `\|` restored to `|`.
#   tested     := first line inside a fenced code block of the receipt matching
#                 <guard-ere> (default: rev-parse --local-env-vars).
# Usage: q34-guard-bytecmp.sh <entry-file> <row-ere> <receipt-file> [guard-ere]
# Exit 0 = byte-identical; 1 = differ; 2 = usage/extraction error.
set -u
[ $# -ge 3 ] || { echo "usage: $0 <entry-file> <row-ere> <receipt-file> [guard-ere]" >&2; exit 2; }
entry=$1 rowere=$2 receipt=$3 ere=${4:-'rev-parse --local-env-vars'}
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT

rowline=$(grep -nE "$rowere" "$entry" | head -1) || { echo "Q34 ERROR: no row matching /$rowere/ in $entry" >&2; exit 2; }
rownum=${rowline%%:*}
grep -E "$rowere" "$entry" | head -1 > "$work/row.txt"
# longest backtick span
grep -oE '`[^`]+`' "$work/row.txt" | sed 's/^`//; s/`$//' | awk '{ if (length($0)>length(m)) m=$0 } END { print m }' \
  | sed 's/\\|/|/g' > "$work/prescribed.txt"
[ -s "$work/prescribed.txt" ] || { echo "Q34 ERROR: no backtick guard span at $entry:$rownum" >&2; exit 2; }

# first line matching ere inside any fenced block of the receipt
awk '/^```/{inb=!inb; next} inb{print}' "$receipt" | grep -E "$ere" | head -1 > "$work/tested.txt" || true
[ -s "$work/tested.txt" ] || { echo "Q34 ERROR: no fenced line matching /$ere/ in $receipt" >&2; exit 2; }

pbytes=$(wc -c < "$work/prescribed.txt"); tbytes=$(wc -c < "$work/tested.txt")
# compare as bytes without trailing newline
printf '%s' "$(cat "$work/prescribed.txt")" > "$work/p.bin"
printf '%s' "$(cat "$work/tested.txt")"     > "$work/t.bin"
if cmp -s "$work/p.bin" "$work/t.bin"; then
  echo "Q34 IDENTICAL row=/$rowere/ $entry:$rownum vs $receipt bytes=$pbytes"
  echo "Q34 PASS exit=0"; exit 0
fi
echo "Q34 MISMATCH row=/$rowere/ $entry:$rownum (${pbytes}B) vs $receipt (${tbytes}B)"
echo "Q34 cmp: $(cmp "$work/p.bin" "$work/t.bin" 2>&1)"
echo "Q34 prescribed: $(cat "$work/prescribed.txt")"
echo "Q34 tested    : $(cat "$work/tested.txt")"
echo "Q34 FAIL exit=1"; exit 1
```
