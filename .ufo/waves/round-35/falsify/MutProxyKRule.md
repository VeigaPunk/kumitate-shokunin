ATTACK C3 verdict=holds defects=0

## Scope and axes
- Assigned target only: `scripts/proxy-check.mjs:352` (`K_MEMBER_RULES` root `mcp.json`) and `:1153` (`FX_KIMI_FILES`).
- Lane axes: operability + coverage; judged sub-axis: coverage:kimi-layer.
- Four independent one-line mutants; no combined mutations, contract changes, integration, or shipping.
- Scratch root W: `/fast/scratch/kumitate-r35/w/MutProxyKRule`.
- Copied the uncommitted lane tree into W/pristine, excluding `.git`, `.jj`, `.ufo`; made four independent copies. All pristine copies reproduced the claimed proxy counts.
- Upstream source for every external gate invocation: `/fast/scratch/kumitate-r35/src` (binding pin `31c465f1`).

## Commands and bounded detector
Each case directory (`delete-rule`, `kind-dir`, `path-tilde`, `fixture-drop`) ran both exact Node argv below in the pristine, mutated, and restored stages:
```sh
node scripts/proxy-check.mjs --selftest --src /fast/scratch/kumitate-r35/src
node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src --json
```
- Cwd: `W/<case>`; environment overrides: `TMPDIR=W/tmp/<case>`, `KIMI_ROOT=/home/vgpnk/.kimi-code`; inherited `KUMITATE_PROXY_NESTED` removed so the full suite ran.
- Each process had a 120-second outer deadline. All 24 invocations completed without timeout; selftest runtime was Node v26.12.0.
- Independent cases/detectors ran concurrently within each stage; mutation and restoration happened only after the preceding stage completed.
- Expected detector: selftest's literal hand-arithmetic `K_members=30` assertion must fail if the added rule or fixture member stops contributing. Live JSON must expose lost member/section terms for the three rule mutants; fixture-only mutation has no live K-term effect.

## Baseline and restoration outputs
All four pristine runs and all four restored runs returned:
- Selftest: exit 0, `PROXY_SELFTEST: 107/107 pass`, `VERDICT: PASS`.
- JSON: exit 0, `"verdict":"MATCH"`, `"errors":0`, `"warnings":1`.
- Actual selected terms: `A=7`, `S_members=88`, `S_sections=88`, `R_members=92`, `R_sections=83`, `K_members=51`, `K_sections=51`, `coverage_kimi=10`, `pinsMatched=6`, `pinsTotal=6`.
- The existing warning was `PIN_UNPINNED` for `scripts/sources-check.mjs`; it was not a mutation-induced failure.

## Mutants and actual outputs
All four mutant selftests returned exit 1, `PROXY_SELFTEST: 44/107 pass`, `VERDICT: FAIL` (63 failed assertions each).
Their first failed assertion reported the same behavioral mismatch:
```text
FAIL  [  1/107]  MATCH: A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5 (literal verdict) — exit=1 PROXY: DRIFT (K_MEMBERS_DRIFT term=K_members declared=30 computed=29 delta=-1)
```

| Mutant | Exact original target and change | Actual live JSON output (selected fields) | Verdict |
|---|---|---|---|
| delete-rule | `scripts/proxy-check.mjs:352`: delete the entire `mcp.json` rule | exit 1; DRIFT; errors=3; K_members=50; K_sections=50; coverage_kimi=10; pinsMatched=5/6 | killed by selftest and live K-term drift |
| kind-dir | `scripts/proxy-check.mjs:352`: change only `kind: 'file'` to `kind: 'dir'` | exit 1; DRIFT; errors=3; K_members=50; K_sections=50; coverage_kimi=10; pinsMatched=5/6 | killed by selftest and live K-term drift |
| path-tilde | `scripts/proxy-check.mjs:352`: change only `path: 'mcp.json'` to `path: '~/.kimi-code/mcp.json'` | exit 1; DRIFT; errors=3; K_members=50; K_sections=50; coverage_kimi=10; pinsMatched=5/6 | killed by selftest and live K-term drift |
| fixture-drop | `scripts/proxy-check.mjs:1153`: delete `'mcp.json',` from `FX_KIMI_FILES` | exit 1; DRIFT; errors=1; K_members=51; K_sections=51; coverage_kimi=10; pinsMatched=5/6 | killed behaviorally by selftest; live JSON detects pin change only |

For the three rule mutants, live JSON error findings were exactly:
```text
K_MEMBERS_DRIFT: K_members: declared=51 computed=50 delta=-1
K_SECTIONS_DRIFT: K_sections: declared=51 computed=50 delta=-1
PIN_DRIFT: pin.proxy-check (declared baseline hash; computed mutant hash below)
```
For fixture-drop, the sole live JSON error finding was `PIN_DRIFT` for `pin.proxy-check`.
All mutant JSON runs retained the same single `PIN_UNPINNED` warning as baseline.
The scalar coverage stayed 10 for the rule mutants because both numerator and denominator fell together; the exact-term assertions, not the scalar, detected the loss.
Minimal undo for each injected defect: restore the original rule at :352 (`path: 'mcp.json', kind: 'file', secret: true`), or restore the fixture member at :1153. All four undos were applied; no lane fix is indicated by this probe.

## Before / mutated / restored SHA-256
Hash commands ran from W:
```sh
sha256sum pristine/scripts/proxy-check.mjs delete-rule/scripts/proxy-check.mjs kind-dir/scripts/proxy-check.mjs path-tilde/scripts/proxy-check.mjs fixture-drop/scripts/proxy-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs
sha256sum delete-rule/scripts/proxy-check.mjs kind-dir/scripts/proxy-check.mjs path-tilde/scripts/proxy-check.mjs fixture-drop/scripts/proxy-check.mjs
```
The first command ran before mutation and after restoration; the second ran on mutant bytes.
Baseline B = `e58c08017508482fc63620c311681a3783849ddf42e1b34f53900d31a35cc647`.

| Case | Before | Mutated SHA-256 | Restored |
|---|---|---|---|
| delete-rule | B | `0af613ecb7df5dee91912d7b555de513ae4343f95efbf53c8a7f680a8883fb9e` | B |
| kind-dir | B | `91413434cda019591cd3e6e7d5b17a8ed73a2bd38bc001b19df0abffe0b54b88` | B |
| path-tilde | B | `d52ad586d775005958cb41be9adf02331790f9e03c368911aec60fa37e3d1801` | B |
| fixture-drop | B | `74e758bdf47b73efc30b7242190ec8a331240622c709042c478da56ff83f78f9` | B |

The untouched pristine copy and lane script also hashed to B both times. Exact byte restoration is established by equal SHA-256 plus the restored detector outcomes, not merely by reversing the intended text.

## Evidence and limits
- Complete stdout/stderr and command/cwd/deadline-result metadata: `W/logs/<case>.<pristine|mutated|restored>.<selftest|json>.{stdout,stderr,json}`.
- Aggregated actual results, hashes, first failures, and JSON findings: `W/results.json`.
- Result: killed 4/4, survived 0/4, inconclusive 0/4. Selftest behaviorally killed all four; live JSON behaviorally killed three and detected the fixture-only edit through its pin.
- No production files changed; the only lane write was this report. No host configuration or secret file contents were read by this probe; the gate's K walk used metadata/name enumeration. No tools installed or updated.
- Scope does not exercise the census's 0400 floor or prove general completeness; no broader C3 conclusion is claimed.
