# K81ScribeCorpus — knowledge drafts for round 81 (w1)

- **Seat:** `K81ScribeCorpus` (scribe). Drafts only: the L1 lands the files.
- **Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (all paths below are absolute unless lane-relative).
- **Plan:** `.ufo/waves/round-81/plan.md` (C1 `ready-handoff`, C2 the self-describing shape receipt); base tip `77c7a8b3fe7f3cebe681065da283de0ae38ddb5b`.
- **Host / date:** Linux run-15 host, 2026-11-04.
- **Scratch:** `/fast/scratch/hyaku/kumitate-r81/K81ScribeCorpus` — removed before yield.

Behavior: read the frozen plan, both lane instruments in full, the note style, and both
committed captures; verified every quoted sentence inside the capture bytes; ran the
read-only instruments with `--work` under scratch (captures below); drafted the two entries
and the two README rows. No product file, no knowledge file, no registry file was edited.

---

## Deliverable 1 — `corpus/knowledge/ready-handoff-admission.md` (copy-ready)

Expected source id: **`S236`**. Placeholder: the L1 must confirm the id when it lands the
`corpus/SOURCES.md` row. A matching row already exists at HEAD `d140f288`
(`corpus/SOURCES.md:190`, quote count 21 words); the id is not yet confirmed by this seat.

