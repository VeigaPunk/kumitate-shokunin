VERDICT: `scripts/report-receipt-diff.mjs` v2 (`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`) has seven concrete soundness and false-DRIFT defects across `scan()`/`cited()` scoping, `TALLY` & `checks=` parsing, `unfence()`/CRLF/`SHONEN` structure checks, `RECEIPT_PATH`/`globRe` validation, `HASH`/`inUrl()` URL exemption, and CLI `--rev`/entrypoint handling; a `git apply --check`-clean patch (`build/K64R2ReviewToolV2/report-receipt-diff.v2-fixes.patch`) closes all seven while keeping 52/52 selftests, 37/37 receipt controls, and P3 (r60/r63) intact.

## Evidence

Fixture lane `/tmp/kumitate-r64/K64R2ReviewToolV2/fx` (`git -C "$D" init -q`, `rev-parse --show-toplevel` = `/tmp/kumitate-r64/K64R2ReviewToolV2/fx`, commit `996fd336e33412da1b36da940bafcd6bf4be4185`) holding committed `.ufo/waves/round-9/close/p-tip.txt` (`X9_HELD held=1/3 checks=3 rev=abc rule=X9`), `close/r-tip.txt` (`X9_HELD held=3/3 checks=3 rev=old rule=X9`), `close/empty.txt` (0 B), `base/p-base.txt` (`X9_UNMET held=0/3 checks=3 rev=abc rule=X9`), plus untracked `close/untracked.txt` (`Z9_HELD held=9/9 checks=9`).

```text
$ TOOL=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs
$ FX=/tmp/kumitate-r64/K64R2ReviewToolV2/fx; REV=996fd336e33412da1b36da940bafcd6bf4be4185
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r1-scan-scope-wipe.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=230)   # exit=0 (lie: X9_HELD held=3/3 citing p-tip.txt + " / .. / x")
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r1b-wrapped-cite.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=223)   # exit=0 (lie: X9_HELD held=3/3 with (`...p-tip.txt`) on next line)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r1c-swap-cite.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=281)   # exit=0 (swapped base/close citations on one line)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r2-scan-prose-false-drift.md --rev "$REV"
REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=374)
TALLY_UNRECEIPTED X_HELD held=3/3
TALLY_UNRECEIPTED LOCK_HELD held=1/2
TALLY_UNRECEIPTED X9_HELD held=1/3
TALLY_UNRECEIPTED X9_UNMET held=0/3                                                        # exit=1 (false DRIFT on prose, `a / b` paths, and dir citation)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r3-tally-bypasses.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=478)   # exit=0 (10 tally/checks= lies in one report all read CLEAN)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r4a-fence-mismatch.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=170)   # exit=0 (all 6 headings inside ~~~ fence toggled open by inner ```)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r4b-shonen-escape.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=170)   # exit=0 (0 boxes in SHONEN; 4 boxes on 1 line under ##**Appendix**)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r4c-unbalanced-fence.md --rev "$REV"
REPORT_RECEIPT: DRIFT SECTION_MISSING,SHONEN_COUNT (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=197) # exit=1 (inline ```code` blanks rest of file)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r4d-crlf-shonen.md --rev "$REV"
REPORT_RECEIPT: DRIFT SHONEN_COUNT (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=245) # exit=1 (CRLF report; LF-identical bytes read CLEAN)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r5a-dotdot-and-empty-glob.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=237)   # exit=0 (`.ufo/.../close/..` and `empty*` glob read CLEAN)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r5b-globstar.md --rev "$REV"
REPORT_RECEIPT: DRIFT RECEIPT_MISSING (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=207) # exit=1 (`close/**/*.txt` fails to match `close/p-tip.txt`)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r6a-inurl-global-bypass.md --rev "$REV"
REPORT_RECEIPT: CLEAN (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=321)   # exit=0 (dead 40-hex commit masked by 64-hex URL elsewhere)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r6b-sha256-ellipsis-false-drift.md --rev "$REV"
REPORT_RECEIPT: DRIFT HASH_DEAD (round=9 rev=996fd336e33412da1b36da940bafcd6bf4be4185 bytes=226) # exit=1 (truncated `sha256=<40-hex>…` flagged as HASH_DEAD)
$ node "$TOOL" --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r7-untracked.md --rev=
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=227)                                    # exit=0 (--rev= or trailing --rev silently drops to worktree)
$ ln -sf "$TOOL" /tmp/kumitate-r64/K64R2ReviewToolV2/rrd-link.mjs && node /tmp/kumitate-r64/K64R2ReviewToolV2/rrd-link.mjs --lane "$FX" --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r7-untracked.md --rev "$REV"
# (zero bytes stdout/stderr, exit=0 — CLI block skipped when invoked via symlink or path containing spaces)
```

## Findings

- **K64R2ReviewToolV2-1 (high — soundness & false DRIFT, attacks `scan()` + `cited(line)` scoping at `scripts/report-receipt-diff.mjs:51-55,145-150`)**: `scan()` collapses `[ \t]*\/[ \t]*` → `/` across the entire line before `cited(line)` runs, and `scope` is computed once per line without trailing-slash directory matching.
  1. *Scope-wipe forgery*: `X9_HELD held=3/3 (.ufo/waves/round-9/close/p-tip.txt / .. / x)` passes step 1 (`cited(text)` stops at space before `/`, so `p-tip.txt` is valid), then `scan(line)` fuses `/ .. /` onto the path; `filter(isPath)` drops it, `scope` becomes `[]`, and the lie matches `r-tip.txt` (`CLEAN`).
  2. *Wrapped-line & same-line multi-clause bypasses*: wrapping `(`.ufo/waves/round-9/close/p-tip.txt`)` onto the next line leaves `scope=[]` on the claim line (`CLEAN`); putting two tallies on one line unions their citations so swapped `base`/`close` citations both pass (`CLEAN`).
  3. *False DRIFT*: two valid paths separated by ` / ` fuse into one nonexistent path; a directory citation `(`.ufo/waves/round-9/base/`)` on a tally line fails `sp === h.file` at line 149 (`TALLY_UNRECEIPTED`); prose like `when lock_held | held = 1 / 2` or `X_HELD held = 3 / 3 of the seats` (with `3/30` also matching prefix `3/3` because `(\d+)` lacks `(?![0-9/])`) synthesizes unreceipted tallies.
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r1-scan-scope-wipe.md --rev 996fd336e33412da1b36da940bafcd6bf4be4185` (and `r1b-wrapped-cite.md`, `r1c-swap-cite.md`, `r2-scan-prose-false-drift.md`).
  - Minimal diff: restrict `scan()`'s `=`/`/` collapsing to `\b(held|checks)[ \t]*=[ \t]*` and `(held=\d+)[ \t]*\/[ \t]*(\d+)`; extract citations from raw clauses (splitting on `;` when clauses cite receipts, plus 1-line continuation lookahead), fail closed when any cited path in clause fails `isPath`, and include `sp.endsWith('/') ? h.file.startsWith(sp) : ...` in `scope`.

