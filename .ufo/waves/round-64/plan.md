# Round 64 — plan (frozen before any wave seat was dispatched or scored)

Round: kumitate 64, attempt 1, L1 `KumitateR64`. Base revision `6825a51425e91908f019ed65aa2f4209acbd7087`
(branch `master`, ahead=0). Frozen 2026-10-25. These sentences are the claims; the same words appear in the
counters' code and in the receipts' labels. Committed before the first `.ready` marker (QUALITY Q58).

## Axis state and nudge

Owned axes (SCORECARD `## Axes`): operability 9 (terminal integer of the frozen `f_O` proxy), coverage retired at
10, coverage:script-layer / runtime-layer / kimi-layer 10. The last verified capability row is round 63
(`inline-dispatch-evidence`); the stagnation window is N = 3, so the nudge is **not** active and the lowest-axis
obligation stands: **C1 works operability**, the lowest non-retired axis. C2 works the frontier (coverage family).
No score integer can move; the verdict is the counter. No axis may be harmed. Base state's live defects are repaired
as maintenance, not claimed: `readme-map` DRIFT (round-63 spot-check file unmapped, `base/readme-map-before.txt`) and
`proxy-check` DRIFT (`C2_TOTAL_DRIFT`, `AXES_DRIFT`, `base/proxy-before.txt`).

## C1 — operability, capability acquisition `report-receipt-diff`

**Surface it moves:** a new tool, `scripts/report-receipt-diff.mjs` (contract `kumitate-report-receipt-diff-v1`).
Rounds 60–63 filed reports whose claims the lane's own receipts contradicted or left as template tokens
(round-60 report as filed: six `__TIP__`/`__MEASURED__`/`__COMMITS__` tokens and `DISPATCH60_HELD held=10/10` where
`close/dispatch60-tip.txt` reads `DISPATCH60_UNMET held=8/10`), and nothing in the lane compares a report with the
committed receipts it cites. The tool diffs a report against `.ufo/waves/round-N/{base,close}/*` read at a revision.
Mined from `considerthese/2026-10-25.md` idea 2. Command that shows it unmoved: `test -e scripts/report-receipt-diff.mjs`
at the base revision (absent).

**Frozen predicate `RECEIPT64_HELD`** (rule R64 v1, checks P1..P5), measured at revision M over `git archive M`:

- P1 — the archive runs `node scripts/report-receipt-diff.mjs --selftest` and prints
  `REPORT_RECEIPT_SELFTEST: PASS (N/N)` with N >= 20, exit 0.
- P2 — `.ufo/waves/round-64/controls/receipt/` holds >= 14 committed cases (16 at freeze: one honest, the rest each
  altering one thing); every case exits as its `expect` file names (exit code, then the sorted finding ids or `CLEAN`);
  >= 8 distinct finding ids are exercised and at least two cases read CLEAN.
- P3 — real data: the round-60 report as filed (fleet commit `7b0581ed`) reads DRIFT with exactly as many `PLACEHOLDER`
  lines as an independent `grep -o '__[A-Z][A-Z0-9_]*__'` count of the same bytes (6) and a
  `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10` line; the round-63 report as filed (fleet commit `8fd46e61`) reads CLEAN.
- P4 — the counter can fail: a stub tool that always prints CLEAN, and one that always prints DRIFT, each run through the
  same P2+P3 harness, score a MISS.
- P5 — with `--report <file>` the tool run with `--round 64 --rev M` over that file (the round-64 report) reads CLEAN.

**Counting command:** `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report <round-64 report>`
→ `RECEIPT64_HELD held=5/5 checks=5 rev=<M> rule=R64` exit 0.
**Kill rule:** any check MISS → the claim fails as declared. A rule changed after any seat scored is not this claim's
rule. **Ratchet (declared now, monotone):** any report-lie a wave seat finds that the tool accepts is added to
`controls/receipt/` with its `expect` and the tool is fixed — a strengthening, never a relaxation; P2's floor stays 14.
The probe, control generator and do-nothing script are pinned in `.ufo/pins/counter-pins.json` at this freeze.