```markdown
source: S236 — Kubernetes, *Admission Control in Kubernetes*, "What are they?" — https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/ (opened 2026-11-04; capture `.ufo/waves/round-81/build/L1/captures/kubernetes-admission.html`, sha256 1a86e90c458ef57757435ea481d95cf8ccb52c67c2dad9e610eb5b3afc7ffbb3); local contract: `.ufo/waves/round-81/plan.md` § C1 and `scripts/ready-handoff.mjs` — expected id `S236`, a placeholder the L1 must confirm at landing
verified-at: 2026-11-04 — `node scripts/ready-handoff.mjs --selftest --work <scratch>` → `READY_HANDOFF_SELFTEST: 34/34 pass`; `node scripts/ready-handoff.mjs --lane <lane> --round 81 --wave w1` → `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1` exit 0; frozen counter `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1` → `C81_C1: HELD held=16/16` (tool sha256 `f8fc11f12f74505e95bdf1674c3626e4b810f6be99453177d5bd729349712995`)
recheck: re-run the frozen counter and the live gate at the next lane tip; re-open S236 only if the admission wording changes (180 d)

# Ready-handoff admission

A cross-session handoff is admitted or refused **before** it is taken, never
after. The run-7 inline-spawn handoff is a file this lane writes —
`<lane>/.ufo/waves/round-<N>/<wave>.ready`, JSON `{lane, round, wave, dispatch,
l1}` — which the orchestrator polls for and takes within seconds. The write is
the request; the take is the persistence; every rule that separates a
dispatchable handoff from a bad one belongs in the window between them.

`scripts/ready-handoff.mjs` (contract `kumitate-ready-handoff-v1`,
`ready-handoff.mjs:31`) is that admission layer. It reads two files and nothing
else — the ready file (`:23-24`) and the dispatch JSON it names — and returns one
verdict: `READY_HANDOFF: READY …` exit 0, `READY_HANDOFF: DRIFT <ids>` exit 1,
`READY_HANDOFF: FAIL-CLOSED <TOKEN>` exit 2, usage 64 (`:20-21`).

## The five-key ready contract

The ready document is exactly `lane`, `round`, `wave`, `dispatch`, `l1`
(`READY_KEYS`, `:38`). The key sets are compared as sorted lists (`:150`), so a
missing key and an extra key fail the same way — there is no tolerated field.

- The ready **file** must be a regular file whose realpath is inside the lane
  (`lstat`, `:107-109`; `realpath`, `:112-118`). A symlink is `READY_UNSAFE` even
  when it points inside the lane, and one that points outside is refused at the
  same token — the handoff's own bytes must live in the lane, like the dispatch
  it names.
- `dispatch` must be an **absolute** path (`:121-123`), lexically inside
  `<lane>/.ufo/waves/round-<N>/` (`inside()`, `:86`; `DISPATCH_OUTSIDE`, `:127`),
  and its realpath must stay inside too, so a symlink cannot smuggle the payload
  out (`:132-139`, `PATH_UNSAFE`).
- `lane` may be the lane id (`kumitate`, the directory name minus `-shokunin`)
  or the directory name itself (`:151-153`); the live file writes
  `"lane": "kumitate"`.
- `round` and `wave` must equal the CLI arguments (`:154-155`), and `l1` must be
  a non-blank string (`:156`).

## The dispatch agreement checks

The dispatch is a JSON object whose `taskCall` carries a string `context` and a
non-empty `tasks` array (`:141-143`); anything else is `DISPATCH_MALFORMED`
exit 2 before any policy rule runs. Then, per seat:

- Only `name`, `agent`, `task` are dispatch fields (`:172-173`). A per-seat
  `model` — or any other key — is `ARTIFACT_KEYS`; the campaign forbids pinning a
  model at seat level.
- `name` matches `[A-Za-z][A-Za-z0-9]{1,31}` (CamelCase, ≤32) and duplicates are
  refused case-insensitively (`:174-177`): `K81X` and `k81x` are the same seat.
- `agent` must be one of the frozen roles (`ROLES`, `:34-36`), and `planner` is
  refused before that lookup (`:179-180`): the planner seat is L1-held.
- The task text's first trimmed line must be `/skill:godspeed` (`:186`); the
  text must contain the lane's realpath (`:158`, `:187`); a lane-relative
  `.ufo/waves/round-<N>/…` path outside `Report:` lines is `RELATIVE_WAVE_PATH`
  (`:188-190`); a relative `Report:` trailer is legal only when the batch context
  says where it resolves — `relative to` or `write it at` (`:192-198`).
- The batch context must contain the lane root (`:161`) and name the scratch rule,
  `HYAKU_SCRATCH` or `scratch root` (`:162`).

## The wave-policy arithmetic

Three counters, one comparison each:

| Rule | Test | Default | Finding |
|---|---|---|---|
| band | `lo ≤ tasks.length ≤ hi` inclusive | `8:16` (`:47`) | `BAND` (`:160`) |
| attack share | integer `attack × 100 < pct × total` fails | `pct = 25` (`:47`) | `ATTACK_SHARE` (`:200`) |
| connector cap | `connectors > 2` fails | cap 2 (`:201`) | `CONNECTOR_COUNT` (`:201`) |

The attack set is `reviewer`, `critic`, `mutation-tester`, `labrat` (`:37`). The
share is strict: exactly one quarter passes, `2/10` fails, `4/14` passes. All
three values are CLI-overridable (`--band`, `--attack-pct`), and the defaults are
compiled in: the gate never opens `ufo-wave-policy.json` — the comment at `:36`
is attribution, not a read. A policy change is therefore a tool change (and a
counter change), not a config edit.

## The fail-closed surface

These are refusals to **evaluate**, not policy verdicts; each exits 2 and prints
one token. They run before the policy block, so an unreadable or escaping handoff
never receives a policy verdict (`judge()`, `:95-144`): "absent" is never
rendered as READY.

| Token | Trigger | Line |
|---|---|---|
| `READY_ABSENT` | no ready file at the path | `:104`, `:107` |
| `READY_UNSAFE` | the ready path is a symlink or non-file, its realpath escapes the lane, or it cannot resolve | `:109`, `:113`, `:117` |
| `READY_MALFORMED` | the ready file is not JSON, or JSON that is not an object | `:120-121` |
| `DISPATCH_PATH` | `ready.dispatch` is not an absolute path | `:123` |
| `DISPATCH_OUTSIDE` | the dispatch is lexically outside the round's wave directory | `:127` |
| `DISPATCH_ABSENT` | no file at the dispatch path, or it is not a regular file | `:130-131` |
| `PATH_UNSAFE` | the dispatch realpath escapes the wave directory, or cannot resolve | `:134`, `:138` |
| `DISPATCH_MALFORMED` | `taskCall.context` is not a string, or `taskCall.tasks` is not a non-empty array | `:143` |

Exit 1 is the other half: the handoff was evaluated and refused, and the DRIFT
line names every finding id plus the first finding's detail (`:226-227`), so a
reader can repair it without re-reading the round prompt.

## What it does not prove

- **Well-formed is not useful.** The gate checks strings and counts; it never
  opens a file a seat text cites, so a well-formed handoff can still name paths
  that do not exist.
- **It is not the validator.** `ufo-swarm-wave.mjs plan`/`run` refuses malformed
  specs before a payload exists; this gate judges the pair as it will be taken
  (ready file ↔ dispatch on disk), which is the surface the orchestrator reads.
- **No authorship or authenticity.** Any writer who can produce a legal file and
  dispatch passes; nothing checks that the ready file was written by the agent
  named in `l1`, and there is no signature.
- **No custody of the bytes taken.** The gate reads; the orchestrator takes.
  Nothing locks the dispatch, so a rewrite between the two is unobserved.
  `dispatchSha` is a 32-bit non-cryptographic digest for diagnostics
  (`sha`, `:72-75`; `:211`) — not a content pin, and not safe to quote as one.
- **No read-side claim.** Admission judges the write. Kubernetes states the limit
  on its own mechanism — reads bypass the admission control layer — and the same
  boundary holds here: after the take, the gate asserts nothing about what the
  seats do.
- **No environment claim.** It does not check that the named agents exist, that
  the model is available, or that the budget permits the wave.

## Gate

Opened 2026-11-04 in the committed capture
`.ufo/waves/round-81/build/L1/captures/kubernetes-admission.html`
(574 395 bytes, sha256
`1a86e90c458ef57757435ea481d95cf8ccb52c67c2dad9e610eb5b3afc7ffbb3`).
Section *What are they?*, exact quote (**21** whitespace words):

“Admission controllers are code within the Kubernetes API server that check the
data arriving in a request to modify a resource.”

The read-side limit is the same section's following sentences; supporting
fragment (**6** words): “reads bypass the admission control layer”. No Kubernetes
API server was contacted; the quote grounds one property — check before
persistence — not this tool.

## Evidence

| Claim | Command | Result |
|---|---|---|
| the gate admits this round's own handoff | `node scripts/ready-handoff.mjs --lane <lane> --round 81 --wave w1` | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=scout=2,connector=1,executor=3,mutation-tester=1,reviewer=2,critic=1,sentinel=1,scribe=2,revenger=1` exit 0 |
| the suite is hermetic and green | `node scripts/ready-handoff.mjs --selftest --work <scratch>` | `READY_HANDOFF_SELFTEST: 34/34 pass`, `VERDICT: PASS` exit 0 |
| the ready file itself is policed | gate on a scratch fixture whose `w1.ready` is a symlink (`ready-symlink-inside`/`ready-symlink-escape` cases) | `READY_HANDOFF: FAIL-CLOSED READY_UNSAFE (ready path is not a regular file (symlink): …)` exit 2 |
| band below / above | frozen counter arms `band-below`, `band-above` | `DRIFT BAND (7 seats outside 8:16)` / `(17 seats outside 8:16)` exit 1 |
| attack share and connector cap | arms `attack-share`, `connector-cap` | `DRIFT ATTACK_SHARE (2/10 attack seats below 25%)`, `DRIFT CONNECTOR_COUNT (3 connector seats (at most 2))` exit 1 |
| refusals are typed | arms `planner-refused` … `ready-keys` | `PLANNER_SEAT`, `ARTIFACT_KEYS`, `GODSPEED`, `TASK_LANE_ROOT`, `RELATIVE_WAVE_PATH`, `READY_KEYS` exit 1 |
| fail-closed surface | arms `dispatch-escape`, `dispatch-absent` | `FAIL-CLOSED DISPATCH_OUTSIDE` / `DISPATCH_ABSENT` exit 2 |

