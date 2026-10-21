ITEM FixS747 anchors=1 move=1 token=0 move_token=0 debt=0
VERDICT route-probe-cluster#84 MOVE 108 | pin 108 `if (argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h")) {` is the sole-argv --help guard and the only exit-0 path (exit is pin 110 `process.exit(0);`); pin 99 is the PROBE_USAGE string literal with no --help and no exit, so the current anchor is wrong
EVIDENCE
1. Pin HEAD: git -C /fast/scratch/kumitate-r36/src rev-parse HEAD -> 31c465f15669f744848bd9f5d56191c5085670f7 (matches pin).
2. Lane note at 753446a: git diff --stat 753446a829edda519c75777ce95888443f51fa94 -- corpus/knowledge/route-probe-cluster.md -> empty (identical to working copy). Sentence spans note 211-218; the `:99` span sits on note line 218: "while `--help` / exits 0 (`:99`)."
3. Pin 98-99: `const PROBE_USAGE =` / `  "usage: probe-ufo-route-health --route provider/model[:effort] [--route ...] [--timeout-ms N] [--state .ufo/...json --max-age-ms N]";` (string literal; no `help` word, no exit).
4. Pin 101-105 usage(): 103 `console.error(PROBE_USAGE);`, 104 `process.exit(2);`.
5. Pin 107-111 parseArgs: 108 guard, 109 `console.log(PROBE_USAGE);`, 110 `process.exit(0);`. Pin 1158 main(): `parseArgs(process.argv.slice(2))`.
6. Pin 170 `if (argument === "--help" || argument === "-h") usage();` is the loop path and exits 2 (a mention on another path, not this claim). `--help` occurs on pin lines 108 and 170 only.
7. Observed on pin (cwd /tmp, node v24.21.0, parse-time exit, no live call): sole `--help` -> usage on stdout, rc=0; `--help --help` -> usage on stderr, rc=2.
8. Gate scripts/anchor-truth.mjs: norm() strips leading `-` (token -> `help`); wb() uses class [\p{L}\p{N}_$]; `help` matches on 108 and 170, not 99. judge(108)=true, judge(99)=false. Lexically 170 also passes, so the choice of 108 is semantic (exit 0), not gate-driven.
9. Prose caveat: "exits 0" holds only for a sole argv `--help`/`-h` (108 `argv.length === 1`); with other args it exits 2 (170).
10. The note's own excerpt (note 513-516: PROBE_USAGE:87, process.exit(2):93, parseArgs:96, process.exit(0):99) is exactly 11 below the pin (98, 104, 107, 110). The pin's exit line 110 has no `--help` token, so a single-line anchor must sit on 108.
11. Alternative not chosen: 108-110 also keeps the token on the cited lines and includes the exit; rejected because this is a single-point claim and the format is one line.
12. Not verdicted (other ids in the same paragraph): `:87`, `:93`, `:96`, `:45`, `:47`, `:203-208`, `:209`, `:994`. Installs: none.
