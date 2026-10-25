# ConnectorSiblings — round 61, wave w1 (connector, leaf)

Milestone: sibling overlap scan. Judged on: adjacency. Role: report-only — nothing judged,
admitted, edited, integrated or shipped; no sibling runtime invoked; no subagent dispatched;
no tool installed or upgraded; no background job. Every read was read-only, including the two
census invocations (stdout only, no `--out`).

## Files written

- `.ufo/waves/round-61/build/ConnectorSiblings/scan.md` — the cross-axis overlap scan
  (surfaces, contested scope with sibling pointers, coordination notes, negatives).
- this report. No other lane file touched (no `git` command run: the index and jj state are
  out of scope for this seat).

## Verdict: adjacent, with one hard contradiction in the round's own C2 id

**Axes affected: coverage (C2's id ground) and operability (the record's reconciliation with
its own campaign merge). No score integer moves; this is a capability/record finding.**

### The contradiction (stated, not smoothed)

`plan.md:66` (E3) freezes that the Temporal Worker Versioning entry's `source:` cites **S195**,
that S195 is `mined`, `opened 2026-10-25`, and `used-by` names exactly that entry. The
out-of-lane campaign package has already assigned that id to a **different source**:

- `/home/vgpnk/Projects/shokuknow/merge/kumitate/MERGE-REPORT.md:9` —
  "lane registry currently holds **133** rows; **first staged id is S195**";
- `SOURCES.append.md:7` — **S195 = MCP Architecture overview** (`modelcontextprotocol.io/docs/2026-07-28/learn/architecture`);
- `SOURCES.append.md:29` — the **Temporal — Worker Versioning** row for
  `https://docs.temporal.io/worker-versioning.md` is staged as **S217**, `mined` 2026-10-23,
  `used-by` `corpus/knowledge/temporal-worker-versioning-pinning.md`;
- the staged entry's own header reads `source: S217`
  (`merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md:2`).

The lane registry holds 133 rows and none of `S195`/`S196`/`S217` (re-derived:
`grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md` → 133; `^\| S19[0-9] ` → S190, S194 only).
So E3 is satisfiable today only by taking an id the package has reserved for another source.

Two second-order effects, both mechanical:

1. **`E03 duplicate id`** (`scripts/sources-census.sh:25`) if the staged block is appended
   verbatim after this round takes S195 — its own S195 (MCP) collides. E5 then fails in every
   *later* round, not this one.