## Limits

Kubernetes' admission controllers are a server-side plugin chain; this gate is a
single read-only process over two files. Only the order property transfers —
check before persistence — not authorization, mutation, or webhooks. The gate is
lane-local: it knows the kumitate five-key `.ready` shape and the run-15 wave
policy, so another lane's handoff shape fails `READY_KEYS` by design. Its
`--selftest` is hermetic; its live verdict is only as good as the two files it
reads at that instant.
```

---

## Deliverable 2 — `corpus/knowledge/self-describing-shape-receipt.md` (copy-ready)

Expected source id: **`S237`**. Placeholder: the L1 must confirm the id when it lands the
`corpus/SOURCES.md` row. A matching row already exists at HEAD `d140f288`
(`corpus/SOURCES.md:191`, quote count 22 words, which matches the §4.2.3 sentence used below);
its title cell says “Section 5.1” — finding 7.

```markdown
source: S237 — IETF RFC 9111, *HTTP Caching*, §4.2.3 Calculating Age and §4.2 Freshness — https://www.rfc-editor.org/rfc/rfc9111.html (opened 2026-11-04; capture `.ufo/waves/round-81/build/L1/captures/rfc9111.html`, sha256 ce91ee9848d2b9ac46386b0f0cbd4bfd9c0cd1948ebc363834cadc7e0997f3d7); local contract: `.ufo/waves/round-81/plan.md` § C2 and `scripts/omp-census.mjs` — expected id `S237`, a placeholder the L1 must confirm at landing
verified-at: 2026-11-04 — `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` → `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` exit 0; frozen counter `node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2` → `C81_C2: HELD held=15/15` exit 0; `--selftest` → `VERDICT: PASS` (tool sha256 `ba7cbc8f7f507fcf932d06b53e11d0c0801921000d0ba3d35b27ab37b70c322f` on this date)
recheck: re-run the frozen counter; re-open S237 only if RFC 9111 is superseded (180 d)

