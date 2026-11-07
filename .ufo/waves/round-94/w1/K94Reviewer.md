# K94Reviewer — hand review of the r94 C1 candidate (`round-gate` SOURCES-declared pins)

Reviewed bytes: `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20` (`.ufo/waves/round-94/K94ExecTool/round-gate.mjs`, mtime 20:51; revision "v2"). Revision "v1" `77f6470b…` was reviewed in full first; v1→v2 is comment re-wrap only (`K94Reviewer/candidate-v1-v2.diff` in my seat dir). `READY`/executor `diff.txt` were still pending at review close; my line-by-line diff against BASE (`git show 73317eca18c3927fc3c92fe492cd882dc4cda953:scripts/round-gate.mjs`, sha256 `09d4d792…` — byte-identical to the `a6e4da96…` copy) is `K94Reviewer/candidate-diff-vs-base.txt` (v1) and `K94Reviewer/candidate-v2-diff-vs-base.txt` (v2, source of the line numbers below). All receipt paths below are relative to `.ufo/waves/round-94/K94Reviewer/`.

**Verdict: no blocker defects. Counter `C94_C1: HELD` on both revisions.**

## 1. Hand-derived declared pin set (frozen rule, by grep/awk over `corpus/SOURCES.md`)

Method: registry rows = `^ {0,3}\|\s*S\d{3,}\s*\|` → 208 rows; 0 rows contain escaped `\|`. On each row, `https?://[^\s|`]+` URLs, split on `[/?#]`, keep segments matching `^[0-9a-f]{40}$`; drop rows whose 8th cell is `rejected`. Receipts: `registry-rows.txt`, `pins.tsv`, `declared-pins.txt`.

Declared 40-hex pins — 9 distinct (row ids, status):

| pin | rows | status |
|---|---|---|
| `140f211984e8a0c926ec305a550da425f9bb8d69` | S036 | queued |
| `183238ddacd0118a22399cd4743a5b5eaa43dbdd` | S210 | mined |
| `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2` | S070 | mined |
| `45c35e40c46166dc726ccc52f5d27f40f2449f99` | S053 S054 S055 S060 S068 S087 S088 S089 | mined |
| `79fa222e8390aed3494f4bc6746814e6c74c21cf` | S266 S267 S268 S269 | mined |
| `82d60be17d75e69b350c9fe77df2e8cac202ac11` | S214 S215 S216 | mined |
| `b3d28aceaa6d49f5f92258e3d06b61ad6f111e84` | S127 | mined |
| `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb` | S041 S083 S096 | mined |
| `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` | S080 | mined |

Excluded by `rejected` status: `e7f1a99fc52e68d8e8a2d99d59deba38e4272754` (S045) — the only 40-hex URL segment in the corpus on a rejected row. Non-registry lines of SOURCES.md carry no 40-hex URL segments (checked; receipt `candidate-diff-vs-base.txt` run log shows the empty grep).

## 2. Red-round token disposition (BASE `--json`, receipts `base-r{12,46,53,57,61,62,63,93}.json`)

| round | BASE unresolved | declared under rule? |
|---|---|---|
| 12 | `23e476e21` | no |
| 46 | `7af3d978` | no |
| 53 | `b717dc035bf687a3039123f4c70527bd3774f510` | no |
| 57 | `1cd6d667e20075fd2e77e6e655bc755f95e3d940` | no |
| 61 | `ab902da2fa30d051455a5f3563627e2c23c3a74d`, `4247d2d` | no |
| 62 | `4247d2da937842bd6846874d548b7125b356e14c` | no |
| 63 | `9237a72` | no |
| 93 | `79fa222e`, `79fa222e8390aed3494f4bc6746814e6c74c21cf` | **yes** — prefix of / equal to the S266–S269 pin |

Exactly round 93's two tokens are declared; the other seven rounds stay red. BASE unresolved sets equal the frozen `KEEP` literals in `probe94-c1.mjs`. Independent cross-check: my scratch regeneration + rerun of `ctl-positive` reproduces the frozen control output line-for-line (`ctlpos-rerun.txt`, tool_sha256 `c67dbc8d…` matches `controls/controls-sha256.txt`).

## 3. Rule sentence vs code (v2 line numbers)

- Row regex `:357` — `/^ {0,3}\|\s*S\d{3,}\s*\|/`, character-exact vs frozen rule.
- Status cell `:372` — `line.split('|')[8].trim().toLowerCase() === 'rejected'`: index 8 = 8th cell (verified against the 11-column header); ≡ L1 reference `/^rejected$/i` over trimmed cells. Backticks in cells do not affect `|`-splitting.
- URL regex `:359` — `/https?:\/\/[^\s|)`'"<>]+/g`, same terminator set as the L1 reference; verified no corpus URL is followed by any excluded char (all end at whitespace/pipe).
- Segment split `:363` — `/[/?#]/`; pin match `:361` — `/^[0-9a-f]{40}$/` (exact length, lowercase; corpus has only lowercase).
- Prefix test `:386` — `p.startsWith(tok)`.
- Placement `:453` — declared branch sits after the lane/main/origin probes and before the `mainProbeableNow() && originProbeableNow()` unresolved arm, identical to the L1 reference; a token resolving in any probeable repo can never be declared, so `COMMIT_CITED_NOT_ANCESTOR`/`external` paths are intact.
- No SOURCES.md `:370-373` — `readText` null (missing/unreadable) → empty pin set, no throw (`readText` at BASE `:214-216` catches all).
- `checked`/`external`/`notAncestor`/`unverifiable` semantics untouched; contract id unchanged.

## 4. Laziness

`:429-433` — `declaredPinsNow()` memoizes one read per `runChecks` call and is invoked only from the declared else-if arm: a report with no cited token, or whose tokens all resolve in lane/main/origin, never opens `corpus/SOURCES.md`. `--tracked` never calls `runChecks` (separate `runTracked` path, no citations object), so the header claim "read lazily, once per run" (`:120-121`) is accurate.

## 5. `citations.declared` on every JSON path

Success path init `:394`; fail-closed `--json` body `:686`. Both carry `declared: []`; the run body serializes the same object (`:682` region). New selftest arm (ix) `:1371` asserts present-and-empty on a clean audit run; counter arm (d) exercises the no-SOURCES fail-DRIFT path (`declared` len 0). The frozen `--json` top-level-key selftest is unaffected (citations sub-key, not a top-level key).

## 6. Header doc accuracy

`:77-80` (finding-kind entry) and `:112-124` (notes) restate the frozen rule verbatim, including "No SOURCES.md -> no declared pins", the laziness sentence, and the text-mode `declared=<n>` tail — verified against code in §3-§5.

## 7. New selftest arms 24b–24l (`:1228-1391`) — ten arms, each read

(i) 8-hex prefix of a URL segment on a mined row → declared, exit 0, no findings; (ii) full 40-hex → declared; (iii) pin followed by `#diff-1` fragment → declared (segment split on `#`); (iv) non-URL 64-hex digest inside a registry row → unresolved; (v) URL on a prose line outside the registry → unresolved; (vi) URL on a `rejected` row → unresolved; (vii) infix of a declared pin → unresolved (prefix, not contains); (viii) no `corpus/SOURCES.md` → unresolved, kinds exactly `[COMMIT_CITED_UNRESOLVED]` (so no `INTERNAL_ERROR`); (ix) `citations.declared` present and empty on a clean run; (x) text-mode detail is exactly `cited=2 unresolved=1 [deadbeef1234] declared=1`.

Every arm's assertion matches its name (one cosmetic nit, §9.3). Forgery teeth: each control forgery shape fails ≥1 arm — ctl-blanket→(iv)(v)(vi)(vii)(viii); ctl-substring→(iv)(v); ctl-anyline→(v)(vi); ctl-contains→(vii); ctl-norejfilter→(vi); ctl-slashonly→(iii); ctl-nothing→(i). Selftest prints `71/71 pass` (61 BASE + 10 new).

## 8. Counter runs (mine)

- v1 `77f6470b…`: `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1`, exit 0 — `score.txt`
- v2 `341726f3…`: `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1`, exit 0 — `score-v2.txt`

Both at `--freeze 73317eca18c3927fc3c92fe492cd882dc4cda953`, `base_sha256=09d4d792…`, `manifest_sha256=c5542d1a…` (matches frozen control runs). Live-corpus spot checks with the candidate gate (`cand-live-r93.json`, `cand-live-r61.json`, `cand-live-r12.json`): r93 → CLEAN, `declared=[79fa222e, 79fa222e8390…]`; r61/r12 → DRIFT with BASE's exact unresolved sets and `declared=[]`.

## 9. Defects

**Blockers: none.**

Non-blockers:

1. `:371-377` — status cell indexed by raw `split('|')`; a row with an escaped `\|` inside an earlier cell would mis-index the status column. Corpus has 0 such rows (`grep -c '\\|' registry-rows.txt` → 0); behavior is byte-identical to the L1 reference control. Latent only.
2. `:453` — the declared step precedes the probeability guard, so on a run with an unprobeable main/origin a nowhere-resolving declared token lands in `citations.declared` instead of `citations.unverifiable`. Same placement as the L1 reference; counter fixtures keep upstreams probeable, so counter-neutral; the frozen rule's "resolves in no probeable repo" does not disambiguate.
3. `:1371` — arm (ix) name ("…always present…") is broader than its single-fixture assertion; presence on other paths is covered by arm (i) and the probe fixtures. Cosmetic.

## 10. Residual risk / verification gaps

- Reviewed bytes are v2 `341726f3…`; the executor's `READY` (final sha) had not been written at review close. v1→v2 was cosmetic, but if the shipped bytes differ from `341726f3…` at integration, re-diff and re-run the counter before admitting (score receipts pin the sha they certify).
- K2 mutation survival (`mutate94.py`) and the K3 harm battery are K94Mutation / K94ExecHarm seats — not exercised here; §7 maps forgery shapes to selftest arms as static support for K2 only.