2. **`E04` vs `W04`** (`scripts/sources-census.sh:645-649`): same URL **and** scope is fatal;
   same URL with a differing scope is a warning. The two rows' scopes are honestly different
   (2026-10-25 re-grounded read vs the package's 2026-10-23 read), so a verbatim append is a
   warning — but only while the scope cells stay different.

Also: the package stages the *same knowledge file* as `new-file` (its "Knowledge files to add"
table), and the two "target already exists — append, do not replace" exemptions are other
files. An applier following that table has no instruction not to overwrite this round's
re-grounding — i.e. E2's `verified-at: 2026-10-25` and E4's sha256 pin. And the staged S217 row
carries **no body sha256** (only a `recheck:` curl/grep), so E4 cannot be met from staged bytes
either way: this round must write a fresh row.

## 4. Proposed move (one, bounded, report-only)

**Record the reservation where the census and the merge applier will read it, and change
nothing the predicate counts.**

- In the S195 row, keep every cell the predicate reads byte-exact (`status` `mined`, `opened`
  `2026-10-25`, `used-by` exactly `corpus/knowledge/temporal-worker-versioning-pinning.md`,
  the sha256 pin) and append to the **`scope`** cell one sentence:
  *"campaign package `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` reserves
  S217 for this URL; this row claims S195 in-round, so the staged block must be renumbered at
  merge."*
- In the entry, add one line **after** the header trio:
  `campaign-row: S217 — staged package /home/vgpnk/Projects/shokuknow/merge/kumitate (renumber at merge)`.

Why this is the non-obvious move: no seat in this wave is instructed to read the campaign
package, so the collision is invisible from inside the round; and it is the only change that
costs one cell and one line while making the future merge a *recorded* reconciliation instead
of a silent `E03`.

Why it is safe against the gates that do read the files:
- `scripts/sources-check.mjs:369` scans only `lines.slice(0, 5)` for the trio, so a line after
  the trio is ignored; `ENTRY_SOURCE_UNKNOWN` (`:373`) resolves the `source:` id, which stays
  `S195`.
- E3 does not read `scope`; E5 reads it only for duplicate detection, where a genuinely
  different scope is the honest `W04` class rather than the fatal `E04`.

Affected axes: **operability** (the record reconciles with its own future merge; a later
verifier can tell a reserved id from a mislabelled one) and **coverage** (C2's id ground stays
as frozen). No harm to either: no cell the predicate reads changes value, and the entry's
header trio is untouched.

Risks, stated:
- **R1** — it is a record, not a control. If the merge applier appends verbatim, `E03` fires
  regardless; the note only makes the cause legible. The fix is the applier's, and the campaign
  tree is read-only for every seat here.
- **R2** — a reviewer may read a new `scope` sentence as scope creep into a frozen claim. It
  touches no frozen read; if the round's L1 prefers zero textual change, the fallback is to put
  the same sentence only in `close/` and the seat report, accepting R1's invisibility.
- **R3** — the package may be renumbered before it lands, making the note stale. It names the
  package path and the *staged* id, not a predicted final id, so it stays true as a record.

Verification (the closure can re-run each):
- `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=134 …)`, `--selftest` unchanged.
- `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0 (at worst a `W04` for this URL).
- `node .ufo/waves/round-61/probe/doctrine61-probe.mjs <lane> <rev>` → E1–E6 met.
- Later, after any campaign merge: no `E03` naming S195 — that is the proof the applier
  renumbered, and the only observable that closes R1.

## Other findings, ranked (details and pointers in `scan.md`)

1. **README-map row grammar is lane-specific** — this lane's gate requires a first cell that is
   a clean backticked `knowledge/…`/`lessons/…` path (`scripts/readme-map.mjs` "Row rule"),
   while mori r44's M6 fix made its row name `corpus/knowledge/…` verbatim
   (`mori-shokunin/corpus/lessons/round-44.md` M6; `mori-shokunin/corpus/README.md:639`).
   A copied sibling shape reads `uncovered` here. E6's row must also be **appended** to
   `.ufo/pins/readme-map.json` `covered` — currently 146 members, files 56+90=146, no temporal
   member — and `ExecReadmeMapFix` already made one append this wave. Two appends, no rewrite.
2. **Census mechanics: this round already uses the form that fixes mori's M3** — mori stages
   `$TMPDIR/c3-*/SOURCES.md` and calls the census `--file`, so `dirname(file)/..` yields E11 on
   every `used-by` and exit 1 (`mori-shokunin/corpus/lessons/round-44.md` M3; `count-c3.py:132-145`).
   E5's `--root … kumitate` is correct; no seat may regress to `--file` or stage a registry copy.
   Re-derived now: `kumitate ok …/corpus/SOURCES.md`, **exit=0**, six pre-existing `W04` lines
   (S034, S068, S084, S095, S123, S126); `shared` mode reports no `docs.temporal.io` URL in any
   lane.
3. **Dispatch evidence: no sibling holds this format** — fleet-wide, `launcher-progress.tsv` and
   `dispatch-actual.json` exist only in this lane (r58/r59/r60). The closest prior art is
   kaidoku's `ufo-wave-outcomes-v1`
   (`kaidoku-shokunin/.ufo/waves/round-19/evidence/wave-outcomes/r18-w2-outcomes.json`) and its
   r18 G1/G2/G3 (`kaidoku-shokunin/.ufo/waves/round-18/w2/WaveEvidenceComplete.md`): G1 — the
   declared registry left `0/89` null while a side file held the ids — is **absent here**
   (`w1/swarm-registry.json` 32/32 filled, `updatedAt 09:41:05Z`). kaidoku r16's rule, "dead-seat
   counts are observed session outcomes, not a lane-script inference from missing reports"
   (`corpus/lessons/round-16.md:160,174`), is **already met**: `dead = exit !== 0 || !session`
   (`scripts/dispatch-evidence.mjs:114`), report presence is a separate term. This is the place
   a kaidoku-trained reviewer would look for a defect and find none — worth one sentence in the
   C1 receipt.
4. **Capability-row practice** — uniform 4-column header fleet-wide; the practice question is the
   pointer. kotodama r69 discloses a stamped revision/tree, the counting command, an explicit
   ceiling and an evidence class (`corpus/lessons/round-69-verifier-spotcheck.md:70-90`); chousa
   r25 reconciles row-less "Capabilities +1" claims (`SCORECARD.md:1305`). This lane's own
   `sources-registry` row already drifted (`rows=20` in the row vs `rows=38`/`rows=45` in the
   errata, `SCORECARD.md:2090,2127`). P3's new row should quote the counter line **with its
   `src-rev`**, or it inherits that class.
5. **Gate-registry standard left unmet by silence** — kotodama r69 D7 and mori r44's
   `ExecGateInventory` (33 tools, `REGISTRY=unmet`) both record that a gate without a `SKILL.md`
   registry row leaves PROTOCOL §Gate standard *Registry* unmet. C1's P1–P4 has no registry arm.
   Not a contradiction with frozen bytes; named so the closure can decide.
6. **Name collision only** — game-dev-3d r105's "README mapping"
   (`reports/round-105/pc/ruling-draft.md:10`) is the card/label mapping, not
   `corpus/README.md` coverage rows. Not prior art for E6.

## Adversarial limits of this scan

- I did not read the campaign *applier*; whether it renumbers or appends verbatim is unknown
  from the package (R1 stands on that gap).
- Sibling rounds are at different counters (kotodama 69, game-dev-3d 108); "most recent" was
  taken by mtime of `corpus/lessons/` and of `.ufo/reports/`, so a lane whose newest round has
  no lesson yet (souji r24, in flight; no `launcher-progress.tsv`/`dispatch-actual.json` in its
  wave dir) is represented only by its prior lesson.
- Fleet report-side evidence is present but thin for this round's surfaces: the newest
  fleet-side kumitate report is `.ufo/reports/round-60/kumitate.md` (it declares the same
  `dispatch-evidence` capability this round completes, and `.ufo/reports/round-61/` has no
  `kumitate.md` yet), so the sibling scan rests on lessons and on the sibling lanes' own
  `.ufo/waves/` records rather than on fleet reports.

## Installs / updates

None. No package manager transaction was run (`pacman` is paused host-wide in any case).