# Self-describing shape receipt

Round 80 bound the OMP plane's score to a committed shape receipt and disclosed
`source=snapshot`. The receipt still carried no capture instant, so a closure
reading it months later could not tell whether the live root had moved since
(`corpus/lessons/round-80.md` §Limits). Round 81 versions the document to
`kumitate-omp-shape-v2` and makes the instant readable.

## The v2 document

The receipt is exactly `{captured_at, contract, entries}` and nothing else
(`validateShape`, `:171-177`); `captured_at` is an ISO second,
`YYYY-MM-DDTHH:MM:SSZ` (`ISO_SECOND`, `:168`). `entries` is non-empty, sorted in
the order `readdirSync(root).sort()` produces (`:157-161`), and each entry is
exactly `{kind, mode, name}` — `kind` one of `file`/`dir`/`symlink`, `mode` an
integer `0…0o777`, `name` free of `/`, `\`, NUL and never `.`/`..` (`:179-193`).
The document is validated before it is written (`:226`) and again on every read
(`readShapeDoc`, `:197-208`), so a malformed receipt is refused at the boundary,
not deep inside the census.

## Writing a receipt

`--snapshot FILE [--root DIR]` reads the root's depth-1 shape with `readdir` and
`lstat` only (`readShape`, `:150-164`), stamps `new Date()` truncated to whole
seconds (`:225`), validates the candidate document, then writes
`<file>.<uuid>.tmp` with `flag:'wx'` and mode 0600 and renames it into place
(`:222-229`). The rename is the publish: a crash before it leaves the previous
receipt intact, a crash after leaves the new one, and a leftover `.tmp` is not a
receipt because no reader looks at it. The line is
`OMP_SNAPSHOT: WROTE entries=<n> sha256=<digest of the exact bytes> path=<file>`
(`:231`). On an unchanged root, a re-snapshot differs only in `captured_at`.

## Age disclosure

`--shape FILE` re-runs the census from the recorded entries and appends
`captured=<YYYY-MM-DD> age_days=<n>` to its single verdict line (`:492`). The age
is `floor((now − Date.parse(captured_at)) / 86 400 000)` (`receiptAgeDays`,
`:216-219`): whole 24-hour periods against the reader's clock, so any receipt
younger than 24 h reads 0. The census decision consumes `entries` alone
(`:489`); the age is printed beside it and never passed into it.

## The opt-in staleness gate

`--max-age DAYS` is accepted only with `--shape` (`:433`) and must be a
non-negative integer (`:432`). When `age > maxAge`, the tool prints
`SHAPE_STALE age_days=<n> max_age=<d>` (`:479-481`), still prints the census
line, and exits 1 (`:493`). Without the flag the same 45-day receipt exits 0;
with `--max-age 60` over it, exit 0. The window is the consumer's declaration —
the tool ships no freshness policy and no default window.

## Refusals

Each refusal prints one token (and, for `SHAPE_VERSION`, the wanted and got
contract) and no census line; all exit 2 except usage:

| Token | Trigger | Line |
|---|---|---|
| `SHAPE_VERSION want=kumitate-omp-shape-v2 got=<contract>` | `--shape` given a v1 receipt | `:469-471` |
| `SHAPE_CLOCK captured_at=<ts> is in the future` | age is negative — any future instant | `:474-476` |
| `SHAPE_INVALID` | not JSON, wrong key set, missing/invalid `captured_at`, empty entries, unsorted entries, bad name/kind/mode | `:176-189`, `:204` |
| `SHAPE_NOT_FOUND` | the receipt cannot be read | `:199-201` |
| usage 64 | `--max-age` without `--shape`, or incompatible modes | `:426-433` |

## The v1 cutover

Only `--shape` refuses v1. `validateShape` still admits the legacy
`{contract: kumitate-omp-shape-v1, entries}` key set (`:172`), so `--compare` —
the report-only live diagnostic (`compareShape`, `:242-287`) — and the proxy's
scoring read (`shapeFromFile`, `scripts/proxy-check.mjs:331`) keep working on an
old receipt. A v1 receipt can therefore still feed `coverage:omp` and a
count-only comparison; it can never be age-gated. Migration is a re-snapshot,
not an edit. `pin.omp-shape` (`SCORECARD.md:331`) binds the committed receipt's
sha256: at this round's landing the receipt is v2, 65 entries, `captured_at`
`2026-11-04T09:45:44Z`.

## What age cannot prove

- **Not authenticity.** `captured_at` is self-asserted by the writer; a
  backdated instant is accepted and only the future is refused. A forger who
  re-labels an old snapshot produces a *new* receipt with a different sha256 —
  custody is the pin and the commit diff, not the field.
- **Not live equality.** Age says when the shape was read, not that the root
  still matches. `--compare` answers the present-tense question, non-scoring,
  and excludes the `agent.db-{shm,wal,journal}` transients (`:253-262`); it is a
  separate observation, not a stronger reading of the receipt.
- **Not content.** The receipt records names, kinds and modes. A content-only
  change is invisible to both the receipt and the comparison.
- **Not host identity.** The document has no host or user field, so two hosts
  with the same depth-1 shape produce interchangeable receipts.
- **Not correctness.** The rules that turn entries into CLEAN/DRIFT are a
  separate, versioned decision; age says nothing about whether the capture or
  the rules were right.
- **Not a score input.** `coverage:omp` is
  `floor(10 × C1o/C1o_total × (O_members − O_findings)/O_members)`
  (`SCORECARD.md:370`) and reads 10 on a 45-day receipt (counter arm
  `stale-does-not-score`: `verdict=MATCH coverage_omp=10`). A decaying score
  would measure the snapshot schedule, not the plane.

## Gate

Opened 2026-11-04 in the committed capture
`.ufo/waves/round-81/build/L1/captures/rfc9111.html` (232 630 bytes, sha256
`ce91ee9848d2b9ac46386b0f0cbd4bfd9c0cd1948ebc363834cadc7e0997f3d7`).
§4.2.3 *Calculating Age*, exact quote (**22** whitespace words):

“The Age field value is the cache's estimate of the number of seconds since the
origin server generated or validated the response.”

§4.2 *Freshness* states the consumer side; supporting quote (**14** words):
“A "fresh" response is one whose age has not yet exceeded its freshness
lifetime.” The RFC describes HTTP caching, not this receipt: no HTTP exchange
was performed.

## Evidence

| Claim | Command | Result |
|---|---|---|
| the committed receipt is v2 | `node -e` on `.ufo/pins/omp-shape.json` | `contract=kumitate-omp-shape-v2 captured_at=2026-11-04T09:45:44Z entries=65 keys=captured_at,contract,entries` |
| age is disclosed | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` exit 0 |
| backdated age reads as days | counter arm `shape-age-backdated` | `captured=2026-09-20 age_days=45` exit 0 |
| stale gate | counter arm `max-age-stale` | `SHAPE_STALE age_days=45 max_age=30` + `OMP_CENSUS: CLEAN …` exit 1 |
| window passes when declared wide | counter arm `max-age-pass` | `OMP_CENSUS: CLEAN … age_days=45` exit 0 |
| v1 refused by `--shape` | counter arm `shape-v1-refused` | `SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1` exit 2 |
| v1 accepted by `--compare` | counter arm `compare-v1-accepted` | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0` exit 0 |
| future instant refused | counter arm `clock-future-refused` | `SHAPE_CLOCK captured_at=2026-11-06T09:55:32Z is in the future` exit 2 |
| v2 without `captured_at` refused | counter arm `captured-at-required` | `SHAPE_INVALID` exit 2 |
| age does not score | counter arm `stale-does-not-score` | `verdict=MATCH coverage_omp=10 O_members=65` |
| the receipt is pinned | counter arm `receipt-pinned` | `pin=8b6aaa79e24f computed=8b6aaa79e24f contract=kumitate-omp-shape-v2` |

## Limits

The age is whole-day granularity against the reader's clock: a reader whose clock
lags the capture instant refuses a valid receipt as `SHAPE_CLOCK`, and a reader
ahead overstates the age. The receipt is host-bound and single-host; it is a
depth-1 metadata record, not an inventory of content, and it answers "when was
this taken", not "was this honest". `--max-age` shares the intuition of HTTP's
`max-age` directive but not its mechanism: it is a CLI flag read at one
invocation, not a field transmitted with the artifact.
```

