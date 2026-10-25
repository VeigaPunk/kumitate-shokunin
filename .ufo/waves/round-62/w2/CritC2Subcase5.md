# C2 subcase 5 — arbitrary bytes with a matching invented digest

**Verdict: reproduced; independently prevents D61 v1 from verifying source provenance.** The frozen E4 accepts an invented capture after its author computes and inserts the matching digest. Its byte-for-byte hash agreement establishes only self-consistency, not that the bytes were captured from the claimed source. This is the named subcase “arbitrary bytes with a matching invented digest”; this report does not introduce a new round-62 claim or verdict.

## Frozen predicate

`.ufo/waves/round-62/probe/doctrine61-probe.mjs:20-21` reads the capture from the current worktree, computes SHA-256, extracts a digest-looking string from the selected S195 row in the measured revision, then tests only `pin.includes(sha.slice(0,16))`:

```js
const cap=join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md');let sha='';try{sha=createHash('sha256').update(readFileSync(cap)).digest('hex')}catch{}
const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l))||'';const pin=(row.match(/sha256 [0-9a-f]{64}/)||[])[0]||'';add('E4',!!sha&&pin.includes(sha.slice(0,16)),`pin=${pin.slice(0,24)} sha=${sha.slice(0,16)}`);
```

The exact row-finder has additional known defects (reported elsewhere); this reproduction uses the existing committed forgery fixture whose row satisfies it, isolating E4's self-pinning defect.

## Scratch reproduction and exact output

Scratch was isolated from lane state. I ran the frozen round-62 copy of the probe against the already-provided scratch fixture `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`, revision `4247d2da937842bd6846874d548b7125b356e14c`, with census root `/tmp/kumitate-r61-a2/fleet`. That fixture commits an invented 41-byte `body.md` (`fabricated capture: no source was opened\n`) and a row pinning its computed digest. No lane files were modified by this run. Exact probe output and exit:

```text
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=4247d2da937842bd6846874d548b7125b356e14c rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
PROBE_EXIT=0
```

The capture bytes and SHA are independently recorded in lane `.ufo/waves/round-62/w1/C2Bundle.md` lines 19-24 and 30-33: 41 bytes, exact content above; digest `15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d`; row is under `## Leads (unopened)`, outside `## Registry`. The same receipt reports that E3 selects this phantom row and E4 compares only 16 hex characters.

A separate tiny, filesystem-only check of the same E4 comparison showed an invented 46-byte payload hashes to `8ca36cbc56db755d8cc554bfbee1a436854217bf38bcbbd2113cc97549d149f7`; the E4 predicate `pin.includes(sha.slice(0,16))` is true for a pin computed from those same bytes. This confirms the arbitrary-bytes/self-digest mechanism without relying on the semantic claim that a digest is provenance.

## Does this independently prevent D61 from verifying?

**Yes, for the declared source-provenance behavior.** E4 is the only frozen check purporting to bind the capture to the S195 source row. The successful forged run above demonstrates E4 PASS with a capture that explicitly says no source was opened; neither a matching digest nor other independent checks in that run attest capture origin. E4 therefore cannot verify source provenance even if other predicate issues are repaired. Separately, the overall D61 honest-path failure has other independently demonstrated causes (notably E3 row parsing/schema); this report makes no claim that E4 is the sole reason the full probe fails.

**Residual limitation:** the reproduced full HELD fixture also exploits the known phantom-row / non-Registry issue. That does not account for E4 PASS: its self-consistent invented capture and digest are directly visible in the frozen worktree-hash / 16-hex-prefix predicate and fixture bytes. A robust revision-bound hash could still prove only byte identity, not that a source was genuinely opened; provenance must come from independently trusted acquisition evidence.

**Verification performed:** read-only inspection of the frozen probe and existing C2 fixture report; invoked the frozen probe on the provided scratch fixture and directly evaluated the hash predicate on arbitrary bytes. No tests, edits to code, tools installs, or changes to lane state.