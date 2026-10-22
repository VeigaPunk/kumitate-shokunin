RESULT ScoutOmpSpawnFailure rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=untraceable found=2/2 version=omp/18.12.6

# What was located (observed)

Host install: `/home/vgpnk/.local/bin/omp`, a 256,702,432-byte standalone Bun 1.4.3 ELF,
`omp --version` prints `omp/18.12.6`. No npm, uv or bun package tree for omp was found on this
host (global npm, uv tools, fnm node_modules, ~/.bun, /opt and /usr/lib);
the JavaScript ships inside the ELF as a Bun standalone module graph in section `.bun`
(file offset `0x0568a000`, size `0x09e385da`). Payload prefix u64 = 165905874; the 32-byte
`Offsets` struct sits at section end minus 48, immediately before the 16-byte
`\n---- Bun! ----\n` trailer; the module table is `blob + 0x09e05cd5`, 3,451 records of
52 bytes = 179,452 bytes = the serialized `modules_len` (self-check). The reproducible
locator is `/fast/scratch/hyaku/kumitate-r41/seats/ScoutOmpSpawnFailure/omp_locate.py`;
extracted chunks are under `.../ScoutOmpSpawnFailure/extract/`.

- "Background job limit reached": `/$bunfs/root/chunks/cli-kywyc85z.js:104`, column 24, in
  `AsyncJobManager.register()` (chunk module comment: `packages/coding-agent/src/async/job-manager.ts`).
  Quote (19 words): ``throw new Error(`Background job limit reached (${o}). Wait for running jobs to finish or cancel one.`)``.
  The limit is `get #R` at lines 78-82: `Math.max(1, Math.floor(t ?? v))` with fallback `v = 15`;
  the parent session constructs the manager with `maxRunningJobs: () => Math.min(100, XPe.get(R))`
  (`cli-qsja5a0h.js:26731`). The throw happens before any job record is created.
- "No model selected": `/$bunfs/root/chunks/cli-qsja5a0h.js:46713`, column 26, in
  `async promptCustomMessage(u, h)` (declared at line 46459, class `xL`).
  Quote (20 words): ``No model selected. Use /login, set an API key environment variable, or create ... Then use /model to select a model.``
  Related shipped sites: bare `throw new Error("No model selected")` at `cli-z6944kyg.js:700`
  (`compact`, `packages/coding-agent/src/session/session-maintenance.ts`); handoff variants at
  `cli-z6944kyg.js:1285` and `cli-1sg5ez97.js:74` (`packages/coding-agent/src/session/session-handoff.ts`);
  two UI labels that are not throws at `cli-10ygtj5w.js:2712` and `cli-e1qr06gb.js:1385`.

# Does a seat dying this way leave a committed trace the census could read? (answer: no)

Both failures are thrown by harness code before the seat can write anything in the lane: the
job limit in the spawn registration path, the model check at the start of the prompt path.
The task tool registers each background seat on
`this.session.asyncJobManager` (`cli-qsja5a0h.js:18732`); a registration throw (the job limit)
is caught per seat at `cli-qsja5a0h.js:18878-18885`, the prepared run is discarded, and the
error is returned as tool-result text: `Failed to start background task job...` and
`Failed to schedule N spawns: <agent>: <message>.` (message text at `:18892` and `:18898`). The
"No model selected" throw happens at the start of the prompt path, so again no lane file.

The census at the measured revision opens only `.ufo/waves/round-N/*-dispatch.json` and the
report paths named by each task's `Report:` trailer (`scripts/wave-census.mjs:51`, `:98`). It
tests report presence with `existsSync` (`:103`), prints absent seat names (`:154`), and its
only findings are `COUNT_MISMATCH`, `REGISTRY_MISMATCH`, `STRAY_REPORT` and `EXPECT_*`. It
never opens host session logs, the parent transcript, or error text. The harness keeps session
state under `~/.omp` on the host; the lane has no `.omp` project-state directory at all.

Consequence: the only committed trace a dying seat can leave is the dispatch payload the
orchestrator committed before dispatch, in which the census can see the seat declared and its
report absent. That records intent, not death: the instrument's own header says a payload
"proves validation, not dispatch" and "an absent report does not say why (dead at spawn,
cancelled, never dispatched)". Round 41's build payload has 34 seats and its
committed `evidence-seat-gate.txt` says 0 seats spawned, yet the census prints
`reports=0/34` and `WAVE_CENSUS: CLEAN ... findings=0`. Because presence is `existsSync` at
this revision, presence cannot be read as survival either: a 3-byte file at the Report path
produced `reports=1/1 CLEAN`, and deleting it produced `reports=0/1 CLEAN`.

Which of the "No model selected" sites a seat hits at spawn is inference, not observed: no
round-41 artifact records the error message of any seat that died at spawn. The host route
note in `evidence-seat-gate.txt` names the down route, not a message.

