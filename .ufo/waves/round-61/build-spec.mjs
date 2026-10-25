// build wave-1 spec for kumitate round 61 (32 seats, v1 band)
import { writeFileSync } from 'node:fs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const CONTEXT = `ROUND CONTEXT (kumitate round 61, wave w1 — build + first falsifiers)

- Lane repo (write scope): ${LANE}. Your tools start at the fleet root; use ABSOLUTE paths for every read/edit/write.
- Every \`Report:\` trailer path is relative to ${LANE} — write it at ${LANE}/<that path>.
- Write your seat report at ${LANE}/.ufo/waves/round-61/w1/<SeatName>.md (your name as the file stem).
- Scratch under /tmp/kumitate-r61/<SeatName>/.
- Never mutate: the fleet repo (${LANE.replace('/kumitate-shokunin','')} outside this lane), sibling lane repos, this lane's jj state or git index (no \`jj\` mutating commands; no \`git add/commit/reset/checkout/switch/pull/push/stash\`), \`.ufo/state/*\`, /home/vgpnk/Projects/shokunin/.scratch/, fleet templates/ and scripts/, MANIFEST.json, or the shokuknow campaign tree (/home/vgpnk/Projects/shokuknow — read-only; never run campaign tools there).
- Tooling authorization (operator 2026-10-19): you may install or upgrade tools that help the task — read /home/vgpnk/.omp/agent/RULES.md first (official channels, update-safety gate, record tool/version/channel/reason in your report). pacman transactions are PAUSED host-wide until the operator resolves the host-recovery L0 question — install via \`uv tool\`/\`npx\`/an official binary in ~/.local/bin instead; never run \`pacman -Sy/-Syu/-U/-R\`.
- REA MCP is disabled: do REA work only through the CLI, never \`xd://mcp__rea_*\` devices.
- Leaf seat: do not spawn subagents; no background jobs.
- Honesty: never invent numbers; if a command cannot run, say so and show the error. Quote full verdict lines.
- Finish by writing your seat report; keep it concise with evidence pointers (paths/lines/commits).`;

const G = `### Godspeed posture
Name the axes; iterate cheap and in parallel; keep moves that improve any axis and harm none; do not aim — let the frontier walk itself. No clarifying-question loops: act via tool calls.`;

const items = [];

function add(name, role, body, axes, milestone) {
  items.push({ name, role, prompt: `${G}\n\n${body}`, axes, milestone });
}

// ---------------- EXECUTORS ----------------
add('ExecTipReceipts', 'executor', `Fix R60-V4: produce the round-60 tip receipts at the real measured revision and commit them.
1. In a sandbox clone (or via \`git -C ${LANE} show\`), run:
   - \`node ${LANE}/.ufo/waves/round-60/probe/dispatch60-probe.mjs ${LANE} a745a3b0e02253e722834ef95042d97ed92e5e53\`
   - \`node ${LANE}/.ufo/waves/round-60/probe/doctrine60-probe.mjs ${LANE} a745a3b0e02253e722834ef95042d97ed92e5e53\`
2. Write \`${LANE}/.ufo/waves/round-60/close/dispatch60-tip.txt\` containing the observed DISPATCH60 line, its exit code, and an appended note: "C1 after-state (10/10) is delivered by round 61 C1 — see .ufo/waves/round-61/plan.md" (the 8/10 line is the truth at this revision; do NOT fabricate 10/10).
3. Write \`${LANE}/.ufo/waves/round-60/close/doctrine60-tip.txt\` containing the observed DOCTRINE60 line and exit code.
4. Verify the files contain no placeholder tokens (\`__TIP__\`, \`__MEASURED__\`, \`__COMMITS__\`).
Report paths + the two verbatim lines.`, ['operability'], 'R60-V4 repair');