- **K64R2ReviewToolV2-2 (high — soundness, attacks `TALLY` and `checks=` regexes at `scripts/report-receipt-diff.mjs:46,51-55,139,151-152`)**:
  1. `TALLY = /\b([a-z][a-z0-9]*_(?:held|unmet))\s+held=(\d+)\/(\d+)/gi` forbids underscores inside the label stem (`[a-z0-9]*` excludes `_`) and after a leading `_` (`\b` fails between `_` and `[a-z]`), so any multi-word label (`FOO_BAR_HELD held=99/99`, `JJ_SEAT_HELD held=99/99`) or `_X9_HELD held=99/99` is invisible (`CLEAN`).
  2. Inline Markdown/punctuation (`**X9_HELD** held=99/99`, ``X9_HELD `held=99/99` ``, `X9_HELD: held=99/99`), Unicode `U+00A0` (NBSP) / `U+00AD` (soft hyphen), or a line wrap between label and `held=` all evade `scan()`/`TALLY` (`CLEAN`).
  3. `/^\s*checks=(\d+)/` at lines 139 & 151 is case-sensitive (`CHECKS=99` → `CLEAN`), requires immediate adjacency (`X9_HELD held=1/3 rev=abc checks=99` → `CLEAN`), and `h.checks === null` lets a receipt without `checks=` excuse any fabricated `checks=99`.
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r3-tally-bypasses.md --rev 996fd336e33412da1b36da940bafcd6bf4be4185`
  - Minimal diff: allow `[A-Za-z0-9_]*` in `TALLY` with `(?<![A-Za-z0-9])` (requiring a digit in all-lowercase labels so English `lock_held` prose is ignored while `x9_HELD` in k2 is caught), strip `U+00AD`/`U+00A0` and inline `` ` ``/`*`/`:` in `scan()`, join `_(?:HELD|UNMET)\nheld=`, and match `/^[^\n;]*?\bchecks=(\d+)/i` requiring `h.checks !== null && h.checks === c[1]`.

