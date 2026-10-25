# Audit23 — Trend-Expansion: Temporal entry sourcing, band-4 addition, and separation from the failed frozen C2 counter

Seat: `L1Kumitate62.Audit23` (round-62 w2, reviewer). Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Lane HEAD inspected: `0cbe0d75e5a08718e2256408329692908c837766` (round-61 verifier spot-check). Read-only: no edits
except this report, no commits, no tests run, no external sources beyond the already-committed lane artifacts and the
w1 `SourceReopen` live reopen (performed by a sibling seat, cited below).

## 1. The object under review

The round-61 landed work: S195 registry row + knowledge entry `corpus/knowledge/temporal-worker-versioning-pinning.md`
+ pinned source capture (commits `15084153`, `019a844c`, `f351c520`; see `.ufo/reports/round-61/kumitate.md`).
The R61 trend verdict under attack: **expansion: improved** — "One A-tier row and one band-4 entry landed with a pinned
capture (census exit 0, 133→134). C2 does not verify, so this rests on the census and the receipts, not on D61."

## 2. Verified: the Temporal entry is sourced to opened, mined S195

**S195 row exists, exactly once, inside `## Registry`** — `corpus/SOURCES.md:147` (Registry spans lines 10–149; `## Paths`
begins line 153). `grep -c "^| S195 |"` → 1. The row splits into 13 fields = **11 contract cells**:

| contract cell | value |
|---|---|
| 0 | S195 |
| 1 | Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md |
| 2–3 | docs / A |
| 4 | scope: "the version-pinning contract for durable Workflow execution; the registry has not held this concepts page before" |
| 5 | locator: § Versioning behaviors → § Pinned Workflows, guarantee sentence; raw markdown opened 2026-10-25, HTTP 200, sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` |
| 6 | quote: "A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version." (13 words ≤ 25) |
| 7 | status = `mined` |
| 8 | opened = `2026-10-25` |
| 9 | recheck = `90d` |
| 10 | used-by = `corpus/knowledge/temporal-worker-versioning-pinning.md` |

**The row is genuinely opened+mined on the claimed date.** The opening record
`.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md` logs URL, access date `2026-10-25T09:40:58Z`,
HTTP 200, `content-type: text/markdown`, 9645 bytes, sha256, and the located grounding quote at body.md:39 (heading at
body.md:37), grep-count 1. `mined` status means the row was written after opening, per SOURCES header rules.

**Capture bytes match the pin and the live source.** `sha256sum .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
→ `8ef2ee5f…` = the row's sha256 cell = `.ufo/pins/source-captures.json` entry `S195` (path, sha256, bytes 9645,
captured 2026-10-25). Sibling seat `SourceReopen` (w1) re-fetched the live URL today: `HTTP/2 200`, same `last-modified`
(2026-10-24) and `etag`, diff live-vs-capture empty, sha256 equal; quote at line 39 exactly once, recheck grep returns 1.

**The entry is sourced to S195 and hygienic.** Entry header: `source: S195 — https://docs.temporal.io/worker-versioning.md — § Versioning behaviors → § Pinned Workflows / § Auto-Upgrade Workflows; § Continue-as-new, Child Workflow, and Retry Semantics`; `verified-at: 2026-10-25`; `recheck: 90d — <curl grep>`; `coverage-map: frontier band "Durable-execution and multi-agent failure research …" (PROVINCE.md §Frontier)`; `ground: frontier item 4`. `grep` for `S217|S216|S218` in the entry → **no match** (the staged campaign package cited S217; the lane entry uses only S195). The entry marks the retry-of-top-level-pinned case UNKNOWN rather than asserting it — it does not overclaim the source.

## 3. Verified: the entry genuinely adds band-4 knowledge

