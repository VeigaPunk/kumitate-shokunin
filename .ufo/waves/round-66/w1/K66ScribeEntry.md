VERDICT: The C2 entry is drafted as a full-file draft (`build/K66ScribeEntry/mcp-deprecation-registry.md`, 135 lines) and scores `DEPREC66_HELD held=8/8` (exit 0) against the frozen counter on a fixture at the freeze, with three new rows (S207/S208/S209) I opened live, captured and pinned; two counter soundness limits are reproduced as mutants and reported, not patched.

## Evidence

Fixture: `git clone --shared` of the lane at `/fast/scratch/hyaku/kumitate-r66/K66ScribeEntry/lane`, checked out at the freeze `621212ba`; integration applied as the L1 would (entry + 3 SOURCES rows + 3 capture pins + `corpus/README.md` row + `readme-map` covered pin + one PROVINCE clause), committed inside the clone only.

```
$ TMPDIR=<scratch> node .ufo/waves/round-66/probe/deprec66-probe.mjs "$LANE" 6a1fbf73dbd5f33e212d2e8c1915b3cd9a867927
DEPREC66_HELD held=8/8 checks=8 rev=6a1fbf73dbd5f33e212d2e8c1915b3cd9a867927 rule=M66
exit=0
$ node .ufo/.../deprec66-probe.mjs "$LANE" 6a1fbf73 --no-live        # M5 is the live check
DEPREC66_UNMET held=7/8 checks=8 rev=f7d8c60b... rule=M66 | M5 MISS live-fetch-skipped        exit=1
$ node scripts/sources-check.mjs    -> SOURCES_CHECK: CLEAN (rows=148 tiers=A:125,B:15,C:8 status=queued:13,mined:116,rejected:19 entries_with_source=23 legacy=38)   exit=0
$ node scripts/source-capture.mjs   -> SOURCE_CAPTURE: CLEAN captures=41 exemptions=107   exit=0
$ node scripts/readme-map.mjs       -> README_MAP: CLEAN files=161 rows=161 covered=161   exit=0
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <lane>/corpus/SOURCES.md
  -> file  ok  <lane>/corpus/SOURCES.md   exit=0
```

Sources opened live on 2026-10-27 through the counter's own curl line (`-A 'Mozilla/5.0 (kumitate-deprec66)'`), bytes committed under `build/K66ScribeEntry/capture/`:

| row | url | bytes | sha256 (first 16) |
| - | - | - | - |
| S207 | `https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md` | 3839 | `c12c3cb7d6b8a30c` |
| S208 | `https://modelcontextprotocol.io/community/feature-lifecycle.md` | 8794 | `3f3371911512591e` |
| S209 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts` | 15183 | `0b69229a69b01a37` |

Entry shape measured on the draft: `wc -l` → 135 (limit 140); three `source:` lines on lines 1–3 with `verified-at:`/`recheck:` on 4–5 (both `sources-check` needs the trio in the first five lines and `M1` reads the first fourteen); `## Registry snapshot` carries 6 data rows, one per captured Deprecated row; 15 `## Located quotes` bullets, 15 ≤ 25 words, all re-found in capture and live.

The Bearing section's claims were each verified at the tag before writing: `sse.ts` `:46` (doc comment naming revision 2024-11-05), `:47` (`class LegacySseTransport`), `:39` (`LegacySseConnectionTimeoutError`), `:439` (`createSseTransport`); wiring at `client.ts:81-82` (`case "sse": return createSseTransport(config as MCPSseServerConfig, signal)`); config type at `types.ts:142` ("SSE server configuration (deprecated, use HTTP)"); roots declared at `client.ts:102` (`roots: { listChanged: false },` inside the initialize capabilities), answered at `client.ts:59-62`, and commented at `client.ts:171-173`.

## Findings

**K66ScribeEntry-1 — medium, frozen counter M6: the snapshot is checked set-wise, not row-wise.** M6 (`deprec66-probe.mjs:197-204`) joins the whole snapshot into one normalised string and tests `includes(depIn)` / `includes(removal)` per captured cell; nothing pairs a feature with its own cells, and the four `2027-07-28` rows are indistinguishable. A table that asserts a false removal clock for two features still scores 8/8. Reproduce (fixture at `53363c57`, one line changed in each of two rows):

```
$ git -C lane show 53363c57 -- corpus/knowledge/mcp-deprecation-registry.md | grep -E '^[+-]\| (Roots|HTTP\+SSE)'
$ node .ufo/.../deprec66-probe.mjs "$LANE" 53363c5733a7381e50372bfa244427b7ee4206e7
DEPREC66_HELD held=8/8 checks=8 rev=53363c57... rule=M66        exit=0
```
Row-wise correctness of the snapshot is a non-author judgement; my draft's § Registry snapshot therefore carries the page's cells verbatim and should be read against `build/K66ScribeEntry/capture/mcp-deprecated-2026-07-28.md:26-31`, not trusted from the counter.

