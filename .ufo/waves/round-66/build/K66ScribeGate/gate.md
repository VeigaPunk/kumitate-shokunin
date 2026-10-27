## Gate

Draft for the round-66 lesson (theme **"MCP deprecation registry and its clocks"**), seat `K66ScribeGate`. Rows opened this round at access
date **2026-10-27**: `S207`–`S210`, the four the C2 entry re-grounds on (the lane's max id at the round base `8d557f85` is `S206`, so all
four are absent at the base: `grep -cE '^\| S20[7-9] \|' corpus/SOURCES.md` → `0`). Every quote below is ≤ 25 words and re-found in this
seat's committed capture under the frozen counter's own `norm()`
(`.ufo/waves/round-66/probe/deprec66-probe.mjs:52-62`), and re-found again in a live fetch using the counter's own `curl` arguments
(probe `:159-171`). Copies of all four sources are in `build/K66ScribeGate/captures/`; the counter's M3 pins them there.

| row | URL (opened 2026-10-27) | ≤25-word located quote | location | capture (bytes, sha256) |
|---|---|---|---|---|
| S207 | `https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md` | "Three months after SEP-2596 reaches Final" (6 words) | `deprecated.md:31`, the HTTP+SSE row's Earliest removal cell; the `2027-07-28` literal sits in the four rows `:26-29` | `captures/deprecated-2026-07-28.md` — 3839, `c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa` |
| S208 | `https://modelcontextprotocol.io/community/feature-lifecycle.md` | "The window is measured from the release of the specification revision in which the feature is first marked Deprecated" (19) | `feature-lifecycle.md:68-72`, § Deprecating a Feature item 4 | `captures/feature-lifecycle.md` — 8794, `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee` |
| S209 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts` | "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05" (8) | `sse.ts:46`, the class doc comment (factory comment `:438`) | `captures/sse.ts` — 15183, `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` |
| S210 | `https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md` | "Each is therefore given a three-month grace period from the date this SEP reaches Final before it is eligible for removal" (21) | `sep2596.md:249-250`, § Transition; the transition table cell "Three months after this SEP is Final" at `:257` | `captures/sep2596.md` — 25830, `cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468` |

Reproduce the captures: `curl -fsSL <url> | sha256sum` prints each hash above (four HTTP 200 on 2026-10-27, `bytes=3839/8794/15183/25830`).
Quote check, same `norm()`: `node .ufo/waves/round-66/build/K66ScribeGate/qcheck.mjs` → 9/9 bullets in-capture and 9/9 live, word counts
6–21, `M4-sim PASS bullets=9`, `M5-sim PASS`, `M6-sim PASS capRows=6 snapRows=6`, `M7-sim PASS`, `QCHECK PASS` (receipt
`build/K66ScribeGate/qcheck.txt`). The nine bullets are S207 ×3, S208 ×2, S209 ×2, S210 ×2; the required literals are carried by
`2027-07-28` (S207 bullet 2) and `Three months after` (S207 bullet 3, S210 bullet 2). The proposed rows and the entry's `## Located
quotes` / `## Registry snapshot` / `## Bearing on the installed OMP release` sections are in `build/K66ScribeGate/sources-rows.md` and
`build/K66ScribeGate/entry-skeleton.md`.

**Registry snapshot (M6).** The 2026-07-28 page's `## Deprecated` table carries **six** data rows; the snapshot table must carry six, and
each captured row's `Deprecated in` and `Earliest removal` cells must occur in it (probe `:174-205`, which delinks and normalises before
comparing). The six captured pairs, read by this seat's copy of that algorithm: Roots / Sampling / Logging / Dynamic Client Registration
→ `2026-07-28` and "First revision released on or after 2027-07-28"; `includeContext: "thisServer" / "allServers"` → `2025-11-25` and
"Follows Sampling (SEP-2577)"; HTTP+SSE transport → `2025-03-26` and "Three months after SEP-2596 reaches Final". `§ Removed` is still
empty and says so (`deprecated.md:37-41`).

