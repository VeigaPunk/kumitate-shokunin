AUDIT RouteProbe3 anchors=3 false=3 overreverted=2 notice=bad verdict=refuted

# AuditRouteProbe3 — route-probe-cluster.md, group 3/8

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Pin: /fast/scratch/kumitate-r36/src @ 31c465f1 (clean; `probe-ufo-route-health.mjs` bytes equal `git show 31c465f1:…`, sha256 prefix 5264bb017ffd). Line numbers are 0614092-file numbers (add 1–2 for notice lines). T/F: the sentence's symbol is on that pinned line (substring test). EOF: beyond file length (ufo 1188 L, shared 159, kimi 147, models 244, redact 116, fake-omp 392).

## 1. State audited (the lane moved during the audit)
- Audited restoration: `5ceb8cd` (the commit this item describes; the file bytes are identical at a5d627b and 86c0676).
- Superseded: `5bc40d0` "reset four notes to 0614092 bytes (scope-accurate notice)". HEAD was `8c41439`; `c589b38` later changed only the notice's attribution text (anchor bytes unchanged; `git diff --numstat 0614092 HEAD -- corpus/knowledge/route-probe-cluster.md` → `1 0`, the notice line only). Against 0614092 the changed-anchor set is now empty. The group-3 anchors sit at base values and give the same counts (section 3).

## 2. Enumeration and group
- Changed anchor = a line-reference token whose resolved file+line differs between 0614092 and 5ceb8cd. Path-only additions are excluded. Bare numbers resolve to the file their 0614092 token named.
- 26 changed anchors in document order, A1 (L87) … A26 (L346); see section 4.
- Group g = {i : floor((i−1)·8/26) = g−1}, so group 3 = A8, A9, A10.
- Sensitivity: ceil(i·8/26) gives A7–A9, and numpy array_split gives A9–A11. Under both, every listed anchor is F/EOF and overreverted is 1 or 2.

## 3. Group 3

| id | note line · symbol | 0614092 | round-36 | restored | pinned line at restored value | verdict |
|---|---|---|---|---|---|---|
| A8 | L113 · `MAX_ROUTES` (`:49`) | :41 F | :49 F | :49 F | :49 = `const FAILURE_CLASSES = [`; `MAX_ROUTES` is `:45` | restored-but-false |
| A9 | L115 · `assertNoSecrets` (`:943`) | :939 F | :932 **T** | :943 F | :943 = `function parseMaxAgeMs(value) {`; `assertNoSecrets` is `:932` | restored-but-false; overreverted |
| A10 | L117 · `interpretPersistedHealth` (`:1186`) | :1037 F | :1030 **T** | :1186 F | :1186 = `}));`, tail of `main().catch` (`:1181–1188`); definition is `:1030` | restored-but-false; overreverted |

- Pinned reads (`read /fast/scratch/kumitate-r36/src/scripts/probe-ufo-route-health.mjs:45-49`, `:931-944`, `:1029-1034`, `:1185-1187`): `:45 const MAX_ROUTES = 16;`, `:49 const FAILURE_CLASSES = [`, `:932 function assertNoSecrets(value) {`, `:943 function parseMaxAgeMs(value) {`, `:1030 function interpretPersistedHealth(state, now = new Date()) {`, `:1186 }));`.
- Base lines at pin: `:41` `// cap alone would let the 64-file enumeration hold 4 GiB.`; `:939` `throw new Error("refusing to emit credential-shaped route-health output");`; `:1037` `const observedAtMs = Date.parse(state.observedAt);`. None holds its symbol.
- Base revision 964f443e (named by the S7 header; `git -C /fast/scratch/kumitate-r36/src show 964f443e:scripts/probe-ufo-route-health.mjs`): `:41`, `:939`, `:1037` hold their symbols. `:49`, `:943`, `:1186` are `"permission_denied",`, `// normalizes the emitted value …`, and `}`. The restored values are false at both revisions.
- Pin-true lines for these symbols: A8 `:45`, A9 `:932`, A10 `:1030`.
- Overreverted (round-36 true, restored false, base line lacks the symbol): A9 and A10. A8 is not overreverted, because `:49` was already false in round-36.
- Failing condition met: three of three restored anchors are not on their symbol.

## 4. All 26 positions (pin truth; reproduce with `python3 /fast/scratch/kumitate-r37/AuditRouteProbe3/truth.py`)

