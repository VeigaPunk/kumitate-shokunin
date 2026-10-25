# CriticC2 — attack on the frozen round-62 C2 claim (findings only)

Critic: `L1Kumitate62.CriticC2` (round-62 w2, read-only falsification).
Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Lane HEAD at inspection: `0cbe0d75e5a08718e2256408329692908c837766`.
No files modified except this report. No tool installs. No git writes.

## 0. Frozen-claim availability note

At inspection, `.ufo/waves/round-62/plan.md` does **not** exist locally: the
round-62 working tree is entirely untracked and `round-62/plan/` is empty
(mirroring the w1 `ReviewClaims` record: “claims are frozen only in the parent
plan (fleet)”). The frozen C2 surface attacked here is therefore the one this
assignment names — *the counter must accept the honest captured row and reject
the forged phantom-row/capture fixture* — plus the R61-V2 repair requirements
(`corpus/lessons/round-61-verifier-spotcheck.md` §6) that define the revised
predicate: revision-bytes-only reads, `\s` row regex with 11-cell contract
indices 8/9/11 scoped to `## Registry`, full-sha256 capture pin, external
census at the fleet root, and causally tied README/covered/proxy updates.

## 1. Row parser (E3) — honest accepted, bundled phantom rejected, with a residual hole

Empirical test (node, exact regexes, committed bytes):

- Honest row `git show 0cbe0d7:corpus/SOURCES.md` line 147, inside `## Registry`
  (Registry opens line 10, Leads line 224), 13 split cells (11 contract cells):
  - v1 regex `/^\|[[:space:]]*S195[[:space:]]*\|/` → **false** (JS has no POSIX
    class; `[[:space:]]` is the literal set `{[,:,s,p,a,c,e]}`).
  - fixed regex `/^\|\s*S195\s*\|/` → **true**.
  - contract indices 8/9/11 = `mined` / `2026-10-25` / entry path → **true**;
    v1 probe indices 9/10/12 = `2026-10-25` / `90d` / `""` → **false**.
- Forged phantom row `git -C /tmp/kumitate-r61-a2/fleet/kumitate-shokunin show
  4247d2d:corpus/SOURCES.md` line 273, **outside** `## Registry` (under
  `## Leads (unopened)`), 14 split cells:
  - v1 regex → **true** (matches via the `:` after the pipe);
  - fixed regex → **false** (next char after `|` is `:`, not `\s`);
  - contract indices 8/9/11 = `shim`/`mined`/`90d` → **false**;
  - v1 indices 9/10/12 = `mined`/`2026-10-25`/entry → **true**.

So each of the three fixes (regex `\s`, indices 8/9/11, `## Registry` scoping)
individually rejects the bundled phantom, and the honest row passes a fixed E3.
Minimal fix = regex + indices; section scoping additionally hardens against an
in-Registry lookalike.

**Residual hole:** a *well-formed* in-Registry fake — 11 cells shaped exactly
like the honest row, self-pinned capture, correct header trio — passes the fixed
E3/E4/E5/E6 without any external anchor (see §2/§4). The counter proves internal
consistency, not provenance.

## 2. Data source / capture pin (E4) — revision-only reads and full hash

- v1 E4 reads the capture from the **worktree** (`readFileSync(join(lane,…))`)
  and compares only the first 16 hex chars (`pin.includes(sha.slice(0,16))`).
  Controls already prove both flips: `ctl-c2-critic-a1b-fabricated-capture.txt`
  (invented bytes, self-pinned → HELD 6/6) and `a2-repro-c2-forgery-dirty-worktree.txt`
  (missing worktree body.md → E4 MISS on a clean rev).
- Committed bytes at honest rev: body.md = 9645 bytes, sha256
  `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`; the S195
  row cell 6 carries exactly that full 64-hex pin. Full-hash rev-only comparison
  passes on honest.
- Forged fixture: body.md = `fabricated capture: no source was opened\n` (41 B),
  sha256 `15841c50…`, and the phantom row self-pins exactly that hash → full-hash
  equality passes there too **if E3 had admitted the row**. E4 alone can never
  reject a fabricated capture; rejection rests entirely on E3's row finder.
- Therefore the “reject forged capture fixture” half is satisfied only for the
  bundled fixture shape, not for a self-consistent in-Registry forgery.

## 3. External census / root identity (E5)

- Default root is the **lane**, not the fleet: `sources-census.sh validate --root
  <lane> kumitate` exits 2 (`ERROR: config not found: …/shokunin.conf`;
  `unknown lane`). Control `ctl-c2-critic-a6-default-census-root.txt` shows E5
  MISS (exit 2) under the documented counting command without `--census-root`.
  The plan-counting command must pass `--census-root $FLEET`
  (`/home/vgpnk/Projects/shokunin`).
- E5 validates the **worktree**, not the rev tree: control
  `ctl-c2-critic-a4-e5-worktree-not-rev.txt` commits a malformed (escaped-pipe)
  row at `ad78e87` and restores the worktree — census of the committed tree fails
  (`E01 S195 fields=12`, exit 1) while the probe's E5 reads the clean worktree
  and PASSes. A rev-measured E5 must run over an export of the measured rev
  (`git archive <rev>`), or fail closed on worktree/rev divergence.
