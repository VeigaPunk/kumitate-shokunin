RESULT SweepS041S045 rev=516977af verdict=defects rows=5 defects=1

Anti-loop sweep of corpus/SOURCES.md rows S041–S045 at 516977af2216b1cc426ee970d260dee53714bf4f.
Read-only lane; scratch /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS041S045. All re-opens by
ordinary means (curl, raw.githubusercontent.com, git ls-remote, GitHub commits API, read-only grep
-c/-abo counts on ~/.kimi-code/bin/kimi — no content printed). No headless browser, no bot challenge
hit. No tools installed or updated (system curl/git/grep/sha256sum only). Admission quotes taken
from corpus/lessons/round-42.md ## Gate bullets (S041–S045 opened there) and each row's quote cell.
Match method: byte-exact `grep -F` of the quote on fetched bytes for code rows; for HTML rows the
quote sits verbatim inside markup (`<span>`/`<p>`/`<code>`), entities `&#39;` counted as apostrophe.

ROW S041 verdict=teaches-overstates — pinned code re-opens clean; teaches clause "per-session lock
files" is located by line 201, not by the row's anchor "file lines 55 and 196" or either quote.
EVIDENCE S041: `curl -o s041.ts` raw …b5e28fd6…/sessionLockService.ts → HTTP 200, 6455 B, sha256
acbcdd3811903885c2edfeb5e67cf5258921768b814c751c511e4cf7c867ad08 — equals the pinned digest in
.ufo/waves/round-42/build/ScoutKimiLocksSource.md; no pin drift.
EVIDENCE S041: `git ls-remote --tags MoonshotAI/kimi-code` → @moonshot-ai/kimi-code@2.3.0^{} =
b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb (URL pin = release tag ✓); same file @2.2.0 → HTTP 404
(control package.json @2.2.0 → 200) ✓ "file absent at the 2.2.0 tag".
EVIDENCE S041: quotes verbatim, `grep -F`, 1 hit each: line 55 `this.lockDir = join(bootstrap.homeDir,
'locks', 'sessions');` (5 words); line 196 `fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700
});`. Installed binary carries `this.lockDir = join` at byte offset 134688526 (`grep -abo`) ✓;
binary sha256 prefix cf323ca555ccb69c unchanged since the scout.
EVIDENCE S041 DEFECT: teaches = "what creates ~/.kimi-code/locks/sessions on this host (Kimi Code
2.3.0, the installed release): lock directory path, mode and per-session lock files". Located bytes
at the anchor lines: 55 → directory path only; 196 → mkdir mode 0o700 only. "per-session lock files"
first occurs at line 201 `return join(this.lockDir, `${sessionId}.lock`);` (transient `.tmp-*` at
127), outside every locator and every quote — same class as the r45 S073 rejection (D2: teaches
checked against every locator). Cure: anchor gains line 201 (and 127) or the clause is dropped.
EVIDENCE S041 (context): the bytes are true of the pinned file and the row's quote-cell gloss "its
per-session lock directory" is located (the sessions dir at line 55); only "files" overstates.

ROW S042 verdict=holds — quote and locator verbatim; teaches matches; no product version on page.
EVIDENCE S042: `curl -sSL` https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html
→ HTTP 200, 74846 B, sha256 8e55630062c982c93e6a7e7917a2bf014b38ab097fc38e495cc4b7b313f67784 (no
pinned digest; recorded).
EVIDENCE S042: fetched bytes contain `│   └── sessions/           # Cross-process occupancy locks
while a client writes a session` — quote verbatim (9 words), attached to the `sessions/` child of
`locks/` under § Directory layout, as the row/lesson locate it.
EVIDENCE S042: page names no product version: only x.y.z string is `<meta name="generator"
content="VitePress v2.0.0-alpha.17">` (toolchain, not product) — the row's parenthetical holds.
EVIDENCE S042: teaches "documented layout and purpose of the locks/sessions node … (purpose only)"
= exactly what the located bytes say; used-by row consistent.