**Registry gate, run on an archive of the lane tip.** With the four rows appended inside `## Registry` and the entry in place,
`sources-census.sh validate --file …/corpus/SOURCES.md --today 2026-10-27` exits **0** and prints exactly the same census lines as the
untouched archive (six carried `W04`, then `file ok …`; `build/K66ScribeGate/validate-base.txt`, `validate-rows.txt` — each also holds
the one shell-trace line the `2>&1` capture prepended). Negative control: deleting only
the entry makes the same command exit **1** with `E11 S207/S208/S209/S210 missing used-by corpus/knowledge/mcp-deprecation-registry.md`
(`validate-rows-noentry.txt`) — so the validation is live: the row append and the entry file must land in one commit.

### What the four rows do not settle (and the entry must say so)

- **The clock has an anchor no cited row dates.** The registry's transport cell and the SEP's transition clause both measure from "the
  date this SEP reaches Final", and the SEP page carries `| **Created** | 2026-04-17 |` (`sep2596.md:27`) and `| **Status** | Final |`
  but **no Final date field**. So `S207`+`S208`+`S210` resolve the *rule* and not the *date*; an entry that prints a removal date from
  these three rows has computed it from an unstated premise. The lane's `2026-08-18` (staged `mcp-deprecation-registry-timing-2026-10-27.md:53`)
  rests on the merge record, which is not a lane row: the record does answer at the REST path `/pulls/2596`
  (`merged_at 2026-05-18T18:09:21Z`, `created_at 2026-04-17T17:50:11Z`), while the staged amendment's recheck fetches `/pull/2596`, which
  404s today — so the date is checkable but nothing the entry cites carries it.
- **Presence is not selection.** `sse.ts` is shipping code, not a runtime observation: nothing cited shows a configuration choosing the
  legacy transport. The entry's bearing section must keep the same limit round 65 stated for the binary sweep.

