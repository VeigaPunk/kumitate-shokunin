VERDICT: CONFIRMED — the installed OMP binary carries the legacy SSE transport and the roots/list + listChanged handler literals (with one correction: the named path ~/.local/bin/omp.real does not exist on this host; the evidence binary is ~/.local/bin/omp, sha256 ee2961c7…, version omp/18.13.1).

## Evidence

All probes read-only byte greps / strings on the binary; no OMP program was executed except the authorized `--version` attempt.

```
$ grep -a -c -F 'LegacySseConnectionTimeoutError' ~/.local/bin/omp.real
grep: /home/vgpnk/.local/bin/omp.real: No such file or directory (os error 2)   # exit=2
$ OMP_NO_RESTART=1 ~/.local/bin/omp.real --version
error: command not found: /home/vgpnk/.local/bin/omp.real                        # exit=127
$ file ~/.local/bin/omp
/home/vgpnk/.local/bin/omp: ELF 64-bit LSB executable, x86-64, ... not stripped
$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5
$ ls -la ~/.local/bin/omp
-rwxr-xr-x 1 vgpnk vgpnk 275986608 Oct 27 00:02 /home/vgpnk/.local/bin/omp

$ grep -a -c -F 'LegacySseConnectionTimeoutError' ~/.local/bin/omp   # -> 4
$ grep -a -c -F 'createSseTransport'              ~/.local/bin/omp   # -> 3
$ grep -a -c -F 'roots/list'                      ~/.local/bin/omp   # -> 3
$ grep -a -c -F 'listChanged'                     ~/.local/bin/omp   # -> 5
(each printed count followed by exit=0)
```

Printable contexts (single command, `grep -a -o -E '[ -~]{0,N}<lit>[ -~]{0,M}' | sort -u | head`):

```
LegacySseConnectionTimeoutError:
    this.name = "LegacySseConnectionTimeoutError";        # class definition
  nfe as LegacySseConnectionTimeoutError,                 # re-export alias
createSseTransport:
  knt as createSseTransport
  knt as createSseTransport,
roots/list:
      case "roots/list":
    case "roots/list": {                                  # handler dispatch switch
listChanged:
      const C = u.resources?.listChanged === true;
      const f = u.tools?.listChanged === true;
      const m = u.prompts?.listChanged === true;
      roots: { listChanged: false }
```

Version string, extracted from bytes only (running `~/.local/bin/omp --version` was not authorized by the seat):

```
$ grep -a -o -E '[ -~]{0,50}omp/18\.13\.1[ -~]{0,50}' ~/.local/bin/omp
--user-agent=omp/18.13.1
```

## Findings

1. **K66LabratBinarySse-1 (info, hypothesis body CONFIRMED).** The installed OMP binary contains all four probe literals: the legacy SSE transport symbols (`LegacySseConnectionTimeoutError` ×4 — class name assignment + re-export alias; `createSseTransport` ×3 — minified `knt` re-exported under its public name) and the MCP server-handler literals (`roots/list` ×3 — `case "roots/list": {` dispatch; `listChanged` ×5 — capability flags for resources/tools/prompts and a `roots: { listChanged: false }` capability block). This supports treating the legacy SSE transport and a built-in roots/list handler as present in the shipped binary. Repro: `grep -a -c -F <literal> ~/.local/bin/omp` (counts above).
2. **K66LabratBinarySse-2 (minor, seat-spec path stale).** The hypothesis names `~/.local/bin/omp.real`; that path does not exist (grep exit 2, `--version` exit 127). The live installed binary is `~/.local/bin/omp` (ELF, 275,986,608 bytes, sha256 ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5, mtime 2026-10-27 00:02, version string `omp/18.13.1`). All confirmations in finding 1 are for `omp`, not `omp.real`; if a sibling seat or receipt cites `omp.real`, it should be re-pointed at `omp`.
3. **K66LabratBinarySse-3 (info, version channel).** The binary's own version is recoverable read-only via the embedded user-agent string `omp/18.13.1`; no version JSON for the product itself was found in bytes (only bundled dep versions 0.1.0/0.0.1). Repro: `grep -a -o -E '[ -~]{0,50}omp/18\.13\.1[ -~]{0,50}' ~/.local/bin/omp`.

## Artifacts

- `.ufo/waves/round-66/build/K66LabratBinarySse/omp-binary-byte-evidence.txt` — verbatim counts, contexts, sha256, size, version string.
- `.ufo/waves/round-66/w1/K66LabratBinarySse.md` — this report.

No scratch dir was needed (no build/fixture); nothing was written outside the two paths above. No tools installed.

## Limits

- Did not execute the binary (only `omp.real --version` was authorized and the path is absent; `~/.local/bin/omp --version` was not run). Version is inferred from the embedded user-agent byte string, not from `--version` output.
- Counts are substring occurrences in the binary blob (including sourcemap/source text embedded by the Bun compile), not proof of reachability at runtime; a live SSE session was not exercised (REA MCP disabled; no campaign run).
- Did not diff against any pinned origin clone (`/fast/scratch/hyaku/kumitate-pin/src`) — out of this seat's bounded scope.
