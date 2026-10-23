RESULT SweepS031S035 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open of SOURCES.md rows S031–S035 at 516977af2216b1cc426ee970d260dee53714bf4f.
Rows extracted via `git -C <lane> show 516977af…:corpus/SOURCES.md` (lines 44–48); admission
gates found via `git grep -n <id> 516977af… -- corpus/lessons/`. Sources re-fetched 2026-10-23
by curl (docs rows) and host-path re-open (own-work row). No edits made.

ROW S031 verdict=holds (git-scm.com/docs/git-rev-parse; admitted round-36, spotcheck line 145)
- HTTP 200, body 122463 B, sha256 64c603545b3f9799cc9525228ba70cf80444a063b32a4be37de2a5ca09b83421; Last-Modified Wed, 21 Oct 2026 15:55:45 GMT.
- Quote (11 words) verbatim under `id="Documentation/git-rev-parse.txt---verify"`: "…If so, emit it to the standard\noutput; otherwise, error out." — matched after normalizing the HTML line-wrap inside the sentence.
- Page footer: "git-rev-parse last updated in 2.56.0" — served-version pin (2.56.0) still accurate, no pin drift. (Release date 2026-09-28 is git metadata, not asserted by the fetched page.)
- teaches "how a gate names the revision it scored": the --verify text ("Verify that exactly one parameter is provided…") supports emit-one-or-error; no overstatement.

ROW S032 verdict=holds (reproducible-builds.org/docs/recording/; admitted round-36, spotcheck 146; re-agreed round-37:174)
- HTTP 200, body 40293 B, sha256 728733043c1bc713cfc59ea2d014d39d8c0b7b61af78e62c3d522bf8139dece1; Last-Modified Mon, 19 Oct 2026 17:18:03 GMT — matches the row's pinned Last-Modified 2026-10-19.
- Quote (23 words) verbatim in the rendered text after tag-strip + whitespace-fold; the next heading in the byte stream is "File Format", matching the locator "paragraph before § File Format".
- teaches "provenance duty for a scored result": supported by the quote; "Pin defines it; src-rev records it" is the lane's own mapping, consistent with the sentence's define-or-record split.

ROW S033 verdict=holds (docs.github.com getting-permanent-links-to-files; admitted round-38, spotcheck 168–170)
- HTTP 200, body 190888 B, sha256 25008dac52d6c94c43a7a1a2d548d72bd054173b839fba7366f1b9c9704f384f; no Last-Modified (row says none — consistent).
- Quote (23 words) verbatim, both in HTML body and JSON-escaped payload; prefix "…so if you were to copy the normal URL, the file contents might not be the same when someone looks at it later." located byte-exact.
- Both anchors present: section "File views show the latest version" and "press-y-to-permalink-to-a-file-in-a-specific-commit" (says "put a commit ID" for a permanent link).
- teaches "why a line anchor must name the revision it was checked at": the row itself marks the line-anchor application as "the lane's inference" — honestly scoped.

ROW S034 verdict=holds (stryker-mutator.io mutant-states-and-metrics; admitted round-39, spotcheck 116–122)
- HTTP 200, body 27068 B, sha256 5295e9bb464367c8287d4d56d822b01710edd744a2445fd73a222f405e4cc450; Last-Modified Thu, 22 Oct 2026 16:23:06 GMT (row read none — drift only in that a header now exists, harmless).
- Quote (15 words) verbatim under `id=mutant-states`, Killed bullet: "When at least one test failed while this mutant was active, the mutant is killed."
- "Runtime error" bullet present verbatim: "The running of the tests resulted in an error (rather than a failed test)." — grounds teaches' killed-vs-runtime-error split. States listed: Pending/Killed/Survived/No coverage/Timeout/Runtime error/Compile error/Ignored.
- teaches "mutant outcome vocabulary (killed, survived, runtime error)": supported. Docusaurus 3.10.2 string present in body (row's noted version).
- Standing W04 (URL shared with S023 across scopes) is a logged census warning, unchanged by this sweep.

ROW S035 verdict=holds (own-work: ~/.kimi-code/skills/kimi-webbridge/; admitted round-40, spotcheck 212; re-opened round-41)
- `~/.kimi-code/skills/kimi-webbridge/SKILL.md` sha256 defba946e6693fd4c890e8754a56fbeef63dc633e6ea32de504cbbc41bfc34b5 — prefix matches row's `defba946e6693fd4`; dir mtime Oct 21 23:36 predates the row's open timestamp.
- `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md` sha256 84a8e69d04c5b810e69695dec8d8e16c1cd9735b96ba81c39433b0c0451bea4b — prefix matches row's `84a8e69d04c5b810`.
- Anchors verbatim: skills copy `:2` `name: kimi-webbridge`, `:6` `version: "2.0.26"`; plugin copy `:6` `version: "1.11.3"` with same `name:` at `:2`. references/ inventory exists (7 files, incl. operations.md and cli-creator/*).
- Quote verbatim at skills SKILL.md line 4 (single line): "Kimi Browser Extension（Kimi 浏览器扩展，原 Kimi WebBridge）lets AI control the user's real browser" (row truncates at "browser" — prefix match).
- teaches "seventh counted-live skills/ child…": host now has exactly 7 dirs under ~/.kimi-code/skills/ (cursor-lane, godspeed, kimi-webbridge, reverse-engineer-anything, shokunin, ufo, wwkd); corpus/knowledge/kimi-skills-plugins.md:220 says "seventh live child"; distinct digests+versions ground "different content… not one tree counted twice".
- Residual note (not a teaches defect): the gloss "the loader must break the tie by scope precedence (User over Extra)" in the quote cell asserts loader behavior the row's own locators don't evidence; teaches cell itself stays within located facts. Left as-is per "do not fix".

Method notes: quotes matched verbatim modulo markup stripping/whitespace folding (S031 line-wrap inside the
sentence; S032/S033 tag-and-JSON markup). Word counts 11/23/23/15 — all ≤25. No rejected rows in S031–S035.
Tools installed: none (pacman paused per operator guard; curl/python3/sha256sum already present).
Host safety: no node selftests run, no counters run against candidates, no lingering processes (all fetches synchronous).