# Confidence and gaps

High confidence in the string locations: the module-table offset mapping and `grep -n` on the
extracted chunks agree on every line number. High confidence that spawn failures are tool
result text, not lane files: read from the shipped task tool. Unresolved: the live lane
worktree's `scripts/wave-census.mjs` is 379 lines while rev 4e58bb0 has 295; the trace answer
above is for the measured revision. No committed record of either message exists for any
round-41 seat death.

# Evidence

1. `command -v omp` -> /home/vgpnk/.local/bin/omp
2. `omp --version` -> omp/18.12.6 (exit 0)
3. `stat -c %s /home/vgpnk/.local/bin/omp` -> 256702432
4. `file /home/vgpnk/.local/bin/omp` -> ELF 64-bit LSB executable, x86-64, not stripped
5. `grep -aob 'Bun v1.4.3' omp` -> 13424968, 16022264
6. `grep -aob -- '--user-agent=omp/18.12.6' omp` -> 256648593
7. `readelf -S omp | grep ' .bun '` -> [26] .bun PROGBITS ... 0568a000 09e385da
8. `python3 omp_locate.py 159540379 160033359 162302211 162325255 162343757 162754448 165006031` ->
   cli-10ygtj5w.js:2712, cli-kywyc85z.js:104, cli-1sg5ez97.js:74, cli-z6944kyg.js:700,
   cli-z6944kyg.js:1285, cli-e1qr06gb.js:1385, cli-qsja5a0h.js:46713
9. `grep -aob 'Background job limit reached' omp` -> 95794256 (string table), 160033359 (source)
10. `grep -aob 'No model selected' omp | wc -l` -> 9 (3 in metadata strings, 6 in source)
11. `sed -n '104p' extract/cli-kywyc85z.js` -> throw new Error(`Background job limit reached (${o}). Wait for running jobs to finish or cancel one.`);
12. `sed -n '78,82p' extract/cli-kywyc85z.js` -> `return Math.max(1, Math.floor(t ?? v));`
13. `grep -n 'maxRunningJobs' extract/cli-qsja5a0h.js` -> 26731: `maxRunningJobs: () => Math.min(100, XPe.get(R))`
14. `sed -n '46459p' extract/cli-qsja5a0h.js` -> `async promptCustomMessage(u, h) {`
15. `sed -n '46713,46717p' extract/cli-qsja5a0h.js` -> `throw new Error(\`No model selected.` + `Use /login, set an API key environment variable, or create ${an()}` + `Then use /model to select a model.`
16. `sed -n '700p;1285p' extract/cli-z6944kyg.js` -> `throw new Error("No model selected");` and `throw new Error("No model selected for handoff");`
17. `sed -n '74p' extract/cli-1sg5ez97.js` -> `throw new Error("No model selected for handoff");`
18. `sed -n '2712p' extract/cli-10ygtj5w.js; sed -n '1385p' extract/cli-e1qr06gb.js` -> UI labels, no throw
19. `sed -n '18732p' extract/cli-qsja5a0h.js` -> `const pe = de ? this.session.asyncJobManager : undefined;`
20. `sed -n '18878,18900p' extract/cli-qsja5a0h.js` -> per-seat catch: `it.run?.discard(...)`, `Failed to start background task job...`, `Failed to schedule ... spawns: ...`
21. `grep -n 'RE_REPORT\|existsSync(join(root, t.report' lane/scripts/wave-census.mjs` -> 51, 103
22. `grep -n 'absentNames' lane/scripts/wave-census.mjs` -> 105, 154
23. `jq '.counts' .ufo/waves/round-41/build-dispatch.json` -> {"spawn":34,"resume":0,"total":34}
24. `node scripts/wave-census.mjs --round 41` -> `WAVE round=41 wave=build ... seats=34 ... reports=0/34`; `absent: ...`; `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`
25. `grep -n 'seats spawned' .ufo/waves/round-41/evidence-seat-gate.txt` -> `The wave was never dispatched: 0 seats spawned.`
26. `git ls-tree -r --name-only 4e58bb0 -- .ufo/waves/round-41` -> build-dispatch.json committed; no `build/*.md` reports
27. `node scripts/wave-census.mjs --root .../census-probe --round 99` with a 3-byte report -> `reports=1/1`, CLEAN
28. same probe after deleting the report -> `reports=0/1`, `absent: A`, CLEAN
29. `cmp lane/scripts/wave-census.mjs <live lane>/scripts/wave-census.mjs` -> DIFFER (295 vs 379 lines)
30. `sed -n '17,22p' lane/scripts/wave-census.mjs` -> header: "A payload file proves validation, not dispatch"; "An absent report does not say why (dead at spawn, cancelled, never dispatched)"
31. `ls -la lane/.omp` and `ls -la <live lane>/.omp` -> absent in both; harness session state is host-side under ~/.omp

No tools were installed or upgraded for this seat.