**Before (base `6825a514`):** `RECEIPT64_UNMET held=0/5` exit 1 (`base/receipt64-base.txt`).
**Do-nothing controls:** P4 is the in-counter control (a stub that always says CLEAN and one that always says DRIFT
both fail); the base commit reads 0/5.
**Stated limit:** only labelled `<LABEL>_HELD|UNMET held=x/y` tallies are compared (a bare `held=9/10` cannot be told
from a plan's target); a receipt the lane itself wrote is trusted as written; HASH_DEAD cannot resolve a hash of an
external repository. Wave seats are asked to find cheaper lies (ratchet).

## C2 — coverage, frontier ground: jj workspaces as seat containment, demonstrated (sourced claim)

**Surface it moves:** `PROVINCE.md` frontier line "Isolation substrates" gains the first *demonstrated* jj-workspace
ground. The lane's `corpus/knowledge/agent-isolation-substrates.md` states for mechanism M7 (jj workspaces share one
repository): "Not demonstrated this round; no table row relies on it." The round lands a new entry,
`corpus/knowledge/jj-workspace-seat-containment.md`, grounded on rows opened this round and a re-runnable,
hermetic demo, `scripts/jj-seat-demo.sh` (15 outcome keys at freeze: workspace list, seat file visibility, seat git dir,
shared operation log, `--ignore-working-copy`, rewrite vs abandon of the seat's checked-out commit, stale recovery,
absolute-path write, forget). It enters via the assimilation theme "jj seat containment" of `merge/kumitate/`
(staged jj entries); the staged text is re-grounded, not copied. Command that shows it unmoved:
`test -e corpus/knowledge/jj-workspace-seat-containment.md` and `grep -c 'jj-workspace-seat-containment' PROVINCE.md`
at the base revision (absent; 0).

**Frozen predicate `JJ64_HELD`** (rule J64 v1, checks J1..J8), measured at revision M over `git archive M`:

- J1 — the entry exists and opens with `source:`, `verified-at: 2026-10-25` and `recheck:`.
- J2 — every S-id on its `source:` lines (>= 2) is a row inside `## Registry` with exactly 11 cells, status `mined`,
  opened 2026-10-25, a URL, and a `used-by` cell naming the entry.
- J3 — each cited row is bound in `.ufo/pins/source-captures.json` to a committed capture whose sha256 and size equal the pin.
- J4 — the entry's `## Located quotes` section holds >= 4 bullets `- S### — "<quote>"`, each <= 25 words, each found
  (markup/whitespace-normalised) in that row's capture, every cited row carrying at least one.
- J5 — each bullet's quote is also found in a fresh live fetch of the row's URL (unreachable = MISS).
- J6 — the entry's `## Demo outcomes` section lists `- <key>=<value>` bullets (>= 12) and `bash scripts/jj-seat-demo.sh`
  in the archive, run now on this host, exits 0 and prints the same keys with the same values (set equal).
- J7 — `sources-census.sh validate --file <archive>/corpus/SOURCES.md` exits 0, `PROVINCE.md` names the entry path on a
  frontier line, and `node scripts/readme-map.mjs` in the archive prints `README_MAP: CLEAN`.
- J8 — `corpus/knowledge/agent-isolation-substrates.md` at M begins with exactly the bytes it had at the base revision
  (append-only) and carries an appended `Amendment 2026-10-25` section naming the entry path and `M7`.