add('ExecDeadSeatTable', 'executor', `Fix R60-V6: produce the round-60 dead-seat table from committed bytes.
Inputs: \`${LANE}/.ufo/waves/round-60/w1/launcher-progress.tsv\`, the per-seat \`.err\`/\`.stream.jsonl\` files in that dir, and \`${LANE}/.ufo/waves/round-60/w1-launcher.log\`.
Write \`${LANE}/.ufo/waves/round-60/close/dead-seats-r60.md\`: a table of all 32 seats (name, exit, session, pid) plus the last error-text line per dead seat (from its .err/stream tail), and the launcher crash traceback (the ValueError at launcher.py.txt:95) quoted whole. Count check: 5 exit=0, 27 exit=-9.
Report path + counts.`, ['operability'], 'R60-V6 repair');

add('ExecReadmeMapFix', 'executor', `Fix R60-V8: the round-60 verifier spot-check file landed without its README map row/pin.
1. Add the map row for \`corpus/lessons/round-60-verifier-spotcheck.md\` to \`${LANE}/corpus/README.md\` (same style as other lessons rows).
2. Add it to the \`covered\` set of \`${LANE}/.ufo/pins/readme-map.json\` (registry version 2).
3. Run \`node ${LANE}/scripts/readme-map.mjs\` and paste its full verdict line.
4. Run \`node ${LANE}/scripts/proxy-check.mjs\` and paste the full line (expect C2_TOTAL_DRIFT to be closed; other drift terms are handled by the L1 in final integration — do not edit the proxy stanza).
Do NOT edit the proxy stanza in SCORECARD.md (integration owns it). Report verdict lines.`, ['coverage'], 'R60-V8 repair');

add('ExecDispatchSchemaTool', 'executor', `Fix R60-V5: an executor cannot emit the dispatch record in the gate's schema, so a wave record is unverifiable. Build \`${LANE}/scripts/make-dispatch-actual.mjs\`:
- Inputs: a validator swarm registry (\`swarm-registry.json\`), a seat-results file (validator \`settle\` output or equivalent JSON with per-member name/agentId/exit/status), and the report dir.
- Outputs in the dispatch-evidence gate schema: \`dispatch-actual.json\` = {planned, sessionIds, exit0, reports, dead, members:[{name, agentId, exit, ...}]} and \`launcher-progress.tsv\` lines \`<name>\\tsession=<id>\\texit=<n>\\tpid=<p>\\tstart=..\\tend=..\`.
- \`--selftest\` hermetic fixtures: a known-good record round-trips to CLEAN under \`scripts/dispatch-evidence.mjs --root … --round … --wave …\`; an array-vs-object members fixture and a null-agentId fixture each prove the gate still rejects them.
- Exit 0/1/2/64 map; no network; no writes outside the lane.
Run the selftest and paste its final lines. Report path + verdict.`, ['operability'], 'capability tooling (R60-V5)');

add('ExecQualCriterion', 'executor', `From the routed defects of round 60 (corpus/lessons/round-60-verifier-spotcheck.md R60-V1..V9) append new QUALITY criteria Q52-Q55 to \`${LANE}/corpus/QUALITY.md\` (append-only, never rewrite):
- Q52 — every citation in a committed report/scorecard/lesson names a real object (commit hash, line, file); \`__TIP__\`/\`__MEASURED__\`/\`__COMMITS__\` are rejected. Grounding: R60-V2.
- Q53 — a report's claimed score must equal its committed receipt and the scorecard section. Grounding: R60-V3.
- Q54 — a claim that dispatches a wave cites a committed dispatch record in the gate's schema, and every dead seat is named with its last error text. Grounding: R60-V5/V6.
- Q55 — a tip/after receipt exists at the measured revision and carries the real observed line. Grounding: R60-V4.
Each with the grounding pointer (file:line). Do not touch other criteria. Report the appended ids.`, ['operability'], 'quality criteria from R60 defects');