- **K64R2ReviewToolV2-3 (medium — soundness & false DRIFT, attacks `unfence()`, CRLF handling, and `SHONEN` at `scripts/report-receipt-diff.mjs:38-43,57-63,77-88`)**:
  1. `unfence()` uses a single boolean toggled by `/^\s*(?:```|~~~)/`: opening `~~~` and putting ` ``` ` inside toggles `fenced` back to `false`, so all 6 headings inside a `~~~` code block pass as prose (`r4a`, `CLEAN`); conversely, inline `` ```code` `` at line start toggles `fenced=true` for the rest of the file (`r4c`, false `SECTION_MISSING,SHONEN_COUNT`).
  2. `REQUIRED` and `SHONEN` heading regexes use `\s*\**` (0 spaces allowed before `*`), while the SHONEN section-break regex `/^(#{1,6})\s/` requires a whitespace char after `#`: placing `##**Appendix**` after an empty `## SHONEN` does not break the loop (`r4b`, `CLEAN`). Also one bullet `- [ ] [ ] [ ] [ ]` satisfies `boxes >= 4` (`r4b`).
  3. `text.split('\n')` leaves `\r` on CRLF lines; `/^(#{1,6})\s/.exec("###\r")` matches `\r` as `\s` on a bare `###` line under `### SHONEN`, breaking the loop early (`r4d`: CRLF reads `DRIFT SHONEN_COUNT boxes=0`, LF reads `CLEAN`).
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r4a-fence-mismatch.md --rev 996fd336e33412da1b36da940bafcd6bf4be4185` (and `r4b-shonen-escape.md`, `r4c-unbalanced-fence.md`, `r4d-crlf-shonen.md`).
  - Minimal diff: normalize `\r\n?` → `\n` on report and receipt text; track opening fence char and length (`openCh`, `openLen`) and ignore inline `` ```foo` ``; require `[ \t]+` or `\*` followed by `\S` on headings and cap boxes at 2 per bullet across `>= 2` bullet lines.

- **K64R2ReviewToolV2-4 (medium — soundness & false DRIFT, attacks `cited()`, `isPath()`, `globRe()`, and directory/glob checks at `scripts/report-receipt-diff.mjs:114-130`)**:
  1. `cited()` strips trailing `[.,;:]+` *before* `isPath()` checks for `..`: `.ufo/waves/round-9/close/..` becomes `.ufo/waves/round-9/close/` (a valid directory citation) and reads `CLEAN`.
  2. Directory (`p.endsWith('/')`) and glob (`p.includes('*')`) branches check key existence only and `continue` before line 129's `.trim()` check, so citing `.ufo/waves/round-9/close/empty*` (matching 0-byte `empty.txt`) bypasses `RECEIPT_EMPTY` (`CLEAN`).
  3. `globRe()` splits only on single `*` → `[^/]*`, so `**` becomes `[^/]*[^/]*` (still cannot cross `/` or match zero segments in `.ufo/waves/round-9/close/**/*.txt` → false `RECEIPT_MISSING`). Also worktree mode (`!rev`, lines 103-111) uses non-recursive `readdirSync`, diverging from `git ls-tree -r`.
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r5a-dotdot-and-empty-glob.md --rev 996fd336e33412da1b36da940bafcd6bf4be4185` (and `r5b-globstar.md`).
  - Minimal diff: preserve trailing `..`/`.` in `stripPunct` (`/(?:\.{3,}|[,;:]+|(?<!\.)\.(?!\.))+$/`), reject `.` and `..` segments in `isPath`, require at least one non-empty matched receipt in directory/glob branches, handle `**/` in `globRe`, and recurse in worktree mode.

