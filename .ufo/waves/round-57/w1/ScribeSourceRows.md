# ScribeSourceRows — mechanical audit of SOURCES.md rows S117–S120 (kumitate round 57)

Seat: ScribeSourceRows (leaf, one-shot, no subagent). Axes: operability + coverage.
Date: 2026-10-24. Verdict: **4/4 rows conform mechanically — 116/116 checks pass, 0 failures.**
The item's claims (13 cells each, legal enums, tier/scope/anchor/teaches populated, rejected
row carries reason+flip, ISO opened dates) are independently corroborated.

## Audited bytes and provenance

- File: `corpus/SOURCES.md`, sha256 `b58498dd1e2983480dc50c48c6226776048f123df00294e56d96f03461b25e79`, 93,491 bytes.
- Revision: HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` ("round-57: idempotence at
  bookkeeping tip c42afe1c — A57 10/10, D57 5/5", 2026-10-24 09:50:23 -0300).
  `git status --porcelain` over `corpus/SOURCES.md`, `.ufo/pins/source-captures.json`,
  `corpus/knowledge/worker-heartbeat-liveness.md` → empty, so working-tree bytes audited ==
  committed bytes at HEAD. HEAD was not moved; no mutating git/jj command was run (jj was not
  invoked at all — jj commands snapshot the working copy, which would mutate lane state).
- Plan-freeze base `7178bfd3643c…` predates this round's rows (rows S117–S120 are opened this
  round), so the meaningful audit target is the round's own committed state, above.
- Row locations: S117 = line 130, S118 = line 131, S119 = line 132, S120 = line 133.
  Registry holds 120 S-rows, no duplicate ids.

## Contract applied (mechanical, not judgment)

Frozen fleet contract SOURCES-CONTRACT-v1 (kaika 2026-10-19, carried verbatim in fleet
`/home/vgpnk/Projects/shokunin/CORPUS.md` § "SOURCES.md — where a shokunin learns"; frozen
file `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`) plus the lane validator rules encoded in
`scripts/sources-check.mjs`. "13 cells" is the lane's own mechanical reading: the table has
11 named columns (`id | source | kind | tier | scope | anchor | teaches | status | opened |
recheck | used-by`) and the validator errors with `ROW_MALFORMED` unless
`line.split('|')` yields exactly 13 fields (`sources-check.mjs:261`); awk precedent
`NF!=13` (round-43 falsify, ReopenS046 #12) is identical. Enums: kind ∈ {spec, docs, paper,
code, tool, dataset, talk, book, community, own-work} (`sources-check.mjs:104-108`), tier ∈
{A,B,C}, status ∈ {queued, mined, rejected}; `community` never tier A; opened must parse as a
real proleptic-Gregorian ISO date on/before today (`isoDay`, `OPENED_INVALID`); recheck ∈ ISO
date | `Nd` | `on-release`; a `rejected` row's `teaches` must contain `REJECTED:` and
`\bflip:` (`REJECTED_NO_REASON` / `REJECTED_NO_FLIP`); a `mined` row's `used-by` must name
existing repo-relative paths; contract bans `|` inside any cell (enforced here by an explicit
12-pipe count alongside the 13-field split).

## Checks run per row (29 each; runner `audit-s117-s120.mjs`)

row-present · cells-13 · pipes-12 · id-form · kind-enum · tier-enum · status-enum ·
community-not-tier-A · populated:{id, source, kind, tier, scope, anchor, teaches, status,
opened, recheck, used-by} · opened-iso-real-and-not-future · recheck-form ·
rejected-reason-REJECTED: / rejected-flip: (S120) · mined-usedby-nonempty +
usedby-path-exists (S117–S119) · capture-pin-present · anchor-sha256-matches-pin ·
anchor-bytes-matches-pin · pin-captured-date · capture-file-exists · capture-file-sha256 ·
capture-file-bytes.

Result: **S117 29/29 · S118 29/29 · S119 29/29 · S120 29/29 — failures=0** (`audit-s117-s120.out.txt`, `audit-s117-s120.json`).

## Per-row findings

| id | line | kind/tier | status | opened | recheck | used-by | result |
|---|---|---|---|---|---|---|---|
| S117 | 130 | docs/A | mined | 2026-10-24 | on-release | corpus/knowledge/worker-heartbeat-liveness.md | 29/29 |
| S118 | 131 | docs/A | mined | 2026-10-24 | on-release | corpus/knowledge/worker-heartbeat-liveness.md | 29/29 |
| S119 | 132 | docs/A | mined | 2026-10-24 | on-release | corpus/knowledge/worker-heartbeat-liveness.md | 29/29 |
| S120 | 133 | docs/B | rejected | 2026-10-24 | 180d | — | 29/29 |

- 13 cells: all four rows split to exactly 13 fields (12 pipes; no `|` inside any cell).
- Enums: `docs` legal kind; tiers A/A/A/B legal; `mined`/`rejected` legal statuses; no
  community row in scope, so TIER_INFLATION vacuously clean.
- Populated: all 11 named cells non-empty on every row (the validator's full ROW_FIELD_EMPTY
  set, superseding the item's four-cell minimum).
- Opened dates: all `2026-10-24` — real ISO, not in the future (today 2026-10-24).
- Rejected row S120 carries both required markers, verbatim:
  `REJECTED: AMQP heartbeats answer "is this TCP peer alive" at connection scope — the
  worker's connection lives or dies as one unit, not its outstanding units of work; the name
  collides with this entry's worker-liveness scope but the mechanism is transport keepalive;
  flip: a lane-owned mapping of connection-level liveness onto the dispatcher's transport
  tier`. This matches the plan's S120 ground (TCP connection keepalive ≠ worker/task
  liveness). `used-by` `—` is legal for a rejected row (MINED_UNUSED applies to mined only).
- Mined rows S117–S119: used-by path exists in the lane; the knowledge entry's first five
  lines cite S117, S118 and S119 and carry the `source:` / `verified-at:` / `recheck:` trio
  (used-by asymmetry corroborated at working tree; D57 E1/E3 class).
- Capture pins (Q46): `.ufo/pins/source-captures.json` version 1, 13 captures, entries for
  S117–S120 present; each row's anchor cell `body sha256` + byte count matches its pin, each
  pinned capture file exists on disk and re-hashes to the pinned digest and size:
  - S117 `.ufo/waves/round-57/build/ScoutTemporalHb/temporal-activity-failures.html`
    `c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50`, 80,679 bytes
  - S118 `.ufo/waves/round-57/build/ScoutKafka/kafka-consumer-configs.html`
    `abf4310fd8bec0df3f1ddcae3a115faa509d98c5d5d8266e721db2965189cb17`, 145,719 bytes
  - S119 `.ufo/waves/round-57/build/ScoutK8s/k8s-liveness-probes.html`
    `2a69b9a5354d355147f562bce0c808c875bb046b7b15b045f012c757c87fad7e`, 554,624 bytes
  - S120 `.ufo/waves/round-57/build/ScoutRabbitmqHb/rabbitmq-heartbeats.html`
    `8370687da1c8b67387951eaeab2c7658e0abc1564e40607cb190bfdca7228779`, 51,578 bytes

## Independent corroboration

`node scripts/sources-check.mjs --json` on the live lane (read-only; the script writes only
under the OS temp dir): exit 0,
`{"verdict":"CLEAN","findings":[],"totals":{"errors":0,"warnings":0},"counts":{"rows":120,...}}`
— no finding of any kind touches S117–S120. Recorded as corroboration of the same class the
D57 E4/E5 checks score; my run is live-lane (E5 class), whereas the counter's own E4 run is
against the extracted revision.

## Gates observed (this seat's own)

G1 row-presence+line · G2 13-cell shape (split + pipe count) · G3 id form/uniqueness ·
G4 enum legality (kind/tier/status, community≠A) · G5 populated cells (11) · G6 opened ISO ·
G7 recheck form · G8 rejected reason+flip · G9 mined used-by existence · G10 anchor↔pin↔disk
byte identity. All green; none flippable without mutating committed bytes.

## Out of scope / known limits

- Mechanical shape only. I did not re-open the four source URLs, judge tier *merit* or
  scope/teaches honesty, or weigh the located quotes — that is the admission reviewers' seats
  (ReviewS117/S118/S119Admission, ReviewS120Rejection). SOURCES.md and knowledge entries were
  not edited (read-only by lane law); no production file changed.
- The ≤25-word Gate quotes in `corpus/lessons/round-57.md` were not re-verified here (lesson
  seats' scope); only the row cells were audited.
- No tool installs or updates were performed (none needed; pacman pause respected).
- Conflicts with other seats' claims: none observed.
- Both frozen counters were read: doctrine57 (D57, E3 binds S117–S119's `mined` status and
  `used-by` cell to the new entry — this seat independently corroborates those cells on the
  working tree that equals HEAD) and attest57 (A57 B1–B10 carries no SOURCES.md row terms —
  this seat is orthogonal to C1's predicate).

## Artifacts

- `.ufo/waves/round-57/build/ScribeSourceRows/audit-s117-s120.mjs` — the mechanical runner
- `.ufo/waves/round-57/build/ScribeSourceRows/audit-s117-s120.out.txt` — full stdout + exit 0
- `.ufo/waves/round-57/build/ScribeSourceRows/audit-s117-s120.json` — per-check machine view
- `.ufo/waves/round-57/build/ScribeSourceRows/commands.txt` — command log with exit codes
