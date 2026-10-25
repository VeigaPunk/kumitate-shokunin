# D4 — the kimi layer is DEGRADED; the stanza's K terms are the governed universe, never the live count

VERDICT: Record **(b) keep, mark degraded** — the four members are declared, live at their paths and
absent from the host; the installed binary still carries their path literals, so this is removed runtime
state, not a layout change; retire (a) is refuted and "never reproducible" (c) is refuted. The fix is
SCORECARD wording + stanza values (53/53), not a member-list edit.

## 1. The four members (names only; no content read)

| # | member | family | absent path | census id |
|---|---|---|---|---|
| 1 | `logs/kimi-code.log` | K3 | `~/.kimi-code/logs/` (whole dir absent) | `logs/kimi-code.log` |
| 2 | `cache/` | K3 | `~/.kimi-code/cache` | `cache/` |
| 3 | `search-index/` | K3 | `~/.kimi-code/search-index` | `search-index/` |
| 4 | `updates/` | K4 | `~/.kimi-code/updates` | `updates/` |

Governed universe = census `FROZEN` `{K1:4,K2:27,K3:10,K4:9,K5:3}` = **53**; live = **49** (K3 7/10,
K4 8/9). Both member lists already declare all four (`scripts/kimi-census.mjs:141,144,145,149`;
`scripts/proxy-check.mjs:542,545,546,549`) — **no member-list change is needed**.

## 2. When each disappeared (host + lane evidence; no per-member time exists)

The host keeps no mtime for an absent path (`stat` → `No such file or directory`), so the dates below
are **bounds from live census observations in this lane**, not guesses:

- `search-index/` — live at the round-57 close (K=53, commit `50548ae`, 2026-10-24T10:24:08-0300); first
  reported missing in round-58 w1 (`.ufo/waves/round-58/w1/ExecChecklist.md:26`, committed
  `8984889` 2026-10-24T19:52:13-0300). LOG round 58: "the kimi host root lost `search-index/` between closes".
- `logs/kimi-code.log`, `cache/`, `updates/` — still **present** in the round-61 w1 live census
  (`KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/)` only, `.ufo/waves/round-61/w1/ScoutProxyFull.md:13`,
  committed `019a844` **2026-10-25T08:29:23-0300**); gone by the round-63 measurement
  (`c8cb1bb` 2026-10-25T19:13:01-0300).
- Host root last child-set change: `stat ~/.kimi-code` → `2026-10-25 13:16:18.899421295 -0300`, identical
  to `sessions/` (`.891286379`) — an upper bound, not a per-member date. The journal for that window shows
  a disk-cleanup sweep (`du -sb /var/tmp`, `du -sh /var/cache/*`, `btrfs filesystem du`, `snapper list`,
  13:14:50–13:15:24) and `gvfsd-trash` churn at 13:15:18; the trash was empty by 13:28. **No `rm` of these
  paths is recorded** — the attribution is circumstantial and is stated as such.

## 3. Why (a) "gone for good (host upgrade)" is refuted, and (c) too

- **Not a layout change.** The installed binary (`~/.kimi-code/bin/kimi`, mtime 2026-10-23T13:25:30, i.e.
  *before* the removals) still contains the literals `search-index` (11), `query-store` (6),
  `kimi-code.log` (11), `updates/latest.json` (1), `install.json` (3), `client-configs` (7),
  `textindexes` (5). A version that had moved those substrates would not carry them.
- **Not reproducible?** It is reproducible every run: three runs today printed the identical four
  `MEMBER_MISSING` lines and `TOTALS: members=49 checked=49 errors=4`.
- **Transient by design, unobserved return.** The corpus records these as runtime state created by the
  CLI (`corpus/knowledge/kimi-session-state.md:372-395` cache/search-index measured 2026-10-13;
  `kimi-binary-secrets.md:93-110` updates/). Recreation is expected on the next CLI session but has **not
  been observed** (last session writes: `session_index.jsonl`, `workspaces.json` 2026-10-25T03:31, before
  the removal). So the record is DEGRADED, not "will be fine".

## 4. The mask, precisely