- Census discards rows outside `## Registry` (control
  `ctl-c2-critic-a3-malformed-row-census.txt` variant 5: phantom row after
  `## Leads` → census `ok` exit 0). So the census alone cannot catch the bundled
  phantom; only the probe's E3 scoping does.

## 4. README source pointer / causal tie (E6)

- `mapped` half reads `git show <rev>:corpus/README.md` (rev-pinned, correct);
  the honest rev contains the `temporal-worker-versioning-pinning.md` row.
- The `readme-map` leg runs in the **worktree** (`cwd: lane`). Current live state
  at 0cbe0d7: `README_MAP: DRIFT files=149 rows=148 covered=148 bad=2` (exit 1),
  first bad = `uncovered:lessons/round-61-verifier-spotcheck.md` (also
  `unpinned`). So **E6's CLEAN half is false-red even on the honest rev** until
  the R61-V5 carry is repaired: the round-61 spot-check file needs its README row
  and `covered` pin. The claim cannot pass on any honest rev unless that repair
  lands in the same change as the entry/lesson row+pin (R56-V3 class; R61-V5
  says "or `readme-map` opens in DRIFT again (seventh recurrence)").
- The `readme-map` leg must also run inside the exported rev tree, not the
  worktree, or a dirty `.ufo/pins/readme-map.json`/README flips it
  (`a2-repro-c2-forgery-dirty-worktree.txt` shows this flip).

## 5. Proxy / single-stanza grammar and the `make-dispatch-actual` pin

- Current SCORECARD `kumitate-proxy-v1` stanza (lines 287–311) is stale:
  `A=105 C2=145 C2_total=145`; live `node scripts/proxy-check.mjs` →
  `A_DRIFT declared=105 computed=117`, `C2_DRIFT declared=145 computed=148`,
  `C2_TOTAL_DRIFT declared=145 computed=149`, `AXES_DRIFT coverage declared=10
  derived=9`, `PIN_UNPINNED scripts/make-dispatch-actual.mjs`; exit 1.
- The computed values are **worktree-sensitive**: `computed A` is 117 only
  because the two untracked round-62 probe files
  (`.ufo/waves/round-62/probe/*.mjs`) are counted from the worktree; the
  committed tree has 115 (`git ls-tree` count). Any later-added script changes A,
  so the stanza must be refreshed at the final measured rev or it drifts again.
- Refreshing the stanza in place to the true current numbers would make the
  derived `coverage = 9` (C2/C2_total = 148/149) contradict SCORECARD `## Axes`
  `coverage 10` — the same change must therefore also reconcile the axes row or
  the retirement note, or the proxy stays in AXES_DRIFT.
- `scripts/make-dispatch-actual.mjs` sha256 = `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9`
  (verified live and stable). The `pin.make-dispatch-actual=<that hash>` key
  belongs in the `kumitate-gate-pins-v1` stanza (currently absent → `PIN_UNPINNED`).
  The reader (`proxy-check.mjs`) does validate tool-byte pins declared in the
  stanza; it cannot validate a pin that was never added.
- **Stale stanza survival:** the frozen C2 E1–E6 checks do not include
  `proxy-check`; if the round-62 C2 claim does not add a proxy-clean/pin-presence
  gate, the claim can land HELD while the proxy stanza remains DRIFT.

## 6. Post-report commit semantics

- The counting command takes `<rev>` explicitly, so a post-report commit that
  adds the missing row/pin/stanza cannot change the verdict *at the measured rev*
  — but it changes the verdict at any later rev, so the measured rev must be the
  report's cited commit and the verifier must pass exactly that rev. The
  worktree legs (E4/E5/E6-readme-map) are the only way a post-report or dirty
  worktree can flip the verdict for a fixed rev.

## 7. Smallest safe corrections (findings, not repairs)

1. E3: `/^\|\s*S195\s*\|/`, indices 8/9/11, search scoped to the `## Registry`
   section. (Accept honest; reject the bundled phantom.)
2. E4: read `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
   via `git show <rev>:…`; compare the full 64-hex pin. Note: this still cannot
   authenticate a self-pinned captured capture — the honest/`ged distinction
   hinges on E3 plus, ultimately, on live-byte equality with the cited URL
   (today true: `SourceReopen` confirmed the live page is byte-identical to the
   pinned capture).
3. E5: run `sources-census.sh validate --root /home/vgpnk/Projects/shokunin
   kumitate` over an export of the measured rev; default root must never be the
   lane.
4. E6: run `readme-map` inside the exported rev tree; land the round-61 spot-check
   README row + `covered` pin in the same change as the round-62 row+pin.
5. Same change: refresh `kumitate-proxy-v1` in place (single stanza, no second
   stanza) at the measured rev, reconcile the derived coverage vs `## Axes`, and
   add `pin.make-dispatch-actual=f0194314…` to `kumitate-gate-pins-v1`.
6. If the claim is to be airtight against a well-formed in-Registry self-pinned
   forgery, add a check an author cannot mint (live URL byte comparison at verify
   time, or a non-author-observed open record); none of the E1–E6 literals
   provide one.

Evidence used: committed bytes at `0cbe0d7` (lane) and `4247d2d` (fixture,
root verified `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`); the committed
round-61 control receipts cited above; live read-only runs of
`readme-map.mjs` (exit 1, DRIFT) and `proxy-check.mjs` (exit 1, DRIFT); sha256
of `scripts/make-dispatch-actual.mjs`.
