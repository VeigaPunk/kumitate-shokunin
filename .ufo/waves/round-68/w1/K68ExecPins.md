VERDICT: Round-68 counter pins are ready to write — a 5-entry fragment (both frozen counters, both committed controls, and the frozen plan) whose merged registry reads `COUNTER_PINS: CLEAN pins=39` over the freeze archive, with the subject pin left to the L1 because a placeholder fails the gate closed.

## Evidence

Freeze commit, from the lane log and the round-68 commit message: `39f61816d4ee7a8d401df42c1818c91a9c537bce` ("round-68: freeze plan + counters L68/M68 v1, base receipts, controls, validated v2 wave spec (66 seats)…"). No `.md` LOG entry names it (see Limits), so the pin hashes below use that commit explicitly.

Hashes computed twice, independently — `git show <freeze>:<path> | sha256sum` and sha256 over a `git archive 39f61816` extraction — and the generator re-hashes the extraction and exits 1 on any mismatch:

```
981f2daeb3c392b971ec5541f01fb3157cd78f176b905fa445b2b3431c4843e2  .ufo/waves/round-68/probe/ledger68-probe.mjs
f0a3142e82ba1791270217f60d9cbc9658df34e9169b4575d77bc776063a8f17  .ufo/waves/round-68/probe/deprec68-probe.mjs
6648cc31fe5e3f7bbf4295a105a91748ca30d072a3d850fb00595d708aca154d  .ufo/waves/round-68/probe/c1-controls.sh
c71c625a580c1e7bddbf09b8d64e0c1c684a457e0144f32a42d83f988b48294f  .ufo/waves/round-68/probe/c2-donothing.sh
476f2cb7c43f8167df569e90adc01204fdfed840aa668ea1d1b5fca7ddefb7a1  .ufo/waves/round-68/plan.md
f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5  scripts/routed-ledger.mjs   (v1 pre-image — must NOT be pinned)
```

Worktree bytes equal the frozen bytes for all six (`sha256sum` on the lane root, above).

Acceptance run (`.ufo/waves/round-68/build/K68ExecPins/validation.txt`, exit per section):
- A generator: `PINS_FRAGMENT: ready additions=5 merged_pins=39 freeze=39f61816…`, exit 0.
- B `diff <(git show 39f61816:.ufo/pins/counter-pins.json) counter-pins.json.proposed` → `206a207,236` only: the last round-66 object's closing brace takes a comma and the five round-68 objects are appended. No existing `round/name/path/sha256` value changes. (diff exit 1 = files differ, expected.)
- C `node scripts/counter-pins.mjs --registry <extraction>/counter-pins.json` → `COUNTER_PINS: CLEAN pins=39`, exit 0.
- D mutants over the same extraction (`--registry` base = extraction root): hash flip → `DRIFT pins=39 bad=1 first=ledger68-probe:hash-mismatch` exit 1; renamed target → `… first=deprec68-probe:absent` exit 1; `../base-registry.json` → `… first=c1-controls68:path-escape` exit 1; duplicated `ledger68-probe` → `FAIL-CLOSED reason=duplicate pin name "ledger68-probe"` exit 2; `sha256: null` subject entry → `FAIL-CLOSED reason=a pin entry lacks valid round/name/path/sha256(64hex)` exit 2.
- E isolated base with `scripts/routed-ledger.mjs` at its v1 digest → `COUNTER_PINS: CLEAN pins=1`; after appending 12 bytes → `DRIFT pins=1 bad=1 first=routed-ledger68:hash-mismatch` exit 1.
- F live lane today: `COUNTER_PINS: CLEAN pins=34` exit 0; `--selftest` → `COUNTER_PINS_SELFTEST: PASS (11/11)` / `VERDICT: PASS` exit 0.
- No proxy ripple: `sha256sum scripts/counter-pins.mjs` = `060d5d86…b29028e` = `SCORECARD.md:323 pin.counter-pins`; this fragment edits only the registry.

## Findings

K68ExecPins-1 — medium — the round-68 freeze pins nothing for round 68, and the gate's CLEAN hides it.
`git show 39f61816:.ufo/pins/counter-pins.json | grep -c '"round": 68'` → `0` (exit 1), while `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=34` exit 0. The frozen counters and committed controls are unprotected by the very gate that claims to bind them; only a registry edit closes this. Reproduce both commands.

K68ExecPins-2 — low — round 66 declared a plan pin it never wrote; the class recurs unless round 68 pins its plan.
`.ufo/waves/round-66/plan.md:53` says "The counter, its controls and this plan are pinned in `.ufo/pins/counter-pins.json` at this freeze", but the round-66 block of the registry holds only `ledger66-probe`, `deprec66-probe`, `c1-controls66`, `c2-donothing66` (`.ufo/pins/counter-pins.json:184-207`). The fragment therefore adds `plan68` (already frozen, hash computable now) so the declaration is true for this round. Reproduce: `grep -c '"name": "plan66"' .ufo/pins/counter-pins.json` → 0.

K68ExecPins-3 — medium (operability) — the subject pin cannot be written before close: a placeholder bricks the gate.
`scripts/routed-ledger.mjs` is edited until integration (`f92a36…` today, v1), and any non-hex/`null` digest makes the whole registry `FAIL-CLOSED` exit 2 (mutant t5), not DRIFT — i.e. a "pin it now, fix later" move silently disables the gate for every pin. The L1 must add `routed-ledger68` only after the final v2 edit, in one step, then re-run the gate.

