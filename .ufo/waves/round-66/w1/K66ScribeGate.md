VERDICT: The round-66 `## Gate` block for the theme "MCP deprecation registry and its clocks" is drafted with four new rows (S207–S210, access date 2026-10-27, one located ≤25-word quote each, every quote re-found in a live fetch and in a committed capture), two ADMITs and two REJECTs with reasons and flip conditions, and an old→new cell log; three staged-corpus defects and one unpinned clock anchor block a copy-forward landing of the staged set.

## Evidence

Captures fetched by this seat, 2026-10-27 (all into `build/K66ScribeGate/captures/`):
```
HTTP 200 bytes=3839   https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md      -> c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa
HTTP 200 bytes=8794   https://modelcontextprotocol.io/community/feature-lifecycle.md             -> 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee
HTTP 200 bytes=15183  https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts -> 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
HTTP 200 bytes=25830  https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md -> cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468
```
Quote/table check with the frozen counter's own `norm()` and its M4/M5/M6/M7 logic (probe `:52-62`, `:140-219`), run over this seat's
skeleton — `node .ufo/waves/round-66/build/K66ScribeGate/qcheck.mjs` (`qcheck.txt`):
```
M4-sim PASS bullets=9        (word counts 13,7,6,19,19,8,7,21,7; every bullet in-capture=true)
LIVE S207 bytes=3839 / S208 8794 / S209 15183 / S210 25830   M5-sim PASS
M6-sim PASS capRows=6 snapRows=6   M7-sim PASS   QCHECK PASS m4=true m5=true m6=true m7=true
```
Fleet census over the lane tip archive (`git -C <lane> archive HEAD`), rows appended inside `## Registry` + entry file in place:
```
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file …/corpus/SOURCES.md --today 2026-10-27   -> exit 0
 (output byte-identical to the same tree without the rows: six carried W04 + "file ok"; validate-base.txt / validate-rows.txt)
same command with only the entry deleted -> exit 1, four lines: E11 S207/S208/S209/S210 missing used-by corpus/knowledge/mcp-deprecation-registry.md
```
Merge-record probe (2026-10-27, rate limit remaining 26/60):
```
GET https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pull/2596   -> HTTP 404  (content-length 106)
GET https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596  -> HTTP 200, 26236 bytes,
    merged_at 2026-05-18T18:09:21Z  created_at 2026-04-17T17:50:11Z  state closed  labels ['SEP','final']
```

## Findings

**K66ScribeGate-1 — HIGH — the staged registry entry's worked example is built on the SEP's creation date.** What it attacks: any
entry that copies `mcp-feature-deprecation-registry.md` forward. Staged `:66-67` asserts "SEP-2596 reached Final on 2026-04-17; three
months later is **2026-07-17**", but the SEP page labels that value `| **Created** | 2026-04-17 |` (`sep2596.md:27`) and carries Status
Final with no Final-date field; the merge record dates the merge 2026-05-18 (`/pulls/2596`). Repro:
`grep -n '2026-04-17\|2026-07-17' /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md`
and `grep -n 'Created' .ufo/waves/round-66/build/K66ScribeGate/captures/sep2596.md` → `27:| **Created** | 2026-04-17 |`.

**K66ScribeGate-2 — HIGH — a staged recheck fetches an API path that 404s.** `sep-2596-merge-timestamp-surfaces-2026-10-27.md:4` runs
`curl …/pull/2596 | grep -c '"merged_at": "2026-05-18T18:09:21Z"'` and records `-> 1`; on 2026-10-27 the singular REST path returns 404
(0 bytes body, so the grep prints 0). It attacks the amendment's recheck rather than its claim — the same record answers at `/pulls/2596`
with the quoted `merged_at`. Repro: the two GETs in Evidence.

**K66ScribeGate-3 — MEDIUM — the staged table's casing would break M4 if copied.** Staged `mcp-deprecation-registry-timing-2026-10-27.md:30`
lowercases the cell ("three months after SEP-2596 reaches Final") where the live 2026-07-28 page and this seat's capture read
"Three months after SEP-2596 reaches Final" (`deprecated.md:31`). M4 requires a bullet containing the literal `Three months after`
(probe `:149`), so the do-nothing control's byte-for-byte copy — and any entry that copies this table — has no such bullet. Repro:
`grep -n 'three months\|Three months' <staged timing file> <capture deprecated-2026-07-28.md>`.

