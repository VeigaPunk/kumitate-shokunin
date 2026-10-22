RESULT ReRunC2Census rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=reproduced before=<DRIFT,exit=1> after=<CLEAN,exit=0> K=53/53

Re-ran C2 counters at both revisions against live ~/.kimi-code at 20:59Z (receipt was 20:56Z; open receipts 19:52Z). Clones in /fast/scratch/hyaku/kumitate-r42/falsify/ReRunC2Census/{lane-before,lane-after}, --no-hardlinks, detached HEADs verified by rev-parse.

AT c9a084bf (lane-after):
$ node scripts/kimi-census.mjs; echo exit=$?
ROOT_ENUM  -  root children=35 declared=27 chain=8 strays=0
TOTALS: members=53 checked=53 errors=0 info=4 chain=8
KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)
exit=0
-- every line identical to c2-measured-c9a084bf.txt (FAMILY K1=4 K2=27 K3=10 K4=9 K5=3; CHAIN=8; agents/secondary=18; skills=7).

$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {K_members, K_sections, coverage_kimi}'
{"K_members":53,"K_sections":53,"coverage_kimi":10}   (receipt: same)

$ node scripts/kimi-census.mjs --selftest | tail -2
KIMI_CENSUS_SELFTEST: 52/52 pass
VERDICT: PASS   (receipt: same)

AT dfabe92 (lane-before):
$ node scripts/kimi-census.mjs; echo exit=$?
ROOT_ENUM  -  root children=35 declared=26 chain=8 strays=1
CENSUS  error  UNLISTED  locks  locks sits at the root and is not declared by the frozen K1-K5 set
TOTALS: members=52 checked=52 errors=1 info=4 chain=8
KIMI_CENSUS: DRIFT (UNLISTED locks)
exit=1   -- identical to open/receipts.txt lines 13-26.

$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {K_members, K_sections, coverage_kimi}'
{"K_members":52,"K_sections":52,"coverage_kimi":10}   (open receipts: same)

BYTE IDENTITY:
lane-after sha256 scripts/kimi-census.mjs a1bab1b5...0edb63, proxy-check.mjs 4c2819b0...8024a -- both equal the digests in the measured receipt header.
lane-before sha256 kimi-census.mjs ded569fe...6d3d08, proxy-check.mjs f9416d66...14d1d9 -- both equal open/receipts.txt.

HOST DRIFT since 19:52Z: none.
$ find ~/.kimi-code -mindepth 1 -maxdepth 1 -printf '%y %f\n' | sort   (at 20:59:34Z)
35 entries; diff vs the find listing committed inside c2-measured-c9a084bf.txt = empty (ROOT_IDENTICAL). No new root child, no removal; locks/ still present so the declared member is not MEMBER_MISSING.

Leftover node processes after runs: 0. No mutants or selftests of mutated files run (no prlimit wrap needed). No tools installed; pacman untouched. Files written: only this report inside the lane; scratch clones under /fast/scratch/hyaku/kumitate-r42/falsify/ReRunC2Census/.
