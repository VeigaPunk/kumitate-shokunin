# gotchas — every way `report-receipt-diff.mjs` v2 trips an honest round-64 report

Companion to `report-skeleton.md` (which reads `REPORT_RECEIPT: CLEAN`, exit 0, in both `--rev` and worktree mode).
Each case below was run against the skeleton as a copy in `/tmp`; the reproducing command is self-contained. Run from
the lane root (`/home/vgpnk/Projects/shokunin/kumitate-shokunin`), with the line under test appended to a copy:

```
S=.ufo/waves/round-64/build/K64R2ExecReportSkeleton/report-skeleton.md
T=/tmp/gotcha.md; cp "$S" "$T"; printf '\n%s\n' '<the line under test>' >> "$T"
node scripts/report-receipt-diff.mjs --lane . --round 64 \
  --rev 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --report "$T"
```

## 1. A hash the report cites that is not a commit (HASH_DEAD)

The scanner takes any `\b[0-9a-fA-F]{39,40}\b` as a commit claim unless it is a path component of a URL on the
same line. Three honest traps live in this round's own receipts:

| the honest text | what the tool says | phrasing that avoids it |
|---|---|---|
| `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` (the freeze demo receipt, `.ufo/waves/round-64/base/jj-seat-demo-freeze.txt:15`) | `HASH_DEAD 7c41cdeb16b6b321c64e789a966b6adf723816a5` — the jj build hash is 40-hex and resolves in neither repo | `JJ_SEAT_DEMO: DONE`, jj version as `0.45.1` only; the build hash stays in the receipt, not the report |
| `JJ64_UNMET held=1/8 checks=8 rev=213cfac447103250cdb9f1e768357f95c0f0f405 rule=J64` (the do-nothing receipt, `.ufo/waves/round-64/base/jj64-donothing.txt:1`) | `HASH_DEAD 213cfac447103250cdb9f1e768357f95c0f0f405` — a sandbox-clone commit, absent from the lane | quote the tally and the path, not `rev=`; write `rev` as `the sandbox clone's own commit, not a lane object` |
| a 39-hex abbreviation of a **dead** object | `HASH_DEAD <39-hex> (len=39)` | use the full 40-hex of a live object |

What does **not** trip: a 39-hex abbreviation that resolves (`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d` →
`CLEAN`, git resolves the abbreviation); a 40-hex that is a URL path component on the same line
(`github.com/can1357/oh-my-pi/tree/45c35e40…` in the census, so keep such URLs on one unwrapped line); a hash that
resolves in the **fleet** repo, because `--fleet` defaults to `dirname(--lane)` when that has `.git` — a report checked
with `--lane` pointing at a copy outside `/home/vgpnk/Projects/shokunin` will read those as dead.
A 40-hex that resolves in the lane but is not an ancestor of `--rev` reads `HASH_ORPHAN` (the lane has remote-branch
commits: `git rev-list --all --not 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 | head` is non-empty) — cite only commits
on the measured line, and pass `--rev <the tip the report cites>`.

## 2. Tallies quoted from base receipts that carry other values (TALLY_UNRECEIPTED)

The frozen counters' current reads are **not** committed receipts at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:
`RECEIPT64_UNMET held=4/5 checks=5` (P5 MISS, no report yet) and `JJ64_HELD held=8/8 checks=8` are printed by
`.ufo/waves/round-64/probe/receipt64-probe.mjs` / `jj64-probe.mjs` but no file under `base/` or `close/` carries either
pair — `.ufo/waves/round-64/close/` does not exist at that revision (`git ls-tree -r 2ed8a5f… -- .ufo/waves/round-64/close`
prints nothing).

- Writing `RECEIPT64_UNMET held=4/5 checks=5` anywhere in prose → `TALLY_UNRECEIPTED RECEIPT64_UNMET held=4/5`.
  Phrasing that avoids it: `4 of 5 checks with P5 MISS, exit 1` (a bare count is not a labelled tally — the tool's
  declared limit) **and** the receipted form only after the L1 commits the verdict line under this round's close
  directory, then `RECEIPT64_UNMET held=4/5 checks=5` with that path cited on the same line.
- Same for `JJ64_HELD held=8/8 checks=8`: write `8 of 8 checks, exit 0` until the close receipt exists.
- A tally whose pair a base receipt carries is safe: `RECEIPT64_UNMET held=0/5 checks=5`, `JJ64_UNMET held=0/8
  checks=8`, `JJ64_UNMET held=1/8 checks=8` all read `CLEAN` when their base receipt is cited on the same line.

## 3. Receipt paths with trailing punctuation, directories, escapes (RECEIPT_MISSING)

- Trailing punctuation is **stripped**, so `…/base/receipt64-base.txt;` and an unquoted `…/base/receipt64-base.txt,`
  read `CLEAN` (`g14`). A path followed by `..` (`…/base/p-tip.txt/../../../base/p-base.txt`) reads `RECEIPT_MISSING`.
