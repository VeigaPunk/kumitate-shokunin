# RevScopeCoverage — r50 scope-boundary review

Seat: `KumitateR50.RevScopeCoverage` (reviewer). Item: "Review the round for cross-domain bleed and coverage: are cap-run isolation and mount namespace behavior within kumitate's PROVINCE.md core/frontier, or do they belong to another lane? Read the lane PROVINCE.md and relevant sibling province, cite lines, and report any scope boundary the round should disclose."

## What I attacked

- The C1 claim (cap-run `--bind` /tmp-guard + `pin.bind-oracle` family re-pin) against the lane's own province declaration and every sibling province declaration.
- The R50 "Frontier audit" (LEDGER_HELD) against the same declarations.
- Whether any sibling lane declares sandbox/mount-namespace construction, bwrap/cap-run tooling, or host mount/namespace authority that overlaps the round's work.

## Method (all read-only)

- Read lane `PROVINCE.md` (kumitate).
- Read sibling `PROVINCE.md` for: mado, mori, tsukuroi, kotoba, kama, chousa, kaidoku, kotodama, kake, kasegi, souji, tameshi, kengaku, revenger, lore, kagi, tabi, audio.
- `grep -i 'bwrap|bubblewrap|cap-run|cap-spawn|sandbox' /home/vgpnk/Projects/shokunin/*/PROVINCE.md` (case-insensitive, gitignore off) -> **no matches** in any sibling province.
- Read round-50 `plan.md`, `scripts/hyaku/ufo-wave-policy-v2.json` (membrane/lanes sections), lane `corpus/SOURCES.md` rows S095/S098/S099, `SKILL.md` §Gate registry (cap-run :597,:613; bind-oracle :616; cap-spawn :617), and confirmed `corpus/knowledge/agent-isolation-substrates.md` exists.

## Verdict

**The C1 guard and the mount-namespace behavior it touches are inside kumitate's own Core-plus-Frontier. No sibling lane owns the construction side; the only adjacent sibling claims (tsukuroi) are detection-only host mount/namespace discrimination, which the round does not touch.**

### 1. The guard is a change to kumitate's own Core instrument

- kumitate `PROVINCE.md:15` (Core): "The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry) and its learning registry `corpus/SOURCES.md`".
- `SKILL.md:597` registers `cap-run` as a kumitate-owned **runner** ("Owner: this lane (kumitate L1)"); `:613` gives its contract `kumitate-cap-run-v2`; `:616` registers `bind-oracle` (gate); `:617` registers `cap-spawn` (helper). All three are the exact files the round edits/re-pins (G1/G5/G6/G7).
- The C1 predicate (G1-G8) only reads `git archive` bytes of `<rev>` in this lane, plus cap-run/bind-oracle selftests and proxy-check pins. Nothing in the claim mutates host state outside a cap-run child's own sandbox.

### 2. The mechanism (bwrap mount semantics) is kumitate's named Frontier ground

- kumitate `PROVINCE.md:21` (Frontier): "Isolation substrates for parallel agents (git worktrees, harness isolation backends) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory)". Entry exists.
- The round's source anchoring is in-lane: `corpus/SOURCES.md:108` (S095 bubblewrap 0.13.1, mined, tier A), `:112` (S099 proc_pid_mountinfo(5)),
 `:111` (S098 strace 7.2). The plan (C1 section) cites S095's argument-order rule directly. This matches the Frontier pattern "named ground, entered by sourced entries".
- The knowledge entry for the mechanism (`corpus/knowledge/mount-order-and-bind-scope.md`, drafted by ScribeKnowledge with provenance S095+S099+own-work) follows the same established pattern.

### 3. Sibling provinces: no contested owner, three adjacencies to disclose

- **tsukuroi (closest claim):** `tsukuroi-shokunin/PROVINCE.md:85-90` (round-12 refinement): "root-directory metadata and create-failure DAC/ACL, **mount/namespace** and configured-credential discrimination remain within the existing host/rollback-net surface. **The census owns detection only**; no mode repair, service restart, subvolume creation, boot or package transaction is authorized by a finding." And the round-13 correction (`:96` area): "grants **no namespace mutation**, privileged inspection or sibling-method ownership."
  - So tsukuroi claims host mount/namespace *discrimination/detection*; it explicitly refuses namespace mutation. cap-run *constructs* a sandbox mount namespace (a mutation inside a transient child) for harness isolation — that is kumitate's construction side, and the guard changes only which argv cap-run accepts. No overlap with tsukuroi's detection plane; but the *vocabulary* (mount/namespace) is shared, so an adjacency note is warranted.