`proxy-check` compares the stanza's K terms to **live** values, so a stanza refitted to the live count
reads MATCH while the census names members. Round 58 fitted 53 → 52; round 63 fitted 52 → 49
(`.ufo/waves/round-63/w1/K63ExecProxyStanza.md:60`, finding 3 — "declaring 49 is the only way to MATCH").
At base `6825a514` in a scratch archive the proxy prints **no K finding at all** while the census names
four: measured, `KIMI_AGREE: DISAGREE … K_members=silent K_sections=silent` (exit 1).

## 5. Patch text (the L1 integrates; nothing in the lane was edited)

**5a. `SCORECARD.md` — stanza (lines 302-303)**
```
-K_members=49
-K_sections=49
+K_members=53
+K_sections=53
```
`coverage_kimi=10` stays: it is the live ratio 49/49, so no `COVERAGE_KIMI_DRIFT` and **no axis integer
moves** (`## Axes` kimi row already states `floor(10 × 5/5 × 53/53)` — the stanza's 49 contradicted its
own axes row). Full patch: `build/K64ExecKimiDegraded/scorcard-kimi-degraded.patch` (dry-run
`patch -p1 --dry-run` exit 0 on `git archive 6825a514`).

**5b. `SCORECARD.md` — the DEGRADED record**, inserted after the `## Axes` table (before the
"Why not 10 on either axis" paragraph); this is the required DEGRADED line and it ships inside 5a's patch:

```
### K layer — DEGRADED (2026-10-25; routed defect D4 names the rounds-58/63 refits)

The `coverage:kimi-layer` integer is 10 and the layer is **DEGRADED**: four governed K members are
absent from `~/.kimi-code` while both member lists still declare them — K3 `logs/kimi-code.log`,
`cache/`, `search-index/` and K4 `updates/`. The census names them (`MEMBER_MISSING ×4`,
`TOTALS: members=49 checked=49 errors=4`, exit 1). The stanza's K terms are the governed universe
(**53** = the census `FROZEN` total 4/27/10/9/3), never a live count, so the proxy reports the same
shortfall: `K_MEMBERS_DRIFT declared=53 computed=49 delta=-4` and `K_SECTIONS_DRIFT … delta=-4`.
Round 58 fitted 53 → 52 (`search-index/`) and round 63 fitted 52 → 49 (the other three), each time
declaring the census's live `members=` value as if it were the universe — a MATCH that hid the loss.
`coverage_kimi` stays 10 because it is the live ratio 49/49, so that integer is not evidence of
health here; the two K deltas are. The layer reads DEGRADED until each member returns (the installed
binary still carries `search-index`, `query-store`, `kimi-code.log` and `updates/latest.json`, so this
is removed runtime state, not a layout change) or a sourced retirement lands in **both** member lists
with the census `FROZEN` totals moved in the same commit. Bound: `search-index/` was live at the
round-57 close and gone by round-58 w1 (2026-10-24); the other three were live in the round-61 w1
census (2026-10-25T08:29-0300) and gone by the round-63 measurement; the host root's last child-set
change is 2026-10-25T13:16:18-0300, and the host keeps no per-member time for an absent path.
```

**5c. Optional strengthening — census `TOTALS` names the governed total**
(`build/K64ExecKimiDegraded/kimi-census-totals-frozen.patch`, one line):
```
-    lines.push(`TOTALS: members=${v.totals.members} checked=${v.totals.checked} errors=${v.totals.errors} info=${v.totals.info} chain=${v.totals.chain}`);
+    lines.push(`TOTALS: members=${v.totals.members} checked=${v.totals.checked} errors=${v.totals.errors} info=${v.totals.info} chain=${v.totals.chain} frozen=${FAMILIES.reduce((n, f) => n + FROZEN[f], 0)}`);
```
Measured effect: `TOTALS: members=49 checked=49 errors=4 info=4 chain=10 frozen=53`,
`KIMI_CENSUS_SELFTEST: 54/54 pass` exit 0, census verdict/exit unchanged (still DRIFT exit 1). No
consumer parses this line (only `scripts/kimi-census.mjs:457` emits it; no selftest asserts it). **Cost:**
the tool hash moves → re-pin `pin.kimi-census` `9d27bc9c…` → `6cb3a972255dcac37475e64f7cf28f02d9750f769519b62b07b86ddf8b016ed6`
(measured `PIN_DRIFT` in the patched scratch tree). It removes the trap that produced both refits: the
`members=` number people copied is a *present* count.