---

## Gate rows (quotes, locations, word counts)

Both captures are committed under `.ufo/waves/round-81/build/L1/captures/`; the quotes were
re-checked against the capture bytes with tag-stripping and whitespace normalization
(`K81ScribeCorpus-captures/gate-facts.txt`), not against a remembered wording.

| Entry | Expected id | Source / section | URL | Accessed | Exact quote | Words |
|---|---|---|---|---|---|---|
| `knowledge/ready-handoff-admission.md` | `S236` (placeholder) | Kubernetes, *Admission Control in Kubernetes*, **What are they?** (body) | https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/ | 2026-11-04 | “Admission controllers are code within the Kubernetes API server that check the data arriving in a request to modify a resource.” | **21** |
| `knowledge/self-describing-shape-receipt.md` | `S237` (placeholder) | IETF RFC 9111, **§4.2.3 Calculating Age** (inside §4.2 Freshness) | https://www.rfc-editor.org/rfc/rfc9111.html | 2026-11-04 | “The Age field value is the cache's estimate of the number of seconds since the origin server generated or validated the response.” | **22** |

Supporting quotes (each also re-checked in the same captures):

| Entry | Section | Exact quote | Words | Use |
|---|---|---|---|---|
| `ready-handoff-admission` | Kubernetes, *What are they?* | “reads bypass the admission control layer” | **6** | the read-side limit: admission judges writes only |
| `self-describing-shape-receipt` | RFC 9111, §4.2 *Freshness* | “A "fresh" response is one whose age has not yet exceeded its freshness lifetime.” | **14** | freshness is a consumer comparison against a declared lifetime |