- A **directory** citation is satisfied by any committed receipt under it: `.ufo/waves/round-64/base/` → `CLEAN`
  (`g17`); `.ufo/waves/round-64/close/` → `RECEIPT_MISSING … (no receipt under it)` (`g4`) because the directory holds
  nothing at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`. Phrasing that avoids it until the close receipts land: name the
  future receipt **without** the round prefix (`close/receipt64-at-tip.txt`) — the scanner only matches
  `.ufo/waves/round-N/(base|close)/…` — and switch to the full path once the file is committed.
- A **symlinked** receipt is not a receipt (mode `120000` is skipped), and an empty one reads `RECEIPT_EMPTY`.

## 4. Tallies in prose that are plans, not results (TALLY_UNRECEIPTED / TALLY_CHECKS_MISMATCH)

- The plan's own target `RECEIPT64_HELD held=5/5` written in the report reads `TALLY_UNRECEIPTED` (`g8`) — there is no
  receipt for a plan. Phrasing: `the plan's target is 5 of 5 checks (P1..P5)`, or keep it inside `plan.md` and cite
  the plan without the tally.
- **Scope trap** (`g20`): a line that cites receipts is checked only against those receipts.
  `RECEIPT64_UNMET held=0/5 checks=5` (`.ufo/waves/round-64/base/jj64-base.txt`) reads `TALLY_UNRECEIPTED` because the
  cited receipt does not carry that pair — keep each tally on the line that cites **its own** receipt.
- With **no** receipt cited on the line, any committed receipt of the round may carry the pair (`g21`, `g22`).
- `checks=` after the pair must agree with the receipt's `checks=` or read `TALLY_CHECKS_MISMATCH`
  (`RECEIPT64_UNMET held=0/5 checks=6` + the base receipt, `g9`); a receipt with no `checks=` accepts any `checks=`.
- Spacing and case are normalised (`held = 0 / 5` → `CLEAN`, `g10`), and a table cell or a zero-width character
  between label characters does not hide a tally — the normalisation is there so a claim cannot be hidden, not so an
  honest one can be spelled around.

## 5. Fenced blocks exempt headings only — never tallies, never receipt paths

`unfence()` blanks fenced lines for **section detection** only; `PLACEHOLDER`, tallies and receipt paths are scanned over
the whole text. So a fenced example of a lie reads DRIFT (`g6`: a fence containing `RECEIPT64_HELD held=5/5` →
`TALLY_UNRECEIPTED`), and a fenced `…/close/foo.txt` reads `RECEIPT_MISSING`. Phrasing: never put a labelled tally or a
`base/`/`close/` path inside a fence — use `label held=x/y` as prose with a placeholder-free spelling, or describe the
lie without its tally.

## 6. Section and SHONEN shape

- The six headings must appear in **prose** (a report whose body is one fenced block reads
  `SECTION_MISSING,SHONEN_COUNT`). Spellings: `## Work performed`, `## Landed changes`,
  `## Before → after measurements` (the arrow or `->`), `## Sources & frontier`, `## Trend verdicts`, `## SHONEN`.
- **Any** heading whose text starts with `SHONEN` counts: adding `### SHONEN notes` after the section reads
  `SHONEN_COUNT headings=2` (`g7`). Phrasing: name it `### Fill instructions` or `### UNMEASURED — what fills each`.
- Four box markers `[x]` / `[~]` / `[ ]` (optionally backticked, several per line) must sit on list lines **inside** the
  SHONEN section, before any heading of the same or higher level. Sub-headings (`###`) do not end the section; a `##`
  heading after the boxes would.

## 7. Placeholder spellings that read as unfilled tokens (PLACEHOLDER)

`__NAME__` (two or more characters between the underscores), `{{NAME}}`, `XXXX`, `TBD`, `to be filled`, `LANE_HASH`,
`<measured>`, `<measured_rev>`, `<tip_hash>`, `<rev_hash>`, `<placeholder>`, `<tbd>`, `<todo>`. The literal
`UNMEASURED` is **not** one of them — it is the skeleton's honest marker. Command templates keep `<lane>`, `<rev>`,
`<tip>`: those are exempt.

## 8. Measure on the archive, not on the dirty worktree

`proxy-check` counts every runnable file (`.mjs/.js/.sh/.py`) under `--self`, so during a wave it reads
`A_DRIFT term=A declared=257 computed=1294` on the lane worktree (wave build artifacts included) but
`computed=514` on `git archive 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` — both are DRIFT, but only the archive number
is a property of the tree the report claims to measure. Phrasing that avoids a misreport:
`measured on git archive <rev>, exit 1` and the archive delta; never quote the worktree delta as the tree's.
Same rule for `readme-map` (`files=156` on the archive) and for any receipt cited with `--rev`.

## 9. Keep the skeleton passing while filling it

Every `UNMEASURED` may be replaced only by (a) a bare count, or (b) a labelled verdict line **whose receipt is cited on
the same line and committed**. After each fill: `node scripts/report-receipt-diff.mjs --lane . --round 64 --rev
<measured-rev> --report .ufo/reports/round-64/kumitate.md` must still print `REPORT_RECEIPT: CLEAN`, exit 0, and the
frozen counter must print `RECEIPT64_HELD held=5/5 checks=5 rev=<measured-rev> rule=R64`, exit 0.
