# K70ReviewCounterR10 — R10 registration triad review (operability, C1 replay isolation)

Seat: K70ReviewCounterR10 (leaf reviewer). Scope: the frozen R10 check only — "tool registry,
source pin and demonstrated capability row agree" (`registration triad`). No other round-70
check audited; candidate under `build/K70ExecRunner/` inspected read-only, never modified.
Plan read: `.ufo/waves/round-70/plan.md` (frozen at commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`,
verified in lane git log); frozen counter `.ufo/waves/round-70/probe/replay70-probe.mjs`
read, bytes unchanged (sha256 below matches its round-70 pin).

## Frozen R10 predicate (normative, must not be amended after scoring)

`.ufo/waves/round-70/probe/replay70-probe.mjs:42`:

```js
check('R10', fs.existsSync(tool)
  && skill.includes('| control-replay |')
  && score.includes('| control-replay |')
  && pins.pins.some(p=>p.path==='scripts/control-replay.mjs' && p.sha256===sha(fs.readFileSync(tool))),
  'registration triad');
```

`tool` is `scripts/control-replay.mjs` extracted from `git archive <REV>` of the measured rev;
`skill`/`score`/`pins` are the same-rev archived `SKILL.md`, `SCORECARD.md`,
`.ufo/pins/counter-pins.json`. So all three registration artifacts must be **committed at the
measured REV**, and the pin sha256 must equal the sha256 of the **committed blob bytes**.

## Commands run and observed outputs

1. `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs`
   → `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` — equals the probe's
   round-70 entry in `.ufo/pins/counter-pins.json`; frozen counter intact.
2. `grep -n "R10" probe/replay70-probe.mjs` → line 42 (quoted above).
3. `grep -n '^| name | kind |' SKILL.md` → `SKILL.md:605` (registry table, bare-name first cell,
   e.g. `SKILL.md:609` `| round-gate | gate | …`).
4. `grep -n 'control-replay' SKILL.md SCORECARD.md .ufo/pins/counter-pins.json` → no matches,
   exit 1 (integration delta fully absent at lane HEAD `1e00955a`; base receipt `base/replay70-base.txt`
   already records `R10 MISS` at B — the honest base).
5. SCORECARD capability-table census: rows at `SCORECARD.md:1784–1804` all use a **backticked**
   first cell — `| \`counter-rerun\` |`, `| \`receipt-evidence\` |`, … `| \`routed-ledger\` |`.
6. Node substring check against the frozen literal `"| control-replay |"` (script
   `build/K70ReviewCounterR10/r10-check.mjs`, output `r10-check-output.txt`):
   - SKILL-style bare row `| control-replay | runner | …` → satisfies literal: **true**
   - SCORECARD-style backticked row `| \`control-replay\` | …` → satisfies literal: **false**
   - SCORECARD-style bare row → satisfies literal: **true**
   - live SKILL.md / SCORECARD.md contain the literal today: **false / false**
7. Candidate byte state (executor seat still writing — file mtime `2026-10-30 12:32:45`):
   - first read: sha256 `01a12626a69dec9fcd42fd58b965b275f9f2608ed605d412eaabcff6b161505d`, 19143 B
   - second read (12:32:45): sha256 `460c0a6cda9d0d40135ba447dc0812b08e31e12063f1733d080534935eedec32`, 19160 B
   - both `sha256sum` and `node:crypto` agree on the second value; receipt `hash-snapshots.txt`.
8. Existing scripts/ pin convention in `.ufo/pins/counter-pins.json`:
   `{"round":69,"name":"routed-ledger","path":"scripts/routed-ledger.mjs","sha256":"05aacb5e…"}`;
   no `scripts/control-replay.mjs` pin present yet.

## Findings

### F1 — concrete defect risk: frozen SCORECARD literal is incompatible with the SCORECARD capability-row convention (severity: high for R10 passage)

The capabilities table in `SCORECARD.md` (rows `1784–1804`) writes every tool name as a
**backticked** first cell (`| \`routed-ledger\` |`). The frozen check demands the bare literal
`| control-replay |` somewhere in the file. A convention-following row
`` | `control-replay` | … `` does **not** contain the literal (verified, command 6). If L1
registers the capability row in the established house style and does not place the bare literal
elsewhere (e.g. in the round-70 move-log/axis evidence text), R10 reads MISS at measurement,
capping the receipt at 9/10 → `REPLAY70_UNMET`. The predicate is frozen ("never amend the
predicate after scoring"), so the integration — not the counter — must carry this: either a
bare-name capability row (deviates from the table's backtick style) or the exact literal
`| control-replay |` in committed SCORECARD bytes at the measured REV. The SKILL side has no
such hazard: the `SKILL.md:605` registry table uses bare names, so a conventional
`| control-replay | runner | …` row satisfies its conjunct.

### F2 — hazard: pin must bind the final committed bytes; candidate is a live moving target (severity: medium)

R10's pin conjunct compares against `sha(fs.readFileSync(tool))` over the bytes `git archive`
extracts at the measured REV. Observed: the K70ExecRunner candidate changed bytes **during this
review** (19143 B → 19160 B; sha `01a12626…` → `460c0a6c…` within ~2 min; receipt
`hash-snapshots.txt`). Consequences:
- Any pin drafted from an intermediate candidate hash will mismatch at measurement. The pin
  value must be computed from the exact bytes L1 commits (and `git archive` must be of that
  same commit).
- The candidate header carries a "(candidate, seat K70ExecRunner)" banner
  (`build/K70ExecRunner/scripts/control-replay.mjs:3`); a cosmetic scrub of that banner at
  integration changes the bytes and silently invalidates any pre-computed pin. Either commit
  verbatim or recompute the pin after the final edit — no third option.
- Pin entry shape per existing convention: `{"round":70,"name":"control-replay",
  "path":"scripts/control-replay.mjs","sha256":"<final blob sha256>"}`. Adding it does not
  change counter bytes (plan: "Pins are added without changing counter bytes") and is also
  enforced repo-internally by the `counter-pins` gate.

## Bounded justification (reviewed, not defects)

- `fs.existsSync(tool)` + archive scope: the probe archives path set `scripts corpus SKILL.md
  SCORECARD.md .ufo/pins .ufo/waves/round-69/{probe,controls}` at REV. A worktree-only copy of
  the script is invisible; the file must be committed before the measured run. This matches
  how every prior round's pinned tool was admitted (e.g. `scripts/routed-ledger.mjs`).
- Self-referential pin: R10 verifies repo-internal agreement (pin in the same tree as the
  tool). There is no external anchor for a brand-new file; the behavior conjuncts (R2 selftest,
  R3–R9 replay obligations) are what stop a stub from scoring. Within the frozen predicate's
  stated meaning ("registry, source pin and capability row agree"), this is honest, not a gap.
- Base honesty: at B (`78b98d76`) none of the three conjuncts exist and the frozen base
  receipt records `R10 MISS` — no vacuous PASS at the base.
- Adding one `scripts/*.mjs` raises proxy term A 10 → 11; `f_O = 30/33 ≈ 0.909`, integer
  stays 9 (terminal). The registration edits do not disturb the held operability integer.

## Residual risk and verification gaps

- The candidate bytes were still changing at review time (executor seat live). F2's pin value
  can only be fixed by L1 at integration; this review pins down the constraint and the exact
  final-byte rule, not the final hash.
- F1 offers two honest placements for the SCORECARD literal; the choice (bare capability row
  vs literal inside move-log/axis evidence text) is an L1 editorial decision. What is not
  negotiable: the committed SCORECARD at the measured REV must contain the exact substring
  `| control-replay |`.
- Out of scope by seat spec: R1–R9 checks, candidate selftest behavior, freeze-map/census
  state, and any sibling seat's artifacts; no broad round audit performed.
- No installs performed; tooling used: `node` v24.21.0 (system), `sha256sum`, `grep`, `stat`,
  `git` (read-only) — no version changes, channels untouched.

## Receipts (unique artifacts)

- `build/K70ReviewCounterR10/r10-check.mjs` — substring/pin arithmetic script (hermetic, re-runnable).
- `build/K70ReviewCounterR10/r10-check-output.txt` — its observed output.
- `build/K70ReviewCounterR10/hash-snapshots.txt` — candidate byte snapshots + probe pin cross-check.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR10/` cleaned after copying receipts.
