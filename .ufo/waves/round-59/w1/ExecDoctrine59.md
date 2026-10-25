# ExecDoctrine59 — D59 extraction re-read

Axes: operability, coverage. This seat measures C2 (coverage, rule D59) only. It does not score operability and does not edit the lane.

Measured revision: `5469c0a58d7986ff8a5f203938ae1c8785a92213` (commit; HEAD; ancestor of HEAD). Probe blob at that rev equals the file that ran (`bc2993bea72a69068861b22012e60022e1f9ecd8`). This report is not a verdict.

## Frozen predicate

DOCTRINE59_HELD — node .ufo/waves/round-59/probe/doctrine59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE59: DOCTRINE59_HELD held=5/5 checks=5 rev=<rev> rule=D59" and exits 0.

## Executed command

Working directory: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Started and finished `2026-10-24T21:30:48-03:00`.

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/probe/doctrine59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

## Observed result

Exit code: `0`. Stderr: empty (0 bytes).

Full DOCTRINE59 line:

```text
DOCTRINE59: DOCTRINE59_HELD held=5/5 checks=5 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=D59
```

Arm trailer (second stdout line, leading space included):

```text
 | E1 PASS trio | E2 PASS clauses=8 distinct=8 hash-miss=0 | E3 PASS rows+pins | E4 PASS admit=true fanout=true detect=true flips=2 | E5 PASS collisions=present empty=true regS124=true stagedS125=true
```

## Attack

