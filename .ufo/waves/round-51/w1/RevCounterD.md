# RevCounterD — adversarial review of `probe/doctrine51-probe.mjs` (rule D51)

Seat: kumitate-r51.TeenageGibbon · Date: 2026-10-23 · Item: RevCounterD (review only; no edits)

Counter under review: `.ufo/waves/round-51/probe/doctrine51-probe.mjs`
Reviewed bytes: working tree == HEAD, sha256 `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` (post-repair, commit `3ed875d`).
Companion counter `attest51-probe.mjs` sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1` (unmodified during this review per `git status`, though it shows ` M` — separate repair in flight by the parent task; out of scope).

**Answers up front.** (1) Hollow clauses: **yes** — D2 passes on 12 identical empty bullets binding one blob (demonstrated); SOURCES rows can be fully hollow (`teaches`, `anchor`, URL never verified). (2) Status check enforceable: only as a string match — `mined` is self-attested; nothing verifies a source was opened; `used-by` is a substring test that a decoy path satisfies (demonstrated through all three real gates). (3) Tier inflation: **invisible** — only `community@A` is machine-checked; a `docs` row self-declares tier A with no gate. (4) Census call: **live-only** — it ignores both `<rev>` and `<lane>` and reads the mutable fleet script plus the live working tree; only the exit code counts.

## Method

Read frozen `plan.md` (§C2, D1–D5), the probe (twice — see F-0), lane `scripts/sources-check.mjs` (`runCheck`, `emitResult`), fleet `scripts/sources-census.sh` (`validate`, `usedby_findings`, `row_pass`). Ran the real counter at frozen base: `node .ufo/waves/round-51/probe/doctrine51-probe.mjs <lane> c90b9de94009b938fa19a089bfaa97df20b54f86` → `DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 ... D1 MISS entry-absent`, exit 1 (control consistent). All bypass demonstrations ran on `mktemp -d` fixtures against the real checkers or faithful copies of the probe's own code paths — no lane bytes touched.

## F-0 (informational) — counter amended mid-review; repair verified correct

The frozen v1 bytes (commit `06ecbf4`, line 97) read `c[9] === 'mined' && c[12].includes(ENTRY)` — an off-by-one: `c[9]` is the `opened` column (must be an ISO date per census E08 / `OPENED_INVALID`) and `c[12]` is the empty post-final-pipe segment. That code was **unsatisfiable by any contract-valid row** and only satisfiable by a malformed row guaranteed to fail D4 and D5 — `DOCTRINE_HELD` was unreachable. Commit `3ed875d` repaired it to `c[8]`/`c[11]`, the contract positions (`sources-check.mjs` `fields[8]`/`fields[11]`; census `cells[8]`/`cells[11]`; split-of-13 layout). Verified: a conforming row now evaluates `okRow → true` under the repaired expression. The defect is closed; this report reviews the repaired bytes. (Note: the fix lands mid-wave, so per `counter-amendment-discipline` the pre-/post-repair identities belong in the close record — recorded here: v1 line 97 `c[9]/c[12]` → repaired `c[8]/c[11]`, no other semantic change.)

## F-1 (medium-high) — D2 admits fully hollow clauses; demonstrated d2=true on vacuous bullets

Probe D2 (`doctrine51-probe.mjs` D2 block): `clauses` = every line starting `- ` (fenced code, blockquote-adjacent, any section); a clause counts as `bound` if it merely *contains* `receipt:<path>@sha256:<64hex>` anywhere in the line; `d2 = clauses.length >= 12 && bound.length >= 12 && d2miss === 0`, where `d2miss` counts only unresolvable/hash-mismatched bindings via `git show <rev>:<path>`.

Demonstrated bypass (against real base `c90b9de9`): an entry body of twelve identical lines `- receipt:corpus/SOURCES.md@sha256:<real blob hash>` — zero words of content — yields `clauses=12 bound=12 miss=0 → d2=true`. Structural holes:

- **Binding target unconstrained**: any committed path qualifies — `corpus/SOURCES.md` itself, `.ufo/**` (tracked: 1995 files), the probe file itself. A receipt "binding" proves only "this blob exists at rev," i.e., non-bit-rot, not that the clause says anything about it.
- **No distinctness**: one blob bound 12× counts 12.
- **No topicality**: clause text may be empty; nothing ties clause content to the bound path, to S100/S101, or to the claim's mandated content (Q39 ceiling sentence, M2 rationale — all optional at gate level).
- **`- ` lines inside fenced code blocks count** as clauses.

Consequence: the "≥12 receipt-bound clause lines" requirement — the counter's only content-depth arm — can be satisfied for ~zero authoring cost. Severity medium-high: it does not break the soundness of *other* arms but guts the claim's "records the design and its grounding" teeth. Minimal fix: require ≥12 *distinct* binding targets restricted to a path allowlist (e.g. `scripts/`, `corpus/`, `.ufo/waves/round-51/`), and/or non-empty clause text before the binding token.

## F-2 (medium) — D3 `used-by` is a substring test; decoy used-by passes D3 + real sources-check + real census

`okRow` does `c[11].includes(ENTRY)` — substring, not per-element equality. Any used-by cell *containing* the entry path qualifies, e.g. `attic/corpus/knowledge/invocation-attestation.md` (a real decoy file), `corpus/knowledge/invocation-attestation.md.bak`, or a comma-list that never names the entry itself.

Demonstrated end-to-end on a scratch fixture (tier-C rows, `used-by=attic/corpus/knowledge/invocation-attestation.md`, decoy file present):
- probe D3 sim: `S100: true S101: true` (would PASS);
- real `scripts/sources-check.mjs --self <fixture>`: only `warn USED_BY_ASYMMETRY` ×2 → **`SOURCES_CHECK: CLEAN`, exit 0** (warnings never move the exit code — `emitResult` computes exit from `error`-severity only);
- real `sources-census.sh validate --file <fixture>`: only `W01` lines + `ok` → **exit 0** (W-codes "never change status").

So the asymmetry tripwire — the one gate that notices the registry row doesn't actually credit the entry — is warn-severity in the lane checker and absent from the census E-codes; D3's substring match papers over it entirely. The S100/S101 rows can "use" a decoy while the real entry exists on the strength of D1's line-0 header alone. Minimal fix: split the cell on `,`, trim, drop `—`, exact-match against `ENTRY` (mirror `splitUsedBy`).

## F-3 (medium) — `mined` status is self-attested; tier inflation/deflation invisible to every arm

D3 checks the literal string `mined`; D4/D5 check enums, field counts, ISO dates, used-by existence — **no gate anywhere binds fetched source bytes, a hash, or a located quote**. Plan §C2 requires rows "opened this round by scout seats (fetch bytes, hash, ≤25-word located quote)" — that contract lives entirely outside the counter. Demonstrated: rows with `teaches=hollow teaches`, any URL, any anchor, `status=mined`, `tier=C` pass both real checkers (exit 0). Specifically:

- **Tier**: only `community@A` is machine-flagged (`TIER_INFLATION`/E10). A `docs`/`spec`/`own-work` row self-declares A — invisible. Deflation is likewise warn-only: `tier C` + `mined` + used-by → W01 → exit 0. So the probe-visible "tier inflation" surface is nil in both directions that matter.
- **Status**: `queued→mined` flips are self-declared; `opened` only needs a past/present ISO date (can be any date); `recheck` any symbolic cadence.
- **Content**: `source` title, `anchor`, `teaches` are free text; the URL is never fetched or matched (E04 only dedups URL+scope).

An entry resting on two rows whose bytes no one opened satisfies D1–D5 as long as file paths exist. The claim's "sourced" property is enforced only by scout-seat process evidence outside the counter — worth a declared-limit line or a `probe/` receipt arm binding the fetched hashes.

## F-4 (high) — D5 is live-only: ignores `<rev>` and `<lane>`, reads the mutable working tree

Probe line: `spawnSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate', '--root', '/home/vgpnk/Projects/shokunin', 'kumitate'])`. The census resolves `kumitate → $ROOT/kumitate-shokunin` via `shokunin.conf` and validates **`corpus/SOURCES.md` on the live filesystem** — including E11 used-by checks against live `test -e`. It never touches the `git archive` extraction and ignores both probe arguments entirely (any `<lane>`/`<rev>` scores the same D5).

Consequences:
- **Non-reproducible per rev**: this review watched the lane tree mutate mid-round (the probe itself was recommitted; `attest51-probe.mjs` is dirty in-tree now). A rerun of the same counter on the same rev reads different live state — the same live-sensitivity class the scorecard records for round 47 (`CAPROUTE` re-runs reading 3/5, 3/5, 4/5 on one commit).
- **False negative**: any dirty committed row anywhere in the live registry — a sibling wave's stray edit, a stale `opened` date — flips D5 regardless of the rev under test. `kumitate`'s live tree is shared state; D5 scores it, not the claim.
- **Exit-code-only**: `d5r.status === 0` — warnings (W01–W04), `unlisted` lanes, even a silent validator all pass. The verdict text is never inspected.
- The header claim "five checks over the committed bytes of `<rev>`" is false for D5 — plan §C2 does call it "the live census", so this is a *declared* live arm, but it converts a per-rev predicate into an environment gate.

Minimal fix if a fix is wanted within the frozen shape: record the live tree's `SOURCES.md` sha and the census script sha in the probe output line so the close evidence can show what was actually validated.

## F-5 (medium) — the census script itself is unauthenticated, mutable, outside the lane repo

D5 executes whatever bytes sit at `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` at run time. Nothing hashes it (contrast A5's `pin.receipt-attest` arm); it isn't inside the lane repo, isn't in the lane's pin universe, and any host-level edit — adversarial or drift — silently redefines the check. A stub that `exit 0`s passes D5 unconditionally. Severity medium: exploiting it requires fleet-root write access, which the wave model already grants seats in other lanes' items — the trust boundary is the finding.

## F-6 (medium-low) — D4 trusts the rev's own checker

`spawnSync('node', [join(T, 'scripts/sources-check.mjs')])` runs the checker **from the extracted rev**. D51 never verifies that script's hash; `pin.sources-check` is enforced only by `proxy-check --strict`, which lives in A5 — a different predicate's arm. Scored alone, a rev carrying a weakened `sources-check.mjs` passes D4 on its own say-so. Mitigated in practice because A51 and D51 score the same close rev and H3 reruns `proxy-check --strict` — but DOCTRINE_HELD as a standalone reading does not contain that mitigation; disclose it.

## F-7 (low-medium) — D1 vacuity and decorative citation

- `/verified-at\s*:/i` and `/recheck\s*:/i` test key presence only — `verified-at:` (empty) passes D1; `sources-check` requires a token (`^verified-at:\s*\S`), so `verified-at: x` / `recheck: x` pass both. No date shape, no recency.
- `/S100/` is substring: `S1000`, `XS100` satisfy it. And a line-0 `source:` citing some *other registered* id while `S100`/`S101` and the two man7 URLs appear on lines 1–4 still satisfies D1 — the checker's `ENTRY_SOURCE_UNKNOWN` only binds **line 0** ids, so the decorative-citation shape survives D4 too (demonstrated fixture: `source: S001 …` line 0 with S100/S101 on the same line is required to avoid that; a two-line split with `source: S001` alone + `S100`/`S101` text below passes both gates while the entry formally cites S001).
- URL↔id association is unordered; either URL may pair either id.
- Drift note: plan §C2 says the trio sits "in its first three lines"; the probe enforces the first **five** — the plan overstates; counter wins but the plan text should be reconciled at close.

## F-8 (low) — hardening nits

- `git archive` runs through `bash -lc` with `JSON.stringify`'d `<rev>` — inside double quotes `$(…)`/backticks still expand, so `rev='$(id)'` injects. Operator-supplied argument, but `spawnSync` with an argv array removes the whole class.
- `c[11].includes(ENTRY)`: a short malformed `| S100 |` line (< 12 cells) anywhere in the file (even stray prose inside Registry that isn't a full row — wait: any `|`-starting line in Registry is parsed as a row by both checkers, but the *probe* `rows` filter matches `^\|\s*S10[01]\s*\|` on any line, in or out of Registry, fenced or not) → `c[11]` is `undefined` → `TypeError` → catch → `FAIL-CLOSED` exit 2 instead of a clean `D3 MISS`. Fail-closed direction, but a stray `| S100 |` table-snippet turns a scoring run into a crash. Guard with `(c[11] ?? '')`.
- Row filter `^\|` misses rows indented 1–3 spaces, which both real checkers (0–3-space tolerant) accept — indented-only S100/S101 rows silently read `D3 MISS` (false negative; low).

## What's solid

- Extraction over `git archive <rev>` (never the working tree) for D1–D4; correct fail-closed on archive failure (exit 2).
- D3 post-repair column indexes are exactly the contract positions; id equality is exact (`c[1] === id`); base control reads `DOCTRINE_UNMET held=0/5`.
- `d2miss` covers both nonexistent path and hash mismatch; verdict line prints per-check detail; exit map 0/1/2/64 disciplined.
- D4's `SOURCES_CHECK: CLEAN` is checked on the *last* output line and with exit 0, so trailing-chatter forgeries can't fake it cheaply.

## Residual risk / verification gaps

- The dominant residual is **depth-vs-shape**: every C2 arm checks shape (trio keys, bullet count, cell strings, exit codes); nothing checks that a byte was ever fetched or that a clause says something true. A maximally cheap entry — vacuous trio values, 12 identical one-token bullets, self-declared `mined`/`docs|A` rows — reads `DOCTRINE_HELD held=5/5` provided D1–D5's surface forms are met and the live tree is clean at scoring time.
- D5's live-tree dependency makes held=5/5 a property of `<rev>` + scoring-time environment; a second scorer at a different moment can read 4/5 on the same commit.
- Not verified here (out of scope): wave seats' actual entry/rows (build hasn't landed); whether `proxy-check --strict`'s GATE_PINS cover `sources-census.sh` (it does not — it's fleet-side); attest51-probe's in-flight working-tree edit.