**Counting command:** `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `JJ64_HELD held=8/8 checks=8 rev=<M> rule=J64` exit 0.
**Kill rule:** any check MISS → the claim fails as declared; the same no-retroactive-change rule and the same monotone ratchet
(a forgery found by a seat becomes a control and a fix, never a relaxation) apply.

**Before (base):** `JJ64_UNMET held=0/8` exit 1 (`base/jj64-base.txt`).
**Do-nothing control (committed before data):** `probe/jj-donothing-control.sh` — on a sandbox clone at the base, copy the
staged entry byte-for-byte to the new path, add a PROVINCE frontier line and an amendment naming it, change nothing else:
`JJ64_UNMET held=1/8` exit 1 (`base/jj64-donothing.txt`; only J8 passes). A control that meets 8/8 would mean the counter is wrong.
**Stated limit (declared now):** the counter measures an evidence chain plus a live demo re-run; it cannot tell a sound entry
from a well-grounded wrong one, and an attacker-hosted row URL would pass J5 (carried hole from T63). It scores the surface
it names, so on a retired axis it carries no integer; the verdict is the counter.
**Sourced claim (§2b.4):** C2's rows are opened this round; the entry and rows cite their S-ids.

## Frontier step and assimilation (inside the claim cap; not claims)

- **Census** before (`base/census-before.txt`, exit 0, 136 rows, six W04 warnings) and after, pasted in the report.
- **Assimilation:** ONE theme from `merge/kumitate/` — jj seat containment (staged
  `jj-workspace-as-isolation-substrate`, `jj-seat-workspace-containment`, `jj-shared-repository-seat-visibility`,
  `jj-operation-log-and-seat-staleness`, `jj-seat-staleness-outcome`, and the three `agent-isolation-substrates-amendment-*`)
  — adopting ONE merged entry (staged `jj-operation-log-and-seat-staleness` + `jj-seat-staleness-outcome`, re-grounded; the
  staged claim "the seat does not go stale" holds only for rewriting the seat's commit and is contradicted by abandoning it —
  measured on this host before freeze, `scripts/jj-seat-demo.sh`). Collision guard run in scratch (`assimilation/`): registry
  136 ids, staged 155 ids, collisions S195/S196/S197 (lane ids equal staged ids; the staged rows for those ids point at documents the lane
  already holds as S125, S117/S126 and S127 — none appended) — none of the jj rows (staged S259/S270/S290/S291/S295/S309) collides; adopted
  ids continue the lane registry (next S198), re-pointed by document. The guard is proven able to fail on an indented
  `  | S002 |` fixture by a seat. The lesson's `## Gate` records >= 1 admit and >= 1 reject from the assimilation set.
  Quarantine slice re-derived (`assimilation/quarantine-slice`, 9 ids; round 63 hand-checked all 9 PRESENT, none appended).
- **considerthese (one proposal):** `considerthese/2026-10-25.md` idea 2 "diff reports against receipts" = C1; idea 1 "try to
  forge each new gate" is applied to the new tool and both counters by wave-2 forge seats.
- **Mistake mined (§2b.3):** the R56-V3 map drift recurred a tenth time (round-63 spot-check file landed without its
  `corpus/README.md` row; base `readme-map` DRIFT) — class `reference-drift`, captured-by `readme-map` (detects after the fact,
  never at round start). Fix: the round-start gate runs `readme-map` before the plan freeze (QUALITY Q60, with a red-before
  receipt: base reads exit 1 for the named reason, the repaired tree exit 0).
- **Routed R63 defects answered:** D1 (map row + structural fix above), D2 (selftest transcripts committed), D3 (appended
  correction of the w2 `-2` stem count: three, not one), D4 (kimi layer recorded degraded, K=49 not cited as clean), D5 (the
  two counters' declared holes stay named; C1 and C2 each aim at a declared limit), D6 (role mix planned before dispatch).
- **Maintenance repairs (not claims):** `readme-map` DRIFT and `proxy-check` DRIFT at base must read clean at the tip.

## Round shape

Two v1 waves (policy `ufo-wave-policy.json`, band 32–64), seats prefixed `K64` (seat names are global in the dispatcher).
Wave 1 (36–40 seats): build + first falsifiers. Wave 2 (>= 32 seats, only if wave 1 yields >= 32 distinct attack items): fresh
reviewers / critics / mutation-testers re-run each counting command, re-open every new source row, attack each claim, entry,
tool and demo. Planner seat: the L1 (the validator rejects `planner`). Round total 64–100; strict m_flash share
(executor/scribe/simplifier) >= 50% planned per wave; attack roles >= 25%.

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Seats write only their own report
(`.ufo/waves/round-64/<wave>/<Seat>.md`), build artifacts under `.ufo/waves/round-64/build/<Seat>/` and scratch under
`/tmp/kumitate-r64/<Seat>/`; the L1 is the sole integration owner of `scripts/`, `SCORECARD.md`, `corpus/`, `PROVINCE.md`,
`LOG.md`, `SKILL.md`, `.ufo/pins/`. No seat touches the fleet repo, sibling lanes, jj state, `.ufo/state/`, `.scratch/`.
