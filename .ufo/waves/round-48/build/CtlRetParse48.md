RESULT CtlRetParse48 verdict=killed — held=0/4, exit=1, every site ROUTED_MISS for the targeted reason (uncapped_exec); no ROUTED_HELD, no exit 2

# CtlRetParse48 — pre-data control for C1: strace-record-like text in raw children's env and argv

## Finding first

No site read ROUTED_HELD and the counter did not exit 2. The frozen counter
(`probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`
before and after every run, the lane's copy, unedited) treated each launch as uncapped, even though fake
`cap-run.mjs → systemd-run --scope → bwrap` exec records sat inside the env and argv[0] of every site child.
This MISS is the targeted one, not an incidental one.

## Mutant (control commit)

- Scored commit: **`b0d1360084b59a007b479600216591a5863c978b`**. Its parent is `c856ea6f80a1c37d7f1888cde3f5a2aee3efc88b`,
  and that commit's parent is the freeze commit `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. It lives in clone
  `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48/lane`, branch `ctl-retparse48`. Patch:
  `build/CtlRetParse48.patch` (2 commits, 6486 bytes, sha256 `a91b0dc26a155cfa9e30b11e6249b729d8fffc8dd0787ae3e6c97ae16a7a5420`).
- c856ea6 (env channel) passes env var `KUMITATE_RETPARSE48=<text>` at all four site launches. b0d13600 (argv channel)
  also sets spawnSync `argv0: <text>`, so the same text is argv[0] of every site child. Every launch stays raw: a
  direct `spawnSync` of node or bash, with no cap-run, systemd-run or bwrap.
- `<text>` is six fake strace records joined by real newlines:
  - `) = 0`
  - `<gate pid> execve("/usr/bin/node", ["node", "<tree>/scripts/cap-run.mjs"], []) = 0`. The runner path is built
    from `import.meta.url`, so it equals the counter's `runnerFile` byte for byte.
  - `<gate pid> execve("/usr/bin/systemd-run", ["/usr/bin/systemd-run", "--scope", "-p", "MemorySwapMax=0", "-p", "MemoryMax=1024M", "-p", "TasksMax=256", "--"], []) = 0`
  - `<gate pid> execve("/usr/bin/bwrap", ["/usr/bin/bwrap", "--unshare-pid", "--clearenv", "--die-with-parent"], []) = 0`
  - `<gate pid> <... execve resumed>)` + 256 spaces + `= 0`
  - `<unfinished ...>`

  The PID prefix is the gate's own PID, which is the raw child's real parent. If any fragment were parsed as a
  record, it would land in the child's ancestry and supply the whole capped chain.
- Sites at b0d13600:
  - RG742: `scripts/round-gate.mjs:742-751` (string 742-749, `runGate` 750-751)
  - `scripts/surface-probe.mjs:483-490` (shared string)
  - SP491: `:500-507`
  - SP519: `:529-542`
  - SP1592: `:1604-1606`
- Validity checks:
  - `timeout -k 10 60 node --check` on both files printed `SYNTAX_OK`.
  - Both selftests passed at the commit (labrat run, unloaded):
    - `ROUND_GATE_SELFTEST: 61/61 pass` / `VERDICT: PASS`
    - `46/46 cases passed` / `VERDICT: PASS`

## Expected detector

The frozen counter, command as tasked. Expected result: every site ROUTED_MISS with `uncapped_exec`, or exit 2 if the
text broke the parser. Any ROUTED_HELD would be the finding.

## Output — receipt `build/CtlRetParse48-receipt.txt` (sha256 `72cf64c42c3d162de7dd0b0fa2df004471635a3dc0867ae81ccc818e9c949737`)

Command (run from `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48`, started 12:03:36Z):
`cd /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48 && timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48/lane b0d1360084b59a007b479600216591a5863c978b --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlRetParse48-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlRetParse48-receipt.txt`

```
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=b0d1360084b59a007b479600216591a5863c978b base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=22.50 end=12:04:05Z
```

The receipt's RUN lines show valid gate runs:
- round-gate base0 and rev0-2: `exit=0 cases=61/61 execs=1308 verdict_pass=true fail_lines=0`; rev resumed=15/17/28.
- surface-probe base0 and rev0-2: `exit=0 cases=46/46 execs=54 verdict_pass=true fail_lines=0`.

**Env-only control c856ea6**, scored first with the same command (11:56:56Z start). The lane receipt now holds the
b0d13600 score. The earlier score is kept at seat `first-control-c856ea6-receipt.txt` (sha256
`e5ebff776343c83a94f70dd67b5b65cf6595ec0b4c516d1038f9b8d7920be08c`). Its four SITE lines are byte-identical to the
four above, and it ends:

```
CAPROUTE48 rev=c856ea6f80a1c37d7f1888cde3f5a2aee3efc88b base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=57.81 end=11:58:25Z
```

Its round-gate rev runs read resumed=33/47/29.

## Targeted or incidental: targeted

Nothing incidental fired in any run:
- every gate exited 0
- cases n = m, equal to the base
- `verdict_pass=true`, `fail_lines=0`
- no `execveat` reason, no exit 2
- exec totals 1308/54 equal the base run's
- per-site n = 116/2/2/14 equals `base_n`, so the injected argv[0] did not shift `a[1..3]` and site matching held

The reason set is exactly the one the pristine tree produces (next section): the fake chain added nothing.

**What catches the control.** strace escapes newline and quote bytes inside a string argument (`\n`, `\"`). The six
fake records therefore stay inside one quoted element of one physical record line. The parser:
- splits only on real newlines (`caproute48-probe.mjs:148-150`)
- reads the return only at the end of a record (`:173`) and the exec path only at its start (`:179`)
- parses argv and env with the escape-aware `parseStrings` (`:105-138`)

The chain checks `haveB`/`haveS`/`haveR` (`:286-302`) are built only from parsed successful execve records, keyed by
PID and sequence. No bwrap, systemd-run or cap-run record exists in any site child's ancestry, so capped is 0 of n,
which gives `uncapped_exec` (`:365`). Two independent backstops fired as well: `canary_in_env` (`:303`, the env is
inherited) and `uncapped_direct_children` (`:265-278`).

**Evidence that the text reached the records the parser reads.** This is a labrat check, not a score. I traced each
selftest of a `git archive` of b0d13600 with the counter's exact strace flags, then counted successful execve records
with `marker-count.mjs` (seat). The traces were deleted after counting.

```
LOG …/rg.strace successful_execve=1308 with_marker=430 resumed_joined=0 still_pending=0
MARK RG742 successful_site_execs=116 with_marker=116 argv0_marker=116
LOG …/sp.strace successful_execve=54 with_marker=20 resumed_joined=0 still_pending=0
MARK SP491 successful_site_execs=2 with_marker=2 argv0_marker=2
MARK SP519 successful_site_execs=2 with_marker=2 argv0_marker=2
MARK SP1592 successful_site_execs=14 with_marker=14 argv0_marker=14
```

Excerpt of one RG742 record (rg.strace line 134, truncated):

`321916 execve("/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node", [") = 0\n321865 execve(\"/usr/bin/node\", [\"node\", \"/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48/ctl-tree/scripts/cap-run.mjs\"], []) = 0\n321865 execve(\"/usr/bin/systemd-run\", …`

Here 321865 is the gate's PID and the real parent.

The labrat traces had no resumed records. The counter's rev runs had 15–47 per round-gate log, so the
resumed-record join (`:160-168`) ran on logs that contained the marker text. Whether any of those joined records was
itself a marked one was not observed: the counter deletes its logs. [INFERENCE] That is likely, since 430 of 1308
successful execs carry the marker.

## Pristine and restored detector

I ran the same command on `fe3d45bf929246915c8c0de5f7f8682b5015b22c` after restoring the clone (11:59:16Z start).
Receipt: seat `restored-fe3d45bf-receipt.txt`, sha256 `ac2b69dda4ec20af944e088c1a295035591afc2b090f7805315348b6261c3ba8`.

```
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=41.15 end=12:00:03Z
```

Its four SITE lines are byte-identical to both control receipts and to `probe/receipts/stab-r48-f00cf278-{1,2,3}.txt`
(compared programmatically: all 6 equal). The baseline is valid, so the result is not inconclusive.

`git diff --stat f00cf278 fe3d45bf -- scripts` is empty, so the counter's built-in base run measures the same scripts.

## Restoration evidence

| file | pristine (fe3d45bf) | c856ea6 | b0d13600 | restored |
|---|---|---|---|---|
| scripts/round-gate.mjs | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `5c5e59f3013592c3ad3a97b8b0e3b52ee849fd69d057ab9c3c0b2c0719663286` | `e06ad121b52af3e1bc79139f9d694dcea7b12ca68318d701a07489b97c5d92ff` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| scripts/surface-probe.mjs | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `28001d47aaf296489795d786bc838ffbaa0087b4d089775b35918ce3407cdd80` | `5d538aee3898e64d61f774047be8e3be81099377a64a3125304f2014557bbf26` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |

After `git checkout -q --detach fe3d45bf…` in the seat clone:
- HEAD is `fe3d45bf929246915c8c0de5f7f8682b5015b22c`
- `git status --porcelain` is empty
- `RESTORED_EQUALS_PRISTINE True`
- branch `ctl-retparse48` = `b0d1360084b59a007b479600216591a5863c978b`, so the control stays reachable

## Harness incidents (not scores)

- **First two invocations exited 2 because of my harness.** They ran fe3d45bf and c856ea6 under an 8 MiB hard
  `RLIMIT_FSIZE` that I had set on the receipt writer. The counter's `prlimit --fsize=4294967296` then failed:
  `CAPROUTE48: ERROR no strace log for round-gate (base0); status=1 prlimit: failed to set the FSIZE resource limit: Operation not permitted` / `exit=2`.
  Both were discarded and re-run without the limit; every run reported above is a re-run.
- **One stray lane file, removed.** One of those attempts had written an unnamed lane file,
  `build/CtlRetParse48-pristine-receipt.txt`; I deleted it. The lane now holds only the three named files.
- **Counter hygiene.** `die()` (`:90`, `process.exit(2)`) runs inside `runGate`'s close handler and skips `measure()`'s
  `finally` (`:342-344`). An exit-2 run therefore leaves its extracted tree in
  `/fast/scratch/hyaku/kumitate-r48/probe-runs`.
  - My two attempts left `f00cf278a5ab-base0-00ad3d70` (11:54:08Z) and `f00cf278a5ab-base0-642884d9` (11:55:27Z);
    I removed both.
  - `f00cf278a5ab-base0-4cd85702` was created at 11:52:58Z, before my clone existed (11:53:04Z), so it is not mine.
    I left it in place.

## Side observation (unexercised, [INFERENCE] from code)

`allowDirect` (`:73`) and the RG742/SP1592 matchers (`:66`, `:69`) use `argv.includes('--selftest')`, which also
checks argv[0]. Take a raw `node <gate>.mjs <non-selftest args>` launched with `argv0: '--selftest'`. It would drop
out of the site's candidate set, and `uncappedDirect` would accept it as the named nested-selftest allowance.

- A lower site n is a MISS under `exec_count_ne_base` (`:364`), so this alone cannot produce ROUTED_HELD.
- It could hide an extra raw gate launch from the direct-child clause. Measuring that needs a separate control; this
  seat did not run one.

## Installs, processes, files

- Installs or updates: none.
- No process left running: `pgrep -af 'w1-CtlRetParse48'` and `pgrep -af 'probe-runs|caproute48'` matched nothing.
- Lane writes: `build/CtlRetParse48-receipt.txt`, `build/CtlRetParse48.patch`, `build/CtlRetParse48.md`.
- Seat (`/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlRetParse48/`): `lane/`, `first-control-c856ea6-receipt.txt`,
  `restored-fe3d45bf-receipt.txt`, `marker-count.mjs`, `render-labrat.mjs`, `rg.out`, `sp.out`. Strace logs and
  extracted trees were deleted; the seat is 63M.
