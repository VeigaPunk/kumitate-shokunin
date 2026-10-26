VERDICT: D4 is real and the wave-1 fix is required, not optional — at tip `2ed8a5f` the proxy is silent on K while the census names four absent members; `kimi-final.patch` (3 hunks, 2 files, sha256 `fe023109349c22624d5c1b63ee4c912a4fab0dcd3ab1848d8d44020233473bc2`) makes both tools name the same four, changes no frozen definition, no v1 key set and no key's documented meaning, and is safe to integrate at close provided the round says `K=49/53 DEGRADED` and never quotes `K=49/49` as health.

## Evidence

Scratch archive of lane commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (`git archive | tar -x`), all runs from the archive root.

1. **The same four members are still missing (wave-1 fact re-verified).**
```
$ node scripts/kimi-census.mjs ; echo exit=$?
CENSUS  error  MEMBER_MISSING  logs/kimi-code.log  logs/kimi-code.log is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  cache/  cache is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  search-index/  search-index is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  updates/  updates is absent under /home/vgpnk/.kimi-code
TOTALS: members=49 checked=49 errors=4 info=4 chain=10
KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)
exit=1
$ node scripts/kimi-census.mjs --selftest ; echo exit=$?
KIMI_CENSUS_SELFTEST: 54/54 pass        exit=0
```
Host shape (read-only, names only): `ABSENT logs/kimi-code.log| cache| search-index| updates`; `~/.kimi-code/bin/kimi` mtime `2026-10-23 13:25:30 -0300` carries the literals `search-index` 11×, `query-store` 6×, `kimi-code.log` 11×, `updates/latest.json` 1× → removed runtime state, not a layout change. `FROZEN = {K1:4,K2:27,K3:10,K4:9,K5:3}` = 53 (`scripts/kimi-census.mjs:172`).

2. **The tip masks it — the proxy prints no K finding at all while the census names four.**
```
$ node scripts/proxy-check.mjs ; echo exit=$?
PROXY  error  A_DRIFT  A: declared=257 computed=514 delta=+257
PROXY  error  C2_DRIFT  C2: declared=153 computed=156 delta=+3
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=156 delta=+3
PROXY  error  GATE_PIN_DRIFT  pin.plan-before-ready: declared=fdc10c4b… computed=ef726eae…
PROXY  warn  PIN_UNPINNED  scripts/report-receipt-diff.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
exit=1
```
(no `K_MEMBERS_DRIFT` / `K_SECTIONS_DRIFT` line). `--strict` identical, exit 1. The two refits are the cause: `git show 6affb9e -- SCORECARD.md` → `-K_members=53 … +K_members=52` (round 58); `git show c8cb1bb -- SCORECARD.md` → `-K_members=52 … +K_members=49` (round 63).