add('ExecSweepMisroot', 'executor', `Read-only mistroot sweep at wave start:
1. Run \`git -C /home/vgpnk/Projects/shokunin status --porcelain\` (fleet root).
2. For every untracked file at the fleet root, inspect content: if it names this lane/round (kumitate, round-61, wave w1), record path + first line; otherwise ignore.
3. Write findings to \`${LANE}/.ufo/waves/round-61/build/ExecSweepMisroot/sweep-start.txt\` (expected: none or only pre-existing operator files — do NOT delete anything).
Report path + verdict.`, ['operability'], 'write-scope baseline');

add('ExecBaselineRepro', 'executor', `Reproduce the frozen base receipts on a sandbox clone (prove reproducibility outside the working tree):
1. \`git clone --shared ${LANE} /tmp/kumitate-r61/ExecBaselineRepro/lane\` (or \`git worktree\` if clone fails).
2. In the clone at commit c2721f812cebd97ab67a1dd8cd8492a193f82d42, run:
   - \`node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/ExecBaselineRepro/lane c2721f812cebd97ab67a1dd8cd8492a193f82d42\`
   - \`node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r61/ExecBaselineRepro/lane c2721f812cebd97ab67a1dd8cd8492a193f82d42 --census-root /home/vgpnk/Projects/shokunin\`
   - \`node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/ExecBaselineRepro/lane --round 61 --wave w1\`
3. Write the three outputs verbatim to \`${LANE}/.ufo/waves/round-61/build/ExecBaselineRepro/repro.txt\` and note the exit codes.
Delete /tmp/kumitate-r61/ExecBaselineRepro before finishing. Report path + verdicts.`, ['operability', 'coverage'], 'base receipt reproducibility');

add('ExecRecordDoc', 'executor', `Write the integration recipe \`${LANE}/.ufo/waves/round-61/build/ExecRecordDoc/integration-recipe.md\`: exact steps the L1 will follow to assemble the committed dispatch record for C1 from the validator's task results:
- how each seat's name + agentId + settled status map into \`launcher-progress.tsv\` rows;
- how \`dispatch-actual.json\` fields (planned/sessionIds/exit0/reports/dead/members) are computed;
- which seat report files must exist under w1/;
- the command to verify: \`node ${LANE}/scripts/dispatch-evidence.mjs --root ${LANE} --round 61 --wave w1\`.
Base it on the gate source \`${LANE}/scripts/dispatch-evidence.mjs\` (inspect()) and the validator's outputs. Report path.`, ['operability'], 'integration recipe');

// ---------------- SCOUTS ----------------
add('ScoutSourceWorkerVersioning', 'scout', `Open the source row S195 will rest on (one document only):
1. Fetch \`https://docs.temporal.io/worker-versioning.md\` (raw markdown; the docs index is llms.txt). Save the body to \`${LANE}/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md\`.
2. Record: URL, access date (2026-10-25), HTTP/reader status, byte size, \`sha256sum\`.
3. Extract the ≤25-word quote that grounds the row's teaches, located precisely (§ Pinned Workflows heading), and give the exact sentence.
4. Note the versioning-behavior facts most relevant to durable execution (pinned vs auto-upgrade, inheritance on retry/continue-as-new).
Write findings to \`${LANE}/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md\` (do NOT write SOURCES). Report path.`, ['coverage'], 'source S195 open');

add('ScoutWaveValidator', 'scout', `Recon the validator's dispatch artifacts so the C1 record can be built from them:
Read \`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs\` (verbs plan/run/record/settle) and \`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-collect.mjs\`.
Document: the output files of \`run\` (swarm-dispatch.json, swarm-registry.json) and \`settle\` (results envelope: per-member fields such as name/agentId/status/exit), and exactly how a seat's agentId maps to a session id for the dispatch-evidence gate's \`launcher-progress.tsv\`.
Write to \`${LANE}/.ufo/waves/round-61/build/ScoutWaveValidator/findings.md\`. Report path.`, ['operability', 'coverage'], 'validator recon');

