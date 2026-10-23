RESULT ReopenS076 rev=a2e5b54c verdict=confirmed quotes_found=0/0

Re-derived S076 independently (attempt-1 numbers re-run from scratch, never trusted).
Axes: fetch fidelity, draft quote attribution, pin match, kind/tier conformance, rejection validity.

## Re-open (my own fetch, scratch /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS076/)
- Command: `curl -L --fail --silent --show-error -o rl-2.56.0.html -w 'HTTP %{http_code} FINAL %{url_effective} SIZE %{size_download}\n' https://git-scm.com/docs/gitrepository-layout/2.56.0 && sha256sum rl-2.56.0.html && date -u +%F`
- Output: `HTTP 200 FINAL https://git-scm.com/docs/gitrepository-layout/2.56.0/ SIZE 632` then
  `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5  rl-2.56.0.html`, `2026-10-23`.
- Body (632 bytes, read in full): `<title>Redirecting&hellip;</title>`,
  `<link rel="canonical" href="https://git-scm.com/docs/gitrepository-layout/2.49.0">` (3 words),
  `<meta http-equiv="refresh" content="0; url=https://git-scm.com/docs/gitrepository-layout/2.49.0">`,
  a `window.location.replace(...)` script and a fallback link, all pointing at `/docs/gitrepository-layout/2.49.0`.
  It contains no manual text. The text at the redirect target is the manual as of 2.49.0
  (footer: "last updated in 2.49.0"; "2.49.1 → 2.56.0 no changes").

## Check verdicts
1. Locator exists and says what the scope/teaches column claims — CONFIRMED as a rejection:
   the URL is live (HTTP 200) and the row's anchor describes it truthfully ("HTTP 200, 632-byte
   HTML redirect to the 2.49.0 page"), but the scope claim "gitrepository-layout(5) text for the
   host git 2.56.0" is NOT delivered by these bytes — no section exists to quote. That unmet
   claim is exactly what the row's REJECTED gloss records, so row and locator agree.
2. Draft quotes attributed to S076 — CONFIRMED vacuous: `grep 'S076'` on
   /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md returns no matches; the draft's
   `source:` header (line 1) lists S062–S074, S013, S027 and no S075/S076. 0 of 0 quotes to find;
   the rejected row is correctly uncited by the entry.
3. Pinned sha256 — CONFIRMED: row pins `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5`;
   my fetch hashes to the same value at the same 632 bytes. No live-page drift to note.
4. kind/tier — CONFIRMED: kind=docs, tier=A is right; git-scm.com is the official Git project
   documentation site (primary/official), and QUALITY.md Q2 only forbids `community` at tier A and
   tier C as sole support. Sibling rows S062/S063/S065 (same site, same kind, tier A) are precedent.
5. Rejection reason — CONFIRMED: the versioned 2.56.0 URL really is a redirect wrapper to the
   2.49.0 page, not manual text for the host version, so it cannot pin 2.56.0 text by itself.
   Substitution clause also holds: I re-fetched https://git-scm.com/docs/gitrepository-layout →
   `HTTP 200 ... SIZE 64533`, sha256 `d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22`
   (equal to S063's pinned sha), whose footer carries the two lines attempt 1 cited, at the same
   HTML lines 1290 and 1296: "gitrepository-layout last updated in 2.49.0" (5 words) and
   "2.49.1 → 2.56.0 no changes" (5 words) — the unversioned page's history does cover 2.56.0.
   Flip condition ("a versioned 2.56.0 page serves the manual text") is not met today.

## Disposition
- Inherited row and inherited seat report SrcGitRepoLayout reproduce byte-for-byte on every
  observable (status, final URL with trailing slash, size, sha, redirect target, footer lines).
  Nothing to correct; the rejected row stands as evidence of taste per the SOURCES.md header rule
  ("a rejection is kept as evidence of taste").
- The lane working copy's corpus/SOURCES.md registry row S076 matches the inherited snapshot text.

## Hygiene and tooling
- No tools installed or updated. No lane file written except this report. No git/jj writes; no
  spawns; no background jobs left.
- Process check `pgrep -af 'seats/a2-ReopenS076'` → `no leftover processes`. Scratch holds two
  fetched HTML files (632 B and 64,533 B); no large temp files.
- No bot-challenge or access-control bypass was needed; both pages opened by plain curl.
