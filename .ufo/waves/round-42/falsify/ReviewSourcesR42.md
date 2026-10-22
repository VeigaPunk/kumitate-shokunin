RESULT ReviewSourcesR42 rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=findings defects=4

Scope: corpus/SOURCES.md rows S039-S045 at the measured commit vs the frozen contract in
/home/vgpnk/Projects/shokunin/CORPUS.md (SOURCES.md section), plus the lesson's ## Gate
records and the two registry gates. All gate runs were done read-only in my own scratch
clone /fast/scratch/hyaku/kumitate-r42/falsify/ReviewSourcesR42/lane (detached at
c9a084bf03fb043d3cce5da102fffbc023552a45, `git clone --no-hardlinks`, `rev-parse HEAD` =
c9a084bf03fb043d3cce5da102fffbc023552a45).

## Defects (contract violations)

D1 — S045 Gate record carries no quote, breaking rule 1. corpus/lessons/round-42.md:74-78
logs the S045 reject with URL-equivalent (revision id), access date and reason, but no
<=25-word located quote; S043/S044 both carry one, and the file itself was quotable
(`export const SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK';` at line 23 of the pinned
file, fetched today: 239 lines total, matching the row's anchor). Rule 1 applies to every
new row, rejected or not.

D2 — S044 lesson quote is not verbatim. lesson round-42.md:70 logs `"Kimi CLI stores all
data in the ~/.kimi/ directory under the user's home directory." (16 words)`. The fetched
page (https://www.kimi-cli.com/en/configuration/data-locations.html, HTTP 200 today)
contains exactly one "stores all data" sentence: "Kimi Code CLI stores all data in the
`~/.kimi/` directory under the user's home directory." — 18 words and a different product
name. The lesson drops "Code" and mislabels the count. The build scout
(.ufo/waves/round-42/build/ScoutRejectCandidates.md:100-101) logged the sentence correctly.

D3 — S043 anchor names a section that does not exist. Row anchor reads `§ thresholds;
fetched 2026-10-22`. The page (arika.dev blog, fetched today, 213112 bytes) has these
heading ids only: how-mutation-testing-works, tooling-pit-for-jvm-stryker-for-jsts,
the-problem-naive-mutation-testing-is-slow, incremental-only-test-changed-code,
risk-weighted-scoring, baseline-scores-and-score-ratcheting, debugging-surviving-mutants,
full-vs-incremental-when-to-run-each, key-takeaways. No "thresholds" heading exists; the
quoted sentence sits at the end of "How Mutation Testing Works" (scout agrees). The
contract requires "exact section / heading / page / line". Harmless to the verdict (the
quote is verbatim and the reject stands) but the anchor mislocates it.

D4 — S042 used-by is incomplete. Row used-by = `corpus/knowledge/kimi-session-state.md`
only, but corpus/lessons/round-42.md cites S042 (lines 5, 29, 60-63) — the same citing
relationship that puts `corpus/lessons/round-42.md` in the used-by of S039, S040 and S041
this round, and lessons in the used-by of S005/S008/S018/S030/S034 historically. The
contract defines used-by as "repo-relative paths of the knowledge entries or lessons
citing the row".

## Verified clean / within contract

Gates (observed):
- `cd <clone> && node scripts/sources-check.mjs` → `SOURCES  info  LEGACY_NO_HEADER
  count=38` then `SOURCES_CHECK: CLEAN (rows=45 tiers=A:42,B:1,C:2
  status=queued:14,mined:26,rejected:5 entries_with_source=3 legacy=38)`, exit 0.
- `bash scripts/sources-census.sh validate --today 2026-10-22 --root
  /home/vgpnk/Projects/shokunin kumitate` → `kumitate W04 S034 duplicate url
  stryker-mutator.io/... across scopes` (pre-existing, logged in the lesson at line 90-91)
  and `kumitate ok`, exit 0. Same result with the clone dir as target.
- Contract census lines on the clone: malformed rows = 0, row count = 45, mined used-by
  paths all exist (the contract awk emitted nothing).
- `git diff dfabe92..c9a084bf -- corpus/SOURCES.md`: 8 `+` lines (7 rows + header context),
  0 `-` lines: append-only holds; no existing row's status/recheck/used-by was edited in
  place.

Anchors re-opened today (ordinary HTTPS/git, no challenges):
- S041: raw file at b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb → 211 lines; line 55 =
  `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`, line 196 =
  `fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });` — both verbatim.
  `git ls-remote` tag `@moonshot-ai/kimi-code@2.3.0^{}` = b5e28fd…, i.e. the URL revision
  IS the 2.3.0 release tag as the anchor claims. File at tag 2.2.0 → HTTP 404 (absent,
  as claimed).
- S041 binary claim: `~/.kimi-code/bin/kimi` (2.3.0, 192482496 bytes) contains
  `this.lockDir = join$98(bootstrap.homeDir, "locks", "sessions");` with `bootstrap.homeDir`
  at byte 134688559 — the quoted literal is present at the claimed offset region (compiled
  quote style). `KIMI_CODE_SESSION_LOCK` and `taking over session lock` → 0 hits (S045's
  rejection evidence confirmed); the only `taking over` hit is a coincidental substring in
  a macOS plugin description ("…without taking over your mouse…"), not a lock message.
- S045: file at e7f1a99fc52e68d8e8a2d99d59deba38e4272754 → 239 lines (anchor exact);
  contains `KIMI_CODE_SESSION_LOCK` (line 23) and `taking over session lock` (line 108) —
  the drift the rejection states is real at the pinned bytes.
- S040: `curl https://arxiv.org/pdf/2102.11378v2 | sha256sum` =
  a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081 — exact match to the
  row anchor. Quote verified via scout report; kind=paper tier=A consistent.
- S042: official page serves "Cross-process occupancy locks while a client writes a
  session" verbatim under the locks/ node (9 words, matches lesson).
- S043: quote verbatim on the live page ("A mutation score of 80% is a reasonable starting
  threshold for well-tested business logic.").
- S039: teaches claims verified via the committed scout report digests (home body
  sha256 b0c7e050…, faq ccf6ac49…; quotes grepped verbatim in the fetched bodies by the
  seat). Re-fetch not re-run by me; unverified digests, consistent claim.

Shape/tiers/kinds: S039 docs/A, S040 paper/A, S041 code/A, S042 docs/A (scope-limited to
"purpose only" — honest scoping), S043+S044 community/C, S045 code/A rejected for scope.
No `community` at A; ids S039-S045 are the next unused; no `|` inside cells; all rows are
within ## Registry.

Lesson logging: every new row (S039-S045) has a ## Gate bullet with access date, reason
and (except D1) a <=25-word quote; old→new registry changes logged at lines 93-94;
rejections carry REJECTED + flip both in-row and in-lesson. QUALITY.md points to SOURCES.md
for tier semantics (lines 4, 18-19) — contract rule 3 intact.

## Residual observations (below defect bar)

- S042/S043/S044/S045 anchors pin no content revision — only fetch date (S042 and S044
  explicitly note the Last-Modified is a build/request time, not a revision; S045 pins
  via the URL commit id, which is sound). The contract's "plus revision" is only weakly
  met on S042/S043/S044; S043 carries its date in the source cell. Grading: gray area.
- S039's source cell lists two canonical URLs (home + faq) where the contract shape names
  "canonical URL or DOI" singular; both pages were opened and quoted, so substance holds.
- ## Gate bullets name locators (arXiv id, commit id, domain) rather than literal URLs for
  some rows; same practice as prior rounds' lessons (S018 etc.). Consistent precedent.
- Search log gained no round-42 entry. The candidate sweep was a curated 10-item screen
  (ScoutRejectCandidates), not a query-driven search; rounds 36-41 also added rows without
  Search-log notes. Established practice, not a new deviation.
- Unopened candidates (HTTP 403 Medium, 429 DeepWiki) were called "leads" by the scout but
  not appended to ## Leads (unopened); the contract does not require recording them.
- Unverifiable-by-me: that e7f1a99 was `main` head on 2026-10-22 (main is now 759958af…;
  ls-remote proves only current head). The pinned commit exists and its content supports
  the rejection, so the claim stands on the pinned bytes regardless.

## Verification gaps / blockers

- GitHub REST API rate-limited this host mid-review (unauthenticated quota); tag→commit
  resolved instead via `git ls-remote` (recorded above). No other source failed to open;
  no provider refusal encountered.
- S039/S040 page digests: S040's PDF digest re-verified; S039's body digests not re-fetched
  by me (accepted from the committed scout evidence, which greps each quote verbatim).

Tooling: no installs or upgrades; all commands were read-only (node, bash census script,
git diff/ls-remote on read-only refs, curl, python3 byte search of the installed binary —
no credential file contents touched; ~/.kimi-code/bin/kimi is the product binary, not a
credential). Scratch only under /fast/scratch/hyaku/kumitate-r42/falsify/ReviewSourcesR42/.
No leftover processes (no mutants or selftests were run).
