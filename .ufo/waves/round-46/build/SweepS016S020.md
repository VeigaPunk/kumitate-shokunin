RESULT SweepS016S020 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open sweep of corpus/SOURCES.md rows S016–S020 at 516977af2216b1cc426ee970d260dee53714bf4f,
run 2026-10-23 by seat SweepS016S020 (non-author; lane read-only; nothing fixed).
Method: each source re-opened today by ordinary means (curl; redirect chain recorded for S020).
Every admission quote matched verbatim in the fetched bytes, case-sensitive, after HTML entity
decode + tag strip + whitespace collapse (markup/whitespace aside); teaches cells and reject
reasons checked against the same normalized bytes; quote word counts via `printf '%s' "<q>" | wc -w`.
Admission quotes located in the round that opened all five rows: corpus/lessons/round-34.md
`## Gate` "Source rows opened this round" bullets at :110-114; S018 additionally re-opened by the
round-41 Gate (round-41.md:150-158). Spotchecks r34:13, r35:140, r36:149, r41:150-151 read; consistent.
Fetch record 2026-10-23 (none of the five rows pins a body sha256, so pin-drift cannot apply):
- S016 https://cognition.com/blog/dont-build-multi-agents -> HTTP 200, 170190 B, body sha256 a6a1865f8d7baaa2de9fd0765c3c01701240a2ced427705142614e8ecdd57fb0, etag "4c919f8d2db8e93b6acf8aa5c74bc74c", no Last-Modified
- S017 https://docs.temporal.io/activity-definition -> HTTP 200, 125153 B, sha256 da4fa5844ea9ed685cdc9c4649dde01e5d0d36c94b406791ac4f43ba5a53d779, Last-Modified Fri, 23 Oct 2026 04:14:55 GMT
- S018 https://arxiv.org/abs/2503.13657 -> HTTP 200, 44761 B, sha256 69909c1ba184073a579258381b90f4aa6e47e1dca1451576c932e90a378f216b
- S018v3 https://arxiv.org/html/2503.13657v3 -> HTTP 200, 1780259 B, sha256 e54dc4caed74ca80fb6a9a165fac6ae037e438e22878399830f40c0c38cfbb7d
- S019 https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices -> HTTP 200, 579639 B, sha256 6660ce5d0993b128cd77513bc375448debfb313a51bb76b175095de145652d61, etag W/"q767il4tgbcezk"
- S020 HEAD https://docs.langchain.com/oss/python/langgraph/durable-execution -> final URL .../oss/python/langgraph/persistence, HTTP 200; GET persistence page -> 200, 710437 B, sha256 840ec29a6df7887ee5f84b9c692ca607c93ffac4448472fbcb19841f727099d1, etag W/"1721n40mh2vf83t"

ROW S016 verdict=holds — teaches cell: "Counterpoint: share full traces, not messages; single-threaded agents avoid conflicting decisions".
- round-34.md:110: Principle 1: «Share context, and share full agent traces, not just individual messages» (11 words) — 1 verbatim hit @3933, directly under the "Principle 1" heading.
- Anchor date: raw HTML has JSON-LD "datePublished":"2025-06-12" and og article:published_time 2025-06-12; visible byline "By Walden Yan 2025.06.12" — matches anchor "published 2025-06-12".
- teaches clause 1 = the quote itself. Clause 2 grounded on the same page: "just use a single-threaded linear agent" (single-threaded ×2) and Principle 2 heading "Actions carry implicit decisions, and conflicting decisions carry bad results" (1 hit).

