ATTACK K1/mcp.json secrecy verdict=holds defects=0

Axes: coverage:kimi-layer (judged); secrecy/non-disclosure (attacked).

## Result

No content-read, content-hash, output/logging, reproduced-secret, or final-component symlink-follow defect found in the landed K1 path. No remediation is indicated for those criteria.

## Evidence

- `scripts/kimi-census.mjs:108` declares `mcp.json` as `secret: true`; `:187-201` uses `lstatSync` for kind and mode; `:269-319` checks this member with `lstatKind`/`modeOf` and emits only kind/mode metadata. Its secret branch continues without entering the ordinary-member handling. Root enumeration at `:244-246` reads names only. The final `mcp.json` symlink is counted as a non-directory leaf, but the `lstat` calls do not dereference it.
- `scripts/proxy-check.mjs:352` also declares the member secret; `:459-470` defines no-follow `lstatKind`; `:626-650` uses `lstatKind` and adds only the canonical member path to an identity set. The root and counted directories are listed for names; `mcp.json` is neither opened nor listed. `sha256File`/`readText` at `:448-479` are not used by this K-member path.
- `corpus/knowledge/kimi-mcp-plane.md:92-106` records membership, mode/kind behavior and documentation-derived MCP field names; the round-35 section contains host stat metadata, not the file's contents or a credential value. No reproduced secret was found.

## Traces

Commands were run from the lane root. `-e raw=read` prevents strace from printing read buffers.

```text
strace -f -qq -e trace=open,openat,read -e raw=read -yy -s 0 node scripts/kimi-census.mjs
```
Output: `KIMI_ROOT: /home/vgpnk/.kimi-code`; `TOTALS: members=51 checked=51 errors=0 info=4 chain=7`; `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`. The full trace contains no `mcp.json` pathname/open; the process only opens the Kimi root and the counted directories. No `mcp.json` open/openat/read was observed.

```text
strace -f -qq -e trace=open,openat,read -e raw=read -yy -s 0 node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src
```
Output: `PROXY warn PIN_UNPINNED scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza`; `PROXY: MATCH (... K=51/51 coverage:kimi-layer=10; ...)`. The full trace contains no `mcp.json` pathname/open; it opens the Kimi root directory, but not the member. No `mcp.json` open/openat/read was observed. A search of the captured full trace for `mcp.json` returned `No matches found`.

The shell had `KIMI_ROOT` unset and `HOME=/home/vgpnk`, so the proxy default and census root were the checked `~/.kimi-code` tree.

## Boundary note (not a non-disclosure defect)

`corpus/knowledge/kimi-mcp-plane.md:97-102` explicitly says the observed mode is `0644`, that the `0400` floor only requires owner-read, and that a symlink passes the leaf-presence check. Thus the gate does not enforce confidentiality or reject symlinks; however, code inspection and the traces show it does not follow/read the symlink target or disclose file contents. [INFERENCE] If the file contains secrets and other local users can traverse its parent directory, its recorded `0644` mode may permit those users to read it directly; contents and parent permissions were not inspected. That separate at-rest permission policy is not established by this shape-only change.