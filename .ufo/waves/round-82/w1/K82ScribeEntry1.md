# K82ScribeEntry1 — knowledge entry: handoff binding and liveness

Seat: scribe (round 82, w1, lane kumitate). Target: `corpus/knowledge/handoff-binding-and-liveness.md`
(S238's `used-by` row). One new file written; nothing else touched.

## Behavior

Wrote `corpus/knowledge/handoff-binding-and-liveness.md` — 89 lines (`wc -l` → `89`), provenance trio
first, five sections. It does not re-derive the v1 admission split (owned by
`corpus/knowledge/ready-handoff-admission.md`); it records only what v2 adds.

### S238 quote located (13 words)

> Validating admission policies offer a declarative, in-process alternative to validating admission webhooks.

Command: `grep -n -o 'Validating admission policies offer a declarative, in-process alternative to validating admission webhooks\.' .ufo/waves/round-82/build/L1/captures/vap.html`
→ five identical hits, lines 3, 5, 7, 9, 894; the entry cites `vap.html:3`. Capture digest:
`sha256sum …/vap.html` → `ae87bdab827b60c5837bba1b91621a8966cf3e13d323b52e5c68865c3d10dc90` (entry
truncates to `ae87bdab827b…d10dc90`).

### Anchors carried (each a live line in the working tree)

| judgment | anchor | verified text on that line |
|---|---|---|
| `WAVE_BINDING` | `scripts/ready-handoff.mjs:187` | `if (stem !== \`${wave}-dispatch\`) add('WAVE_BINDING', …)` |
| `DISPATCH_WAVE` | `scripts/ready-handoff.mjs:192` | `add('DISPATCH_WAVE', …)`; prefix rule at plan A1.6 (`plan.md:133`) |
| `REPORT_DEST_DUPLICATE` | `scripts/ready-handoff.mjs:244` | `if (destinations.has(dest)) add('REPORT_DEST_DUPLICATE', …)`; trailer parser `:231` |
| `L1_SEAT_COLLISION` | `scripts/ready-handoff.mjs:220` | `add('L1_SEAT_COLLISION', …)` (case-insensitive compare `:219`) |
| `L1_UNRESOLVED` | `scripts/ready-handoff.mjs:195` | `add('L1_UNRESOLVED', …)`; registry shape refusal `:169`; tokens `:166` |
| `BAND` (policy) | `scripts/ready-handoff.mjs:199` | `add('BAND', \`${tc.tasks.length} seats outside ${lo}:${hi} (policy)\`)` |
| `ROLE_UNKNOWN` (policy) | `scripts/ready-handoff.mjs:223` | `role … is not a policy proposal role` |
| dispatch-symlink refusal | `scripts/ready-handoff.mjs:136` | `throw new Refusal('DISPATCH_ABSENT', 'dispatch is not a regular file')` |
| realpath arm (unreachable) | `scripts/ready-handoff.mjs:138` | `inside(realpathSync(waveDir), realpathSync(dispatchPath))` |
| lane constants | `scripts/ready-handoff.mjs:41`, `:51`, `:259`, `:260` | `ATTACK` set, `attackPct: 25`, `ATTACK_SHARE`, `CONNECTOR_COUNT` |
| exit 2 | `scripts/ready-handoff.mjs:629` | `return 2` (Refusal branch) |
| policy extraction | `scripts/ready-handoff.mjs:153-161` | `proposalRoles`, `waveMinLanes/waveMaxLanes`, `POLICY_MALFORMED` |
| PROVINCE | `PROVINCE.md:16`, `PROVINCE.md:57` | “Member content stays out of scope by design (readdir + lstat only)”; “Unchanged and binding: member content of `~/.omp/agent` is out of scope” |
| checklist step | `SKILL.md:755` | `[ ] READY handoff admission (round 82; contract \`kumitate-ready-handoff-v2\`; …` |
| counter | `.ufo/waves/round-82/probe/probe82-c1.mjs:24` | `const ARMS = 22;` |

### One-authority argument (in the entry)

- v1 duplicated the campaign numbers inside the tool: `git show 0c23c4f:scripts/ready-handoff.mjs`
  → `band: '8:16'` (`:47`), `--band` (`:54`), role list with `labrat`/`distiller` (`:35`).
- v2 reads them from `--policy`: `scripts/ready-handoff.mjs:153-161`, applied `:199`/`:223`;
  `grep -n -- '--band' scripts/ready-handoff.mjs` → no match (exit 1).
- Policy measured: `node -e` over `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`
  → band `[8,16]`, ten roles (`scout reviewer critic connector sentinel executor mutation-tester
  revenger simplifier scribe`).
- The dispatch's own `policy` echo (`w1-dispatch.json`: `policy.minLanes` 8) is unread:
  `grep -n "minLanes" scripts/ready-handoff.mjs` → no match (exit 1); so a dispatch cannot widen
  the band it is judged by.

### Offline vs caller-supplied (in the entry)

- Six of seven judgments are decided from the ready file + dispatch + policy; `--agents` is the
  seventh's only surface (`scripts/ready-handoff.mjs:30` header “Reads: …”).
- `--agents` must be `{agents:[{id}]}` (`scripts/ready-handoff.mjs:169`); unreadable →
  `AGENTS_ABSENT`, not-JSON → `AGENTS_MALFORMED` (`:166`), exit 2 (`:629`).
- Why: PROVINCE keeps `~/.omp/agent` at depth-1 members, content out of scope (`PROVINCE.md:16`,
  `PROVINCE.md:57`), so the id set must arrive as an export.
- Liveness means “resolves in the supplied registry”, not “running now”: the shape carries no
  instant and the flag is optional (`:165`); omission is disclosed as `agents=none` (`:272`).

### Limits stated

1. The gate is advisory until a dispatcher calls it; the run is a checklist step (`SKILL.md:755`),
   recorded as lane-side admission (`plan.md:107`).
2. `l1` liveness is opt-in and undated; `agents=none` is the disclosure that it did not run.
3. Attack share and connector cap stay lane constants (`scripts/ready-handoff.mjs:41`, `:51`,
   `:259`, `:260`; `plan.md:112`). This wave reads `attack=4/14` because `sentinel` sits outside the
   four attack roles (A1.6, `plan.md:137`), while the plan's prose counts 5/14.
4. The realpath guard is defence in depth behind the `lstat` refusal (`:136` vs `:138`), unreachable
   and disclosed as such (A1.2, `plan.md:119`).

## Gates run (read-only; all in this seat)

| command | result |
|---|---|
| `node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin` | `C82_C1: HELD held=22/22`, exit 0 (arm `selftest` case count 53 at the modified bytes) |
| `node scripts/ready-handoff.mjs --selftest --work $HYAKU_SCRATCH/selftest2` | `READY_HANDOFF_SELFTEST: 53/53 pass`, `VERDICT: PASS` |
| same suite over HEAD bytes (`git show HEAD:scripts/ready-handoff.mjs` → scratch copy, sha256 `64d6b9c9…`) | `READY_HANDOFF_SELFTEST: 50/50 pass`, `VERDICT: PASS` |
| `node scripts/ready-handoff.mjs --lane . --round 82 --wave w1 --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json` | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=scout=2,executor=3,scribe=2,connector=1,reviewer=2,critic=1,mutation-tester=1,sentinel=1,revenger=1 policy=ufo-wave-policy.json agents=none`, exit 0 |
| same + `--agents .ufo/waves/round-82/w1/swarm-registry.json` | `READY_HANDOFF: FAIL-CLOSED AGENTS_MALFORMED (agents registry must be {agents:[{id}]}: …)`, exit 2 |
| `node scripts/sources-check.mjs` | `SOURCES_CHECK: CLEAN (rows=177 tiers=A:150,B:17,C:10 status=queued:13,mined:142,rejected:22 entries_with_source=36 legacy=38)`, exit 0; two pre-existing `USED_BY_ASYMMETRY` warns (S124, S041), none about S238 |

No tool was installed or upgraded this seat (nothing was missing).

## Touched surfaces

- Written: `corpus/knowledge/handoff-binding-and-liveness.md` (new, 89 lines).
- Untouched by me: `corpus/SOURCES.md` (S238 row already names this path — `corpus/SOURCES.md:192`),
  `corpus/README.md`, `SKILL.md`, `SCORECARD.md`, both counters, receipts, `.ufo/state/*`, all
  `scripts/`. Scratch: `/fast/scratch/hyaku/kumitate-r82/K82ScribeEntry1/` (removed on finish).

## Findings (for the L1)

- **F1 — lane tool dirty mid-wave.** `scripts/ready-handoff.mjs` is `M` against HEAD `c4396021`
  (scaffolding B; the brief's `63b12695` is its ancestor and already carried v2):
  +23 lines, three `trailer-prose-*` selftest cases inserted around `:538-560`
  (`git diff --stat` → `23 insertions(+)`). Worktree sha256 `4b91b2045a72…`; HEAD bytes sha256
  `64d6b9c91212…`. Suite: 53/53 worktree, 50/50 HEAD. The diff adds cases only — judge lines
  1-260 and the C1 counter's 22 arms are unchanged (probe 22/22 under both readings I took), but
  the round's measured revision M must either commit these bytes or revert them before close.
- **F2 — the wave's own registry does not fit `--agents`.** `.ufo/waves/round-82/w1/swarm-registry.json`
  is `{schema, wave, createdAt, updatedAt, reportDir, members:{<seat>:{kind,agentId:null,role,item}}}`;
  fed to the gate it fails closed as `AGENTS_MALFORMED` (measured above). No lane script writes
  `{agents:[{id}]}` — `grep -rn "agents: \[{ id:" scripts/*.mjs` hits only the tool's fixtures
  (`:331`, `:332`). Practical effect: `L1_UNRESOLVED` is reachable only via a hand-built export, so
  the liveness judgment is opt-in by construction, not merely by flag.
- **F3 — attack numerator is the four-role set.** The real handoff reads `attack=4/14`, not the plan's
  5/14 (`plan.md:66`), because `ATTACK` (`scripts/ready-handoff.mjs:41`) omits `sentinel`; A1.6
  (`plan.md:136-138`) states this. Share still passes: `4*100 = 400 >= 25*14 = 350` (`:259`).
- **F4 — dead import.** `readdirSync` is imported at `scripts/ready-handoff.mjs:33` and used nowhere
  (`grep -c "\\breaddirSync\\b"` → 1, the import). Cosmetic; it is also the only fs verb that could
  touch a directory plane, so removing it would tighten the PROVINCE story.
- **F5 — capture repetition.** The S238 sentence occurs five times in `vap.html` (lines 3, 5, 7, 9,
  894). The entry cites `:3`; a spot-checker grepping for the sentence will see five hits and must
  not read that as five distinct claims.

## Out of scope / not done

- No README map row, no SOURCES edit, no SKILL registry edit, no pin refresh, no SCORECARD/LOG
  edit — L1 integration.
- No commit, push, or mutating git/jj command; no subagent dispatch.
- No verification of peers' claims; no rerun of the C2 counter (this seat owns C1's note only).

## Artifact paths

- Entry: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/handoff-binding-and-liveness.md`
- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/w1/K82ScribeEntry1.md`
