# K94ScribeSources — draft SOURCES rows (round 94)

Three rows drafted, ids **S271 S272 S273** (provisional: the plan says "S-ids assigned at
integration"; the next free id at lane base `a6e4da96` is S271, last row S270). Quotes, URLs,
HTTP statuses and body sha256s are in `quotes.md`; captures in `captures/`.

Append these three lines at the end of the `## Registry` table (after S270). Nothing else in
`SOURCES.md` changes: no existing row is edited, no status or `used-by` cell of another row moves.

## Draft rows

| S271 | git gitrevisions manual, `<sha1>` entry — https://git-scm.com/docs/gitrevisions | docs | A | git revision syntax: an abbreviated object name is repository-relative and names a commit only when its prefix is unique in that repository | § SPECIFYING REVISIONS, `<sha1>` entry (anchor gitrevisions.txt-sha1egdae86e1950b1277e545cee180551750029cfe735dae86e); fetched 2026-11-06, HTTP 200, body sha256 60bfaca3907710bdedcfaab0c6d82721b9b317a86ecc11d60d07027bf41a1a54; rendered text lines 2177-2183, quote at 2179-2180 | "The full SHA-1 object name (40-byte hexadecimal string), or a leading substring that is unique within the repository." An abbreviation resolves against one repository's object set only, so a token that matches nothing in the probed repositories is not by itself a lane error when it belongs to an upstream the lane cites rather than hosts | mined | 2026-11-06 | on-release | corpus/knowledge/round-gate-declared-pins.md |
| S272 | GitHub Docs: Getting permanent links to files — https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files | docs | A | the permalink URL shape: the commit id is written into the URL path in the segment the branch name occupies (blob/<commit-id>/<file>), so an upstream pin is a URL path segment and not free-standing text | § Press Y to permalink to a file in a specific commit, prose line 13 with the worked example URL at line 15 (capture .ufo/waves/round-94/K94ScribeSources/captures/gh-permalinks.text); fetched 2026-11-06, HTTP 200, body sha256 0824dda4c0c8e675ae18dd51c7da96590a381d3a0e92eb6bc8bbf56d3be0efe7; companion row S033 covers why a pin is needed at all | "put a commit ID. This will permanently link to the exact version of the file in that commit." The id replaces the branch name as a path segment (blob/b212af08a6cffbb434f3c8a2795a579e092792fd/README.md in the page's own example), so splitting an http(s) URL on /, ? and # and matching a segment is the docs' shape for locating a pin, not a lane invention | mined | 2026-11-06 | 180d | corpus/knowledge/round-gate-declared-pins.md |
| S273 | oh-my-pi packages/coding-agent/src/session/retry-fallback-chains.ts — https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/retry-fallback-chains.ts | code | A | the RetryFallbackRole home that S267:14 imports: a role pinned to one primary model selector plus its fallback chain, persisted in session_init so cold revival restores the routing the spawn installed | doc comment 180-184, RetryFallbackRole 185-190 (primary 187, chain 189, comment 188), getRetryFallbackRole 193-198; the config/ path 404s at the pin, the real path is session/ (tree listing capture .ufo/waves/round-94/K94ScribeSources/captures/tree-retry-paths.txt); fetched 2026-11-06, HTTP 200, body sha256 b5db529983630ee7e60621478868675dbbe93f149e3cf42eb1aee093a21774fc, equal to the r93 auxiliary capture | "Fallback selectors walked after the primary; empty explicitly disables fallbacks." RetryFallbackRole is one primary selector plus chain: string[], an empty chain a deliberate no-fallback, and session_init persists the role so a revived session restores the same routing the spawn installed | mined | 2026-11-06 | on-release | corpus/knowledge/seat-route-retry-fields.md |

## Why S272 is not a duplicate of S033

S033 (same GitHub page, opened 2026-10-21) quotes the *preceding* sentence — "so if you were to copy
the normal URL, the file contents might not be the same when someone looks at it later." — and its
`teaches` cell says a per-anchor pin is only meaningful against a commit id, never a branch head.
That is *why a pin is needed*. It says nothing about *where the pin sits in the URL*. S272's scope is
the URL shape (the id as the segment a branch name occupies, `blob/<commit>/<file>`), which is exactly
the predicate C1 rests on ("a complete path segment, URL split on `/`, `?`, `#`"). Different teaching,
same page: kept as a separate row, and S272's `anchor` cell points back at S033.

## Same-page neighbours (why these rows are not duplicates)

- **S271 vs S253** — both cite `https://git-scm.com/docs/gitrevisions`. S253 (`mined`, `2026-11-04`)
  quotes the **`rev:path`** entry and teaches that a hash of `rev:path` reads the blob as committed, not
  the worktree file. S271 quotes the **`<sha1>`** entry and teaches prefix uniqueness inside one
  repository. Different entries, different facts. The validator emits `W04` (same URL, different scope)
  for S271 — a warning, already carried by seven pre-existing rows; it does not change the exit status.
  Capture drift checked: `.ufo/waves/round-88/open/gitrev.html` (S253's capture, sha256 `1ab7124a…`,
  74654 bytes) vs `captures/gitrevisions.html` (mine, sha256 `60bfaca3…`, 74526 bytes) differ in the
  HTML shell only — the tag-stripped text is identical (585 non-empty lines each, `difflib` empty
  diff), so the quoted sentence did not move between 2026-11-04 and 2026-11-06.
- **S272 vs S033** — see the section above.
- **S273 vs S267-S269** — different file at the same pin (`session/retry-fallback-chains.ts` vs
  `session/session-entries.ts`, `ai/src/types.ts`, `session/turn-recovery.ts`); no URL collision.

## Effect on the C1 predicate's declared-pin set

S271 and S272 add no hex-looking URL path segment (neither URL contains one), so they contribute no
`declared` pin. S273's URL carries `79fa222e8390aed3494f4bc6746814e6c74c21cf` as the `blob/<pin>` path
segment — the same 40-hex pin S267-S269 already declare, so round 93's cited `79fa222e` stays declared
and the registry gains no new pin. Nothing a forgery control could exploit: the rejected-row filter and
the `http(s)://` requirement are untouched.

## Integration notes

- Target `used-by` for S271/S272: `corpus/knowledge/round-gate-declared-pins.md` — **the file does not
  exist at lane base `a6e4da96`**, so the census validator reports E11 (missing used-by path) for both
  rows until the round-94 knowledge entry lands. That is a link-integrity dependency, not a row-syntax
  finding; see `census.txt` for both runs (with and without a path stub in scratch).
- S273 closes the routed defect M93-2. Once it is in the registry, `corpus/knowledge/seat-route-retry-fields.md`
  can re-point its `chain` paragraph's second sentence from "auxiliary capture `K93ScribeLesson/rbchains.ts`"
  to this row and drop the Routed bullet. That edit belongs to the knowledge-entry owner (round-94
  lesson seat / L1 integration), not to this seat: this seat writes no corpus file.
- Row-local limits to keep honest in the knowledge entry:
  - S271 grounds *prefix uniqueness inside one repository*; it does not say an unreachable upstream is
    fine, nor that a token may be a prefix of an object in a repo nobody can probe. The round-94 rule's
    `declared` class is the lane's policy built on it, not a git-doc claim.
  - S272 is about a `blob` URL a human copies; the docs do not discuss splitting a URL on `?` or `#`.
    That split is the lane's inference, disclosed as such in the row's `teaches` wording ("so splitting …").
  - S273 is pinned source: it is authoritative for the pin `79fa222e…`, not for upstream `main`.
- Recheck cadences follow the pin-consistency of neighbours: pinned upstream code rows S266-S269 use
  `on-release`; S273 does too. S272 sits on the same page as S033 (which uses `180d`), so `180d`. S271 is
  an unversioned `git-scm.com/docs` page that tracks the current release, so `on-release` (same choice as
  S014 for git-worktree).
