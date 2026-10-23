# SentTmpPath — `/tmp` path-mangling attack

## Severity and verdict

**No bypass found in the assigned path variants.** The latent defect would be **high impact to the sandbox's `/tmp` isolation** if a whole-host `/tmp` bind reached bwrap: cap-run places `--tmpfs /tmp` before user binds, so a later `--bind` could re-expose host `/tmp`. Current `cap-run.mjs` refuses every tested alias before launch. No code remediation is needed for these cases; preserving the realpath check is essential. An alias-specific selftest would be the smallest regression-proofing change.

## Attack surface

Read `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-run.mjs` (SHA-256 `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`). The `--bind` arm checks `realpathSync(v)` and `resolve(v)` against `bad()` at lines 124–133; `bad()` rejects exact `/tmp` (line 131). The bwrap argv puts `--tmpfs /tmp` before appended `--bind` pairs (lines 189–191). The patch report `r50/ExecBindGuardPatch.md` was absent when checked; this finding is based on current source bytes.

## Failure table

For each CLI probe, I omitted `-- <cmd>` intentionally: a refusal reports `--bind refuses`; a path that passes the bind check stops at `missing -- <cmd>`, before `run()` can spawn systemd/bwrap. The symlink case used a temporary symlink pointing to `/tmp`, removed after the probe.

| `--bind` input | `realpathSync(input)` | `resolve(input)` (bind destination) | Guard / CLI result | Safe? |
|---|---|---|---|---|
| `/tmp` | `/tmp` | `/tmp` | `bad(realpath)` and `bad(resolve)`; exit 64, `--bind refuses` | Yes—refused |
| `//tmp` | `/tmp` | `/tmp` | Both blocked; exit 64, `--bind refuses` | Yes—refused |
| `/tmp/.` | `/tmp` | `/tmp` | Both blocked; exit 64, `--bind refuses` | Yes—refused |
| `/tmp/../tmp` | `/tmp` | `/tmp` | Both blocked; exit 64, `--bind refuses` | Yes—refused |
| `/tmp/` | `/tmp` | `/tmp` | Both blocked; exit 64, `--bind refuses` | Yes—refused |
| `/tmp/r50-caprun-paths.kxsVri/tmp-alias` (symlink to `/tmp`) | `/tmp` | `/tmp/r50-caprun-paths.kxsVri/tmp-alias` | Source realpath blocked (destination spelling alone is not); exit 64, `--bind refuses` | Yes—refused |
| `/tmp/r50-caprun-paths.kxsVri/subdir` (ordinary directory control) | same subdirectory | same subdirectory | Neither blocked; CLI proceeds to `missing -- <cmd>` | Yes—allowed subdir; does not bind `/tmp` itself |

All listed `/tmp` spellings canonicalize to `/tmp` under `realpathSync`; `resolve()` also canonicalizes the lexical slash/dot/dot-dot spellings. For the symlink, only the source realpath detects the target, demonstrating why checking the original string or destination spelling alone would be insufficient. The subdirectory control confirms the exact-path guard does not reject an ordinary fixture below `/tmp`.

## Commands and observed evidence

Source hash:

```text
$ sha256sum scripts/cap-run.mjs
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  scripts/cap-run.mjs
```

Normalization/guard-equivalent probe (temporary directory and symlink cleaned in `finally`):

```text
$ node --input-type=module -e 'import { mkdtempSync, realpathSync, symlinkSync, rmSync, mkdirSync } from "node:fs"; import { tmpdir } from "node:os"; import { join, resolve } from "node:path"; const d=mkdtempSync(join(tmpdir(), "r50-tmp-paths.")); const alias=join(d,"tmp-alias"); symlinkSync("/tmp", alias); const paths=["/tmp","//tmp","/tmp/.","/tmp/../tmp","/tmp/",alias]; const bad=p=>p==="/"||p==="/tmp"||/^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p); try { for (const p of paths) { const real=realpathSync(p), dst=resolve(p), sourceBlocked=bad(real), destBlocked=bad(dst); console.log(JSON.stringify({input:p,realpath:real,destinationResolve:dst,sourceBlocked,destinationBlocked:destBlocked,usageRefusal:sourceBlocked||destBlocked,decision:(sourceBlocked||destBlocked)?"REFUSED":"ALLOWED"})); } const sub=join(d,"subdir"); mkdirSync(sub); const real=realpathSync(sub), dst=resolve(sub); console.log(JSON.stringify({input:sub,realpath:real,destinationResolve:dst,usageRefusal:bad(real)||bad(dst),decision:"ALLOWED (subdirectory control)"})); } finally { rmSync(d,{recursive:true,force:true}); }'
{"input":"/tmp","realpath":"/tmp","destinationResolve":"/tmp","sourceBlocked":true,"destinationBlocked":true,"usageRefusal":true,"decision":"REFUSED"}
{"input":"//tmp","realpath":"/tmp","destinationResolve":"/tmp","sourceBlocked":true,"destinationBlocked":true,"usageRefusal":true,"decision":"REFUSED"}
{"input":"/tmp/.","realpath":"/tmp","destinationResolve":"/tmp","sourceBlocked":true,"destinationBlocked":true,"usageRefusal":true,"decision":"REFUSED"}
{"input":"/tmp/../tmp","realpath":"/tmp","destinationResolve":"/tmp","sourceBlocked":true,"destinationBlocked":true,"usageRefusal":true,"decision":"REFUSED"}
{"input":"/tmp/","realpath":"/tmp","destinationResolve":"/tmp","sourceBlocked":true,"destinationBlocked":true,"usageRefusal":true,"decision":"REFUSED"}
{"input":"/tmp/r50-tmp-paths.grWwHn/tmp-alias","realpath":"/tmp","destinationResolve":"/tmp/r50-tmp-paths.grWwHn/tmp-alias","sourceBlocked":true,"destinationBlocked":false,"usageRefusal":true,"decision":"REFUSED"}
{"input":"/tmp/r50-tmp-paths.grWwHn/subdir","realpath":"/tmp/r50-tmp-paths.grWwHn/subdir","destinationResolve":"/tmp/r50-tmp-paths.grWwHn/subdir","usageRefusal":false,"decision":"ALLOWED (subdirectory control)"}
```