**K66ScribeEntry-2 — low, drafting trap in M4/M5: `norm()` strips markup but does not delink.** A quote that touches a `[text](url)` span exists nowhere in the normalised capture, so both the capture check and the live check miss. Reproduce (fixture at `dfc10536`, one extra bullet):

```
$ node .ufo/.../deprec66-probe.mjs "$LANE" dfc1053642fb53fc7598039a980e1a7c3e0955d7
DEPREC66_UNMET held=6/8 checks=8 rev=dfc10536... rule=M66 | M4 MISS S207:quote-not-in-capture(under its transition provision) | M5 MISS S207:quote-not-live(under its transition provision)   exit=1
```
Cause: `norm` at `deprec66-probe.mjs:52-59` deletes `**`/`__`/backticks and collapses whitespace; `delink` is applied only to the snapshot (`:197`), never to `capText` (`:135`) or the bullet regex (`:144`). Any future row whose page links mid-sentence inherits this. Reported, not patched.

**K66ScribeEntry-3 — low, integration ordering: rows, entry, README row and pins must land in one commit.** A mined row's `used-by` names a file that must exist, and the README row's file must exist too. Demonstrated in the fixture by removing only the entry (rows and pins left in place):

```
SOURCES  error  USED_BY_MISSING  corpus/SOURCES.md:159  id=S207 missing used-by corpus/knowledge/mcp-deprecation-registry.md   (also :160 S208, :161 S209)
SOURCES_CHECK: DRIFT (USED_BY_MISSING)
README_MAP: DRIFT files=160 rows=161 covered=161 bad=2 first=orphan-row:knowledge/mcp-deprecation-registry.md
```

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeEntry/mcp-deprecation-registry.md` — the C2 entry draft (full file, 135 lines).
- `.ufo/waves/round-66/build/K66ScribeEntry/sources-rows.txt` — the three paste-ready SOURCES rows (S207–S209, 11 cells each, `mined`, opened `2026-10-27`, recheck `90d`).
- `.ufo/waves/round-66/build/K66ScribeEntry/pins-fragment.json` — three `.ufo/pins/source-captures.json` bindings (path/sha256/bytes/captured).
- `.ufo/waves/round-66/build/K66ScribeEntry/capture/{mcp-deprecated-2026-07-28.md,mcp-feature-lifecycle.md,omp-v18.12.6-mcp-transports-sse.ts}` — the fetched bytes, hash-equal to the pins.
- `.ufo/waves/round-66/build/K66ScribeEntry/integration-lines.txt` — the exact `corpus/README.md` row and `PROVINCE.md` frontier clause as scored.
- `.ufo/waves/round-66/build/K66ScribeEntry/INTEGRATION.md` — the four integration steps, the ordering constraint, the id-conflict note (a sibling seat's S207–S209 name the same three subjects; its S210/S211 are additive).
- `.ufo/waves/round-66/build/K66ScribeEntry/receipt-fixture.txt` — every probe and gate verdict above, verbatim, with revs.

## Limits

- **Fixture, not the lane.** 8/8 was scored on a clone at the freeze with my integration applied; the L1 must re-run the counter at `M`. I edited nothing in the lane.
- **M2/M3 depend on L1's commit, not on the draft.** The rows and pins are drafts; their correctness is only as good as the paste into `corpus/SOURCES.md` and `.ufo/pins/source-captures.json`, which I did not touch.
- **No execution.** No MCP session, server or `mcp.json` read: presence of `sse.ts` and of a `roots` declaration at the tag is not use at run time. The entry says so in § Bearing and § Limits.
- **Bundle not re-hashed.** Whether the installed `omp.real` carries `sse.ts` verbatim was not measured this round; S209 is the file at `v18.12.6`.
- **SEPs not opened.** SEP-2577, PR #2858 and SEP-2596 are labels taken from the page; whether SEP-2596 has reached Final is UNKNOWN, so the HTTP+SSE cell stays unresolved to a calendar date (stated in the entry).
- **Two mutants only.** I attacked M6 (cell pairing) and M4/M5 (link spans); M7's prose conditions and M2's cell validation were exercised by the passing run and the DRIFT demonstration, not by targeted mutants.
- **Page mutability.** S207 is the mutable `.md` rendering and S208 an unversioned community page; a reflow breaks nothing today but changes what `recheck: 90d` re-finds.
- **Only two counter soundness limits are shown.** They bound what 8/8 means here; they do not bear on the entry's wording, which is a non-author read.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeEntry/` (clone, fetches, mutants) deleted after the receipts above were copied into the build dir; no scratch path is cited as evidence.
