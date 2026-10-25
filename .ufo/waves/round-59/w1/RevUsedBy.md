# RevUsedBy — kumitate round 59

## Axes

operability, coverage. This file corroborates or falsifies the named used-by item. It is not a verdict on C1 or C2, and it does not print `DOCTRINE59_HELD`.

## Scope

Assigned item: in `corpus/SOURCES.md`, rows S125, S127 and S136 must be status `mined`, 11 cells, and used-by exactly `corpus/knowledge/mcp-orchestration-contract.md`. Quote each used-by cell. Attack: a pipe inside a cell.

Measured at score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. The item does not name the base. Probe E3 (`doctrine59-probe.mjs` lines 119–126) splits on `|`, requires `cells.length === 11`, `cells[7] === 'mined'`, and `cells[10]` *includes* the entry path, and fails the row if it contains `\|`. Census contract (`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` line 22 and line 69): no `|` inside any cell; 11 columns means `NF=13`. This seat checked exact equality of the trimmed used-by cell, which is stricter than the probe's `includes`.

## Revision identity

`2026-10-25T00:33:47Z`. `git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git cat-file -t` on that rev printed `commit`. `git merge-base --is-ancestor` of that rev against `HEAD` exited 0. `git status --porcelain -- corpus/SOURCES.md` printed nothing. `git diff --exit-code 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/SOURCES.md` exited 0. Worktree bytes of `corpus/SOURCES.md` match the score revision. Evidence: `.ufo/waves/round-59/build/RevUsedBy/00-identity.txt`.

## Executed checks

Blob via `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/SOURCES.md`, then `python3 .ufo/waves/round-59/build/RevUsedBy/check.py`. Started `2026-10-25T00:35:21Z`. Exit 0. Stderr empty.

Observed header of that run:

```text
blob_bytes=97779 sha256=dae027546be53767aba9265cf19ac8c9ee0ec3455b767e6b27f643cfd2bd37af lines=258
crlf=0 nul=0
```

Each id matched the probe row regex once (`match_count=1`). No second row.

| id | line | cells | status | exact used-by | pipe_count | backslash | escaped `\|` |
|---|---|---|---|---|---|---|---|
| S125 | 137 | 11 | mined | True | 12 | False | False |
| S127 | 138 | 11 | mined | True | 12 | False | False |
| S136 | 139 | 11 | mined | True | 12 | False | False |

`split('|')` length was 13 on each row (`slice(1, -1)` → 11). That is the census `NF=13` shape. Every cell's `interior_pipe` was False. Pipe-like scan (U+007C and the lookalikes in `check.py`, plus `\|`, `&#124;`, `%7C`) found only the 12 delimiter U+007C characters. Offsets:

```text
S125 line=137 pipe_offsets=[0, 7, 104, 111, 115, 256, 411, 535, 543, 556, 562, 611] count=12 backslash=0
S127 line=138 pipe_offsets=[0, 7, 186, 193, 197, 298, 442, 522, 530, 543, 549, 598] count=12 backslash=0
S136 line=139 pipe_offsets=[0, 7, 119, 131, 135, 218, 379, 457, 465, 478, 485, 534] count=12 backslash=0
```

Independent awk on the same `git show`, with `gsub` trim on `$9` and `$12` (exit 0, stderr empty):

```text
id=S125 NF=13 fields=11 status=mined used_trimmed=corpus/knowledge/mcp-orchestration-contract.md
id=S127 NF=13 fields=11 status=mined used_trimmed=corpus/knowledge/mcp-orchestration-contract.md
id=S136 NF=13 fields=11 status=mined used_trimmed=corpus/knowledge/mcp-orchestration-contract.md
```

`02-awk.stdout.txt` is the same NF/status read but its `used_trimmed` label was not trimmed. Do not quote that file for the cell value. The trim is `02b-awk-trim.stdout.txt` and the python quotes below.

## Used-by cells

Quoted from `git show` of the score revision (`04-quote.stdout.txt`). Raw is the field between the pipes, before trim. Trimmed is what the probe (`c.trim()`) and the census (`trim`) read.

S125 raw: `' corpus/knowledge/mcp-orchestration-contract.md '`
S125 trimmed: `'corpus/knowledge/mcp-orchestration-contract.md'`

S127 raw: `' corpus/knowledge/mcp-orchestration-contract.md '`
S127 trimmed: `'corpus/knowledge/mcp-orchestration-contract.md'`

S136 raw: `' corpus/knowledge/mcp-orchestration-contract.md '`
S136 trimmed: `'corpus/knowledge/mcp-orchestration-contract.md'`

The only extra bytes in the raw field are one leading space and one trailing space, the table padding. After trim, each cell equals `corpus/knowledge/mcp-orchestration-contract.md` and nothing else: no comma, no second path, no em dash. The probe's `includes` check and this item's exact check agree on these three cells. A comma-suffix would pass the probe and fail exact; these cells have no comma.

`git cat-file -t 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/knowledge/mcp-orchestration-contract.md` printed `blob` and exited 0. That is a resolvable pointer for the cell string. It is not an E3 pin check.

## Attack: a pipe inside a cell

Copies only. `corpus/SOURCES.md` was not edited. Three injections per live row, then the same splitter the probe uses.

1. Raw `|` appended inside the scope cell. On every id: `cells=12`, status moved off `mined` onto the teaches text, used-by became the recheck cadence (`90d` for S125 and S127, `180d` for S136), `exact=False`. A pipe in an earlier cell shifts both status and used-by.

2. Escaped `\|` appended inside the teaches cell. On every id: `cells=12`, `escaped=True`, status became `escaped-in-teaches`, used-by became the recheck cadence, `exact=False`. The probe's `row.includes('\\|')` arm would also fail. Live rows have `backslash=0`, so that arm is idle, not a miss.

3. Raw `|` appended inside the used-by cell (`path|pipe-inside-used-by`). On every id: `cells=12`, status stayed `mined`, `cells[10]` stayed the entry path, `exact=True`. Index 10 alone does not catch a pipe inside the used-by cell. The 11-cell check does. The item requires both. Live rows have both: `cells=11` and exact trimmed used-by.

The attack does not land on the committed rows. Twelve pipes, all delimiters, no backslash, no lookalike, no entity.

## Finding

**Named item corroborated** on `5469c0a58d7986ff8a5f203938ae1c8785a92213`. S125, S127 and S136 each occur once, status `mined`, 11 cells (`NF=13`), trimmed used-by exactly `corpus/knowledge/mcp-orchestration-contract.md`. A pipe inside a cell is absent. The same splitter, given a pipe inside a cell, either shifts status and used-by or inflates the count to 12. Neither happened on the live bytes.

Not inferred: `DOCTRINE59_HELD`, pin sha256 matches, or any claim score. E3's pin arm was not re-run.

No production file, registry, ledger, pin, Git index, or jj state was changed. No install, commit, push, or seat dispatch.

Report: .ufo/waves/round-59/w1/RevUsedBy.md