add('ScoutReportTemplate', 'scout', `Read the fleet reports \`/home/vgpnk/Projects/shokunin/.ufo/reports/round-57/kumitate.md\` … \`round-60/kumitate.md\` (fleet root).
Extract the exact section headings and order actually used, including the \`## Per-axis verdicts\` table format (Q22: columns axis|verdict|claims|basis + counted claims line) and \`## Round shape\` lines (Q23: WAVE/FLOOR/spawned total).
Write a format reference to \`${LANE}/.ufo/waves/round-61/build/ScoutReportTemplate/report-format.md\`. Report path.`, ['operability'], 'report format recon');

add('ScoutOperatorLessons', 'scout', `Search \`${LANE}/corpus/lessons/operator-*.md\`. For each found file: author/date, one-line content, and whether the lane reflects it in QUALITY.md/SKILL.md (cite). If none exist, state none. Write \`${LANE}/.ufo/waves/round-61/build/ScoutOperatorLessons/findings.md\`. Report path.`, ['coverage'], 'operator lessons check');

add('ScoutQuarantineRegister', 'scout', `Re-derive the kumitate slice of the absent-defect register (read-only; never edit the register):
1. Run the awk filter over /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md selecting rows where the lane cell is kumitate, a round cell matches round[0-9]+, and an id cell matches S[0-9]+, printing the id and quote columns — every line must carry an S-id.
2. For each slice row give a verdict: absent (cited span/quote not locatable), unverifiable (fetch failed / no locator), or present with the anchor you located. Fetch attempts allowed via read/curl of the cited source.
3. Write \`${LANE}/.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md\` with row counts and per-row verdicts. Report path + count.`, ['coverage'], 'quarantine slice');

add('ScoutCollisionGuard', 'scout', `Prove the SOURCES id-collision guard before any append:
1. Extract id lists: \`grep -oE '^ {0,3}\\|[[:space:]]*S[0-9]{3,}' ${LANE}/corpus/SOURCES.md\` → reg-ids; \`grep -oE '^ {0,3}\\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md\` → staged-ids; \`comm -12\` → collisions.
2. Prove the guard catches an indented row: build a scratch registry containing a row indented with 2 spaces, run the same extraction, confirm it still matches (0–3-space rule).
3. Write outputs to \`${LANE}/.ufo/waves/round-61/build/ScoutCollisionGuard/guard-proof.md\` (both id lists, collision count, indent-probe result). Report path.`, ['coverage'], 'collision guard proof');

add('ScoutProxyFull', 'scout', `Dump the lane's measurement terms at the current revision:
- \`node ${LANE}/scripts/proxy-check.mjs\` (full output)
- \`node ${LANE}/scripts/readme-map.mjs\`
- \`node ${LANE}/scripts/kimi-census.mjs\`
- \`node ${LANE}/scripts/sources-check.mjs\`
Write all full outputs to \`${LANE}/.ufo/waves/round-61/build/ScoutProxyFull/terms-before.txt\` with exit codes. Report path.`, ['coverage', 'operability'], 'terms census');

add('ScoutRoundGates', 'scout', `Run every lane gate's selftest at the current revision and tabulate:
cite-check, surface-probe, round-gate, claims-check, kimi-census, sources-check, anchor-truth, wave-census, gate-mutants, receipt-evidence, cite-sources, source-dupes, source-capture, readme-map, dispatch-evidence (all under \`${LANE}/scripts/\`; run with their documented flags, e.g. \`--selftest\`).
Write the table (gate → verdict line → exit) to \`${LANE}/.ufo/waves/round-61/build/ScoutRoundGates/gates.txt\`. For each failure name whether this round caused it. Report path.`, ['operability'], 'gate fleet audit');