**5d. Proposed QUALITY item (Q61; Q60 is reserved by the round-64 plan)** — for `corpus/QUALITY.md`,
append-only:
```
- **Q61 — a proxy stanza's K terms are the governed member universe, never a live count; a host that
  lost a member is DEGRADED, not re-declared.** Grounding: routed defect R63-D4 — round 58 refitted
  `K_members` 53 → 52 and round 63 52 → 49, each declaring the census's live `members=` value, so
  `proxy-check` read MATCH while `kimi-census` named four `MEMBER_MISSING` members. **Fails when.** the
  stanza's `K_members`/`K_sections` differ from the census `FROZEN` total (53) without a retirement that
  (i) cites a source showing the host no longer creates the path and (ii) lands in both member lists with
  the `FROZEN` totals in the same commit; or a round cites `K=49/49` as health while `kimi-census` reads
  DRIFT. **Limit.** the K ratio cannot show a loss (49/49 = 10); only the census ids and the two K deltas can.
```

## 6. Agreement, measured (both tools on the same tree)

```
$ node build/K64ExecKimiDegraded/kimi-agree.mjs /tmp/kumitate-r64/K64ExecKimiDegraded/base
KIMI_AGREE: DISAGREE members_missing=4 [logs/kimi-code.log, cache/, search-index/, updates/] K_members=silent K_sections=silent
  - proxy is silent about K_members while the census names 4: logs/kimi-code.log, cache/, search-index/, updates/
  - proxy is silent about K_sections while the census names 4
base_agree_exit=1
$ node build/K64ExecKimiDegraded/kimi-agree.mjs /tmp/kumitate-r64/K64ExecKimiDegraded/patched   # 5a applied
KIMI_AGREE: AGREE members_missing=4 [logs/kimi-code.log, cache/, search-index/, updates/] K_members=53/49 delta=-4 K_sections=53/49 delta=-4
agree_exit=0
$ cd /tmp/kumitate-r64/K64ExecKimiDegraded/patched && node scripts/proxy-check.mjs
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=154 delta=+1
PROXY  error  K_MEMBERS_DRIFT  K_members: declared=53 computed=49 delta=-4
PROXY  error  K_SECTIONS_DRIFT  K_sections: declared=53 computed=49 delta=-4
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (… ; src-rev=31c465f15669)
proxy_exit=1
$ cd /tmp/kumitate-r64/K64ExecKimiDegraded/patched && node scripts/kimi-census.mjs | tail -2
TOTALS: members=49 checked=49 errors=4 info=4 chain=10
KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)
census_exit=1
```
`C2_TOTAL_DRIFT`/`AXES_DRIFT` are the base defects other round-64 seats repair; the two K drifts are the
degraded record. `kimi-agree.mjs` exits 1 on a fitted stanza (falsifier run above) and 0 on the honest one.

## 7. What the L1 must not do, and the one tension to name

- **Do not refit** `K_members`/`K_sections` back to 49; **do not retire** the four members without a
  source that the host no longer creates them (the binary literals above are the current answer: it does).
- **Tension (declare, do not paper over):** the plan's maintenance clause says the base `proxy-check`
  DRIFT "must read clean at the tip". With 5a the tip reads DRIFT on the two K terms by design. The
  honest reading is that the clause names the base receipt's two terms (`C2_TOTAL_DRIFT`, `AXES_DRIFT`,
  `base/proxy-before.txt`) and that the K drifts are the *declared degradation*; the close report and the
  round-64 SCORECARD row must say `K=49/53 DEGRADED` and must not quote `K=49/49` as health.
- If the L1 instead requires a green proxy verdict, the only honest route is a new tool state
  (`K_DEGRADED` stanza key + `PROXY: DEGRADED` verdict, exit 1) — a contract change with its own selftest
  arm, **not** a stanza refit. Not drafted here: it buys no measurement, and exit 1 is the same signal.