- **mori:** `mori-shokunin/PROVINCE.md:26` — `SURFACE disk` default targets are `$ROOT` and `/tmp` (resource runway). The guard reduces host-`/tmp` writes from cap-run children (G3/G8 assert child writes never land on host `/tmp`), which is additive hygiene on a surface mori observes — it does not absorb mori's runway reporting.
- **souji:** `souji-shokunin/PROVINCE.md:73-78` (F5) — own-uid scratch-residue observation covers `/var/tmp`, `/tmp`, `/dev/shm`. Same additive effect; no authority change.
- **tameshi:** `tameshi-shokunin/PROVINCE.md:7-11` — kumitate `scripts/*` are tameshi's read-only *primary surfaces* for verification method (it never edits them; mutants run on scratch copies). The round's mutation seats are bounded to scratch copies, consistent with that declaration.
- **All other provinces** (mado, kotoba, kama, chousa, kaidoku, kotodama, kake, kasegi, kengaku, revenger, lore, kagi, tabi, audio) declare no sandbox/mount-namespace surface; the `bwrap|cap-run|sandbox` grep across sibling provinces returned zero hits.

### 4. R50 frontier audit — internal, no axis claim

- `plan.md:63-82` explicitly marks LEDGER_HELD as "not a second claim", "round-closure conformance audit, not an axis claim ... without moving the retired `coverage` axis". All R1-R8 checks read lane/fleet lesson and report bytes; nothing touches another lane's province.

## Scope boundaries the round should disclose (recommended for the r50 report/lesson)

1. **Adjacency note toward tsukuroi:** cap-run constructs sandbox mount namespaces (kumitate core instrument); tsukuroi's host mount/namespace plane is detection-only and explicitly refuses namespace mutation. Record the split (construct vs detect) so no later round misreads the guard as host-level mount work.
2. **`/tmp` multi-lane surface note:** mori (disk runway default) and souji (F5 residue roots) observe host `/tmp`; G3/G8 evidence (child writes absent from host `/tmp`) is consistent with both lanes' surfaces — an improvement, not absorption.
3. **No claim of widened refusal scope:** plan Limits (a) already records that only `/tmp` (whole sandbox-managed mount point) is refused; `/etc`, `/usr` binds stay legal and the r48 EXTRA-arm scenario is not changed. This keeps the guard inside kumitate's own instrument contract.
4. **Sibling-source rows are in-lane:** S095/S098/S099 are kumitate `SOURCES.md` rows (mined, tier A, fetched 2026-10-23), so the round opens no foreign registry.

## Findings by severity

- **No critical/high findings.** No cross-domain bleed; no sibling province claims the guard's ground.
- **Medium (disclosure, not defect):** the tsukuroi "mount/namespace" vocabulary overlap should be explicitly split (construct vs detect) in the r50 report/lesson; otherwise a future scope audit could misattribute. The plan itself does not name tsukuroi at all — an adjacency mention is missing.
- **Low (note):** the `/tmp` surface is shared with mori/souji; the round's G3/G8 evidence can be cited as cross-lane-hygiene in the adjacent note, but must not be phrased as owning either lane's surface.

## Residual risk / verification gaps

- I read sibling PROVINCE.md files at their current working-tree state; sibling lanes are append-only and may have uncommitted declarations. The province files are authoritative as of read time (2026-10-23).
- I did not exhaustively grep every sibling's `SKILL.md`/corpus for historical uses of bwrap/cap-run word the provinces are the authoritative ownership declarations, and the province-level grep was clean. If the L1 wants belt-and-braces, a corpus-wide `grep -rn 'bwrap\|cap-run'` across siblings is a one-line addition to the adjacent note.

## Tooling

- No tools installed; no packages touched. All reads done with `read`/`grep`/`glob`; one `ls -d` (read-only) to locate the report directory.
