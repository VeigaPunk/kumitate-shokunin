# RevS121Gone — round 59 / w1

Item: In `corpus/README.md`, the failure-recovery-replay row and the round-58 lesson row must cite S112 and must not cite S121. Quote both rows' source-id cells. Attack: any remaining S121 in a map row. Axes: operability, coverage. Date: 2026-10-24.

**Item result: CORROBORATED.** This is not a claim verdict. At `5469c0a58d7986ff8a5f203938ae1c8785a92213` both named rows contain the source id S112 and neither contains S121. A scan of every map row found no remaining S121. The attack did not falsify the item.

## Revision binding

`git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git status --porcelain --untracked-files=all -- corpus/README.md` and `git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/README.md` both exited 0 with empty stdout. `git hash-object corpus/README.md` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/README.md` both printed `2a116230d40a1252df79781e0725401388c97aa7`. The quotes below are from that blob, not a dirty worktree. HEAD was not moved.

## Source-id cells

A map row is a line whose first non-space characters are `| ` (the `cite-sources` rule). The source-id cell is the third cell. The header is `| Entry | Covers | Primary sources |`. Each named entry cell occurs once.

failure-recovery-replay, line 172, entry `` `knowledge/failure-recovery-replay.md` ``. Row ids: S112, S122, S123 in Covers and again in the source-id cell. Row has S112. Row has S121: no.

Source-id cell:

```
S112, S122, S123; `.ufo/waves/round-58/build/`; `worker-heartbeat-liveness.md`, `at-least-once-dedupe.md`
```

sha256 `a518881f280554a7c9274410b444add1cee7ea517d76583b2de85fab8f5c99d7`. Cell ids: S112, S122, S123.

round-58 lesson, line 174, entry `` `lessons/round-58.md` ``. Row ids: S112, S122, S123, all in the Covers cell as `(S112/S122/S123)`. Row has S112. Row has S121: no.

Source-id cell:

```
`.ufo/waves/round-58/plan.md`; `.ufo/waves/round-58/close/`; `.ufo/reports/round-58/kumitate.md`
```

sha256 `f9225f9e8283bb54951bc821bc7db400ca4a02fc0a6bb6c8764ebc299d513a68`. Cell ids: none.

The lesson row cites S112 in Covers, not in the source-id cell. That is the same cell split as the base defect: at `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f` the lesson row's S121 lived in Covers (`(S121/S122/S123)`), and its source-id cell was already path-only. The scored row replaced that Covers citation with S112. The item's must is on the row, and the row cites S112. The source-id cell was quoted as required; it was not required to be the citation locus.

`lessons/round-58-verifier-spotcheck.md` is a different row (line 175). It is not the round-58 lesson row. It cites neither S112 nor S121.

## Attack — remaining S121 in a map row

```console
$ git grep -n -E 'S121' 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/README.md
```

Exit: `1`. Stdout: empty (0 bytes). No `S121` byte in the file, so none in a map row.

The same blob, scanned with the gate's row rule and `\bS[0-9]{3,}\b`, printed:

```
map-rows=142
coverage-map-pipe-lines=142 section-lines=12-178
map-rows-with-word-S121=0
map-rows-with-substring-S121-ci=0
coverage-section-word-S121=0
file-byte-S121=0 offsets=[]
file-ci-s121=0
```

Case-insensitive substring `s121` is also absent. The 142 pipe-lines are the Coverage map section, including the header and separator. No map row remains that cites S121.

Base contrast, not the scored surface: `git grep -n -E 'S121' 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f -- corpus/README.md` exited 0 and printed the two defective rows (entry line 172 source-id cell `S121, S122, S123`; lesson line 173 Covers `(S121/S122/S123)`). Those citations are gone at the scored revision. The attack's control shows the repair, not a surviving ghost.

## Evidence and scope

Captures are under `.ufo/waves/round-59/build/RevS121Gone/`. `commands.md` is the command/exit index. Primary captures: `failure-recovery-replay.source-id-cell.txt`, `round-58-lesson.source-id-cell.txt`, `failure-recovery-replay.line`, `round-58-lesson.line`, `extract.txt`, `attack.txt`, `score-grep.stdout.txt`, `score-grep.exit.txt`, `base-grep.stdout.txt`, `head.txt`, `readme.status.txt`, `readme.diffstat.txt`.

This seat did not run `repair59-probe.mjs`, `doctrine59-probe.mjs`, or `cite-sources.mjs`, and it does not attest REPAIR59 or DOCTRINE59. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/RevS121Gone/`. No install, pacman transaction, commit, push, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/RevS121Gone.md