Capture digests (recomputed this seat, `K81ScribeCorpus-captures/gate-facts.txt`):

| Capture | Bytes | sha256 |
|---|---|---|
| `kubernetes-admission.html` | 574 395 | `1a86e90c458ef57757435ea481d95cf8ccb52c67c2dad9e610eb5b3afc7ffbb3` |
| `rfc9111.html` | 232 630 | `ce91ee9848d2b9ac46386b0f0cbd4bfd9c0cd1948ebc363834cadc7e0997f3d7` |

---

## README coverage-map rows (verbatim, matching `Entry | Covers | Primary sources`)

```markdown
| `knowledge/ready-handoff-admission.md` | The `<wave>.ready` admission gate `kumitate-ready-handoff-v1`: the five-key ready contract, ready↔dispatch agreement checks, wave arithmetic (band 8–16, ≥25 % attack, ≤2 connectors), the 20 policy finding ids, the eight fail-closed tokens, and what admission does not prove | S236; `scripts/ready-handoff.mjs`; `.ufo/waves/round-81/plan.md` § C1 |
| `knowledge/self-describing-shape-receipt.md` | `kumitate-omp-shape-v2`: `captured_at` beside `entries`, `--shape` age disclosure, the opt-in `--max-age` staleness gate, clock/version/invalid refusals, the v1 read split, and why age never enters the score | S237; `scripts/omp-census.mjs`; `.ufo/pins/omp-shape.json` |
```

---

## Evidence run by this seat (captured output under the report directory)

All runs were read-only against the lane; `--work` for the hermetic suites/probes lived under
`/fast/scratch/hyaku/kumitate-r81/K81ScribeCorpus/` and was deleted. Capture directory:
`.ufo/waves/round-81/w1/K81ScribeCorpus-captures/`.

| # | Command | Observed result | Capture |
|---|---|---|---|
| 1 | `node scripts/ready-handoff.mjs --selftest --work <scratch>/rh2` | `READY_HANDOFF_SELFTEST: 34/34 pass` / `VERDICT: PASS`, exit 0 | `rh-selftest.txt` |
| 2 | `node scripts/omp-census.mjs --selftest --work <scratch>/oc2` | `VERDICT: PASS (98 cases)`, exit 0 | `oc-selftest.txt` |
| 3 | `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1 --work <scratch>/c1c` | `C81_C1: HELD held=16/16`, exit 0 | `c1-probe.txt` |
| 4 | `node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2 --work <scratch>/c2b` | `C81_C2: HELD held=15/15`, exit 0 | `c2-probe.txt` |
| 5 | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)`, exit 0 | `shape-live.txt` |
| 6 | `node scripts/ready-handoff.mjs --lane <lane> --round 81 --wave w1` | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=…`, exit 0 | `rh-live.txt` |
| 7 | `sha256sum scripts/ready-handoff.mjs scripts/omp-census.mjs .ufo/pins/omp-shape.json` | `f8fc11f1…` / `ba7cbc8f…` / `8b6aaa79…` | `tool-digests.txt` |
| 8 | quote presence + word counts over both captures (`python3`, tag-strip + whitespace normalize) | S236 21 words present; S236 fragment 6; S237 22 present; S237 fragment 14 | `gate-facts.txt` |
| 9 | pre-existing draft and module-id checks (`python3`) | draft quote 30 words (HEAD); module ids 20 `add`, 8 `Refusal`; header v1 at `:16`; docstring `:215` | `pre-existing-drafts.txt` |
| 10 | symlinked `w1.ready` fixture in scratch, then the live gate | `READY_HANDOFF: FAIL-CLOSED READY_UNSAFE (ready path is not a regular file (symlink): …)` exit 2 | `ready-unsafe.txt` |