### Assimilation theme — MCP deprecation registry and its clocks (staged set `merge/kumitate/knowledge/corpus/knowledge/`)

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| `mcp-deprecation-registry-timing-2026-10-27.md` | **ADMIT** — merged and re-grounded into `corpus/knowledge/mcp-deprecation-registry.md` | Q1 header triple carried (three rows, `verified-at`, `recheck`); Q2 every external fact is re-pointed to a row opened this round: its `S240` is the draft registry → `S207`, its `S243` the SEP page → `S210`, its `S241` the PR record → not adopted this round (no lane row holds an `api.github.com` record; the REST path in that staged row, `/pulls/2596`, does 200, but the staged *recheck* for the same record in `sep-2596-merge-timestamp-surfaces-2026-10-27.md:4` uses the 404ing `/pull/` shape, and an API row would put M5's live fetch behind a 60-per-hour limit); Q3 its six-row table is the live page's six rows and the same two clock families, but its HTTP+SSE cell lowercases "three months" (`:30`) where the capture reads "Three months" — an entry that copies the staged cell fails M4's literal `Three months after` check; Q4 its computed `2026-08-18` is **not** carried, because the cited rows carry the rule and not the Final date | staged `:19-45` (both clock families, the table); `:47-58` (the correction); capture `c12c3cb7…` rows `:26-31`; `sep2596.md:249-257` |
| `mcp-feature-deprecation-registry.md` | **ADMIT with one replacement** — the entry's spine, re-grounded `S233`→`S207`, `S234`→`S208` | its theme sentence, its "check the registry, not the summary" rule and its account of the two clocks survive re-grounding; the passage `## The correction this produces` does **not**: it dates SEP-2596's Final to `2026-04-17` and computes `2026-07-17`, but the SEP page labels `2026-04-17` as *Created* (`sep2596.md:27`) and the only merge record this seat could read puts the merge at `2026-05-18T18:09:21Z`. The entry keeps the rule, drops the arithmetic | staged `:62-67` (the two bullets and `three months later is 2026-07-17`), `:72-74` (the eleven-days claim); `sep2596.md:27`; `captures/pr2596-pulls-api.json` (`merged_at 2026-05-18T18:09:21Z`, `created_at 2026-04-17T17:50:11Z`, labels `SEP`,`final`) |
| `deprecation-clock-corrections-2026-10-26.md` | **REJECT** | all three of its source rows are the staged corpus itself (`source: S322/S323/S324 — merge/kumitate/…`), which no lane row holds, no live fetch can re-find, and which M2 excludes by construction (only rows absent at the base, with a URL); its substance — that the staged set holds two wrong arithmetic — is established by the admission itself, which replaces the worked example. **Flip:** restate the same two corrections against `S207` (the registry's own cells) and `S210` (the transition clause); then it is the entry's own clocks section and admits | staged `:2-4` (the three staged-path rows), `:13-22` (the two wrong answers) |
| `cjk-mcp-deprecation-accounts-2026-10-27.md` | **REJECT — off-theme** | the theme is the registry and its clocks; this is a CJK coverage record whose primaries are a non-official Traditional-Chinese rendering and a magazine account, and the round is capped at one theme. Its one transferable finding — the Japanese account's "at least a twelve-month migration period" is wrong for the transport — is already the entry's claim from `S207`'s per-row cells. **Flip:** a CJK-accounts theme round re-opens `pichuchen.tw` and `gihyo.jp` under fresh lane ids; the twelve-month finding enters only if it quotes that row itself | staged `:2-3` (S251 the zh-TW rendering, S252 the gihyo.jp account), `:34-40` (the 12-month generalisation), `:13` (one faithful, one wrong) |

Carried rejects, unchanged — no new decision this round: `omp-advisor-and-mcp-transports.md` (round 63's citation-integrity reject; its
staged `S209/S210` are now also `S209/S210` id collisions below — different documents, no row appended) and `exactly-once-attribution.md`
(rounds 60/61/64; staged `S211`).

### Collision guard

Lane ids at the round base: **145** (`^\| S[0-9]{3,} \|` over `## Registry`); staged ids across the whole staged knowledge dir: **145**; intersection → **4**
ids, `S198`, `S199`, `S200`, `S202`, each already **a different document** (lane S198 = jj concurrency vs staged `docs/collab.md`; S199 =
Firefox jj vs staged `docs/mcp-runtime-lifecycle.md`; S200 = jj working copy vs staged 阿里云百炼 managed agents; S202 = v0.46.0 working
copy vs staged arXiv 2512.08296). No staged row is appended on an id match. Adopting `S207`–`S210` **adds four id collisions by id
only** — staged `S207` = volcengine MCP protocol-version compatibility, `S208` = the MRTR pattern page, `S209`/`S210` = `advisor-watchdog.md`
and `mcp-protocol-transports.md` at `0b5c27ab` — so after the append the guard must read **8**, and those four staged documents stay
unadopted. Quarantine slice: unchanged, and no row this round comes from it — the four rows cite documents this seat opened itself.
Reproduce: the intersection script over `corpus/SOURCES.md` and the staged `^source:` ids.

### Old → new cells (SOURCES.md is append-only except `status`, `recheck`, `used-by`)

| row | cell | old (base `8d557f85`) | new |
|---|---|---|---|
| S207–S210 | whole row | absent (max id `S206`) | `mined` / opened `2026-10-27` / recheck `180d`, `30d`, `on-release`, `180d` / used-by `corpus/knowledge/mcp-deprecation-registry.md` (`sources-rows.md`) |
| S201 | `used-by` | `corpus/knowledge/omp-installed-release-mcp-runtime.md` | same + `, corpus/knowledge/mcp-deprecation-registry.md` |
| S202 | `used-by` | as above | same + `, corpus/knowledge/mcp-deprecation-registry.md` |
| S204 | `used-by` | as above | same + `, corpus/knowledge/mcp-deprecation-registry.md` |
| S206 | `used-by` | as above | same + `, corpus/knowledge/mcp-deprecation-registry.md` |
| S203, S205 | — | unchanged | unchanged (the entry's bearing section does not name them; appending would be a false used-by) |
| any row | `status`, `recheck` | — | **no change** this round |

The four `used-by` appends are earned only because `## Bearing on the installed OMP release` names `roots` (S202), the handshake (S204),
the revision constant and header (S201, S206) and the shipped legacy transport (S209). If the integrated entry names a different subset,
the append set follows the entry, not this table.

### Limits of this block

M4/M5/M6/M7 were re-run as simulations over the skeleton (`qcheck.mjs`), not by the frozen counter over an `M`: M1/M2/M3/M8 need the
integrated entry, the four rows inside `## Registry`, and the capture pins in `.ufo/pins/source-captures.json` — all L1 work. The live
re-fetch is one host, one day; a page that changes after 2026-10-27 breaks M5 for every bullet at once. The served `.md` renderings are
the site's own markdown projection, not the HTML page a reader sees.