- **K64R2ReviewToolV2-5 (medium — soundness, false DRIFT & quadratic regex, attacks `HASH` and `inUrl()` at `scripts/report-receipt-diff.mjs:48,159-167`)**:
  1. `inUrl(raw)` checks `textLines.some(...)` across the *whole report* and its dynamic `new RegExp(\`...[^\\s)\\]>\`]*\${raw}\`, 'i')` has no trailing word boundary: a dead 40-hex commit hash in prose is exempted (`CLEAN`) if the same hash—or any 64-hex SHA-256 capture URL starting with those 40 hex chars—appears inside a URL anywhere in the report (`r6a`).
  2. While a contiguous 64-hex SHA-256 digest is not matched by `\b[0-9a-fA-F]{39,40}\b` (`\b` fails at position 40), reports that abbreviate a SHA-256 at 39–40 hex before `…` (U+2026, a non-word char) create a `\b` boundary and trigger a false `HASH_DEAD` (`r6b`).
  3. `inUrl()`'s unanchored `[^\s)\]>]*` exhibits $O(L^2)$ backtracking on lines with many `https://` tokens (~1.0 s at 135 KB).
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r6a-inurl-global-bypass.md --rev 996fd336e33412da1b36da940bafcd6bf4be4185` (and `r6b-sha256-ellipsis-false-drift.md`).
  - Minimal diff: strip URL spans from a copy of `text` (`text.replace(/(?:https?:\/\/|\b(?:github|gitlab)\.com\/)[^\s)\]>]+/gi, '')`) before matching `HASH = /\b[0-9a-fA-F]{39,40}\b(?![\u2026])/g`.

- **K64R2ReviewToolV2-6 (high — soundness, attacks CLI `--opt=value` / `opt()` and entrypoint guard at `scripts/report-receipt-diff.mjs:278-290`)**:
  1. `--rev=` (empty value), `--rev ""`, or a trailing `--rev` sets `revFull = ""` / `undefined`; `if (revFull)` is falsy, so the tool silently drops to `rev=worktree` (exit 0) and accepts uncommitted worktree receipts (`r7-untracked.md`).
  2. `opt(k)` uses `argv.indexOf(k)`: passing `--rev <good> --rev <bad>` silently ignores the second `--rev`; passing `--report --selftest` triggers `selftest()` (exit 0) because `argv.includes('--selftest')` runs before option pairing; `flatMap` splits `--report=--foo=bar.md` twice.
  3. `import.meta.url === \`file://\${process.argv[1]}\`` is false whenever the script is invoked through a symlink or a directory path containing spaces/`#`/`?` (URL-encoded in `import.meta.url`), causing `node <symlink-or-spaced-path> ...` to exit 0 with empty stdout.
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /tmp/kumitate-r64/K64R2ReviewToolV2/fx --round 9 --report /tmp/kumitate-r64/K64R2ReviewToolV2/r7-untracked.md --rev=`
  - Minimal diff: compare `import.meta.url` against `pathToFileURL(realpathSync(process.argv[1])).href`, parse options sequentially in one pass (last flag wins, `--selftest` only when sole argument), and fail closed (exit 2) whenever `opts.has('--rev')` has an empty/missing value.

- **K64R2ReviewToolV2-7 (high — soundness, attacks relative receipt citation binding at `scripts/report-receipt-diff.mjs:47,114`, coordinated with `K64R2ScribeReportDraft`)**: `RECEIPT_PATH` requires the full `.ufo/waves/round-N/` prefix, so a report citing a shorthand path `close/absent-tip.txt` (as in `plan.md:22`'s `close/dispatch60-tip.txt`) skips both `RECEIPT_MISSING` and line-level receipt scoping (`scope=[]`), letting `X9_UNMET held=0/3 checks=3 (close/absent-tip.txt)` read `CLEAN` exit 0 against `base/p-base.txt`.
  - Repro: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ScribeReportDraft/control-k21/lane --round 9 --report /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ScribeReportDraft/control-k21/report.md`
  - Minimal diff: add `REL_RECEIPT = /(?<![\w./-])(?:base|close)\/[A-Za-z0-9._*/-]+/g` in `cited()` expanding to `.ufo/waves/round-${round}/${x[0]}` (`stripPunct` drops trailing `:.,;`; L1 should also adopt `build/K64R2ScribeReportDraft/control-k21/` into `controls/receipt/` as control 38).

## Artifacts

- `.ufo/waves/round-64/w2/K64R2ReviewToolV2.md` (this report)
- `.ufo/waves/round-64/build/K64R2ReviewToolV2/report-receipt-diff.v2-fixes.patch` (unified diff against `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; `git apply --check` exit 0; 52/52 selftests, 37/37 controls, and P3 r60/r63 verified)
- `/tmp/kumitate-r64/K64R2ReviewToolV2/` (fixture lane `fx`, reproducer reports `r1*.md`..`r7*.md`, and patched copy `report-receipt-diff.fixed.mjs`)

## Limits

- Did not edit `scripts/report-receipt-diff.mjs` or `controls/receipt/`; `REL_RECEIPT` remains fence-agnostic like `RECEIPT_PATH`.
- Inherent contract limits declared in `plan.md` (unlabelled `held=x/y`, dead hashes `< 39` hex, and lane-committed receipts that misstate themselves) remain outside parser scope. No tools installed or upgraded.
