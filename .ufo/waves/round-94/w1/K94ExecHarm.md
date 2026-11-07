# K94ExecHarm — harm battery for the round-gate SOURCES-declared-pin swap (K3)

Seat K94ExecHarm (executor, harm battery). Round 94 / hyaku run 15, attempt 1.
Lane base = freeze `73317eca18c3927fc3c92fe492cd882dc4cda953`; candidate `scripts/round-gate.mjs`
sha256 `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20` (snapshot of
`.ufo/waves/round-94/K94ExecTool/round-gate.mjs`; `K94ExecTool/READY` later read the same sha,
`READY-MATCHES-CANDIDATE`, receipt `K94ExecHarm/ready-check.txt`).

## What ran

Sandboxes (deleted before yield; receipts copied here):
- `/fast/scratch/hyaku/kumitate-r94/K94ExecHarm/lane` — `git clone --shared` of the lane, detached at the
  freeze, toplevel asserted (`git -C … rev-parse --show-toplevel`).
- `/fast/scratch/hyaku/kumitate-r94/K94ExecHarm/{fbase,fcand}` — fleet clone + lane clone so round-gate's
  `resolve(HERE,'..','..')` main-repo/reports defaults resolve as they do live (this reproduces the live
  `round-gate --tracked` reading `checked=76` and the live bare audit `round=93`).
- No writes outside the scratch sandboxes and this seat dir. Candidate installed over
  `scripts/round-gate.mjs` and `pin.round-gate` re-pinned to the candidate sha **in the sandbox copies only**.

K3 battery, base vs candidate (same tree; candidate side after the sandbox `pin.round-gate` re-pin):

| tool | BASE | CAND | classification |
|---|---|---|---|
| `node scripts/proxy-check.mjs` | exit1 `PROXY: DRIFT` (A_wave 1471→1473, C2_total 239→240, coverage 10→9) | identical bytes, exit1 | same (inherited base red) |
| `node scripts/readme-map.mjs` | exit1 DRIFT `files=240 rows=239` | identical | same (inherited) |
| `node scripts/sources-check.mjs` | exit0 `SOURCES_CHECK: CLEAN rows=208` | identical | same |
| `node scripts/counter-pins.mjs` | exit0 `COUNTER_PINS: CLEAN pins=50` | identical | same |
| `node scripts/spotcheck-adopt.mjs --check` | exit1 `SPOTCHECK_COVERAGE: DRIFT`/`MAP: DRIFT` | identical | same (inherited) |
| `node scripts/round-gate.mjs --tracked --reports-dir … --main-repo …` | exit0 `CLEAN checked=76` | identical | same |
| `sources-census.sh validate --file …/SOURCES.md` (K3 "census validate") | exit0, 7×W04 | identical | same |
| `node scripts/surface-probe.mjs --checklists` (fleet-shaped sandbox) | exit1 `CHECKLIST: 37/47 pass` `VERDICT: FAIL` | exit1 `CHECKLIST: 38/47 pass` `VERDICT: FAIL` | item-level: 724 FAIL→PASS only |
| `node scripts/round-gate.mjs --round 93 --reports-dir … --main-repo …` | exit1 DRIFT, `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390aed3494f4bc6746814e6c74c21cf]` | exit0 CLEAN, no finding; `citations.declared=[79fa222e, 79fa222e8390…]`, `citations.unresolved=[]` | expected claim effect |
| `node scripts/round-gate.mjs --selftest` | exit0 `61/61 pass VERDICT: PASS` | exit0 `71/71 pass VERDICT: PASS` | same/expected (+10 arms) |
| bare audit in the fleet-shaped sandbox (`node scripts/round-gate.mjs`) | exit1 `DRIFT round=93` | exit0 `CLEAN round=93` | expected claim effect |
| `node scripts/proxy-check.mjs --strict` (checklist item 726) | exit1 same 3 DRIFTs | identical | same (inherited) |

Rounds 12 46 53 57 61 62 63 (base gate bytes from a scratch copy beside `cap-spawn.mjs`, same lane tree):
all seven outputs byte-identical, same unresolved literals (`[23e476e21]`, `[7af3d978]`,
`[b717dc03…]`, `[1cd6d667…]`, `[ab902da2… 4247d2d]`, `[4247d2da…]`, `[9237a72]`), still red. Round 93 flips
red→green. `--json` structural diff for round 93: only `citations.declared` added, `citations.unresolved`
emptied, `findings` emptied, `errors 1→0`, `verdict DRIFT→CLEAN`; the checks vector is otherwise identical.

Selftest: 71 = 61 + 10 new arms — (i)–(viii) rule arms, `--json citations.declared` always present, and the
text-mode `declared=<n>` detail. After mkdtemp normalization the 60 existing non-hermeticity case blocks are
byte-identical; the hermeticity case differs only in its embedded `61/61`→`71/71`.