3. **Wave-1 patches applied to the tip archive** (`patch -p1 --dry-run` exit 0 for both), then `kimi-final.patch`:
```
$ patch -p1 < …/K64R2ExecKimiApply/kimi-final.patch ; echo apply=$?
checking/apply: scripts/kimi-census.mjs, SCORECARD.md      apply=0
$ node scripts/kimi-census.mjs ; echo exit=$?
TOTALS: members=49 checked=49 errors=4 info=4 chain=10 frozen=53
KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; …)   exit=1
$ node scripts/kimi-census.mjs --selftest ; echo exit=$?
KIMI_CENSUS_SELFTEST: 54/54 pass        exit=0
$ node scripts/proxy-check.mjs ; echo exit=$?
PROXY  error  K_MEMBERS_DRIFT  K_members: declared=53 computed=49 delta=-4
PROXY  error  K_SECTIONS_DRIFT  K_sections: declared=53 computed=49 delta=-4
PROXY  error  A_DRIFT … C2_DRIFT … C2_TOTAL_DRIFT … GATE_PIN_DRIFT … (unchanged from the tip)   exit=1
$ node scripts/proxy-check.mjs --strict ; echo exit=$?   # same two K drifts, exit=1
```
**Agreement, measured:** census names 4 members; proxy names exactly 2 K terms with `delta=-4` each; no `PIN_DRIFT` (the patch re-pins `pin.kimi-census` in the same commit — wave-1's 5a alone leaves `PIN_DRIFT declared=9d27bc9c… computed=6cb3a972…`, measured).

4. **The universe really is 53, proven by a complete synthetic root** (structural `mkdir`/`touch` only, no member content copied or read): with all 53 slots present, `K_MEMBERS_DRIFT` disappears → `computed=53`. In that fixture `K_sections` computes 28 because the fixture's child names match no note heading (`K_SECTIONS_DRIFT declared=53 computed=28 delta=-25`) — the limit in finding 7.

5. **Frozen definitions and contract, checked, not assumed.**
- No frozen file touched: patch changes 2 files / 3 hunks / +31 −6. `FROZEN`, `K_MEMBER_RULES`, `scripts/proxy-check.mjs`, the frozen counters and probes untouched. `grep -n 'SCORECARD\|proxy-check\|kimi-census' .ufo/waves/round-64/probe/{receipt64,jj64}-probe.mjs` → **no output**: neither frozen counter reads anything the patch changes, so `RECEIPT64_HELD`/`JJ64_HELD` cannot move.
- `kimi-census` is **not** in `.ufo/pins/counter-pins.json` (frozen, unpatchable by me); its only pin is `pin.kimi-census` in `SCORECARD.md:310`, which the patch moves `9d27bc9c…` → `6cb3a972…`. So the re-pin is legal for the L1 and no frozen pin file is disturbed.
- v1 contract: key set unchanged (23 required keys, `scripts/proxy-check.mjs:182`); the two keys are documented as "`C1k C1k_total K_members K_sections`  **the declared kimi-block universe**" (`scripts/proxy-check.mjs:178`) while the *computed* side stays "the live member-slot total under the frozen counting rules" (`:133-149`) and its selftest still asserts "K_members reads live … never a fitted count" (`:2081`). **53 is what the key already means; 49 was the fit.** No key changes meaning.
- Nothing else breaks: `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0; `node scripts/claims-check.mjs` → `SUMMARY: errors=0 warnings=4`, `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 …)` exit 0; `AXES_DRIFT` absent (the inserted `###` section does not disturb the `## Axes` parse; `coverage:kimi-layer` derives from the live 49/49 → 10, so **no axis integer moves**).

## Findings

**K64R2ExecKimiApply-1 (high) — the tip still masks the loss; "note only, no code change" is refuted.** At `2ed8a5f` the census reads DRIFT with four named members while `proxy-check` (and `--strict`) print no K finding, so a reader who trusts the stanza sees `K=49/49` as health. Reproducer: `git archive 2ed8a5f | tar -x -C /tmp/x && cd /tmp/x && node scripts/kimi-census.mjs | tail -2 && node scripts/proxy-check.mjs | grep -c K_` → census names 4, `grep -c` prints `0`. A prose-only record leaves the machine record lying.

**K64R2ExecKimiApply-2 (medium) — wave-1's `scorcard-kimi-degraded.patch` alone adds a self-inflicted `PIN_DRIFT`.** Its own §5c prose says to re-pin, but the patch file does not carry the pin line, so applying it as shipped makes the proxy report `PIN_DRIFT pin.kimi-census: declared=9d27bc9c… computed=6cb3a972…`. Reproducer: apply `build/K64ExecKimiDegraded/*.patch` to a `2ed8a5f` archive and run `node scripts/proxy-check.mjs` → that PIN_DRIFT line. `kimi-final.patch` folds the re-pin into the same commit (verified: no PIN_DRIFT).

**K64R2ExecKimiApply-3 (medium, L1 chore, not kimi) — the plan's "proxy-check DRIFT clean at the tip" clause cannot be met while wave build trees are committed.** `A_DRIFT declared=257 computed=514`: the archive holds 514 runnable files, 28 excluding `.ufo/waves` (`find … \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l`). `C2_TOTAL_DRIFT` (153 vs 156) and `GATE_PIN_DRIFT pin.plan-before-ready` are the other two. Reproducer: the `proxy-check` run in Evidence 2. The round report must not claim a clean proxy; after the two intended K terms, these three are the remaining drifts.

**K64R2ExecKimiApply-4 (low) — wave-1's DEGRADED wording is under-specified in two places, corrected in `kimi-final.patch`.** (i) it quotes the *pre-patch* `TOTALS: members=49 checked=49 errors=4`, which after 5c reads `… chain=10 frozen=53`; (ii) it asserts "the proxy reports the same shortfall" without the binding rule, so a reader cannot tell that the section delta is the same four rather than a documentation gap. The shipped section quotes the post-patch line and states the rule: a heading binds only to a live member identity, and all four are sectioned (`corpus/knowledge/kimi-session-state.md:289,372,386`, `corpus/knowledge/kimi-binary-secrets.md:93`). Reproducer: `grep -n '^## ' corpus/knowledge/kimi-*.md | grep -E 'cache|search-index|updates|kimi-code\.log'`.

