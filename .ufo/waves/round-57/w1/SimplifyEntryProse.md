# SimplifyEntryProse — entry prose audit: `corpus/knowledge/worker-heartbeat-liveness.md` (round 57, seat SimplifyEntryProse)

Item: review the C2 entry for unbound filler or claims a receipt doesn't carry; flag lines that
exceed their receipt text. Audited at rev `f0dc6d1160e66af65355bd353665adac22bbf4a9` (the
freeze+integrate commit that added the entry; unchanged since — `git log -- <entry>` shows only
that commit; entry working-tree bytes == rev bytes, checked). HEAD `8c6f5b0` does not touch it.
No production files changed; evidence in `.ufo/waves/round-57/build/SimplifyEntryProse/`
(`audit.mjs`, `audit.json`, `evidence.txt`).

## Binding integrity (the floor the entry claims for itself)

The intro asserts "Every clause is bound to committed bytes (E2, rule D57)." Verified true at
`f0dc6d1`: 13 clause lines, 15 distinct `receipt:<path>@sha256:<hex>` bindings, all 15 blobs
exist at rev with matching sha256 (mechanical audit, zero SHA failures). No unbound clause. The
entry's checkable frame also holds: ordinal chain fourth/fifth/sixth/**seventh** is consistent
across the line's own intros; the r54/r55/r56 mapping matches `PROVINCE.md:22`; SOURCES rows
*130–*133 match "three admitted, one rejected"; capture registry pins S117–S120; the lane-mapping
pin `31c465f1` resolves in the origin tree and `scripts/fleet-dispatcher.mjs` at that pin carries
`MAX_LAUNCH_MISSES = 8` (l.117), `LAUNCHING_GRACE_MS = 120_000` (l.123), and repend gated on
`registered_mission_missing` with nonzero launcher exit (ll.3571–3573, 7069–7071).

## Findings — lines that exceed their receipt text (all four sources re-opened 2026-10-24 at exact URLs to adjudicate)

**F1 — line 35 (Rejected row): quote shortened at the capture layer, entry inherits it.** Entry
and bound receipt both quote "promptly finds out about disrupted connections **(and peers)**";
the live S120 Overview reads "disrupted connections **(and also completely unresponsive
peers)**". The parenthetical was silently abbreviated inside quotation marks in
`ScoutRabbitmqHb/tcp-liveness.txt` and the entry copies it. Substance unaffected (peers are
still named; rejection rationale stands), but this is a quotation that is verbatim to neither
the source nor, transitively, honest as a quote. Owner: the capture artifact (sibling seat's
build file) — flag, not fixable from this seat.

**F2 — line 35: pronoun substituted inside an ellipsis quote.** Entry: "the client … needs to
re-connect". Receipt and live source: "When **a client** detects that RabbitMQ node is
unreachable due to a heartbeat, **it** needs to re-connect." "the client" appears in neither;
the entry rewords inside quote marks. Substance identical.

**F3 — line 22 (Kafka cadence): quoted fragment not carried by its own receipt — but verified
verbatim on the live page.** Entry quotes "typically should be set no higher than 1/3"; the
bound receipt's line reads "typically **no higher than 1/3** of that value" (paraphrase, drops
"should be set"). Re-opened S118 today: the live page says "typically should be set no higher
than 1/3 of that value. It can be adjusted even lower…". So the entry is source-faithful and
the **receipt** is the loose layer — the clause's bound bytes do not carry its exact quoted
words. Same shape at line 19: entry's fourth timeout slot is named "Heartbeat Timeout" while
the bound receipt paraphrases the slot as "Activity Heartbeats"; the live S117 page uses
"Heartbeat Timeout" (27 occurrences) — again source-faithful entry, loose receipt paraphrase.
Neither flips D57 (E2 binds clause→receipt existence+sha, not quote verbatim-vs-source).

**F4 — line 24 (K8s remedy): claim carried by a sibling receipt, not the line's own.** "the
remedy is a container restart, a different actor than broker reclaim" is not in clause 7's
bound `liveness-remedy.txt`; it is carried by clause 8's `probe-timing.txt` ("failure →
container restart (pod-level reclaim), not job reclaim"). Entry-level coverage exists; the
line exceeds its own binding. Same pattern, line 30: `fleet-dispatcher.mjs` is named in prose
but clause 10's receipt says "fleet-dispatcher reconcile" (the `.mjs` token lives in clause
11's `grace-window.txt`).

**F5 — line 25 (K8s timing): "plus a startup slot for slow initializers" exceeds the bound
bytes.** The receipt carries only `periodSeconds` and `initialDelaySeconds` ("wait 5 seconds
before performing the first probe"). The Kubernetes *startup probe* — the actual named
"startup" mechanism — is on the live page but outside the receipt; as written the clause
glues a "startup slot" onto `initialDelaySeconds`, which conflates a delay knob with the
startupProbe mechanism. Recommend either adding the startup-probe sentence to the capture or
rephrasing to what `initialDelaySeconds` carries.

**F6 — cosmetic quote-drift (no action needed beyond awareness).** Line 20: "We recommend…"
capitalized; receipt and live page both lowercase "we recommend…" (sentence-initial
capitalization convention). Line 30: quoted "is the worker still there?" — receipt has no "?"
inside its quotation. Line 22: the `heartbeat.interval.ms` quote closes after "coordinator"
mid-sentence (source continues "when using Kafka's group management facilities") without an
ellipsis. Line 24 splices two verbatim fragments in reverse source order ("…cannot recover
except by being restarted." comes first on the page); both fragments verbatim, connective
unquoted — acceptable splice, noted for the record.

## Unbound filler

None found. The unbound prose (intro paragraph, section headers) decomposes entirely into
claims verified above; entry-author synthesis inside clause lines ("liveness latency is priced
directly", "the same short-timeout/frequent-ping trade as Temporal") is unquoted analysis
consistent with bound bytes and is properly marked as design inference where it generalizes
(line 31 carries an explicit `[INFERENCE]` + "not a claim the sources state" disclaimer — the
model behavior for this entry class).

## Verdict, tradeoff

The entry's mechanisms, lane mapping, and rejection are accurate against all four re-opened
sources; no false claim, no filler to delete. The residue is quote-fidelity debt: two quotes
altered inside quotation marks (F1, F2 — inherited from a sibling capture in F1), two claims
whose exact wording lives in a sibling receipt or on the live page but not the line's own bound
bytes (F3, F4), and one conflation risk (F5). Next deletion/simplification would harm the
provenance axis: the clause-level receipt density is the entry's contract, not weight. S120's
rejection (tier B) stands on re-open. One operational note: plain `curl` to rabbitmq.com now
hits a Cloudflare challenge (5,427-byte "Just a moment…"); the pinned 51,578-byte body
reproduces with a browser UA — future re-captures of S120 need that header.

No tooling installs were needed.