ROW S017 verdict=holds — teaches cell: "Temporal activities are at-least-once; Run ID plus Activity ID forms the idempotency key".
- round-34.md:111: § Idempotency: «You can use a combination of the Workflow Run ID and the Activity ID as an idempotency key» (18 words) — 1 verbatim hit @8364, continuing "since this is guaranteed to be consistent across retry attempts".
- § Idempotency heading present (12 hits) — anchor holds.
- teaches "at-least-once": 0 literal "at least once" on the page, but it states "Because Activities may be retried, these functions may be executed more than once." and "If an Activity fails to report to the server at all, it will be retried." — the same contract, fairly condensed; not an overstatement.
- Page republished since open (today Last-Modified 2026-10-23 04:14:55 GMT vs anchor's open-time "Last-Modified 2026-10-19"); quote, heading and both retry passages unchanged in today's bytes; no sha pin to drift.

ROW S018 verdict=holds — teaches cell: "MAST: 1600+ traces, 14 failure modes in 3 categories, kappa 0.88".
- round-34.md:112: § Abstract: «This process identifies 14 unique modes, clustered into 3 categories» (10 words) — 1 verbatim hit @1558 in today's abstract, immediately preceded by "(kappa = 0.88)".
- teaches numbers all in the same abstract: "dataset of 1600+ annotated traces" (1 hit), "(kappa = 0.88)" (1 hit), 14/3 = the quote.
- Submission history lists [v1][v2][v3], v3 dated Sun, 26 Oct 2025 — v3 is the latest version, so anchor "arXiv:2503.13657v3" is current.
- round-41 Gate re-open (queued→mined, round-41.md:150-158): FM-3.2 quote «(partial) omission of proper checking or confirmation of task outcomes or system outputs» (13 words) — 1 verbatim hit @62947 in today's v3 HTML; its Appendix J support also verbatim: bullet "Some failures are non-fatal" contains "appear frequently even in successful runs" (1 hit each), exactly where r41-spotcheck:150 placed it.

ROW S019 verdict=holds (rejected; reason holds) — teaches cell: "REJECTED: security-province OAuth confused-deputy mitigation; report to kasegi/kagi; flip: an orchestration-only clause".
- round-34.md Gate: "S019 ... rejected on domain (kasegi/kagi); flip: an orchestration-only clause binding dispatch or queue behaviour."
- Quote (13 words) «MCP proxy server uses a static client ID with a third-party authorization server» — 1 verbatim hit @13493, under Confused Deputy Problem → "Vulnerable Conditions" bullet list.
- Anchor headings both present: "Attacks and Mitigations", "Confused Deputy Problem".
- Province characterization accurate: the section is OAuth attack/mitigation text ("obtain authorization codes without proper user consent", consent cookies, per-client consent) — security province, not orchestration.
- Flip unmet: 0 hits for "orchestrat*" anywhere on the page — no orchestration-only clause; rejection stands.

ROW S020 verdict=holds (rejected; reason holds) — teaches cell: "REJECTED: locator drift; durable-execution URL redirects to an overview omitting durability modes; flip: page regains durability semantics".
- round-34.md Gate: "S020 ... rejected on locator drift; flip: the page regains the durability-mode semantics." (r35:140 and r41:151 spotchecks agree; both re-checked then.)
- Locator drift reproduced today: `curl -sIL .../langgraph/durable-execution` → final URL https://docs.langchain.com/oss/python/langgraph/persistence, HTTP 200.
- Quote (8 words) «Checkpointers persist a thread’s graph state as checkpoints.» (curly apostrophe as served) — 1 verbatim hit @6509 on the persistence page.
- Anchor § "Checkpointer vs. store" heading present; page has 0 hits for "durabilit*" — durability modes still absent, flip unmet, rejection stands.

Residual risk / verification gaps:
- No row pins a body sha256, so no hash comparison was possible; today's body hashes are recorded above for future seats. S016/S019/S020 served no Last-Modified (etag only), so byte drift vs the 2026-10-19 open cannot be excluded for them — but every quote, anchor and teaches element still matches today's bytes.
- S017: teaches "at-least-once" is a standard-name condensation, not a literal page phrase (the page's own wording is quoted above). Judged grounded, not overstated.
- S016: teaches clause 2 draws on Principle 2 and the "single-threaded linear agent" passage while the anchor names only Principle 1; both passages are on the one opened page and the row's scope is the whole argument, so judged in scope.
- Match method is markup/whitespace-insensitive by design; raw-byte (byte-exact HTML) identity was not required and not checked.
- No pacman transactions; no tools installed or updated — preinstalled curl, git and python3 only (operator tooling directive record).
