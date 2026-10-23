# ConnSiblingOverlap — sibling-overlap scan for the cap-run `/tmp` bind guard

Seat: `KumitateR50.ConnSiblingOverlap` (connector). Date: 2026-10-23. Read-only on every
sibling; the only write is this report. No tools installed; no packages touched.

Question (item): does any sibling lane's PROVINCE.md or corpus own sandbox/mount-namespace
tooling (mori? mado? tsukuroi?)? Whose province does the round-50 cap-run guard touch, if
anyone's? Name contested ground for the report's adjacency note.

Axes: operability (the guard must not need a sibling's permission or duplicate a sibling's
gate), coverage (the frontier audit must not claim novelty over prior fleet art, nor miss a
real owner).

## Verdict

**No sibling province is touched; there is no contested ground.** The guard edits
`scripts/cap-run.mjs`, a kumitate Core instrument (`PROVINCE.md:15`: "The lane's own
instruments `scripts/*.mjs`"), whose mechanism ground is the lane's own named Frontier
(`PROVINCE.md:21`: isolation substrates, entry `corpus/knowledge/agent-isolation-substrates.md`,
round 45). Every sibling that shares the *vocabulary* either refuses the ground, owns a
non-overlapping slice (detect vs construct, method vs gate), or uses bwrap as its own
lane-local instrument without a province claim. The fleet-wide exposure *class*, however,
is not kumitate-only (kake, tameshi, mado, kotoba all run bwrap/unshare instruments) — that
is the adjacency note's real content.

## Method (read-only commands)

```
find /home/vgpnk/Projects/shokunin -maxdepth 2 -name 'PROVINCE.md'   # 21 provinces
grep -n -i -E 'bwrap|bubblewrap|mount.?namespace|mountinfo|sandbox|tmpfs|cap-run|isolation' \
  <every sibling PROVINCE.md>            # hits: kaidoku (refusal), tsukuroi (detect-only)
grep -rn -l -i -E 'bwrap|bubblewrap|mount.?namespace|mountinfo' <sibling corpus trees>  # 26 files
grep -rn -i 'cap-run|cap_run' <all sibling trees>                        # zero hits
grep -n -i -E 'escape|threat|sandbox|isolat' kasegi/PROVINCE.md kagi/PROVINCE.md        # no claim
```

Plus full reads of kumitate, kaidoku, mori, mado, tsukuroi PROVINCE.md; headers of kake,
chousa, tameshi, revenger, souji; `kumitate-shokunin/corpus/knowledge/agent-isolation-substrates.md`
(including its X1–X20 errata); kake `corpus/QUALITY.md:1007-1019` and `lessons/round-41.md:60`;
chousa `corpus/knowledge/mount-alias-r14.md`; tameshi `hermetic-env-differential.md` /
`guard-kill-closure.md` grep hits. Sibling-wave scratch (`.ufo/`) was not read through
(same limit ScoutSiblingBind records).

## Lane-by-lane (the three the item names, then the rest)

| Lane | Province says | Does the guard touch it? |
|---|---|---|
| **mori** | "fleet & host observability" — watchdog, wave settlement, kill/OOM journals; `/tmp` appears only as a `df -P` runway target (`mori-shokunin/PROVINCE.md:3-4,10,26`). Not "moribund host debugging": it **refuses** OS state (→ tsukuroi) and dispatch mechanism (→ kumitate) (`:12-16`); its adjacency row already cedes wave/orchestration semantics to kumitate (`:65`). | **No.** The guard's effect (fewer host-`/tmp` writes from cap-run children) is additive hygiene on a surface mori only observes. No mount semantics owned. |
| **mado** | desktop/compositor plane. `tools/mado-binds.py` = **Hyprland keybinds**, not mounts (`mado-shokunin/PROVINCE.md:29`). Its corpus uses bwrap with `--tmpfs /run` as a mask (round-26 harness/oracle) and cites unshare/user_namespaces for CAP_SYS_ADMIN reasoning (S109/S112) — evidence-use, no ownership. | **No.** Pure vocabulary collision on "bind" (already disambiguated in the lane's registry row; ConnMadoBind checks the lane side). |
| **tsukuroi** | host operability. Round-12 refinement: "root-directory metadata and create-failure DAC/ACL, **mount/namespace** and configured-credential discrimination remain within the existing host/rollback-net surface. The census owns **detection only**" (`tsukuroi-shokunin/PROVINCE.md:85-90`); round-13 correction: "grants **no namespace mutation**, privileged inspection or sibling-method ownership" (`:92-96`). | **No — nearest declaration, clean split.** tsukuroi *detects* host mount/namespace state; cap-run *constructs* a transient child sandbox and the guard only changes which argv it accepts (a refusal before `bwrap` exec; no host mount state is mutated). Construct-vs-detect is the split the adjacency note should record (RevScopeCoverage's item 1 agrees). |
| kaidoku | Adjacent section **explicitly unowns** the ground: "Malware triage at scale — verdict pipelines, **sandbox detonation**, bulk classification `(unowned)`" (`kaidoku-shokunin/PROVINCE.md:102-104`). Its corpus's bwrap hits are artifact diffs (`bwrap` ELF 0.11.2→0.12.0), not mount rules. | **No; it is the strongest negative finding** — the RE lane names sandboxing and refuses it. |
| tameshi | owns the verification-fixture **method**, with kumitate `scripts/*` as read-only primary surfaces; "**every lane's gate remains its own**" (`tameshi-shokunin/PROVINCE.md:5-11`). Its corpus owns the bwrap probe-envelope-as-test-method ("`env -i`, private /tmp, PID and network namespaces", `guard-kill-closure.md:129`; "fresh bwrap scratch with a read-only root, private writable `/tmp/w`", `hermetic-env-differential.md:26-27`). | **No gate overlap.** The round's mutation seats and selftest arm *apply* tameshi's craft on scratch copies — exactly what its province prescribes. kumitate's own entry already cedes this: "the bwrap probe envelope as a test method → tameshi" (`agent-isolation-substrates.md:18-19`). |
| kake | province is web properties; yet it **operates** bubblewrap jails for its counters ("counter v2 (bubblewrap jail)", `lessons/round-36-verifier-spotcheck.md:49`) and keeps a standing sandbox-leak criterion: "(r) A counter's sandbox exposes no witness identity … CtlKeyFinder: witness id read from `/proc/1/cmdline` and `/proc/self/mountinfo`" (`corpus/QUALITY.md:1007-1019`; `lessons/round-41.md:60` SentinelSandbox HIGH). | **No province claim, but the same exposure class in another lane's instrument.** kumitate's guard covers only cap-run callers; nothing checks kake's jail argv. Report, don't patch (kumitate `PROVINCE.md:6`). |
| chousa | research method; its research-gate refuses cross-device mount aliases and records the exact technique frontier: "Same-device binds are stat-invisible … only /proc/self/mountinfo **path-walking could see it (r15+ candidate)**" (`chousa-shokunin/corpus/knowledge/mount-alias-r14.md:39-42`; bypass demo `:14-17`). | **No ownership; prior fleet art.** S099's mountinfo field-5 technique is convergent with chousa's named candidate — the knowledge entry should cite it, not claim novelty. |
| kotoba, kama, kasegi, kengaku, kagi, souji, tabi, audio, lore, revenger, game-dev-2d/3d, kotodama, kengaku | no bwrap/mount-namespace term in PROVINCE.md (grep clean). souji/mori merely observe `/tmp` residue/runway. kasegi/kagi own escape-*analysis* only per kumitate's own routing (`agent-isolation-substrates.md:24,188`: "escape analysis is kasegi and kagi ground") — neither province claims it today. | **No.** |

`cap-run`/`cap-spawn` appear nowhere in any sibling tree (grep, zero hits): no sibling calls
the instrument the guard changes.

## Contradiction to state explicitly (not smooth over)

- `r50/RevScopeCoverage.md:15` reports "no matches" for `grep -i 'bwrap|…|sandbox'` across
  sibling provinces. As run (no `-E`), that pattern is a literal string; with `-E` it matches
  kaidoku's "sandbox detonation" refusal (`kaidoku-shokunin/PROVINCE.md:102`). The seat's
  *conclusion* (no sibling ownership) survives — the one extra hit is a refusal — but the
  "zero hits" line is wrong and the L1 should not repeat it.
- ScoutSiblingBind's corpus verdict ("no sibling recorded the mount-order/unmask rule") and
  this scan agree; nothing here contradicts it.

## Contested ground for the adjacency note

**None is contested** — no two lanes claim the same ground. The note should instead name the
*unclaimed-but-shared* ground, per the lane's own rule (report cross-domain evidence, never
absorb; `agent-isolation-substrates.md:10-12` "The mechanics belong to sibling lanes and are
cited, not absorbed"):

1. **tsukuroi — construct vs detect.** cap-run constructs transient sandbox mount namespaces
   (kumitate Core instrument); tsukuroi's host mount/namespace plane is detection-only and
   refuses namespace mutation. One sentence, so no later round misreads the guard as
   host-level mount work.
2. **tameshi — method vs gate.** The selftest arm + mutant evidence follow tameshi's
   documented craft; gate ownership stays here.
3. **kake/tameshi/mado/kotoba — the exposure class is fleet-wide.** At least four other
   lanes run bwrap/unshare instruments; each guards its own argv. kumitate's guard protects
   only cap-run callers; the finding (a bind after `--tmpfs` on the same path undoes the
   mask) is cross-lane evidence the L1 should route to the orchestrator, not patch anywhere
   else.
4. **chousa — technique precedent.** Cite mount-alias r14's "mountinfo path-walking"
   candidate in the knowledge entry's provenance rather than presenting S099's field-5 read
   as new to the fleet.
5. **kasegi/kagi — boundary on the claim's wording.** Per kumitate's own entry, threat
   models of escape are kasegi/kagi ground; the guard must be stated as accident-containment
   for honest seats (S013: worktrees "are not a security sandbox"), never as a security fix.

## Affected axes / one bounded move

- **Coverage (+):** the adjacency note above stops the round from over-claiming novelty
  (chousa precedent) and under-routing (kake's same-class exposure), which is exactly the
  frontier-audit axis R50 audits.
- **Operability (0):** no sibling permission, dedup, or gate change is needed; nothing here
  blocks or delays the guard or the pins.
- **Proposed move (bounded):** the L1 appends the five adjacency lines above to the r50
  report's adjacency section and adds `chousa-shokunin/corpus/knowledge/mount-alias-r14.md`
  to the knowledge entry's provenance/citations. No second move; no sibling file is touched.

## Risks / limits

- Provinces were read at working-tree state (2026-10-23); siblings are append-only and could
  add declarations later — the note cites files, not frozen revisions, except where quoted
  with line numbers.
- Sibling `.ufo/waves` scratch was not swept (shared limit with ScoutSiblingBind); a
  province-level or knowledge/lesson-level owner would have shown in the greps run here.
- "kasegi/kagi own escape analysis" is kumitate's own recorded routing, not those lanes'
  current province text (kagi's province owns credential hygiene; kasegi's owns bounty
  scope) — quote it as the lane's boundary, not as their claim.

## Verification (for the L1)

- `grep -n -i -E 'bwrap|bubblewrap|mount.?namespace|mountinfo|sandbox|tmpfs' */PROVINCE.md`
  from the fleet root reproduces exactly three sibling hits, none an ownership claim:
  kaidoku `:102` ("sandbox detonation" — unowned/adjacent), tsukuroi `:86` (host
  mount/namespace **detection** only), mori `:222` ("tmpfs active accounting" inside the
  round-23 *withdrawn* quota-capability disposition — observability, not a capability).
  kumitate's own PROVINCE.md scores 0 on the same pattern.
- `grep -rn -i 'cap-run' *-shokunin/ --include='*'` (excluding kumitate) → zero hits.
