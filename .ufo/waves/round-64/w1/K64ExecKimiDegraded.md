VERDICT: The `K_members=49` stanza is fitted to a degraded host — four governed K members are absent while both member lists still declare them; the honest record is (b) keep-and-mark-DEGRADED with the stanza restored to the governed universe 53/53, which makes `kimi-census` (`MEMBER_MISSING ×4`) and `proxy-check` (`K_MEMBERS_DRIFT`/`K_SECTIONS_DRIFT` delta=-4) agree, measured on a scratch archive of `6825a514`.

## Evidence

Seat: `K64ExecKimiDegraded`. Lane untouched (nothing under `scripts/`, `SCORECARD.md`, `corpus/`, `.ufo/pins/` was written); all work in `build/K64ExecKimiDegraded/` and `/tmp/kumitate-r64/K64ExecKimiDegraded/`.

**1. Both tools, base archive of `6825a514` (`git archive 6825a514… | tar -x -C /tmp/…/base`)**
```
$ node scripts/kimi-census.mjs
FAMILY K3  members=7  checked=7  frozen=10
FAMILY K4  members=8  checked=8  frozen=9
CENSUS  error  MEMBER_MISSING  logs/kimi-code.log  logs/kimi-code.log is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  cache/  cache is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  search-index/  search-index is absent under /home/vgpnk/.kimi-code
CENSUS  error  MEMBER_MISSING  updates/  updates is absent under /home/vgpnk/.kimi-code
TOTALS: members=49 checked=49 errors=4 info=4 chain=10
KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)
base_census_exit=1
$ node scripts/proxy-check.mjs
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=154 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …; src-rev=31c465f15669)
base_proxy_exit=1
```
No K finding at all: the stanza (`SCORECARD.md:302-303` `K_members=49 K_sections=49`) equals the live count, so four absent members are invisible to the proxy. Census selftest is green, so the DRIFT is host state, not a tool fault: `node scripts/kimi-census.mjs --selftest` → `KIMI_CENSUS_SELFTEST: 54/54 pass`, `VERDICT: PASS`, `selftest_exit=0`.

**2. The four members and the refit history**
- Members: K3 `logs/kimi-code.log` (census `:141`, proxy `:542`), `cache/` (`:144`/`:545`), `search-index/` (`:145`/`:546`); K4 `updates/` (`:149`/`:549`). Declared in **both** lists already; governed universe = census `FROZEN` `{4,27,10,9,3}` = **53** (`kimi-census.mjs:172`), live 49.
- `search-index/` live at the round-57 close (K=53, `50548ae` 2026-10-24T10:24:08-0300), first named missing in round-58 w1 (`.ufo/waves/round-58/w1/ExecChecklist.md:26`, `8984889` 2026-10-24T19:52:13-0300); LOG round 58: "the kimi host root lost `search-index/` between closes".
- The other three still present in the round-61 w1 live census (`MEMBER_MISSING search-index/` **only**, `.ufo/waves/round-61/w1/ScoutProxyFull.md:13`, `019a844` **2026-10-25T08:29:23-0300**); gone by round 63 (`c8cb1bb` 2026-10-25T19:13:01-0300).
- Host: `stat ~/.kimi-code` → `2026-10-25 13:16:18.899421295 -0300` (= `sessions/` `.891286379`, an empty dir); `logs/`, `cache`, `search-index`, `updates` → `No such file or directory` (no per-member time exists). Journal 13:14:50–13:15:24 shows a disk-cleanup sweep (`du -sb /var/tmp`, `du -sh /var/cache/*`, `btrfs filesystem du`, `snapper list`) and `gvfsd-trash` churn 13:15:18; no `rm` of these paths is logged and the trash was empty by 13:28.
- Not a layout change: the installed binary (`bin/kimi`, mtime **2026-10-23T13:25:30**, before the removals) still contains `search-index` (11 hits), `query-store` (6), `kimi-code.log` (11), `updates/latest.json` (1), `install.json` (3), `client-configs` (7), `textindexes` (5).

**3. Agreement after the fix (scratch tree = base archive + `SCORECARD.md` patch)**
```
$ node build/K64ExecKimiDegraded/kimi-agree.mjs /tmp/kumitate-r64/K64ExecKimiDegraded/base
KIMI_AGREE: DISAGREE members_missing=4 [logs/kimi-code.log, cache/, search-index/, updates/] K_members=silent K_sections=silent
base_agree_exit=1
$ node build/K64ExecKimiDegraded/kimi-agree.mjs /tmp/kumitate-r64/K64ExecKimiDegraded/patched
KIMI_AGREE: AGREE members_missing=4 [logs/kimi-code.log, cache/, search-index/, updates/] K_members=53/49 delta=-4 K_sections=53/49 delta=-4
agree_exit=0
$ cd …/patched && node scripts/proxy-check.mjs
PROXY  error  K_MEMBERS_DRIFT  K_members: declared=53 computed=49 delta=-4
PROXY  error  K_SECTIONS_DRIFT  K_sections: declared=53 computed=49 delta=-4
PROXY: DRIFT (C2_TOTAL_DRIFT …; K_MEMBERS_DRIFT …; K_SECTIONS_DRIFT …; AXES_DRIFT …)
patched_proxy_exit=1
```
`coverage_kimi` stays 10 (live ratio 49/49) → **no axis integer moves**, and the `## Axes` kimi row already states `floor(10 × 5/5 × 53/53)` (`SCORECARD.md:344`), so 53/53 restores the stanza's agreement with its own axes row. Patch dry-run on a fresh base copy: `patch -p1 --dry-run` → `checking file SCORECARD.md`, `patch_dryrun_exit=0`.