```
id   L     file   symbol                     base     r36      restored  note
A1   87    ufo    persistState               1080F    1080F    66F       bare 66, tested in ufo
A2   87    ufo    tmp                        1117F    1117F    66F       bare 66
A3   87    tpm    writeVerdict               40T      40T      66F       base-true, broken by repair
A4   100   ufo    Authorization              2-3F     72F      72F
A5   108   ufo    usage                      97F      108F     108F
A6   109   ufo    spawnCollect               678F     678F     813F
A7   112   ufo    DEFAULT_TIMEOUT_MS         39F      44F      45F
A8   113   ufo    MAX_ROUTES                 41F      49F      49F       group 3
A9   115   ufo    assertNoSecrets            939F     932T     943F      group 3, OVERREVERTED
A10  117   ufo    interpretPersistedHealth   1037F    1030T    1186F     group 3, OVERREVERTED
A11  118   ufo    healthy                    1174F    1174F    1346EOF
A12  120   ufo    ufo-route-health-error-v1  1191EOF  1191EOF  1358EOF
A13  129   tpsh   ROUTE_TIMEOUT_MS           23T      51F      51F       base-true, round-36 break not reverted
A14  133   tpsh   assertNoSecrets            30T      30T      943EOF    base-true, broken by repair
A15  148   tpk    process.exit               100T     39F      39F       base-true, round-36 break not reverted
A16  152   tpk    some(                      123T     140F     140F      base-true, round-36 break not reverted
A17  165   tpm    assertNoSecrets            110T     110T     943EOF    base-true, broken by repair
A18  178   redact redact                     67T      67T      92F       base-true, broken by repair
A19  193   fake   MODE                       31F      47F      47F
A20  196   fake   emit                       95T      95T      98T       substring match
A21  228   ufo    interpretRouteHealth       1164F    1164F    1015F
A22  309   ufo    spawnCollect (posture)     678F     678F     813F
A23  310   tpsh   CATALOG_COMMAND            20T      20T      84F       base-true, broken by repair
A24  310   tpsh   runOmpCatalog              51T      51T      84F       base-true, broken by repair
A25  311   tpsh   spawnSync                  51F      51F      84F
A26  346   ufo    PROBE_CONCURRENCY          61F      61F      784F
```
Counts (script): restored F/EOF 25 of 26; round-36 T turned F 8 (A3, A9, A10, A14, A17, A18, A23, A24), of which A9/A10 are overreverted improvements and the other six are base-true anchors the repair broke; base F/EOF 16; round-36 T but base F (discarded by the HEAD reset) 2 (A9, A10).

## 5. Notice (round-37 restoration, note lines 2–3)
- Present: yes, at 5ceb8cd, at 8c41439, and at c589b38 (current; the attribution now reads AuditRouteProbe1/2/6).
- Audited notice: BAD. Its claim "reverted to the lines their 0614092 sentences named" is false.
  - Round-36 changed 26 positions. The repair reverted 16 to 0614092, left 7 in place (A4, A5, A8, A13, A15, A16, A19), and moved 3 to values equal to neither (A7, A9, A10).
  - It also moved 16 positions that round-36 had left at 0614092 (A1–A3, A6, A11, A12, A14, A17, A18, A20–A26). Six of those were true at base and are false now (A3, A14, A17, A18, A23, A24).
  - L1's record `.ufo/waves/round-37/repairs.md:3-5` repeats "every symbol-keyed anchor … reverted to its 0614092 sentence line". The commit does not do that.
- Cause claim inverted for A9/A10: at the pin the round-36 lines hold their symbols and the 0614092 lines do not.
- Citation: "(spot-check D1)" resolves to `corpus/lessons/round-36-verifier-spotcheck.md:193-196`: "For each moved anchor, keep the base line wherever its symbol is still on that line." The audited restoration did not apply that condition. `.ufo/waves/round-37/falsify/AuditSighting4.md:65` says the D1 reference "was not located". It is at that path and line, so that seat's statement is wrong on this point.
- HEAD notice (c589b38; same text as 8c41439 except the attribution): the byte claim holds (numstat `1 0`). Its "so no anchor here is a round-36 artifact" misstates the scope. The round-36 values `:932` (A9) and `:1030` (A10) were true at the pin, and the reset discards them without saying so. "Pre-existing anchors … remain as ratcheted fidelity debt" is consistent: 16 base positions are F/EOF at the pin, and `.ufo/pins/fidelity-ratchet.json:18` holds a ceiling of 23 for this note (not re-measured note-wide; outside item scope). Against D1 the reset is not a repair, because it keeps base lines where the symbol is absent. Notice: bad (narrow).

## 6. Outside group 3 (cross-check only)
- A7 (`DEFAULT_TIMEOUT_MS` `:45`) and A11 (`healthy` `:1346`) are also false. Every anchor in A7–A11 is false under the audited restoration.
- Base-true anchors the audited repair left broken and did not revert: A13, A15, A16.
- EOF under the audited restoration: A11 `:1346`, A12 `:1358` (ufo, 1188 L); A14 `:943` (shared, 159 L); A17 `:943` (models, 244 L).
- Audited table rows (note L343–350) kept base numbers (`:39`, `:41`, `:22`, `:23`) while the body moved the same symbols to `:45`, `:49`, `:51`. HEAD resolves this by reset (8c41439 onward).

## 7. Evidence and tooling
- Audited diff: `git -C <lane> diff 0614092 -- corpus/knowledge/route-probe-cluster.md` (28 insertions / 26 deletions, including the notice). HEAD: `git diff --numstat 0614092 HEAD -- …` → `1 0`.
- Snapshots: `git show 0614092:…` (base), `git show 5833351:…` (round-36), `git show 5ceb8cd:…` (audited). Copies and `truth.py` are under /fast/scratch/kumitate-r37/AuditRouteProbe3/.
- Installs or updates: none. No package transactions. Writes: this report and /fast/scratch/kumitate-r37/AuditRouteProbe3/ only.