## Pin inventory (who must be re-pinned at integration)

- `SCORECARD.md:321` `pin.round-gate=09d4d792…` is the **only** machine pin of round-gate bytes
  (`scripts/proxy-check.mjs:542` `PINS['pin.round-gate']`). Must be re-pinned to the candidate sha in the
  integration commit (sandbox demo: `cand/repin.txt`).
- `.ufo/pins/*.json`: none mention round-gate. Fleet `MANIFEST.json`: 11 prose mentions, 0 occurrences of
  the old sha. No script parses round-gate `--json`.
- `harm-matrix-gates.json` runs `round-gate --selftest` (verdict PASS at both revisions).
- Old sha `09d4d792…` in the live tree at measurement: `SCORECARD.md` only (1 file); all other occurrences
  are `.ufo/waves/**` frozen evidence (148 historical + the round-94 wave dir, which includes this seat's
  own receipts) — none is a pin declaration and none should be edited.

## Expected pin drift (demonstrated, not a regression)

With the candidate installed and the OLD pin, `proxy-check` emits
`PIN_DRIFT term=pin.round-gate declared=09d4d792… computed=341726f3…` (`cand/proxy-UNREPINNED.out`).
After the sandbox re-pin, `PROXY:` is byte-identical to base. Any integration that swaps the file without
re-pinning reads one extra `PIN_DRIFT` — expected pin drift, not harm.

## Candidate-independent control replay

The pre-data controls were regenerated from the base bytes with
`.ufo/waves/round-94/probe/make-controls94.py` into scratch: all eight regenerated files are **byte-identical**
to `controls/controls-sha256.txt` (`controls-regen-sha.txt` vs `controls-frozen-sha.txt`), i.e. the frozen
control bytes and generator are reproducible. The frozen counter on the regenerated `ctl-positive`
(`ctl-positive-probe94.txt`) reads `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1` exit 0 — the reference rule
passes the frozen predicate with no new selftest arms (arm (e) is the base 61/61 suite).

## Verdict

K3: **no harm** on every listed instrument: 8/8 compared tools and the census read the same or better
(round 93 red→green is the claim, not harm); no regression observed. Two expected drifts: (1) the
`pin.round-gate` re-pin, (2) the round-93 citation check and the +10 selftest arms.

## Caveats

- `K94ExecTool/READY` was absent while the first battery pass ran; it appeared at 20:55 with
  `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20`, byte-identical to the snapshot this
  battery tested (`test "$(cat READY)" = "$(sha256sum candidate)"` → `READY-MATCHES-CANDIDATE`). No re-run was
  needed. An earlier builder snapshot `77f6470b…` was also scored; the only delta to `341726f3…` was comment
  reflow, and its battery readings were identical.
- Checklist leg: run in fleet-shaped sandboxes (lane clone inside a fleet clone), one sandbox per side, so
  round-gate's `resolve(HERE,'..','..')` main-repo/reports defaults resolve as they do live. BASE 37/47 pass
  (fail: 724 726 738 740 743 745 746 749 756 757), CAND 38/47 pass (fail: 726 738 740 743 745 746 749 756
  757). Diff of the 47 item lines: exactly one change, 724 `Round-close artifact audit` FAIL→PASS (exit 1
  `DRIFT round=93` → exit 0 `CLEAN round=93`). Items 723 (selftest) and 725 (`--tracked`) pass on both
  sides; the nine carried reds are inherited/host-state reds (proxy `--strict` drifts, OMP host root,
  cap-run 11/12 under load 55, source-capture S269/S270, the missing README row for
  `lessons/round-93-verifier-spotcheck.md`, kimi score derived from the proxy).
- **Live-tree divergence (observation, not mine).** While this battery ran, the lane advanced to HEAD
  `54add172` (L1 M94-1 README adoption; `readme-map`/`spotcheck-adopt` are CLEAN there) and its working tree
  received an **uncommitted** `scripts/round-gate.mjs` sha256 `158062f8…`, 100663 B, mtime 20:59:40, while
  `SCORECARD.md` still pins `09d4d792` and `K94ExecTool/READY` still names `341726f3…` (that candidate is still
  stored there). Quick battery of the working-tree bytes in a clone of HEAD 54add172
  (`live-preview/summary.txt`): all K3 tools identical to base except r93 red→green and selftest 61/61→75/75 —
  the same profile as the READY candidate. **If integration commits bytes other than `341726f3…`, re-run this
  battery on the committed bytes and re-pin `pin.round-gate` to that sha.**
- Baseline reds on `proxy-check`, `readme-map`, `spotcheck-adopt` and the bare audit are present at the
  freeze tree (`lessons/round-93-verifier-spotcheck.md` has no README row there; the SCORECARD stanza is
  stale); they are unrelated to the candidate and unchanged by it. At HEAD `54add172` the README map is
  repaired and those readings are green.