**K64R2ExecKimiApply-5 (low) — the proposal's QUALITY item is numbered into an occupied slot.** `corpus/QUALITY.md:1050` already carries `**Q61**` (report-receipt-diff), so proposal §5d's "Q61" would duplicate it; the next free number at `2ed8a5f` is **Q62** (`grep -oE '\*\*Q[0-9]+ ' corpus/QUALITY.md | … | sort -n | tail -1` → 61). Q62 is not shipped in `kimi-final.patch` (minimal patch = 2 files); if the L1 wants it, the text is proposal §5d renumbered Q62, and its "Fails when" clause must be extended to cover the refit that this patch cannot prevent (finding 6).

**K64R2ExecKimiApply-6 (low, residual hole) — nothing gates a future refit; the patch makes the loss visible, not refitting impossible.** The tip *is* the refit state, so the same edit (`K_members=49`) silences both tools again: reproducer = Evidence 2 vs 3. Closing it needs a check that compares the stanza's K terms to the census `FROZEN` total (a `kimi-census` finding or a proxy term — a contract change with its own selftest arm). Not drafted: it buys a rule, not a measurement, and the L1's integration budget is already carrying three non-kimi drifts.

**K64R2ExecKimiApply-7 (low, declared limit of the restored semantics) — `K_sections=53` conflates "member absent" with "governed member not sectioned".** `kMembersNamedByHeading` binds only to `kimi.identities` (live present members), so `sections ≤ members` always; the complete-root fixture shows all 53 present with `K_SECTIONS_DRIFT declared=53 computed=28 delta=-25`. Today's `delta=-4` is the same four absent members (their headings exist), so the degraded record is accurate; but a future un-sectioned member and an absent member produce the same finding. Reproducer: `node scripts/proxy-check.mjs --kimi-root <complete synthetic root>` on the patched tree. Keeping both keys at 53 is still right (the axes row already states the `53/53` universe, and a lone `K_members=53` with `K_sections=49` would keep the "fit the sections to the members" habit).

## Decision

**Integrate `kimi-final.patch` at close.** It restores the documented meaning ("the declared kimi-block universe"), removes the fitted value, adds the census `frozen=` universe term that caused both refits, and re-pins the census hash in the same commit. It changes **no** frozen definition (`FROZEN`, member lists, `proxy-check`, probes, `counter-pins.json`) and **no** v1 key or key meaning. Cost, to be stated in the round report and the SCORECARD row: the proxy verdict stays `DRIFT` on the two K terms by design (`K=49/53 DEGRADED`) until each member returns or a sourced retirement lands in both member lists with `FROZEN` moved in the same commit — never quote `K=49/49` as health.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ExecKimiApply/kimi-final.patch` — against `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; sha256 `fe023109349c22624d5c1b63ee4c912a4fab0dcd3ab1848d8d44020233473bc2`; 3 hunks (+31 −6): census `TOTALS … frozen=53`, stanza `K_members=53`/`K_sections=53`, `pin.kimi-census=6cb3a972…`, and the 24-line `### K layer — DEGRADED` section (verbatim SCORECARD wording; hunk 3).
- `…/K64R2ExecKimiApply/{tip-census,tip-proxy,patched-census,patched-census-selftest,patched-proxy,patched-proxy-strict,patched-proxy-fullroot}.txt` — the transcripts quoted above.
- No tool installed or upgraded; no pacman transaction; lane tree, index, jj state and frozen files untouched (all writes are this report plus the build dir).

## Limits

- Not run: `round-gate`, `gate-mutants`, `surface-probe`, `sources-check`, the two frozen counters (other seats own them); `round-gate` parses `SCORECARD.md` only for `| <N> |` round rows and `## Planned`, neither of which the inserted section adds.
- The per-round member attribution (round 58 = `search-index/`, round 63 = the other three) is wave-1's finding; I re-verified the *value* moves (`git show 6affb9e`/`c8cb1bb`) and the round-61 w1 census line (`.ufo/waves/round-61/w1/ScoutProxyFull.md:13`, only `search-index/` missing at 2026-10-25T08:29-0300), not the removal event itself.
- The host journal attribution for the removal window stays circumstantial (wave-1's reading; no `rm` recorded); the SCORECARD bound states it as a bound.
- The synthetic-root fixture is structural only; it does not prove the notes' headings bind every *real* child name (they do today: `computed K_sections = K_members = 49`).
- Nothing here predicts when a member returns; the degraded record is written to stay true whether or not one does.