Actual cap-run parser probes were run with the same six `/tmp` paths and the subdirectory control, using `node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind <path>` (no command terminator). Each `/tmp` case exited 64 with `CAP_RUN: USAGE --bind refuses ...`; the control exited 64 with `CAP_RUN: USAGE missing -- <cmd>`. This confirms the real parser reaches the refusal for aliases and accepts the legal subdirectory without spawning a child.
Exact real-parser probe (the command deliberately omits `-- <cmd>`, so even an unexpected accepted bind cannot spawn a child):

```text
$ node --input-type=module -e 'import { mkdtempSync, realpathSync, symlinkSync, mkdirSync, rmSync } from "node:fs"; import { spawnSync } from "node:child_process"; import { tmpdir } from "node:os"; import { join } from "node:path"; const d=mkdtempSync(join(tmpdir(),"r50-caprun-paths.")); const alias=join(d,"tmp-alias"); symlinkSync("/tmp",alias); const sub=join(d,"subdir"); mkdirSync(sub); const cases=[["/tmp","exact"],["//tmp","double-slash"],["/tmp/.","dot"],["/tmp/../tmp","dot-dot"],["/tmp/","trailing-slash"],[alias,"symlink-alias"],[sub,"subdir-control"]]; try { for (const [p,label] of cases) { const cp=spawnSync(process.execPath,["scripts/cap-run.mjs","--mem","64","--tasks","8","--budget","10","--bind",p],{encoding:"utf8"}); const text=(cp.stderr||"").trim().split("\n").at(-1); console.log(JSON.stringify({case:label,input:p,realpath:realpathSync(p),exit:cp.status,stderr:text,guardDecision:text.includes("--bind refuses")?"REFUSED":"NOT_REFUSED"})); } } finally { rmSync(d,{recursive:true,force:true}); }'
{"case":"exact","input":"/tmp","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"/tmp\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"double-slash","input":"//tmp","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"//tmp\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"dot","input":"/tmp/.","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"/tmp/.\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"dot-dot","input":"/tmp/../tmp","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"/tmp/../tmp\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"trailing-slash","input":"/tmp/","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"/tmp/\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"symlink-alias","input":"/tmp/r50-caprun-paths.kxsVri/tmp-alias","realpath":"/tmp","exit":64,"stderr":"CAP_RUN: USAGE --bind refuses \\"/tmp/r50-caprun-paths.kxsVri/tmp-alias\\" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"REFUSED"}
{"case":"subdir-control","input":"/tmp/r50-caprun-paths.kxsVri/subdir","realpath":"/tmp/r50-caprun-paths.kxsVri/subdir","exit":64,"stderr":"CAP_RUN: USAGE missing -- <cmd> (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)","guardDecision":"NOT_REFUSED"}
```

## Exploit path and impact

Without the guard, `--bind /tmp` would append `--bind /tmp /tmp` after the fresh tmpfs mount and make host `/tmp` visible/writable in the sandbox. The tested aliases do not reach that argv: their canonical source is `/tmp`, triggering refusal. No tested path lets a caller re-expose the host mount; subdirectory binds remain intentionally legal.

## Smallest remediation

None for the tested cases. Retain `bad(realpathSync(v))` before creating bind argv; optionally add selftest arms for `//tmp`, `/tmp/.`, `/tmp/../tmp`, and a symlink-to-`/tmp` to lock the behavior in. No tools installed or updated.
