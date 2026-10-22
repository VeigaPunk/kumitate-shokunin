RESULT ReopenS042 rev=- verdict=agree quote-exact=yes locks-node=yes version-named=no

## Item
Re-open S042 (official Kimi Code docs, data-locations page): verify the quote
"Cross-process occupancy locks while a client writes a session" and its `locks/` node;
check whether the page now names a version.

Revisions: lane repo read at /home/vgpnk/Projects/shokunin/kumitate-shokunin (measured
commit c9a084bf03fb043d3cce5da102fffbc023552a45 per assignment); page fetched live
2026-10-22T20:59:09Z. All scratch under /fast/scratch/hyaku/kumitate-r42/falsify/ReopenS042/.
No lane repo writes except this report. No tools installed.

## Evidence (commands and outputs)

1. `curl -sS -D headers.txt -o page.html https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html`
   → `HTTP/2 200`, `date: Thu, 22 Oct 2026 20:59:09 GMT`,
   `last-modified: Thu, 22 Oct 2026 14:04:53 GMT`, `cf-cache-status: DYNAMIC`.
2. `stat -c%s page.html; sha256sum page.html`
   → `74846`, `8e55630062c982c93e6a7e7917a2bf014b38ab097fc38e495cc4b7b313f67784`.
3. Rendered page, § Directory layout, tree verbatim:
   `├── locks/` then `│   └── sessions/           # Cross-process occupancy locks while a client writes a session`
   — the comment sits on the `sessions/` child line; the `locks/` line itself carries no annotation.
4. Decoded-HTML scan: `Cross-process occupancy locks` occurs exactly `count= 1`; full match is
   `'Cross-process occupancy locks while a client writes a session'` — character-for-character
   the SOURCES.md S042 quote and the kimi-session-state.md sentence, no period included.
5. Same tree is corroborated at the docs markdown inside the Kimi Code 2.3.0 tag commit
   (`raw.githubusercontent.com/MoonshotAI/kimi-code/b5e28fd.../docs/en/configuration/data-locations.md`,
   HTTP 200, 9120 bytes): lines 45-46 are `├── locks/` /
   `│   └── sessions/           # Cross-process occupancy locks while a client writes a session`.
6. Page stability: `curl -H 'If-Modified-Since: Thu, 22 Oct 2026 14:04:53 GMT'` → `304`, and the
   live header is still `last-modified: Thu, 22 Oct 2026 14:04:53 GMT`. The bytes served now are
   the same build as the 14:04Z build, so nothing changed since the round's fetch window.
7. Version naming — no product version on the page:
   - semver-shaped tokens in the whole HTML: only `v2.0.0-alpha.17`, which is
     `<meta name="generator" content="VitePress v2.0.0-alpha.17">` — the docs generator, not Kimi Code.
   - literal `version` / `Version`: 0 hits; `2.3` token scan: 0 hits; `kimi-code@<x.y.z>`: 0 hits.
   - `release` appears once in prose ("receive a new release", rollout explanation);
     `latest` is `updates/latest.json` plus the nav link to the separate Changelog page.
   - docs markdown at b5e28fd opens with `# Data locations` (no frontmatter, no version field).
8. Page title/H1: `Data locations | Kimi Code Docs` / `<h1 id="data-locations">`; anchor
   "§ Directory layout" exists under that H1 (`## Directory layout`), so S042's anchor resolves.
9. Page states the root as `$KIMI_CODE_HOME (default: ~/.kimi-code)` and that `KIMI_CODE_HOME`
   moves "all" data, which corroborates the knowledge entry's conditional `~/.kimi-code` root.

## Assessment

Observed: quote exact and unique, node present in § Directory layout as `locks/ → sessions/`,
page names no version (only the VitePress generator version), page unchanged at 14:04:53Z build,
and the same lines exist in the docs markdown of the pinned 2.3.0 tag.

Inference (bounded): the registry row's "purpose only; the page names no product version" and
"Last-Modified is a build time, not a revision" both hold against the live page; the row's tier A
scope claim is neither wider nor weaker than what the page says. No disagreement found.

Precision note (not a falsification): S042's anchor names the "locks/ node", while the purpose
sentence is the annotation on its `sessions/` child. Since S041's `lockDir` is
`join(homeDir, 'locks', 'sessions')`, the comment describes exactly the lock directory, so
"lists the same node" in kimi-session-state.md is correct; but a reader could think `locks/`
itself is annotated. A future edit could say "locks/sessions/ node" for exactness.

Remaining unknowns: whether the page ever named a Kimi Code version in an earlier build (no
archive of prior builds was opened); the live `.lock` file shape is out of this item's scope
(other seats own the code and census claims).

Consequence for coverage:kimi-layer: the S042 citation survives re-opening unchanged; it remains
valid corroboration for the declared `~/.kimi-code/locks` K3 member and its purpose, and no
strengthening (a version) is available from this source to upgrade it.
