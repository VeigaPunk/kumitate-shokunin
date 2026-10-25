# R19 — R60-DeadTable blob IDs

**Finding: no hash mismatch in the three core input rows.** Recomputed directly from committed revision `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` using `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse <rev>:<path>`:

| Input | Recomputed blob ID | Dead-table value | Result |
|---|---|---|---|
| `.ufo/waves/round-60/w1/launcher-progress.tsv` | `df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66` | same | match |
| `.ufo/waves/round-60/w1-launcher.log` | `d014d43024ed437d8f7b6741712f41647b1a9be2` | same | match |
| `.ufo/waves/round-60/launcher.py.txt` | `24fea66d3d2dba097c62abc3f49f83b9087660ee` | same | match |

Observed command output, in the table's input order:

```text
df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66
d014d43024ed437d8f7b6741712f41647b1a9be2
24fea66d3d2dba097c62abc3f49f83b9087660ee
```

Independent completeness check: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only be4a820c344d4eb2f94b999c3b5d649e76ab70f1 .ufo/waves/round-60/w1 | awk '/\\.err$/ {e++} /\\.stream\\.jsonl$/ {s++} END {printf "err=%d stream=%d\\n",e,s}'` returned `err=32 stream=32`. The committed tree listing also directly shows those 64 paths and blob IDs; the table itself groups them as 32 `.err` plus 32 `.stream.jsonl` files rather than enumerating all hashes.

Evidence pointer: `.ufo/waves/round-60/close/dead-seats-r60.md` lines 3–10, committed at the target revision; queried `git rev-parse` output and committed-tree enumeration above. Scope is the requested blob-ID spotcheck; this confirms the listed core inputs and file-pair count, not every derived table claim.