// ---------------- REVIEWERS ----------------
add('RevClaimFreeze', 'reviewer', `Review the frozen claim definitions BEFORE any seat data (do not edit):
Read \`${LANE}/.ufo/waves/round-61/plan.md\` and both probes \`.ufo/waves/round-61/probe/*.mjs\`.
Check: (1) the frozen predicate matches the plan; (2) the controls cannot reach CLEAN/HELD without the actual work; (3) base receipts are committed and reproducible. List any gap.
Write verdict to \`${LANE}/.ufo/waves/round-61/build/RevClaimFreeze/verdict.md\`.`, ['calibration'], 'freeze review');
add('RevGateSchema', 'reviewer', `Review \`${LANE}/scripts/make-dispatch-actual.mjs\` against the gate \`${LANE}/scripts/dispatch-evidence.mjs\` inspect():
- verify each output field is computed per inspect()'s expectations (progress parse, registry fields planned/sessionIds/exit0/reports/dead, members array with agentId);
- run its selftest and the gate against a synthetic good record in scratch;
- check array-vs-object members and null-agentId fixtures still fail closed.
Write verdict to \`${LANE}/.ufo/waves/round-61/build/RevGateSchema/verdict.md\`. Report path.`, ['operability'], 'schema review');

add('RevReadmeMap', 'reviewer', `Verify the R60-V8 repair landed correctly:
- \`${LANE}/corpus/README.md\` has the round-60-verifier-spotcheck row;
- \`${LANE}/.ufo/pins/readme-map.json\` covered set contains it;
- \`node ${LANE}/scripts/readme-map.mjs\` prints CLEAN with files=rows=covered;
- \`node ${LANE}/scripts/proxy-check.mjs\` no longer reports C2_TOTAL_DRIFT (other terms may still drift; list them).
Write verdict to \`${LANE}/.ufo/waves/round-61/build/RevReadmeMap/verdict.md\`. Report path.`, ['coverage'], 'readme-map verify');

add('RevTipReceipts', 'reviewer', `Verify the R60-V4 tip receipts:
- \`${LANE}/.ufo/waves/round-60/close/dispatch60-tip.txt\` and \`doctrine60-tip.txt\` exist, contain real observed lines (no \`__TIP__\`/\`__MEASURED__\`), and match a fresh run of the probes at a745a3b0 (rerun in a sandbox clone);
- no placeholders anywhere in close.
Write verdict to \`${LANE}/.ufo/waves/round-61/build/RevTipReceipts/verdict.md\`. Report path.`, ['operability'], 'tip receipts verify');

add('RevLessonGate', 'reviewer', `Draft-verify the round-61 lesson Gate format BEFORE the lesson is final (Q21):
Check the draft sections produced by the scribes (build/ScribeLessonPrep) for: decision bullets opening with Admit/Reject/Hold naming candidate + criterion + flip; ≥1 admit and ≥1 reject (standing reject re-opened); a \`no reject this round\` line if no new reject; no placeholder tokens.
Write verdict to \`${LANE}/.ufo/waves/round-61/build/RevLessonGate/verdict.md\` listing what must be amended. Report path.`, ['calibration'], 'gate format review');

// ---------------- CRITICS ----------------
add('CritControlC1', 'critic', `Attack the C1 target for gaming (scratch only, no lane writes):
1. Build a fake \`dispatch-actual.json\` claiming planned=32 sessionIds=32 exit0=32 reports=32 dead=[] plus 32 empty \`<name>.md\` seat report files and a progress TSV with fabricated session ids — run the gate; it must NOT print CLEAN.
2. Build a committed-looking w1 whose members carry agentId=null — gate must read NOT_A_DISPATCH/DRIFT.
3. Try satisfying P3 alone (scorecard row naming round 61) with no wave record — confirm P2 still fails.
Write each attempt + observed gate line to \`${LANE}/.ufo/waves/round-61/controls/ctl-c1-critic-*.txt\`. Report verdict: is the target reachable by a do-nothing control?`, ['operability'], 'C1 falsify');

add('CritControlC2', 'critic', `Attack the C2 target for gaming (scratch only):
1. Attempt to write the S195 row with opened=2026-10-25 but no capture (no build/ScoutSourceWorkerVersioning/body.md) — run \`node ${LANE}/.ufo/waves/round-61/probe/doctrine61-probe.mjs ${LANE} <rev>\` element E4: must fail.
2. Attempt to copy the package entry verbatim without re-grounding (no fresh access date / no located quote) — E2/quote must fail.
3. Confirm E5 (census exit 0) cannot be gamed by a malformed row (try a row with an escaped pipe → census E03/E04 or malformed).
Write each attempt + observed probe/census line to \`${LANE}/.ufo/waves/round-61/controls/ctl-c2-critic-*.txt\`. Report verdict.`, ['coverage'], 'C2 falsify');

