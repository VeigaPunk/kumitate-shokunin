RESULT ReopenS063 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Re-derived inherited candidate row S063 from scratch; attempt-1 numbers were not trusted.
Row under test: `| S063 | gitrepository-layout(5), Git 2.56.0 — https://git-scm.com/docs/gitrepository-layout | docs | A | ... | DESCRIPTION entries 'common' (HTML 2198-2203), 'info' (2217-2219), 'hooks' (2187-2196), 'config' (2160-2164); body sha256 d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22; fetched 2026-10-23 (seat SrcGitRepoLayout; the versioned /2.56.0 URL redirects to 2.49.0, see S076) | ...`
Origin report: `.ufo/waves/round-45/build/SrcGitRepoLayout.md` (attempt 1, untrusted).

Fetch (independent, ordinary curl, redirects followed)
- Command: `curl -L --fail --silent --show-error -o grl.html -w 'HTTP %{http_code} FINAL %{url_effective}\n' https://git-scm.com/docs/gitrepository-layout && sha256sum grl.html && wc -c grl.html && wc -l grl.html`
- Observed: `HTTP 200 FINAL https://git-scm.com/docs/gitrepository-layout`; sha256 `d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22`; 64533 bytes; 2500 lines. No redirect happened (the URL serves the page directly).
- Versioned-URL check: `curl -L ... https://git-scm.com/docs/gitrepository-layout/2.56.0` → `HTTP 200 FINAL https://git-scm.com/docs/gitrepository-layout/2.56.0/`, sha256 `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5`, 632 bytes; body is an HTML meta-refresh stub with `canonical` / refresh target `https://git-scm.com/docs/gitrepository-layout/2.49.0`.
- Version binding: fetched HTML line 1290 `gitrepository-layout last updated in 2.49.0` and line 1296 `2.49.1 → 2.56.0 no changes`, so the page text is the manual for host git 2.56.0; the row's "Git 2.56.0" label is justified the same way attempt 1 justified it.

Check 1 — locator exists and says what teaches/gloss claims: CONFIRMED
- `config` entry at exactly HTML 2160-2164 (dt at 2160; `Repository specific configuration file. This file is ignored if $GIT_COMMON_DIR is set and "$GIT_COMMON_DIR/config" will be used instead.` at 2162-2164, 18 words by `printf '%s' ... | wc -w`).
- `hooks` entry at exactly 2187-2196; `This directory is ignored if $GIT_COMMON_DIR is set and "$GIT_COMMON_DIR/hooks" will be used instead.` (14 words, measured).
- `common` entry at exactly 2198-2203; `When multiple working trees are used, most of files in $GIT_DIR are per-worktree with a few known exceptions.` (18 words, measured).
- `info` entry at exactly 2215-2219 (dt 2215, dd 2216-2219); `This directory is ignored if $GIT_COMMON_DIR is set and "$GIT_COMMON_DIR/info" will be used instead.` (14 words, measured).
- `worktrees` entry at 2312-2318: `Contains administrative data for linked working trees.` (7 words, measured) plus the `$GIT_COMMON_DIR/worktrees` resolution sentence — supports the gloss listing `worktrees/` among common paths.
- `info/exclude` entry at 2246-2252 (dt 2246): stores the exclude pattern list by Porcelain convention. Sharing of `info/exclude` specifically rests on the parent `info/` rule (path composition), not on the exclude entry itself; the row's teaches column is worded consistently with that, and the direct release-note claim is carried by S027, so no overclaim in the row.
- Gloss "which $GIT_DIR paths are common to all linked worktrees (info/exclude, hooks, config, worktrees/)" is supported: hooks/info/config/worktrees each resolve through $GIT_COMMON_DIR when set.

Check 2 — draft quotes attributed to S063 found verbatim and under the named section: CONFIRMED (1/1)
- The draft (`/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md`) mentions S063 on exactly 3 lines: 1 (source list), 72 (the quote), 123 (decision-table reference "M4 · S062, S063, DemoWorktreeShared", no quote). So m=1.
- Draft line 72: S063: «All files under common however will be shared between all working trees.» — 12 words (measured).
- Verbatim in fetched bytes: raw grep for the sentence fails only because the HTML wraps it across lines 2201-2203 with `<em>common</em>` markup. After tag stripping and whitespace joining (html.unescape + strip + collapse, python3 one-liner over the fetched file), the sentence matches exactly (`rendered-match: True`). It sits inside the `common` entry, lines 2200-2203, within the locator's 2198-2203. This is the same text a browser renders; no editorial change.

Check 3 — pinned sha256 matches my fetch: CONFIRMED
- Row pins `d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22`; my independent fetch hashed to the identical value, same byte count 64533. The live page has not drifted since attempt 1's fetch.

Check 4 — kind/tier right for lane rules: CONFIRMED
- QUALITY.md Q2: tier C never sole support; `community` never tier A; tier semantics scoped per SOURCES-CONTRACT-v1 rule 3. Source is git-scm.com, the official Git project documentation site (primary/official), so tier A is correct; kind `docs` matches the sibling git-scm rows S062/S065 (docs/A).

Check 5 — rejection reason: CONFIRMED (row itself is not rejected)
- S063's status is `mined` (candidate, not rejected), so no rejection reason applies to it. Its rejected companion S076 (versioned URL https://git-scm.com/docs/gitrepository-layout/2.56.0) records sha256 `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5` with the reason that the 2.56.0 URL serves a redirect to 2.49.0 text; my fetch reproduced that hash byte-for-byte and the stub's canonical/refresh target is `/2.49.0`. The rejection reason holds, and S063's locator note ("the versioned /2.56.0 URL redirects to 2.49.0, see S076") is accurate.

Verdict: every inherited statement about S063 that I could test reproduced independently — CONFIRMED on all five checks; no corrected row needed. quotes_found=1/1.

Residual risk and verification gaps
- Byte-level pin is only as stable as the live page: git-scm.com serves the unversioned page dynamically for the "latest" URL; a future page change would break the pinned sha (row already says re-open on release; the 2.49.0-text-through-2.56.0 binding comes from the page's own version-history widget, which the page could drop).
- The draft quote is verbatim in rendered text, not in raw HTML bytes (line wraps + `<em>` markup); any future checker doing raw substring search over HTML will get a false miss.
- `info/exclude` sharing is path composition from the `info/` rule; the manual's exclude entry does not itself state sharing (S027 carries the direct statement) — already reflected in the row's wording.

Tooling: nothing installed or updated (curl/python3/coreutils sufficed). Process check after runs: `pgrep -af 'a2-ReopenS063'` → `no matching processes`. Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS063/` (grl.html 64 KB, grl-256.html 632 B, grl.txt rendered text).
