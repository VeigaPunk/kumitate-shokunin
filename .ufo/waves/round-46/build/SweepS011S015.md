RESULT SweepS011S015 rev=516977af verdict=defects rows=5 defects=1
Anti-loop source sweep, rows S011-S015. Every row re-opened by ordinary means (curl, no browser)
2026-10-23 ~09:20Z; HTTP status and body sha256 recorded; admission quotes are the round-34 `## Gate`
lines (round-34.md:105-109 at 516977af) plus each row's own anchor cell. Match method: strip
script/style/comments and tags, unescape entities, unify NBSP/ZWSP/curly quotes/dashes, collapse
whitespace; fallback removes all whitespace; punctuation and word order never altered; section
attribution by h1-h6 byte offsets. Scratch: /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS011S015/.
No pacman/uv/cargo/npm installs were made; stock curl 8.x + python3 only. No processes left behind.
Step 5 (reject-reason check) is vacuous: none of S011-S015 has status=rejected (queued/mined).

ROW S011 verdict=holds — MCP spec 2025-11-25 changelog; quote verbatim in the anchored section; teaches fully covered.
  curl → HTTP 200, 298536 bytes, sha256 b19ad138ad5a0b138d271967859605155216950fe82d3c43bc286875bf83d7ac (row pins no sha256).
  Quote (17 w) verbatim at flat offset 1740, between § Major changes @951 and § Minor changes @1867, i.e. the tasks
  bullet of § Major changes exactly as the anchor says: «Add experimental support for tasks to enable tracking durable
  requests with polling and deferred result retrieval ( SEP-1686 ).»
  Page declares its revision: 109 raw occurrences of "2025-11-25"; <title> "Key Changes - Model Context Protocol".
  teaches «Prior MCP revision introduced experimental tasks with polling and deferred results (SEP-1686)»: every element
  is in the quote; "prior revision" is the row's pinned URL revision (2025-11-25) vs S010's 2026-07-28. No overstatement.

ROW S012 verdict=holds — Kimi agents docs; all three teaches clauses located in the two anchored sections.
  curl → HTTP 200, 53109 bytes, sha256 65e158159e40a0c2183172e98a1b2da4975017ee45f20b24f3074ba015062a1c; Last-Modified
  Fri, 23 Oct 2026 08:04:11 GMT (site rebuilt since the row's 2026-10-19 fetch; row pins no sha256, quotes re-checked on new bytes).
  Quote (21 w) verbatim under § Agent Locations @5779 (matched space-insensitively; served text pads the code element):
  «more specific scopes take higher priority: Explicit ( --agent-file ) > Project > Extra > User > Plugin > Built-in .»
  teaches "recursive .md scan": «Each directory is scanned recursively for .md files.» (§ Agent Locations, @6046).
  teaches "unknown fields ignored": «Unknown fields are ignored, so newer files stay readable by older versions.»
  (§ Agent File Format @8230, quote @10845). Both anchors exist; nothing in the teaches cell lacks located bytes.

ROW S013 verdict=pin-drift — Kimi tower docs; claims intact but the anchor's pinned body sha256/etag/Last-Modified no longer match.
  curl → HTTP 200, 42839 bytes, sha256 05a1e7d1fb7e697c5aa444ec96362b3905b715b0fca9dddbe363eff4424e894d ≠ row pin
  ad6eb6f82f6fe1ab9c0a8809a8342b1e26dbaa98cc66c5a895eb6c0950ce012f; Last-Modified Fri, 23 Oct 2026 08:04:12 GMT vs row's
  Wed, 21 Oct 2026 06:23:19 GMT; etag now "6adb14fc-a757". moonshotai.github.io rebuilt 2026-10-23 08:04 GMT (S012 page same rebuild).
  Admission quote still verbatim under § Safety and resource cost @10343 (@10414): «Worktrees isolate writes, but they
  are not a security sandbox.»
  teaches on the NEW bytes: «Each workspace can have only one tower coordinator.» grounds "one coordinator per workspace";
  «Every mission has its own branch and Git worktree.» grounds "worktree per mission"; § Understand merges and rebases:
  «It also requires a valid clean review and merge approval, usually from an independent reviewer.» grounds "independent review merge gate".
  So the drift is confined to the pin metadata (sha256/etag/Last-Modified); every quote and teaches clause survives on the
  new bytes. Lane action if desired: append a same-bytes-class re-pin note; row remains mined.

ROW S014 verdict=holds — git-worktree 2.54.0 docs; quote verbatim in § BUGS; redirect anchor re-verified; host-version snapshot stale (noted, superseded).
  curl 2.54.0 → HTTP 200, 98696 bytes, sha256 ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59 (no pin in row).
  Quote (14 w) verbatim under § BUGS @24411 (@24422): «Multiple checkout in general is still experimental, and the
  support for submodules is incomplete.»
  Anchor "(the 2.55.0 path redirects here)" holds: /docs/git-worktree/2.55.0 → 301 → /2.55.0/ → 608-byte "Redirecting…"
  page whose canonical href is https://git-scm.com/docs/git-worktree/2.54.0.
  teaches "docs lag host 2.55.0": host git is now 2.56.0 (`git --version` on this host today), so the host half of that
  snapshot is stale; round-45.md:69 already keeps S014 queued and supersedes its scope with S062 (2.56.0). Source-side
  claims (2.54.0 text + redirect) all hold → not a defect; recorded so the stale host number is not re-cited.

ROW S015 verdict=holds — Anthropic multi-agent research post; URL now 308s to /research/ (same migration S025 records); all teaches numbers located under the anchored section.
  Row URL → 308 → https://www.anthropic.com/research/multi-agent-research-system → HTTP 200, 242370 bytes, sha256
  b1291a954aa8aa63e99bc48ec25dcbe2b6ef6783f3094bfd1c7e1e5fd6c5d0f2 (no pin in row).
  Quote (9 w) verbatim under § Benefits of a multi-agent system @1545 (@5013): «multi-agent systems use about 15× more
  tokens than chats.»
  teaches "90.2 percent gain": «outperformed single-agent Claude Opus 4 by 90.2% on our internal research eval» (same section @3609).
  teaches "80 percent of variance": «token usage by itself explains 80% of the variance» (same section @4263).
  Anchor date verified: page shows "Published Jun 13, 2025" (row: published 2025-06-13). Nothing in the teaches cell
  lacks located bytes; verdict holds.

Residual risk / gaps: single fetch per source at one instant (no etag-stability repetition except the redirect chain);
S013's previous bytes were not diffable (round-45 stored only the sha256, not the body), so what changed inside the
tower page besides the rebuild stamp is unknown — the claim-bearing sentences were verified on the new bytes. S014's
"host 2.55.0" staleness is recorded as a note because SOURCES rows are append-only and round-45 explicitly superseded
the scope with S062; flagging it as a defect would re-litigate a settled routing decision.