**4. Optional census strengthening measured** (`TOTALS` gains `frozen=53`): `TOTALS: members=49 checked=49 errors=4 info=4 chain=10 frozen=53`, `KIMI_CENSUS_SELFTEST: 54/54 pass` exit 0, verdict/exit unchanged; cost is the re-pin `pin.kimi-census` `9d27bc9c…` → `6cb3a972255dcac37475e64f7cf28f02d9750f769519b62b07b86ddf8b016ed6` (measured `PIN_DRIFT` in that scratch tree). No consumer parses the line (single emitter, `kimi-census.mjs:457`; no selftest asserts it).

## Findings

**K64ExecKimiDegraded-1 — high — the stanza is fitted, so the proxy is blind to four absent members (routed defect D4).** `proxy-check` compares declared K terms with **live** values; declaring `K_members` = the live count makes a lost member read MATCH. Measured: base archive prints no K finding while the census names four (`KIMI_AGREE: DISAGREE`, exit 1). Refits: round 58 53→52 (`6affb9e`), round 63 52→49 (`c8cb1bb`; the refit is self-declared in `.ufo/waves/round-63/w1/K63ExecProxyStanza.md:60`). Repro: `node build/K64ExecKimiDegraded/kimi-agree.mjs <base archive>` → exit 1.

**K64ExecKimiDegraded-2 — high — the honest record and the plan's maintenance clause conflict; the L1 must pick the wording, not the number.** Plan: base `proxy-check` DRIFT "must read clean at the tip". With `K_members=K_sections=53` the tip reads DRIFT on the two K terms **by design** (measured above). The only way to satisfy the clause literally is the refit this defect names. Proposed resolution (in `proposal.md` §7): the clause names the base receipt's two terms (`C2_TOTAL_DRIFT`, `AXES_DRIFT`), and the round-64 row/close must read `K=49/53 DEGRADED`, never `K=49/49` as health. No patch here — it is a decision.

**K64ExecKimiDegraded-3 — medium — the census `TOTALS: members=` is a present count, and both refits copied it as the universe.** `kimi-census.mjs:457` prints `members=49` for a 53-member governed set (LOG round 58: "re-declared at its measured value"); a reader grepping that number reproduces the refit. Patch `kimi-census-totals-frozen.patch` adds `frozen=${Σ FROZEN}` with selftest 54/54 unchanged; it requires the re-pin above. Repro: `cd /tmp/kumitate-r64/K64ExecKimiDegraded/censuspatch && node scripts/kimi-census.mjs | tail -2`.

**K64ExecKimiDegraded-4 — medium — the disappearance is datable only to bounds, and the cause is circumstantial.** Absent paths keep no mtime; the host root's last child-set change (`2026-10-25T13:16:18-0300`) is an upper bound shared with `sessions/`'s emptying. Journal shows a cleanup sweep in that minute but records no `rm`; the trash was emptied at 13:28. Any record claiming a per-member date would be invented. Repro: `stat -c '%n %y' ~/.kimi-code ~/.kimi-code/sessions; ls -la ~/.kimi-code/{logs,cache,search-index,updates}`.

**K64ExecKimiDegraded-5 — low — the axes row and the stanza contradicted each other, so a reader had two numbers.** `SCORECARD.md:344` states `floor(10 × 5/5 × 53/53)` while `:302-303` declared 49/49. The 5a patch removes the contradiction; nothing else reads the row's formula.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecKimiDegraded/proposal.md` — decision, the four members, dates/bounds, patch text, DEGRADED line, QUALITY Q61 draft, agreement commands
- `.ufo/waves/round-64/build/K64ExecKimiDegraded/scorcard-kimi-degraded.patch` — `SCORECARD.md`: `K_members=53`, `K_sections=53`, new `### K layer — DEGRADED` block (dry-run exit 0 on `git archive 6825a514`)
- `.ufo/waves/round-64/build/K64ExecKimiDegraded/kimi-census-totals-frozen.patch` — optional one-line `TOTALS … frozen=53` (+ re-pin `6cb3a972…`)
- `.ufo/waves/round-64/build/K64ExecKimiDegraded/kimi-agree.mjs` — census↔proxy agreement checker (exit 1 on a fitted stanza, exit 0 on the honest one)
- scratch `/tmp/kumitate-r64/K64ExecKimiDegraded/{base,patched,censuspatch,applytest,patchwork}/` + captured outputs (`census.out`, `proxy.out`, `base-census.txt`, `base-proxy.txt`, `patched-proxy.txt`, `patched-proxy2.txt`, `census-selftest.txt`)

Tool installs/updates: none (node, git, stat, journalctl only).

## Limits

Did not run `~/.kimi-code/bin/kimi` (it would recreate the absent dirs and destroy the evidence); did not verify that the CLI recreates `cache/`, `search-index/`, `logs/`, `updates/` on its next session (unobserved — hence DEGRADED, not "transient-confirmed"); did not read any member's content or any secret file (names, kinds, sizes and times only); did not identify the remover beyond journal/trash evidence; did not test the alternative `K_DEGRADED` tool state (contract change, no measurement bought); did not run the round's frozen counters or any other gate beyond `kimi-census`, `proxy-check` and their selftests.
