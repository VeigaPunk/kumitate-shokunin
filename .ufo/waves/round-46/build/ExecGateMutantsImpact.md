RESULT ExecGateMutantsImpact rev=516977af verdict=unchanged base=CLEAN fixture=CLEAN

Scope: a harm pre-check for C1. Question: does an edit at the selftest entry of scripts/cite-check.mjs disturb the frozen gate-mutants battery (SKILL.md:695, contract kumitate-gate-mutants-v2)?
Answer: no. Base and fixture produce byte-identical mutant rows (43/43 killed, frozen=41/41) and byte-identical selftest output (41/41).
What the edit does break is the `pin.cite-check` sha256 in SCORECARD's `kumitate-proxy-v1` block. That pin is not in `kumitate-gate-pins-v1`.
I installed no tools. The godspeed skill was not read because it lives under ~/.omp/agent, which the contract makes off-limits apart from RULES.md.

Setup. The clone was made exactly as the item specifies, at /fast/scratch/hyaku/kumitate-r46/seats/w1-ExecGateMutantsImpact/lane, with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE unset.
  base    = 516977af2216b1cc426ee970d260dee53714bf4f (`git rev-parse HEAD`; `git status --porcelain | wc -l` -> 0)
  fixture = a448304a72f00fc23120575bd3ede43307d5b236 (sandbox commit). It inserts one line after cite-check.mjs:95 (`import { fileURLToPath } from 'node:url';`), which is the last top-level import:
    if (process.argv.includes('--selftest') || process.argv.includes('--self-test')) for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR']) delete process.env[k];
  sha256 of scripts/cite-check.mjs: base 115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 -> fixture 001345e4f253c27a1925e134c771d9490592b34c6765ef784db12d5d4a50b749
  Every run used: KUMITATE_GATE_MUTANTS_TMP=<scratch>/gmtmp (mode 700) systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=512 timeout -s KILL 1500 <cmd>

Battery, SKILL.md:695 command `node scripts/gate-mutants.mjs`:
  base (08:18:40-08:19:27Z): exit=0
    GATE_MUTANTS_HEADER rev=working-copy cite-check=115bfde4…a4d8 wave-census=76447250…45f4 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f
    CONTROL cite-check PASS … cases=75/75 floor=75; CONTROL wave-census PASS … cases=32/32 floor=31 (CONTROL_AFTER rows were the same)
    GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=working-copy manifest=8486506f…bb12f leftovers=0)
  fixture (08:20:01-08:20:47Z): exit=0
    GATE_MUTANTS_HEADER rev=working-copy cite-check=001345e4…b749 wave-census=76447250…45f4 manifest=8486506f…bb12f
    CONTROL cite-check PASS … cases=75/75 floor=75; CONTROL wave-census PASS … cases=32/32 floor=31 (CONTROL_AFTER rows were the same)
    GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=working-copy manifest=8486506f…bb12f leftovers=0)
  Counts: killed 43 / survived 0 at both revisions (`awk '{print $3}' | uniq -c` -> `43 killed` both times). stderr was 0 bytes both times.
  Per-mutant comparison: `diff <(grep ^MUTANT base|sort) <(grep ^MUTANT fixture|sort)` -> no differences. Both files sha256 7e0347fa2ff501055a4115613b08355c5947fc1afa2a4a4e2da70e65d253606d.

Selftest, `node scripts/gate-mutants.mjs --selftest`:
  base: exit=0, `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0`, `VERDICT: PASS`
  fixture: exit=0, `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0`, `VERDICT: PASS`, `PASS all-manifest-literals-apply-once unapplicable=none`
  The two stdout files are byte-identical (sha256 d97455a42749da8dffa5a42b6908b29351b00c37b3d81fcd637c1a98495b11b5 for both).
  After each run, `pgrep -af <scratch>` found nothing and gmtmp/ was empty.