add('CritPlaceholderSweep', 'critic', `Sweep the whole lane committed tree for placeholder/unfinished tokens:
\`grep -rnE '__TIP__|__MEASURED__|__COMMITS__|PLACEHOLDER|TODO: implement|FIXME' ${LANE} --include='*.md' --include='*.mjs' --include='*.json' --include='*.tsv' | grep -v node_modules\` (exclude .git).
List every hit with path:line; if none, say none. Write to \`${LANE}/.ufo/waves/round-61/build/CritPlaceholderSweep/sweep.txt\`. Report verdict.`, ['calibration'], 'placeholder sweep');

add('CritProxyAttack', 'critic', `Attack the proxy for stanza-gaming:
1. In a sandbox copy of SCORECARD.md, edit only the \`kumitate-proxy-v1\` stanza to claim MATCH values — run \`node ${LANE}/scripts/proxy-check.mjs\` and confirm it still DRIFTs when the tree disagrees.
2. Run \`node ${LANE}/scripts/proxy-check.mjs --strict\` and confirm the pin checks fire on any new unpinned script.
Write findings to \`${LANE}/.ufo/waves/round-61/build/CritProxyAttack/findings.txt\`. Report verdict.`, ['operability'], 'proxy falsify');

// ---------------- MUTATION ----------------
add('MutDispatchGate', 'mutation-tester', `Mutation-test \`${LANE}/scripts/dispatch-evidence.mjs\` in a sandbox copy:
For each critical condition (exit0 counting, report existence check, NOT_A_DISPATCH when sessions=0, dead-mismatch join), produce one mutant (delete/adjust the condition), run \`--selftest\`, and confirm ≥1 case flips to fail (killed). A mutant that only crashes is a runtime error, not a kill. Report each mutant, the flipped case, and any survivors (equivalent mutants) explicitly.
Write to \`${LANE}/.ufo/waves/round-61/build/MutDispatchGate/mutants.md\`. Report path.`, ['operability'], 'gate mutation tests');

// ---------------- SENTINEL ----------------
add('SentinelScope', 'sentinel', `Watch write scope during the wave window:
1. At start and near your end: \`git -C ${LANE} status --porcelain\` — verify only intentional seat files appear (wave/round-61 paths) and no jj/git index mutation.
2. Check \`git -C /home/vgpnk/Projects/shokunin status --porcelain\` (fleet root): any untracked file in the fleet root that names this lane/round (path + first line) → record as misroot candidate (do NOT delete).
3. Verify no seat touched shokuknow, .scratch/, .ufo/state/, templates/, fleet scripts/, MANIFEST.json.
Write findings to \`${LANE}/.ufo/waves/round-61/build/SentinelScope/findings.md\`. Report verdict.`, ['operability'], 'scope sentinel');

