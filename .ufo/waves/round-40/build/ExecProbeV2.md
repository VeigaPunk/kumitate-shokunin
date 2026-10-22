RESULT ExecProbeV2 rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=done attacks_accepted=20/26 benign_clean=10/10
Probe: /fast/scratch/hyaku/kumitate-r40/seats/ExecProbeV2/floor-probe-v2.mjs.txt (ESM, run from stdin; clones the lane at --rev, applies each named hand edit of the committed pin and/or note, runs that revision's own scripts/anchor-truth.mjs --base e18ff1af... --src /fast/scratch/hyaku/kumitate-pin/src, prints one line per case and two totals). Full output: /fast/scratch/hyaku/kumitate-r40/seats/ExecProbeV2/floor-probe-v2-output.txt.
Command run:
  node --input-type=module - --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af3392e3823227644c977c237737fe65c9 < floor-probe-v2.mjs.txt
Observed (verbatim, last lines):
  FLOOR_PROBE2 attacks_accepted=20/26
  FLOOR_PROBE2 benign_clean=10/10
  FLOOR_PROBE2 lane-rev=f69817edf687c8ce4f87ed7953a353399232f69e base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e open-supported=false
Per-case outcome (name: observed, expected refusal kind):
  P01-review-nosuchseat ACCEPTED (expected REVIEW_UNBOUND) — S8#92 source=review:NoSuchSeat token=the expect=true reads CLEAN.
  P02-P05-swap-451/453/454/455-456 ACCEPTED (expected BASE_TRUE_LOST) — the four BypassSwapRaws pair-mode coordinate swaps read CLEAN.
  P06-P10-reorder census#14, route-probe#71, sighting-wall#22/#42/#63 ACCEPTED (expected REVIEW_UNBOUND/BASE_TRUE_LOST) — review:probe-style run reversals read CLEAN.
  P11-debt-trade ACCEPTED (expected DEBT_NEW) — limit-debt-trade.py.txt style trade reads CLEAN.
  P12-headroom-73 ACCEPTED (expected DEBT_GREW) — 73 fresh false anchors at scripts/ufo-swarm-collect.test.mjs:2..74 read CLEAN (debt 4+73=77 = base 77, not greater).
  A1-closure-r38-missing-key REFUSED kinds=TOKEN_FORGED,BASE_TRUE_LOST; A2-valid-shaped-key REFUSED same; A3-forged-true-token REFUSED kinds=TOKEN_FORGED; A4-hand-source REFUSED exit=2 PIN_INVALID; A5-base-true-range-widened REFUSED kinds=BASE_TRUE_LOST; A6-earlier-true-copy REFUSED kinds=BASE_TRUE_LOST. Frozen replay: 0/6 accepted.
  ATK_SLOTS_ALL ACCEPTED (188 slot anchors, debt=208=base total); ATK_X1_REC38/REC40 ACCEPTED; ATK_REORDER_REC ACCEPTED; ATK_REBREAK ACCEPTED; ATK_RELOCATE2 ACCEPTED; ATK_TRADE ACCEPTED; ATK_FRESH ACCEPTED.
  B01-B05 (no-edit / prose-no-anchor / new-true-anchor / insert-earlier-anchor / review-paragraph-rewrap) all CLEAN.
  BEN_PROSE, BEN_REPAIR, BEN_INSERT_NOSHIFT, BEN_REKEY, BEN_UNCHECKED all CLEAN.
--open handling: the probe detects gate support by a dry run (`--open <rev> --zzz-detect`); at f69817ed the gate returns exit 64 with "unknown argument --open", so --open is not passed (open-supported=false). The same probe passes --open f69817ed... when run at a candidate gate that supports it.
Note: 20/26 attacks accepted = all 12 routed R39-1/R39-2/R39-3 cases (P01-P12) plus the 8 CritC1Design-named attacks; the six round-39 A1-A6 frozen-replay attacks stay refused (0/6), confirming the round-39 candidate fixes persist at round open. Benign controls 10/10 clean.
Tooling record: no system packages installed; used node (built-in), git (built-in), and the npm package acorn@8 (channel: npx --yes acorn@8) as a one-off local syntax check of the probe file during development; no lane or host state changed. Scratch only under /fast/scratch/hyaku/kumitate-r40/seats/ExecProbeV2/; the lane was only written at this report path.