- **Frontier reading path extended to S195.** `corpus/SOURCES.md` `## Paths`: "Durable-execution band 4 — S106 → S117 → S126 → S133 → S190 → S194 → S195: … finally the Worker Versioning pinning contract (S195)" — S195 is the new terminal node; nothing in the path was rewritten.
- **PROVINCE.md band-4 line names the entry.** `PROVINCE.md:22` (raw): "advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract".
- **README map row added.** `corpus/README.md:182`: `| knowledge/temporal-worker-versioning-pinning.md | Temporal Worker Versioning: the pinned Workflow code-version boundary, Auto-Upgrade replay-safety duty, and version inheritance limits … | S195; .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/ |`.
- **Knowledge is new, not a restatement.** No earlier row holds the version-pinning concept: S016/S017 are Temporal activity definition/idempotency and failure-detection; S112 is workflow-execution replay (r58, failure-recovery-replay); S116 (visibility) and S120 (heartbeats) are rejects; S117/S126 are activity-heartbeat failure detection; S190/S194 are tail-at-scale/saga. The entry's content — Pinned-vs-Auto-Upgrade behavior, Deployment Version identity (name + Build ID), and inheritance limits for child/continue-as-new/retry/cron with explicit UNKNOWN — is a distinct clause of the band, matching the row's scope cell ("the registry has not held this concepts page before").
- **Census before→after carries the addition.** Receipt `.ufo/waves/round-61/close/census-after.txt`: `sources-census.sh validate` exit 0, 134 rows, A=111 B=15 C=8, six pre-existing W04 warnings unchanged. Before-receipt `base/census-before.txt`: 133 rows, A=110. A +1 = exactly S195; rows touched old→new: none.
- **Lesson Gate records the admission with the located evidence.** `corpus/lessons/round-61.md` Gate row: ADMIT, URL, date, 13-word quote, capture path:line, capture sha256 — and explicitly notes "claim C2 does not verify".

## 4. Distinguished: this trend is not the failed frozen C2 counter

C2 (`DOCTRINE61_HELD`, D61 v1, E1..E6) was a **predicate-verification claim** about the same S195 surface, frozen and
countered by `.ufo/waves/round-61/probe/doctrine61-probe.mjs`. It failed as declared on both sides:

- **Honest tip fails.** `close/a2-tip-doctrine61.txt` at `019a844c`: `DOCTRINE61_UNMET held=3/6` — E3 MISS `row-absent`, E4 MISS `pin=`, E5 MISS `exit=2`. Probe cause (probe source lines 17/21; w1 `AttackC1C2` §2.2–2.3): E3's finder `/^\|[[:space:]]*S195[[:space:]]*\|/` treats `[[:space:]]` as a literal JS class (space not a member), so the honest `| S195 |` row never matches, while a lookalike `|:S195:|` matches; and the probe reads status/opened/used-by at split indices 9/10/12 while the honest contract row carries them at 8/9/11.
- **Forged evidence passes.** `close/a2-repro-c2-forgery.txt` at `4247d2d` (phantom row outside Registry, fabricated 41-byte capture, invented digest): `DOCTRINE61_HELD held=6/6` exit 0. Bundle `controls/r61-c2-full-forgery.bundle` (sha256 `c5c01540…`) preserves the exact forged tree.

The **expansion trend verdict is a different statement, carried by different evidence**, and the R61 report says so
explicitly ("C2 does not verify, so this rests on the census and the receipts, not on D61"). My verification confirms the
trend's evidence holds **independently of D61**: the row, the capture bytes, the pin, the entry header, the PROVINCE/README/Paths updates, and the before→after census are all real committed objects that I re-checked directly (§2–3). The trend does not assert that C2 verified; it asserts a frontier state change, which is observable without any probe. A reader must not conflate the two: C2's failure does not invalidate the expansion, and the expansion does not rehabilitate D61 (the counter remains broken — E3/E4/E5 unsatisfiable on the honest row, satiable on the forgery — and would need the fix alignment listed in w1 `AttackC1C2` §5.3–5.5).

## 5. Findings by severity

- **[INFO] No defect found in the trend-Expansion evidence.** Sourcing (opened mined S195, pinned capture matching live bytes), band-4 addition (new concept in the frontier path, PROVINCE/README updated, census A+1), and separation from the failed C2 counter all check out.
- **[INFO] Confirmed boundary conditions worth carrying forward.** (a) The trend relies on hij census + committed receipts, not on D61 — if the census or receipts were ever compromised, the trend would need re-verification; the current receipts are sound. (b) `SourceReopen` notes both fetches hit the Vercel CDN representation (`x-vercel-cache: HIT`); evidence is of that cached entity — no origin figure, no impact on the pinned byte identity. (c) The S195 quote guarantees completion "on a single Worker Deployment Version" only; the entry correctly refuses to extend it (exactly-once, retry-version UNKNOWN).

## 6. Residual risk / verification gaps

- I did not re-run `sources-census.sh` (wave rule: no tests; also E5-style census runs are probe work). I verified the census claim from the committed before/after receipts plus my own row/path checks; the receipts are consistent (exit 0, 133→134, A+1).
- I did not re-derive the full 134-row registry independently (out of scope; Audit12 covers row schema, Audit13 covers used-by/README pins).
- The round-62 claim plan is not frozen and `.ufo/waves/round-62/plan/` is empty; nothing in round 62 (w1 or w2) proposes a new claim about S195, so there is no "new Temporal entry" beyond the inherited round-61 one to distinguish further.

## 7. Tool installs/updates

None (read-only wave; no packages installed, no binaries fetched).