**K66ScribeGate-4 — MEDIUM — the clock's anchor date is carried by no cited row.** What it attacks: any entry that prints an
earliest-removal date from S207/S208/S210. Those three rows give the *rule* ("Three months after SEP-2596 reaches Final") and the SEP
page gives Status/Created, not a Final date; the lane's `2026-08-18` rides an `api.github.com` record that is not a lane row (and would
put M5's live fetch behind a 60/hour limit). The Gate therefore admits the rule and withholds the arithmetic, and says so. Repro:
`grep -n 'Final' .ufo/waves/round-66/build/K66ScribeGate/captures/sep2596.md | head` → status rows only, no Final-date field.

**K66ScribeGate-5 — LOW — the round-65 rows use two cadences for one class.** S201/S202/S204 (tag-pinned `raw.githubusercontent`
files at `v18.12.6`) carry recheck `on-release`, while S205/S206 (same class) carry `180d`. Not a counter defect (M2 only requires a
`recheck:` line); this seat's S209 follows `on-release` for the same reason as S201. Repro:
`python3 -c "import sys;[print(l.split('|')[1].strip(), l.split('|')[10].strip()) for l in open('corpus/SOURCES.md') if l.startswith('| S20')]"`
→ `S200 180d / S201 on-release / S202 on-release / S203 180d / S204 on-release / S205 180d / S206 180d`.

**K66ScribeGate-6 — LOW — four new id collisions by id only.** Lane S207–S210 collide with staged S207 (volcengine MCP
protocol-version compatibility), S208 (MRTR pattern page), S209/S210 (`advisor-watchdog.md`, `mcp-protocol-transports.md` at
`0b5c27ab`). Current intersection is 4 ids (`S198`, `S199`, `S200`, `S202`, all different documents); after the append the guard must
read 8 and no staged row is appended. Repro: the intersection script over `corpus/SOURCES.md` and the staged `^source:` ids.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeGate/gate.md` — **the deliverable**: the lesson `## Gate` block (rows table, registry snapshot
  rule, anchor gap, assimilation theme with 2 ADMIT / 2 REJECT + flip conditions, collision guard, old→new cell log, limits).
- `.ufo/waves/round-66/build/K66ScribeGate/entry-skeleton.md` — draft entry sections the counter reads (`source:` lines S207–S210,
  `verified-at: 2026-10-27`, `recheck:`, `## Located quotes` 9 bullets, `## Registry snapshot` 6 rows, `## Bearing on the installed OMP
  release` naming S202/S204/S209 and S201/S206).
- `.ufo/waves/round-66/build/K66ScribeGate/sources-rows.md` — the four SOURCES rows, 11 cells each, paste-ready at line 159 of
  `corpus/SOURCES.md`; census-clean on the archive (Evidence).
- `.ufo/waves/round-66/build/K66ScribeGate/qcheck.mjs`, `qcheck.txt` — the M4/M5/M6/M7 self-check and its receipt.
- `.ufo/waves/round-66/build/K66ScribeGate/captures/` — `deprecated-2026-07-28.md`, `feature-lifecycle.md`, `sse.ts`, `sep2596.md`,
  `pr2596-pulls-api.json` (26236, `7b33525a2a72ec8e3faa6ebf7e6511caafbd4ea4a0c91bd8cc8fb9d194a35bd0`). The `/pull/2596` 404 left no body
  (`curl -f -o` writes nothing on failure); it is evidenced by the status/header probe quoted in Evidence, not by a saved file.
- `.ufo/waves/round-66/build/K66ScribeGate/validate-base.txt`, `validate-rows.txt`, `validate-rows-noentry.txt` — census receipts.
- `.ufo/waves/round-66/w1/K66ScribeGate.md` — this report.

## Limits

- M1/M2/M3/M8 were **not** run against an `M`: M4/M5/M6/M7 were re-run only as simulations over a skeleton (M3 needs the pins in
  `.ufo/pins/source-captures.json`, which the L1 owns; M8 needs the entry and rows committed). No verdict line is claimed.
- The live re-fetch is one host on one day (2026-10-27); a page edited afterwards breaks M5 for four bullets at once. The `.md` URLs are
  the site's markdown projection, not the rendered HTML a reader sees.
- I did not read the staged set exhaustively (67 files): four candidates were read in full for the decisions, and the theme's other
  files (`deprecation-notice-record-locations-2026-10-28.md`, `deprecation-decision-roles-and-operator-retirements-2026-10-25.md`,
  `mcp-deprecation-removed-section-2026-10-26.md`, `deprecation-clock-narrative-record-2026-10-27.md`) were skimmed for theme fit only.
- The `sse.ts` row proves presence in the release source, not that any configuration selects the legacy transport at run time.
- No tool was installed or upgraded; no scratch file is cited (scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeGate` removed on exit,
  receipts copied into the build dir first).
