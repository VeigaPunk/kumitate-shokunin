RESULT SentinelCapSpawn rev=cac43009 verdict=FINDINGS findings=2

All probes used a detached scratch clone at `cac43009b22232c1ae8efdab4f2789516c1fcc6f`, with the assigned outer `systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120` bound. No tools installed.

1. HIGH (when bind selection can be influenced by untrusted input) — `--bind` is an unrestricted read-write capability. `cap-run.mjs:118-122` checks only absolute path + `statSync(...).isDirectory()`; `:179` appends each caller value after the initial `--ro-bind / /`. `cap-spawn.mjs:35` forwards bind values without constraining them. A caller can bind `/`, replacing the read-only root with a read-write bind; `..` and parent symlink components also resolve beyond a lexical fixture subtree. A direct leaf symlink destination is rejected by tested bwrap 0.13.1.

Impact: a sandboxed child can modify all host paths writable by the runner UID when `/` is bound; a path believed confined to a fixture can also resolve to a broader writable directory. This is path/capability widening, not extra-option injection.

Smallest remediation: reject a canonical `/` bind; where binds are intended to stay within a fixture root, require a trusted allowed root and enforce realpath containment before launching bwrap.

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; mkdir -p "$S/probe-outside"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --bind / -- /usr/bin/touch "$S/probe-outside/direct-root-bind"; r=$?; if test -e "$S/probe-outside/direct-root-bind"; then marker=CREATED; else marker=ABSENT; fi; printf 'runner_exit=%s marker=%s\n' "$r" "$marker"`
Output:
`CAP_RUN: EXIT code=0 unit=cap-run-2095158-1792749528627-0102ff`
`runner_exit=0 marker=CREATED`

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; mkdir -p "$S/probe-outside/restricted"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --bind "$S/probe-outside/restricted/.." -- /usr/bin/touch "$S/probe-outside/escaped-dotdot"; r=$?; if test -e "$S/probe-outside/escaped-dotdot"; then marker=CREATED; else marker=ABSENT; fi; printf 'runner_exit=%s marker=%s\n' "$r" "$marker"`
Output:
`CAP_RUN: EXIT code=0 unit=cap-run-2501485-1792749625189-fb02a6`
`runner_exit=0 marker=CREATED`

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Parent-symlink command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; mkdir -p "$S/probe-outside/real-dir/target"; ln -s real-dir "$S/probe-outside/alias-dir"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --bind "$S/probe-outside/alias-dir/target" -- /usr/bin/touch "$S/probe-outside/alias-dir/target/parent-symlink"; r=$?; if test -e "$S/probe-outside/real-dir/target/parent-symlink"; then marker=CREATED; else marker=ABSENT; fi; printf 'runner_exit=%s marker=%s\n' "$r" "$marker"`
Output:
`CAP_RUN: EXIT code=0 unit=cap-run-2197820-1792749556848-4ebfbd`
`runner_exit=0 marker=CREATED`

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Leaf-symlink negative-control command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; ln -s / "$S/probe-outside/root-link"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --bind "$S/probe-outside/root-link" -- /usr/bin/touch "$S/probe-outside/symlink-root-bind"; r=$?; if test -e "$S/probe-outside/symlink-root-bind"; then marker=CREATED; else marker=ABSENT; fi; printf 'runner_exit=%s marker=%s\n' "$r" "$marker"`
Output:
`bwrap: Can't mount on symlink destination /fast/scratch/hyaku/kumitate-r47/seats/w1-SentinelCapSpawn/probe-outside/root-link`
`CAP_RUN: EXIT code=1 unit=cap-run-2123353-1792749536653-b27348`
`runner_exit=1 marker=ABSENT`

2. MEDIUM — `--verdict-file` follows a symlink and truncates its target. `cap-run.mjs:196-197` calls `writeFileSync(path, line)` without no-follow/open-file checks.

Impact: a caller able to choose this path can clobber any file writable by the runner UID. `cap-spawn.mjs` normally uses a fresh `mkdtemp` directory, but that does not make the direct runner path safe.

Smallest remediation: open through a descriptor with `O_NOFOLLOW`, verify a regular file, and write through that descriptor (or restrict verdict output to a securely created private file).

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; printf 'SENTINEL\n' > "$S/probe-outside/verdict-target"; ln -s verdict-target "$S/probe-outside/verdict-link"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --verdict-file "$S/probe-outside/verdict-link" -- node -e ''; r=$?; IFS= read -r first < "$S/probe-outside/verdict-target"; case "$first" in 'CAP_RUN: EXIT code=0 unit='*) result=OVERWRITTEN;; *) result=UNCHANGED;; esac; printf 'runner_exit=%s target=%s\n' "$r" "$result"`
Output:
`runner_exit=0 target=OVERWRITTEN`

Clean checks: caller data is passed as argv elements, not shell text; `--env` key syntax is restricted, and mem/tasks/budget are numeric. The value `--bind\n/etc` arrived intact as one environment value, while a planted parent canary was absent. The cap-spawn wrapper also kept the canary out. Source evidence: `cap-run.mjs:96-99, 111-127, 176-181`; `cap-spawn.mjs:33-40`.

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. cap-run command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 env CAP_PARENT_CANARY=planted-marker node "$S/lane/scripts/cap-run.mjs" --mem 256 --tasks 32 --budget 10 --env $'CAP_ARG_VALUE=--bind\n/etc' -- node -e 'const ok=process.env.CAP_ARG_VALUE==="--bind\n/etc"; const leak=Object.hasOwn(process.env,"CAP_PARENT_CANARY"); process.stdout.write(`value=${ok?"ok":"bad"} parent=${leak?"leak":"absent"}\n`);'; r=$?; printf 'runner_exit=%s\n' "$r"`
Output:
`value=ok parent=absent`
`CAP_RUN: EXIT code=0 unit=cap-run-2395067-1792749604045-590e41`
`runner_exit=0`

rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. cap-spawn command:
`S=/fast/scratch/hyaku/kumitate-r47/seats/w1-; S="${S}SentinelCapSpawn"; systemd-run --user --scope --quiet -p MemoryMax=2G timeout -s KILL 120 env CAP_PARENT_CANARY=planted-marker node --input-type=module -e 'import {capSpawnSync} from "./scripts/cap-spawn.mjs"; const child="const ok=process.env.CAP_ARG_VALUE===\"--bind\\n/etc\"; const leak=Object.hasOwn(process.env,\"CAP_PARENT_CANARY\"); process.stdout.write(\"value=\"+(ok?\"ok\":\"bad\")+\" parent=\"+(leak?\"leak\":\"absent\")+\"\\n\")"; const r=capSpawnSync("node",["-e",child],{env:{CAP_ARG_VALUE:"--bind\n/etc"},timeout:10000,mem:256,tasks:32}); console.log("status="+r.status+" "+(r.stdout||"").trim()+" verdict="+(/^CAP_RUN: EXIT code=0 /.test(r.capVerdict)?"EXIT":"OTHER"));'; r=$?; printf 'wrapper_exit=%s\n' "$r"`
Output:
`status=0 value=ok parent=absent verdict=EXIT`
`wrapper_exit=0`

Only the explicit `--env` entries reach the child apart from its controlled PATH/PWD; the parent canary did not. No extra bwrap/systemd-run option or parent-environment leak was observed.