How mutants find their target text (scripts/gate-mutants.mjs at 516977af):
  - By literal text only. There are no line numbers and no file-sha pin.
    - MANIFEST (lines 153-201) is a list of {target,id,from,to} string pairs.
    - countOccurrences/applyLiteral (lines 593-603) apply a mutant only when `from` occurs exactly once (`text.split(literal).length - 1 === 1`, then `text.replace(from, to)`).
    - Any other count is `nomatch` (lines 679-681), and nomatch makes the run exit 2.
  - Sha256 appears only in these places, and none of them pins cite-check:
    - manifestSha256 (lines 270-273) hashes the manifest strings, not the target file.
    - formatHeader (lines 275-278) prints the target's digest for information only. Nothing compares it to a frozen value.
    - liveDigests (lines 776-780) and the integrity check (lines 1244-1249) compare digests taken before and after the same run.
    - Lines 688 and 700 check that the mutated bytes did not change during the run.
    - mutated-byte-header-digest (lines 1162-1164) hashes the selftest's own fixture, not cite-check.
  - A count dependency exists but is a floor: MIN_CONTROL_CASES cite-check=75 (line 35). It does not anchor on a position, and adding cases does not break it.
  - The selftest check all-manifest-literals-apply-once (lines 1155-1160) reads the live cite-check text and needs every `from` exactly once. The fixture passes it.

Why the fixture line is inert inside the battery: each selftest launches as `node --require <guard> --max-old-space-size=128 <file> --selftest` (line 415) with env sandboxEnv (lines 108-115: PATH, HOME, TMPDIR, LANG, TZ only). None of the five deleted keys is ever present there, so the battery cannot witness C1's behavior either way.

Risks for C1 at integration [INFERENCE, from the occurrence rule above; not run against a real C1 candidate]:
  - If the real C1 edit adds a second copy of any cite-check `from` literal, that mutant turns nomatch and the battery exits 2. The short, generic literals are most exposed: `return 64;` (parse-64), `process.env[INJECT41] !== undefined` (both guard-outer extras), `verdict: failed ? 'FAIL' : 'PASS',`, and `return verdict === 'FAIL' ? 1 : 0;`.
  - The fixture line contains none of these literals.
  - proxy-check.mjs and round-gate.mjs are not gate-mutants targets (TARGETS, line 36).

What must be re-pinned. Search for the base cite-check sha in the clone: `grep 115bfde46d6a24ce` over the clone.
  - The only live pin is SCORECARD.md:305 `pin.cite-check=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8`, inside `<!-- kumitate-proxy-v1` (lines 287-311).
  - The other hits are historical receipts under .ufo/waves/round-44 and round-45.
  - `kumitate-gate-pins-v1` (SCORECARD.md:312-318) pins anchor-truth, sources-check, wave-census, gate-mutants and omp-census, but not cite-check. A C1 edit leaves pin.gate-mutants (177f6cbb…) and pin.wave-census (76447250…) valid.
  - The same proxy-v1 block also pins the other two C1 files: pin.round-gate (line 307) and pin.proxy-check (line 308).
  - So at integration, all three of pin.cite-check, pin.round-gate and pin.proxy-check must be re-pinned. pin.proxy-check must be re-pinned last, per SCORECARD.md:270: "re-pin those files after ANY edit, including `proxy-check.mjs` itself".
  Measured in the clone, `node scripts/proxy-check.mjs --strict` wrapped with MemoryMax=4G, TasksMax=256 and timeout 900:
    base 516977af: exit=1. `PROXY: DRIFT (A_DRIFT … declared=16 computed=18 …; C2_TOTAL_DRIFT … declared=102 computed=103 …; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`. This drift already exists at base in a scratch clone and is not caused by this item.
    fixture a448304a: exit=1. Same three findings plus `PIN_DRIFT term=pin.cite-check declared=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 computed=001345e4f253c27a1925e134c771d9490592b34c6765ef784db12d5d4a50b749`.

Blockers: none. Lane files written: this report only. I made no git writes in the lane or fleet repos. Sandbox commits and checkouts happened only in the scratch clone, which is now detached at a448304a. No processes of mine are left.
