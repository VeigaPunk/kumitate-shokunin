# K65ExecHarmRegistry — proposed fixes (patch text; the L1 integrates, not this seat)

All three changes **strengthen** a reading; none relaxes a check. Context is the lane at
`47fe2383151909d31557ada118ad84f90404dc6c` (files identical at `2ca91a0c81542cad5f731049aa55dd2f99ade98d`
for these hunk contexts).

## 1. `scripts/harm-matrix-gates.json` — readme-map verdict regex (registry fix; shipped in `registry-v2.json`)

The v1 regex `^README_MAP: (\w+)` matches **two** logical lines when the map is red, because `emit()`
prints one `README_MAP: note <item>` line per bad item beyond the first (`scripts/readme-map.mjs:247`):

```
README_MAP: note unpinned:lessons/round-64-verifier-spotcheck.md
README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md
```

The tool's last-match-wins rule happens to land on `DRIFT` only because the note lines are emitted
first. Pin the verdict word instead:

```diff
-    { "id": "readme-map", "argv": ["node", "scripts/readme-map.mjs"], "verdict": "^README_MAP: (\\w+)", "clean": ["CLEAN"], "timeout": 60 },
+    { "id": "readme-map", "argv": ["node", "scripts/readme-map.mjs"], "verdict": "^README_MAP: (CLEAN|DRIFT|FAIL-CLOSED)\\b", "clean": ["CLEAN"], "timeout": 45 },
```

Measured: matches 2 -> 1 at base (`DRIFT`), 1 -> 1 at tip (`CLEAN`). `USAGE` (exit 64, stderr) still
reads as no-verdict/FAIL_CLOSED, never as clean. The alternative (fix `scripts/readme-map.mjs` to emit
notes under a different prefix) is **not** proposed: `README_MAP:` note lines are quoted in committed
corpus/lesson text and in round receipts, so a prefix rename would break citations.

## 2. `scripts/plan-before-ready.sh:650` — keep the run's temp path out of the verdict line

```diff
-  echo "PLAN_BEFORE_READY_SELFTEST: $([ "$fail" -eq 0 ] && echo PASS || echo FAIL) ($pass/$((pass+fail))) fixtures=$root"
+  echo "PLAN_BEFORE_READY_SELFTEST: $([ "$fail" -eq 0 ] && echo PASS || echo FAIL) ($pass/$((pass+fail))) fixtures=mktemp"
```

Why: `scripts/harm-matrix.mjs` compares a gate's *text* at the two revisions to separate CARRIED from
CARRIED_MOVED (`transition()`: `b.text === t.text ? 'CARRIED' : 'CARRIED_MOVED'`). `$root` is
`mktemp -d`, so two identical FAIL runs never compare equal. Measured, three runs of the same revision
class:

```
PLAN_BEFORE_READY_SELFTEST: PASS (38/38) fixtures=/tmp/pbr-selftest.7JSnpS
PLAN_BEFORE_READY_SELFTEST: PASS (38/38) fixtures=/tmp/pbr-selftest.VQF2sH
PLAN_BEFORE_READY_SELFTEST: PASS (38/38) fixtures=/tmp/pbr-selftest.7lkY0e
```

Today the gate is clean at both ends so the difference is unread; on a red pair it is a guaranteed
CARRIED_MOVED (an unranked row that reads like movement). Nothing else parses the `fixtures=` field:
`base/plan-before-ready-selftest-freeze.txt` quotes `PASS (38/38)` only, and `counter-pins` does not
pin `scripts/plan-before-ready.sh` (measured: `grep -c plan-before-ready .ufo/pins/counter-pins.json`
= 0).

## 3. `scripts/harm-matrix-gates.json` — timeouts sized from measurement (shipped in `registry-v2.json`)

Four incumbent rows declare a timeout more than twice the measured worst case, and four exceed the
120 s budget the round allows (`round-gate-selftest` 180, `report-receipt-diff-selftest` 180,
`plan-before-ready-selftest` 180, `harm-matrix-selftest` 300). Measured worst of three runs on this
host: 27.8 s, 3.3 s, 3.9 s, 7.2 s. `registry-v2.json` sets `timeout = clamp(ceil(5 x max_ms, 10), 45, 120)`.
No gate measured above 27.8 s, so every row holds the round's `<= 120 s` rule with >= 4x headroom.

## 4. `scripts/harm-matrix-gates.json` — admit `cite-check` with its fleet parent pinned (registry fix; shipped in `registry-v2.json`)

`cite-check` reads its **parent directory** as the fleet root when `--fleet` is absent
(`scripts/cite-check.mjs:272`: `if (!opts.fleet) opts.fleet = dirname(opts.self)`). Under
`harm-matrix` every sandbox is `/tmp/harm-matrix.XXXX`, so the bare gate reads `/tmp` — host
state shared with every other seat — and the verdict moves with it. Measured in one base sandbox
(identical tree, `ls-files` 15142 both, `files=161 tokens=12033` both):

```
$ node scripts/cite-check.mjs                     -> CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1545 warnings=771)
$ node scripts/cite-check.mjs --fleet /tmp        -> CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1506 warnings=768)
```

`--fleet .` pins that category inside the sandbox and is stable across three different parent
directories (`/tmp/kumitate-r65/...`, `/tmp/k65alt/sb`, tool-style `--no-checkout` sandbox):

```
$ node scripts/cite-check.mjs --fleet .   -> CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1545 warnings=766)   x3, exit 1
```

```diff
+    { "id": "cite-check-fleet-dot", "argv": ["node", "scripts/cite-check.mjs", "--fleet", "."], "verdict": "^CITE_CHECK: (\\w+)", "clean": ["CLEAN"], "timeout": 45 },
```

Do **not** ship the bare form: its reading is a function of `/tmp`, so a same-revision pair can read
CARRIED or CARRIED_MOVED at random. A deeper repair (cite-check refusing a `--fleet` that is not the
lane's own parent, or deriving it from `.ufo/pins/origin.json`) is the owner's call; the registry-level
pin is enough to make the gate honest today.

## Not proposed (reported instead)

- Excluding `cite-check` as "heavy": measured 2.5-3.7 s at base with `--fleet .` (10.6 s bare at tip on
  a loaded host), `--selftest` 1.6-2.1 s. The plan's stated limit is stale for that gate.
- `report-receipt-diff` has the same `dirname(laneAbs)` fleet default (`scripts/report-receipt-diff.mjs:501`)
  in its main mode; the registry only runs its hermetic `--selftest`, so no registry change is needed.
- Adding `wave-census` bare: exit 64 usage, zero verdict lines — vacuous as a gate.
- Any change to `controls/harm/`, the H65/O65 counters, or the pinned digests.
