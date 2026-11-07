# K98ExecDebt — r97 closure item 2 candidate (sources-check selftest hermeticity)

Seat: K98ExecDebt. Candidate: `.ufo/waves/round-98/K98ExecDebt/sources-check.mjs` (sha256 `1def379fb98555c6a648f0585c0ff61faaf812218d688589e5c831bc16dd780b`, in READY/sha256.txt). Also `skill-row.md`, `diff.txt`, `selftest.txt`, `selftest-noroot.txt`, `selftest-badcensus.txt`.

Change (only lines 793–818 region, every other byte kept; see diff.txt): census root derived from `process.env.SHOKUNIN_ROOT` else `resolve(HERE,'..','..')`; census path = `<root>/scripts/sources-census.sh` then `<HERE>/../../scripts/sources-census.sh` (no hardcoded home path); `SHOKUNIN_ROOT` passed to census = derived root; census exit ∉ {0,1} with census found = FAIL `{ok:false}`; SKIP only for no-census-found and names both paths tried.

Receipts (evidence over prose):
- `selftest.txt`: `SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin node sources-check.mjs --selftest` → `SOURCES_SELFTEST: 71/71 pass`, `VERDICT: PASS`; arm `PASS r97sec-census-parity ... tool=[S001,S998] census=[S001,S998]`.
- `selftest-noroot.txt`: env without SHOKUNIN_ROOT, scratch copy whose `../../scripts` has no census → single `SKIP r97sec-census-parity: census script absent (tried .../noroot/scripts/sources-census.sh, .../noroot/scripts/sources-census.sh)`, `SOURCES_SELFTEST: 70/70 pass`, `VERDICT: PASS`, 70 PASS / 1 SKIP / 0 FAIL.
- `selftest-badcensus.txt`: SHOKUNIN_ROOT scratch root with `scripts/sources-census.sh` = `exit 2` → single `FAIL r97sec-census-parity`, 70 PASS / 1 FAIL / 0 SKIP, `SOURCES_SELFTEST: 70/71 pass`, `VERDICT: FAIL`.
- Real-lane identity: `node <candidate> --self /home/vgpnk/Projects/shokunin/kumitate-shokunin --json --today 2026-11-07` vs `node scripts/sources-check.mjs --json --today 2026-11-07` run from lane → `cmp` byte-identical (`JSON_IDENTICAL`). Note: candidate needs `--self` pointing at the lane because its default is `resolve(HERE,'..')` = the seat dir; that matches the untouched default semantics, and the comparison used the same lane as the real run.

Scratch `/fast/scratch/hyaku/kumitate-r98/K98ExecDebt/` created, used, and removed. Lane read-only respected; writes only in seat dir + this report. Tool: no installs; used system node/python3 only.

Risks/blockers: none. Candidate selftest requires `cap-spawn.mjs`/`cap-run.mjs` beside it (runtime import from `./cap-spawn.mjs`); during receipt runs they were copied from `scripts/` and removed after (they are not part of the candidate — the lane already has them). Acceptance met: candidate + READY, PASS/SKIP-only-that-arm/FAIL-that-arm, real-lane `--json` byte-identical.