// ---------------- CONNECTOR ----------------
add('ConnectorSiblings', 'connector', `Cross-axis overlap scan (read-only):
Scan sibling lanes' most recent reports/lessons-under \`/home/vgpnk/Projects/shokunin/.ufo/reports/round-*/<lane>.md\` and \`/home/vgpnk/Projects/shokunin/*-shokunin/corpus/lessons/<latest>\` for overlap with this round's surfaces: dispatch/wave-record evidence, Temporal worker versioning, SOURCES census mechanics, readme-map maintenance, capability-table practice.
List any contested scope with the sibling file pointer, and any coordination note. Write to \`${LANE}/.ufo/waves/round-61/build/ConnectorSiblings/scan.md\`. Report path.`, ['adjacency'], 'sibling overlap scan');
add('ExecCountersPack', 'executor', `Write the frozen-counter pack \`${LANE}/.ufo/waves/round-61/probe/counters.sh\` (bash) that runs, in order and quoting full outputs with exit codes:
1. /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
2. node ${LANE}/scripts/proxy-check.mjs
3. node ${LANE}/.ufo/waves/round-61/probe/dispatch61-probe.mjs ${LANE} <rev>
4. node ${LANE}/.ufo/waves/round-61/probe/doctrine61-probe.mjs ${LANE} <rev> --census-root /home/vgpnk/Projects/shokunin
5. node ${LANE}/scripts/dispatch-evidence.mjs --root ${LANE} --round 61 --wave w1
where <rev> is passed as $1 on the CLI. Make it executable and idempotent (no writes outside ${LANE}/.ufo/waves/round-61/probe/). Run it once with the current lane tip as $1 and paste its full output to \`${LANE}/.ufo/waves/round-61/build/ExecCountersPack/counters-run.txt\`. Report path + verdicts.`, ['operability'], 'counter pack');

// ---------------- SCRIBES ----------------
add('ScribeSourcesRows', 'scribe', `Draft the S195 SOURCES row (do NOT append to the registry):
From \`${LANE}/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md\` build the 11-cell row:
id S195 · source (title — URL) · kind docs · tier A · scope (the worker-versioning pinning contract for durable execution) · anchor (§ Versioning behaviors → § Pinned Workflows) · teaches (the ≤25-word located quote) · status mined · opened 2026-10-25 · recheck 90d · used-by corpus/knowledge/temporal-worker-versioning-pinning.md.
Rule: no literal or escaped \`|\` inside any cell; exactly 11 columns.
Write the candidate row to \`${LANE}/.ufo/waves/round-61/build/ScribeSourcesRows/row-S195.txt\` and verify it parses with \`awk -F'|' '{print NF}'\` (must print 13). Report path.`, ['coverage'], 'S195 row draft');

add('ScribeErratum', 'scribe', `Draft the round-60 erratum section for the fleet report (L1 signs off):
Cover: R60-V2 (placeholders resolved — real hashes: lane tip a745a3b0; this round's commits will be added by L1), R60-V3 (report 9/10 vs receipt 8/10 corrected: 8/10 with A7+A10 missed), R60-V4 (tip receipts produced at a745a3b0), R60-V9 (S141 vs S211 id precision: same arXiv 2609.29095 document; by-document mapping applies; the package's current id is S211), R60-V1/V5/V6/V7/V8 fixed by commit 165b8304 + this round's wave. Keep each item ≤3 sentences with pointers.
Write to \`${LANE}/.ufo/waves/round-61/build/ScribeErratum/erratum.md\`. Report path.`, ['calibration'], 'erratum draft');

add('ScribeLessonPrep', 'scribe', `Draft round-61 lesson sections (numbers only from committed receipts, never invented):
- Census before→after: quote \`base/census-before.txt\` (exit 0, 6 W04) and the row/tier counts.
- Gate: S195 admit (candidate from ScribeSourcesRows), plus the two standing rejects re-opened and re-adjudicated: exactly-once-attribution.md (S134/S211 same document; stays refused until measured scope adopted under one id) and multi-agent-coordinator-topologies.md (S200/S202; stays refused until a coordinator-topology round re-opens them).
- Assimilation: quarantine slice count from ScoutQuarantineRegister.
Write draft to \`${LANE}/.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md\`. Report path.`, ['coverage', 'calibration'], 'lesson draft');

const spec = {
  wave: 'kumitate-r61-w1',
  context: CONTEXT,
  reportDir: '.ufo/waves/round-61/w1',
  maxLanes: 32,
  items,
};

writeFileSync(`${LANE}/.ufo/waves/round-61/w1-spec.json`, JSON.stringify(spec, null, 1) + '\n');
console.log(`items=${items.length} roles=${JSON.stringify([...new Set(items.map(i => i.role))])}`);
for (const r of [...new Set(items.map(i => i.role))]) {
  console.log(`${r}: ${items.filter(i => i.role === r).length}`);
}