No run in the table is a claim about a check I did not execute. Runs 1, 3 and 7 are against
the current working bytes (`f8fc11f1…`); the two frozen counters were re-run after both
mid-seat tool edits (finding 5), and both captures hold the post-edit bytes.

---

## State of the landing target at draft time

- At HEAD `d140f288` the two knowledge files are **tracked**; `ready-handoff-admission.md` is
  modified in the working tree (the closer is iterating on its S236 quote),
  `self-describing-shape-receipt.md` is clean at HEAD, and `corpus/README.md:209-210` carries a
  row for each. This seat did not edit them. The drafts above are self-contained; the L1 should
  land one version, not merge a second S236 quote into an entry already carrying the first.
- `corpus/SOURCES.md:190-191` carries `S236` and `S237` rows at HEAD `d140f288` (and in the
  working tree), with URLs matching the captures. The ids are *expected, not confirmed* by this
  seat: the L1 confirms them when it lands the entry. S236's parenthetical (21 words) matches
  the body quote; S237's (22 words) matches the §4.2.3 quote but its title cell says “Section
  5.1” — see finding 7.
- README map (re-read 07:07): **202 rows for 202** `corpus/{knowledge,lessons}/*.md` files. The
  `lessons/round-81.md` row that was missing when this seat opened landed at ~07:01; both entry
  rows are present (`corpus/README.md:209-210`) and neither was written by this seat.
- `.ufo/pins/readme-map.json` (`version 2`, `covered` **202**, including `lessons/round-81.md`)
  and the proxy stanza's `C2`/`C2_total` (`SCORECARD.md:298-299`, now `202`) agree with the map
  as of 07:07. The tree is being edited by the closer while this seat runs; re-read, do not
  trust this snapshot, at landing.

## Findings (recorded, no product edit made)

1. **The S236 quote was the page-description sentence at HEAD; the working tree repairs it.**
   At `d140f288`, `corpus/knowledge/ready-handoff-admission.md` quoted “An admission controller
   is a piece of code that intercepts requests to the Kubernetes API server prior to
   persistence of the resource, but after the request is authenticated and authorized.” That
   sentence is **30** whitespace words (measured), present in the capture only in the
   `<meta name=description>` / `og:description` block (capture lines 2-10), and not the body
   sentence of *What are they?* (capture line 898). The working tree already replaces it with
   the 21-word body sentence and cites *(S236, What are they?)* (`:52-54`), matching
   `corpus/SOURCES.md:190`; no further repair is needed if that version is what lands.
   Evidence: `pre-existing-drafts.txt`.
2. **`corpus/README.md:209` undercounts the gate's surface.** The row says “the 12 policy
   findings, the six fail-closed refusals”. `scripts/ready-handoff.mjs` declares **20** distinct
   `add('…')` finding ids and **8** distinct `new Refusal('…')` tokens (enumeration in
   `pre-existing-drafts.txt`; `READY_UNSAFE` is the round-81 addition and `L1_ABSENT` is the
   id a `[A-Z_]+` regex misses). The replacement rows above say 20 and eight.
3. **`scripts/omp-census.mjs:16` still documents the `--shape` receipt as
   `kumitate-omp-shape-v1`.** `SHAPE_CONTRACT` at `:166` is `kumitate-omp-shape-v2` and
   `snapshot()` writes v2 at `:227`. Doc-in-tool drift: the tool behaves as v2 (counter arm
   `snapshot-v2` passes), the header block did not move with it. Editing it changes the file
   hash and therefore `pin.omp-census`; route with the re-pin.