ROW S043 verdict=holds — reject reason verified against the source (Q3, wrong instrument; erratum
on the anchor is itself correct).
EVIDENCE S043: `curl -sSL` https://www.arika.dev/blog/engineering/mutation-testing-in-ci/ → HTTP 200,
213112 B, sha256 1c90490247f9251b5449cef450c23fac1c0191771ed1175ea6e3d63b43cca394; post date 2025-12-12.
EVIDENCE S043: quote verbatim in fetched bytes: `<p>A mutation score of 80% is a reasonable starting
threshold for well-tested business logic. Below 60%…` (14 words) immediately before
`<h2 id="tooling-…">`, i.e. at the end of `<h2 id="how-mutation-testing-works">` — the lesson's
erratum is correct: h2/h3 list contains no "thresholds" section, so the row anchor `§ thresholds`
names no section (append-only anchor stays wrong, per the erratum).
EVIDENCE S043: zero hits for measured/measurement/revision/commit-sha patterns anywhere on the page;
the 80% and 60% constants carry no measurement or revision; author/site "Arika" is a third-party
blog reviewing PIT/Stryker, not the tool maintainer — flip not met. Reject holds.

ROW S044 verdict=holds — reject reason verified: legacy ~/.kimi/ tree, no locks/ node, injected line
present; quote verbatim. (One stale fetch-time descriptor, noted below.)
EVIDENCE S044: `curl -sSL` https://www.kimi-cli.com/en/configuration/data-locations.html → HTTP 200,
38918 B, sha256 6174e901bdd14206d9a184cbd248fff1a4e0ea17a23c2060fffba45ca8a4affa.
EVIDENCE S044: quote verbatim (15 words, `<code>` markup around `~/.kimi/`, `&#39;` = apostrophe):
`Kimi Code CLI stores all data in the ~/.kimi/ directory under the user's home directory.` — same
line is the opening of the archived official legacy page (moonshotai.github.io/kimi-cli/…/data-locations.html,
re-fetched: HTTP 200, 40516 B, sha256 00e070196c58b4235b195dc271b43fb282640cb45e8fceac702f94b6b5fb4e3a).
EVIDENCE S044: `grep -c locks` → 0 in BOTH pages; `.kimi/` child lists identical (config, credentials,
logs, mcp, mcp-oauth, plans, sessions, user-history); mirror adds the hidden line `Are you an LLM?
You can read better optimized documentation at /en/…` (1 hit vs 0 in legacy) — the injected line.
EVIDENCE S044: not the product this host runs ✓ (host root is ~/.kimi-code, mirror documents ~/.kimi;
rejected under Q8/Q1/Q2). Stale descriptor: row says "served dynamically; Last-Modified is the fetch
moment" — today's response has `last-modified: Thu, 15 Oct 2026 13:51:39 GMT` ≠ `date:` header
(mirror now sends a fixed Last-Modified); true at fetch time, stale today; does not affect the reject.

ROW S045 verdict=holds — reject reason verified: line-23 quote verbatim, drift real, 0 binary hits.
EVIDENCE S045: `curl -o s045.ts` raw …e7f1a99fc52e68d8e8a2d99d59deba38e4272754…/sessionLockService.ts
→ HTTP 200, 7423 B, sha256 fb3fae8242862a49b4bf26e994dd6c692de17eb2a079f173474cf21186301f77; 239
lines ✓; GitHub commits API: commit date 2026-10-22T06:37:49Z ✓ "main head on 2026-10-22".
EVIDENCE S045: line 23 verbatim `export const SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK';` (5 words).
EVIDENCE S045: `diff s041.ts s045.ts` → 32 changed lines; drift adds SESSION_LOCK_ENV, `disabled`
flag (line 72), `evict()` (line 104) and log `'taking over session lock'` (line 108) — takeover path
+ env switch as the reject states.
EVIDENCE S045: installed binary `~/.kimi-code/bin/kimi` → `grep -ac KIMI_CODE_SESSION_LOCK` = 0,
`grep -ac 'taking over session lock'` = 0 → "0 hits for either" ✓; not the running code. Reject holds.
EVIDENCE S045: teaches "the session-lock implementation the host runs" is the refuted claimed scope —
refutation documented (drift + 0 hits); flip condition unmet (host still on 2.3.0).

CROSS-CUT: S041/S042 admission quotes in corpus/lessons/round-42.md ## Gate bullets and in
corpus/lessons/round-42-verifier-spotcheck.md all re-verified above; S043–S045 reject bullets
(incl. the S044 quote correction to "Kimi Code CLI …" and the S043 anchor erratum) agree with the
re-opened bytes. One actionable defect: S041 teaches/locator gap (cure options recorded per row).