K68ExecPins-4 — informational — appending is byte-safe but not append-only at file level.
The diff is a single hunk (`206a207,236`) because the last existing object's `}` gains a comma; the registry must be rewritten (or patched at that one byte) rather than concatenated. Use the proposed file verbatim — it is `JSON.stringify(doc, null, 1) + "\n"`, the existing format, and every pre-existing binding is preserved byte-for-byte.

## Exact JSON the L1 should write

Recommended: copy `.ufo/waves/round-68/build/K68ExecPins/counter-pins.json.proposed` (sha256 `12de300ed890c9c11b9b58da4d3d7f324752db68a8f8bcafbaf86762f8730219`, 39 pins) verbatim over `.ufo/pins/counter-pins.json`, then `node scripts/counter-pins.mjs` must print `COUNTER_PINS: CLEAN pins=39`. The five appended objects are exactly:

```json
[
 {"round": 68, "name": "ledger68-probe",  "path": ".ufo/waves/round-68/probe/ledger68-probe.mjs",  "sha256": "981f2daeb3c392b971ec5541f01fb3157cd78f176b905fa445b2b3431c4843e2"},
 {"round": 68, "name": "deprec68-probe",  "path": ".ufo/waves/round-68/probe/deprec68-probe.mjs",  "sha256": "f0a3142e82ba1791270217f60d9cbc9658df34e9169b4575d77bc776063a8f17"},
 {"round": 68, "name": "c1-controls68",   "path": ".ufo/waves/round-68/probe/c1-controls.sh",      "sha256": "6648cc31fe5e3f7bbf4295a105a91748ca30d072a3d850fb00595d708aca154d"},
 {"round": 68, "name": "c2-donothing68",  "path": ".ufo/waves/round-68/probe/c2-donothing.sh",     "sha256": "c71c625a580c1e7bddbf09b8d64e0c1c684a457e0144f32a42d83f988b48294f"},
 {"round": 68, "name": "plan68",          "path": ".ufo/waves/round-68/plan.md",                   "sha256": "476f2cb7c43f8167df569e90adc01204fdfed840aa668ea1d1b5fca7ddefb7a1"}
]
```
(pretty-printed with 1-space indent in the real file, matching `.ufo/pins/counter-pins.json`). `pins-fragment.json` is the same array in the file's exact formatting, for a patch-style merge.

At close, after the last v2 edit of the subject, append exactly one more object in the same style:
`{"round": 68, "name": "routed-ledger68", "path": "scripts/routed-ledger.mjs", "sha256": "<sha256sum scripts/routed-ledger.mjs>"}`
then `node scripts/counter-pins.mjs` must print `COUNTER_PINS: CLEAN pins=40`. Template (deliberately unwritable): `pins-optional-subject.template.json`.

Pinning `scripts/routed-ledger.mjs` is in-convention: rounds 53/55/56/58 pinned the round's instrument script (`receipt-attest`, `source-capture`, `source-dupes`, `readme-map`, `receipt-evidence`). Base receipts `base/ledger68-base.txt` / `base/deprec68-base.txt` were considered and left out: no round 53–66 precedent, and Q64 already binds them by commit; extend the fragment if the L1 wants tamper evidence there (receipt hashes: `4fc49ed77aab3a8c37ae6a0caca666985023468207d9f93e02d032a759881745`, `9b54a047e3b3039db106b168451a30698bbad75d54b04d5217b6530ddda26a15`).

## Artifacts

- `.ufo/waves/round-68/build/K68ExecPins/counter-pins.json.proposed` — the file to write (39 pins).
- `.ufo/waves/round-68/build/K68ExecPins/pins-fragment.json` — the five appended objects, registry formatting.
- `.ufo/waves/round-68/build/K68ExecPins/pins-optional-subject.template.json` — close-time subject entry, `sha256: null` on purpose.
- `.ufo/waves/round-68/build/K68ExecPins/generate-pins.mjs` — re-derives the fragment from a frozen extraction, asserting the freeze hashes (exit 0/1/2).
- `.ufo/waves/round-68/build/K68ExecPins/make-variants.mjs`, `validate-pins.sh`, `validation.txt` — mutants and the full acceptance run pasted under Evidence.
- `.ufo/waves/round-68/w1/K68ExecPins.md` — this report.

## Limits

- No LOG.md round-68 entry exists yet, so the freeze commit was taken from the commit message/log line, not a stated `Frozen:` line; if the L1's freeze is a different commit, every hash above must be recomputed (`git show <freeze>:<path> | sha256sum`) — the generator makes that one command.
- I did not edit `.ufo/pins/` or any integration surface; nothing here was copied into place, so the merged registry has only been exercised over a `git archive` extraction, never in the lane.
- `counter-pins --selftest` (11/11) and the live 34-pin CLEAN were run; no build/lint/QC gate beyond the gate under test was executed, per wave rules.
- The gate binds bytes, not semantics: a `plan68` pin proves the plan's text is unchanged, not that it is right; a control pin proves a script's bytes, not that its controls discriminate.
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecPins/` (extraction + mutants) is deleted before yield; receipts cited are the copies in `build/K68ExecPins/`.
