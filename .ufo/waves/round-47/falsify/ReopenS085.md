RESULT ReopenS085 rev=269dadb6 verdict=DEFECT minor-hash-truncation-and-gate-wordcount; supersede target correct, correction supported by bytes

# ReopenS085 — re-open of SOURCES row S085 (supersede over S051) at the C1 commit

## Scope
Non-author re-open of registry row S085 (`git show 269dadb6:corpus/SOURCES.md` line 98), its Gate record in `corpus/lessons/round-47.md` (§ Gate table), and the drafting seat's report `.ufo/waves/round-47/build/SupersedeS051.md`. Compare with S051 at `2b2bf7bb` (the original, restored at 269dadb6).

## Evidence

### Source fetch (ordinary means; curl)
- `curl -fsSL -A 'Mozilla/5.0 (X11; Linux x86_64)' --max-time 60 https://circleci.com/blog/what-is-mutation-testing/ -o s085.html`
- HTTP check: `curl -sI …` → `HTTP/2 200`, content-type text/html; charset=UTF-8, content-length 143517.
- Body: `sha256sum s085.html` → `814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f2  s085.html` (64 hex chars).
- `wc -c s085.html` → 143517.

### Verbatim quote at stated locator
- Row anchor: `§ When should a team start using mutation testing?, “Don’t chase 100%” bullet`.
- HTML: line 1259 `<h2>When should a team start using mutation testing?</h2>`; line 1268:
  `<li><strong>Don’t chase 100%.</strong> … A floor of 60–80% on high-risk modules is the realistic target.</li>`
  (bullet inside that section, confirmed by markup).
- Verbatim byte check: `grep -o 'A floor of 60–80% on high-risk modules is the realistic target\.' s085.html` returns the exact sentence.
- `printf '%s' 'A floor of 60–80% on high-risk modules is the realistic target.' | wc -w` → `11` (≤25 ✓).
- `wc -m` → 63.

### Gate record
- `git show 269dadb6:corpus/lessons/round-47.md` → `| S085 | https://circleci.com/blog/what-is-mutation-testing/ | 2026-10-23 | "A floor of 60–80% on high-risk modules is the realistic target." (12 words) | reject C (kept) — supersedes S051 (SupersedeS051) |`
- **Finding:** the Gate record says "(12 words)"; the actual verbatim sentence is 11 words (`wc -w` = 11). Minor count error in the Gate table.

### Supersede target
- `git show 2b2bf7bb:corpus/SOURCES.md | grep '^| S051 |'` and `git show 269dadb6:corpus/SOURCES.md | grep '^| S051 |'` are byte-identical (restored): same URL, kind community, tier C, scope "a mutation-score threshold for teams", anchor `§ When should a team start using mutation testing?, 'Don't chase 100%' bullet; published 2026-06-25, body sha256 47f2a1f0…f951; fetched 2026-10-22 (seat ScoutRejectCandidates)`, status rejected.
- S085 is append-only after S051; `supersedes S051 —` names the right target (same article, same URL, original row). ✓

### teaches clauses vs located bytes
- `the 60–80% floor lacks evidence`: the sentence sits in the “Don't chase 100%” bullet with no citation, link, sample, counting command, or revision. `sed -n '1259,1272p' s085.html | grep -o '<a [^>]*href="[^"]*"'` → no external links in the section; the article's only 46 `<source>` tags are image/video elements. Supported. ✓
- `the timeout claim conflicts with S048/K43(a)`: line 965 exact text `Most tools count timeouts as killed, since the hang itself reveals the change.` S048 (Cosmic Ray concepts, `concepts.rst:178-179`): "if a test of a mutant takes longer than the timeout, the test is killed, and the mutant is marked incompetent" — timeout ≠ killed; K43(a) is grounded in S048 (`corpus/lessons/round-43.md` line 84). Direct contradiction; supported. ✓
- `flip: a measured threshold at a named revision or maintainer statement`: prescription for a future row; not a factual clause.

### Metadata
- `datePublished":"2026-06-25T00:00:00-07:00"` and `"dateModified":"2026-06-25T00:00:00-07:00"` (JSON-LD, line 273); visible byline `Jun 25, 2026` (line 701); author Roger Winter (line 740). „Unversioned” consistent with no version metadata in the page.
- Kind community / tier C / scope "a mutation-score threshold for teams" match S051 precedent and the article's content. ✓

### Defect — truncated body sha256 in S085's anchor field
- Row anchor (S085): `body sha256 814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f` →
  extracted length `63` hex chars.
- Fetched body sha256: `814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f2` → `64` hex chars.
- The row's recorded hash is truncated by one character (missing trailing `2`); it matches no actual body digest and fails a naive string equality against the fetched bytes. The drafting seat's own evidence line (SupersedeS051.md) contains the full 64-char hash `…086f2` (line 21), so the truncation is a transcription error repeated in the row and in the report's header/line 9.

## Findings (by severity)
1. **Minor:** S085 body sha256 truncated to 63 chars (missing final `2`) in the committed row — inconsistent with the fetched body (`…086f2`); anchor/locator integrity broken for anyone verifying the hash, despite the quote itself being byte-exact.
2. **Minor:** Gate table counts the quote as "(12 words)"; actual = 11.
3. No other defects: supersede target correct, bytes support every teaches clause, quote verbatim ≤25 words at the stated locator, tier/kind/scope/anchor consistent, restored S051 bytes intact.

## Residual risk / verification gaps
- “Unversioned article” is asserted from the absence of version metadata in the served page; cannot prove no hidden versioning exists.
- Only the L1 scores the claim's after-state; this review touches no routing, counter, or gate run.

## Files
- Fetched body kept in scratch only: `/fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS085/s085.html` (143517 bytes, sha256 `814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f2`).
- This report: `.ufo/waves/round-47/falsify/ReopenS085.md`. No lane file modified. No tools installed; no processes left.