Re-read each PASS detail from a path-limited `git archive` of `5469c0a58d7986ff8a5f203938ae1c8785a92213` (the probe's extraction: committed bytes, not the worktree). Cross-check: `git cat-file blob <rev>:<path>` sha256 equals the archive sha256 for every arm path. No `.gitattributes`, so no export-subst. No E-arm PASS detail failed that re-read.

### E1 PASS trio

Re-read detail: `trio`. Entry first line cites S125, S127, S136 and `modelcontextprotocol.io`. First five lines contain `verified-at: 2026-10-24` and `recheck:`.

```text
source: S125 https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture ; S127 https://github.com/modelcontextprotocol/ext-tasks/blob/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md ; S136 https://zenn.dev/komlock_lab/articles/mcp-stateless-spec-2026
verified-at: 2026-10-24
recheck: 90d
```

### E2 PASS clauses=8 distinct=8 hash-miss=0

Re-read detail: `clauses=8 distinct=8 hash-miss=0`. Eight `- ` receipt lines, eight distinct paths, each archive sha256 equal to the claimed digest (and to `git cat-file`).

| line | path | sha256 |
| --- | --- | --- |
| 17 | `.ufo/waves/round-59/build/ScoutMcpArch/body.html` | `3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca` |
| 18 | `.ufo/waves/round-59/receipts/quote-s125.txt` | `7a248183c670eadcd765225727d606a009313b53303868f9ce19ad9e2218a573` |
| 20 | `.ufo/waves/round-59/build/ScoutMcpTasks/body.md` | `5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5` |
| 21 | `.ufo/waves/round-59/receipts/quote-s127.txt` | `979e492a081e2f25086086ebf3162ecbcdd57d7ab2acd604ce078401811e6dde` |
| 23 | `.ufo/waves/round-59/build/ScoutZenn/body.html` | `64fd5551c7357e2ca4d65deac37dfa8b60050cc1fcfb16df83929501d97395b5` |
| 24 | `.ufo/waves/round-59/receipts/quote-s136.txt` | `2edb8ce1a4ffad88ce8fb1fb72635e5ce04251cb1aa5fe8a476800f188291ff9` |
| 28 | `.ufo/waves/round-59/assimilation/reg-ids` | `227bc4663eaadaa83b71d587c19fc40d9200608d100c5e3e719ef776e64b968c` |
| 29 | `.ufo/waves/round-59/assimilation/staged-ids` | `53d344e19fcd816bbcf945eb533a7142820caa5cf945eebde01a98eed2ad3e5f` |

### E3 PASS rows+pins

Re-read detail: `rows+pins`. S125, S127 and S136 each split to 11 cells, status cell `mined`, used-by cell exactly `corpus/knowledge/mcp-orchestration-contract.md`, no escaped pipe. Pin sha256 equals the archive blob for each capture path (same three digests as the E2 body rows).

### E4 PASS admit=true fanout=true detect=true flips=2

Re-read detail: `admit=true fanout=true detect=true flips=2`. `flip:` occurs twice.

```text
ADMIT mcp-orchestration-contract.md — frontier item 2, the uncovered MCP orchestration contract. Three rows, no others.
REJECT durable-execution-and-fanout-primitives-2026-10-24.md — right province band, wrong theme. This round's one theme is frontier item 2. The entry's ground (saga compensating action, Tail at Scale) is not item 2. flip: a later round whose one theme is band-4 primitives re-opens S190 and S194 and adopts it through the item-10 pipeline.
REJECT durable-execution-failure-detection.md — overlaps held surfaces, and its S126 URL is the same page as held S117. a shared page is not automatically a duplicate; the operational conclusion is to pin the duplicate group before adoption. This round does not adopt it and does not pin a group it did not open. flip: pin the S117/S126 group, then a later band-4 round may adopt the non-overlapping remainder.
```

### E5 PASS collisions=present empty=true regS124=true stagedS125=true

Re-read detail: `collisions=present empty=true regS124=true stagedS125=true`. `collisions` is present and 0 bytes (`sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`), so it has zero non-empty lines. `reg-ids` line 123 is the whole line `S124` (not only a substring). `staged-ids` line 1 is the whole line `S125`. The probe's unprinted conjunct also holds: `reg-ids` has no `S125` line and no `S125` substring.

## Finding

The named D59 item is corroborated at `5469c0a58d7986ff8a5f203938ae1c8785a92213`. The frozen counter printed `DOCTRINE59_HELD held=5/5 checks=5 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=D59` and exited 0. Every E-arm PASS detail was re-read from the archive extraction and matched. The attack did not land. This is the counter reading for C2, not a round verdict.

## Evidence

Paths are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

- `.ufo/waves/round-59/build/ExecDoctrine59/command.txt` — working directory, command, timestamps, exit.
- `.ufo/waves/round-59/build/ExecDoctrine59/stdout.txt` — complete stdout (301 bytes).
- `.ufo/waves/round-59/build/ExecDoctrine59/stderr.txt` — complete stderr (empty).
- `.ufo/waves/round-59/build/ExecDoctrine59/exit-code.txt` — `0`.
- `.ufo/waves/round-59/build/ExecDoctrine59/rev-identity.txt` — rev type, HEAD, named paths present, no `.gitattributes`.
- `.ufo/waves/round-59/build/ExecDoctrine59/extract/` — git archive of the arm paths and receipt blobs.
- `.ufo/waves/round-59/build/ExecDoctrine59/e2-reread.txt` — eight receipt hash matches.
- `.ufo/waves/round-59/build/ExecDoctrine59/e3-rows-reread.txt` — three source rows, cell counts, used-by cells.
- `.ufo/waves/round-59/build/ExecDoctrine59/e3-pins-reread.txt` — pin sha256 versus archive sha256.
- `.ufo/waves/round-59/build/ExecDoctrine59/e3-pin-objects.json` — S125, S127, S136 pin objects.
- `.ufo/waves/round-59/build/ExecDoctrine59/e5-reread.txt` — collisions length, S124 line, S125 absence in reg-ids, staged S125 line, probe-byte equality.
- `.ufo/waves/round-59/build/ExecDoctrine59/archive-vs-catfile.txt` — archive sha256 equals cat-file sha256.
- `.ufo/waves/round-59/build/ExecDoctrine59/reread-compare.txt` — probe detail versus re-read detail per arm.

No production files were edited. No commit, push, or other VCS mutation. No install.

Report: `.ufo/waves/round-59/w1/ExecDoctrine59.md`