4. **`scripts/omp-census.mjs:215` docstring is imprecise about the age unit.** It says “0 for
   the same day”; `:218` is `Math.floor((now − captured) / 86400000)`, i.e. whole 24-hour
   periods. A 23-hour-old receipt reads 0 across a calendar boundary, and a 25-hour-old one
   reads 1. The entries above state the implemented semantics, not the comment.
5. **Both instruments moved under this seat (recorded, not a defect).**
   - `scripts/omp-census.mjs` changed at 06:58:17 local: +14 lines — `mkdirSync(work)` in
     `selftest`, a `cli-max-age` case that calls `main()` with `--max-age`, and a stdout
     `EPIPE` guard. The plan names the pre-edit suite as 97 cases
     (`.ufo/waves/round-81/plan.md:96`); the added case makes the current suite read 98.
     `SCORECARD.md:330` declares `pin.omp-census=ba7cbc8f…`, matching the current sha256
     (`K81ScribeCorpus-captures/tool-digests.txt`).
   - `scripts/ready-handoff.mjs` changed at ~07:07 (HEAD is `d140f288`; the edit is
     uncommitted): +37 lines — a new `READY_UNSAFE` fail-closed arm for a symlink or non-file
     ready path and a realpath escape (`:104-118`), case-insensitive duplicate seat names
     (`:176`), and three suite cases (`duplicate-case-variant`, `ready-symlink-escape`,
     `ready-symlink-inside`). The suite went 31 → **34/34**; the C1 counter still reads
     `C81_C1: HELD held=16/16` because its 16 arms are unchanged — `READY_UNSAFE` is
     suite-covered and has a direct fixture capture (`ready-unsafe.txt`), not a counter arm.
     `SCORECARD.md:352` declares `pin.ready-handoff=f8fc11f1…`, matching the current sha256.
   Consequence: the anchors in Deliverable 1 are against the post-edit bytes
   (`f8fc11f1…`); if either file changes again, re-check the anchors and re-run both counters.
6. **The README-map shortfall seen at open closed during the seat.** At 07:00 the map was 201
   rows for 202 files with `lessons/round-81.md` the only uncovered file; at 07:01 the lesson
   row landed, and the map, the `readme-map` pin (covered 202) and the stanza `C2`/`C2_total`
   (202) now agree. Recorded so the intermediate 201 does not reappear in a later report.
7. **`corpus/SOURCES.md:191` labels S237 “Section 5.1 (Age)” but records the §4.2.3 sentence.**
   The row's 22-word quote is verbatim in §4.2.3 *Calculating Age* (“The Age field value is the
   cache's estimate of the number of seconds since the origin server generated or validated the
   response”), not in §5.1, whose corresponding sentence is 24 words (“The "Age" response header
   field conveys the sender's estimate of the time since the response was generated or
   successfully validated at the origin server”). The row's notes cell says “*Age* and
   *Freshness* sections”, which covers §4.2.3, but the title cell names only 5.1. Either the
   label becomes “§4.2.3 (Age, within §4.2 Freshness)” or the entry quotes the 24-word §5.1
   sentence; the Gate row above takes the first option and keeps the 22-word count. Evidence:
   `gate-facts.txt` (both quotes and counts, both present in the capture).

## Touched surfaces

- `.ufo/waves/round-81/w1/K81ScribeCorpus.md` — this report (new).
- `.ufo/waves/round-81/w1/K81ScribeCorpus-captures/` — `gate-facts.txt`,
  `pre-existing-drafts.txt`, `tool-digests.txt`, `rh-selftest.txt`, `oc-selftest.txt`,
  `c1-probe.txt`, `c2-probe.txt`, `shape-live.txt`, `rh-live.txt`, `ready-unsafe.txt` (new).
- No other path written. Scratch removed.

## Out of scope / not asserted

- No edit to `corpus/knowledge/*`, `corpus/README.md`, `corpus/SOURCES.md`, `SCORECARD.md`,
  `SKILL.md`, the two instruments, the probes, the pins, or any fleet-root file.
- No commit, push, or any mutating git/jj command. No subagent dispatch, no background job.
- No network fetch: the two captures supplied by the L1 were used; their digests were
  recomputed, not re-downloaded.
- Did not run `proxy-check.mjs`, `cite-check.mjs`, `readme-map.mjs`, `sources-check.mjs`, or
  the closers' gates. The `file:line` anchors in both entries were checked by reading the
  cited lines in `scripts/ready-handoff.mjs` and `scripts/omp-census.mjs`; they were not
  machine-verified by `cite-check.mjs` (unrun), which remains the L1's integrated gate.
- Tooling: no install or upgrade was needed; no tool version changed.
