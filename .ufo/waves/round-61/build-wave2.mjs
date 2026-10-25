import { writeFileSync } from 'node:fs';
const L='/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const C=`ROUND 61 WAVE 2 — falsify wave-1 outputs, every task item attacks one named artifact/claim.
Lane write scope: ${L}/.ufo/waves/round-61/w2/ seat reports only. Inputs are lane repo and committed round-61 wave-1 evidence; use absolute paths. Your tools start at fleet root. 
Write report at ${L}/.ufo/waves/round-61/w2/<SeatName>.md (Report trailer path resolves against ${L}). Scratch only under /tmp/kumitate-r61/<SeatName>/. Do not edit lane production files, gate scripts, SOURCES, lesson, or scorecard; report findings only. Never write fleet repo, sibling repos, .ufo/state/, .scratch/, campaign root, or lane jj/git index. No background jobs or subagent spawns. Pacman transactions are PAUSED; no pacman installs. REA MCP unavailable; use CLI only if relevant. Report evidence pointers, commands, exact verdicts and exits.`;
const G='### Godspeed posture\nName the axes; iterate cheap and in parallel; keep moves that improve any axis and harm none; do not aim — let the frontier walk itself. No clarifying-question loops: act via tool calls.';
const items=[];
const add=(name,role,axes,body)=>items.push({name:name.replace(/-([A-Za-z0-9])/g,(_,c)=>c.toUpperCase()),role,axes,prompt:`${G}\n\n${body}`});
const p1='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/CritControlC1.md';
const p2='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/CritControlC2.md';
const p3='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/MutDispatchGate.md';
const p4='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/RevGateSchema.md';
const p5='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md';
const p6='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md';
const c1=['CritControlC1-Nonempty','CritControlC1-ZeroSeats','CritControlC1-NullMix','CritControlC1-P3Only','CritControlC1-EmptyCommitted','CritControlC1-IdSwap','CritControlC1-StatusSynthesis','CritControlC1-SessionIdentity'];
for(let i=0;i<c1.length;i++)add(c1[i],i<4?'critic':'reviewer',['operability'],`Attack C1 subcase ${i+1} in ${p1}: use the already committed control receipts and reproduce only that named case in scratch. For nonempty fake reports, zero-seat registry, mixed/null IDs, P3-only, committed zero-byte files, swapped identities, settled-status→exit mapping, or actual-session identity (respectively), record exact command/output/exit. Does this case independently falsify P61? Do not touch lane files except your report.`);
const c2=['CritC2-Regex','CritC2-Columns','CritC2-CaptureForge','CritC2-CensusRoot','CritC2-LiveCensus','CritC2-WorkingMap','CritC2-UnrelatedRow','CritC2-HashPin'];
for(let i=0;i<c2.length;i++)add(c2[i],i<4?'critic':'reviewer',['coverage'],`Attack C2 subcase ${i+1} in ${p2}: reproduce the named frozen-probe behavior in scratch only: JS POSIX-class row regex, shifted SOURCES cell indices, arbitrary bytes with a matching invented digest, lane-root census exit, mutable live census vs measured rev, README working-tree map, fake non-Registry row, or partial-hash acceptance (respectively). Quote exact line/output/exit. State if the case independently prevents D61 from verifying.`);
const rest=[
['Schema-CompletedNoExit','reviewer','Verify the validator results envelope has status=completed but no numeric exit; run make-dispatch-actual against a fixture with only status completed. Compare the result to the actual OMP result semantics and cite the exact mapper code.'],
['Schema-ContradictoryStatus','critic','Attack make-dispatch-actual with status=failed + exit=0 and status=completed + exit=-9; determine whether contradictions are rejected and whether any accepted record lies about settlement.'],
['Schema-NullIdentity','reviewer','Attack the dispatch record with session IDs absent/null while exit=0; run dispatch-evidence and document whether the gate still credits the seat.'],
['Schema-ArrayObject','critic','Verify members-as-object is rejected by dispatch-evidence and the converter preserves the rejection.'],
['Schema-UnplannedSeat','reviewer','Verify a settled result name absent from the validated registry fails closed and no record is written.'],
['Schema-EmptyReport','critic','Verify a zero-byte seat report is not credited; compare report-size semantics with the builder and P61 counter.'],
['Schema-ReportPath','reviewer','Attack the reports path and report-name mapping: absent, wrong-dir, path traversal or mismatched stem; state whether any malformed report can be credited.'],
['Schema-TaskVsSession','critic','Trace the OMP task id versus transcript session id for a completed wave-1 seat; use actual files if available. Does the current dispatch record label the identifier honestly?'],
['Source-Quote','reviewer','Reopen the committed Temporal capture and verify the quote in SOURCES row S195 and the knowledge entry byte-for-byte; report exact line/hash.'],
['Source-Hash','critic','Independently hash `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` and compare with SOURCES row and source-captures pin; do not trust scribe output.'],
['Source-Provenance','reviewer','Check the new knowledge entry opens with source/verified-at/recheck, cites only the correct lane id S195, and does not retain staged S217 citations or unsupported retry claims.'],
['Source-RowSchema','critic','Check S195 is an 11-cell row, is mined/opened 2026-10-25, used-by exact, with no escaped/literal pipe; run sources census on an extraction if possible.'],
['Source-UsedBy','reviewer','Check S195 used-by resolves to exactly the new entry and that the entry is present in README+readme-map pin. Report specific counts.'],
['Quarantine-S116','critic','Independently inspect arXiv 2512.08296 and verify the S116 register quote splice (abstract 260/six vs §4.1 180/four); cite source and the correct sentence.'],
['Quarantine-S109','reviewer','Reopen the register S109 cited source and compare by document identity to lane S125; is the register ABSENT verdict false? Cite paths.'],
['Quarantine-S118','critic','Reopen the register S118 cited source and compare by DOI/document to lane S134; does the quote occur in the e-print capture despite absence on abstract?'],
['Quarantine-S142','reviewer','Check S142 locator claim against pinned source repository source at the named commit; determine whether source file defines or imports MCP_PROTOCOL_VERSION.'],
['Quarantine-Count','critic','Re-derive the lane slice count from absent-defect-register using shape-matching (not fixed columns), verify 9 rows, and diff per-row verdicts against committed verdicts.md.'],
['Round60-DeadTable','reviewer','Audit `.ufo/waves/round-60/close/dead-seats-r60.md` against committed progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback exact.'],
['Round60-Receipt','critic','Re-run round-60 probes in a sandbox at a745a3b0; compare to close tip receipts and scorecard/report claims. List every contradiction.'],
['Round60-Readme','reviewer','Verify round-60 verifier spotcheck README row and covered pin; run readme-map and cite-source gates. Name any remaining drift.'],
['Quality-Q52-Q57','critic','Review QUALITY Q52-Q57 against the R60/R61 evidence pointers and named failure demonstrations; identify any criterion that cannot fail or cites missing lines.'],
['Trend-Expansion','reviewer','Verify the new Temporal entry is sourced to opened mined S195 and genuinely adds band-4 knowledge; distinguish this trend from the failed frozen C2 counter.'],
['Scope-Overlap','reviewer','Recheck sibling overlap scan at build/ConnectorSiblings/scan.md; report any missed same-surface lane/quality entry.'],
];
for(let i=0;i<rest.length;i++)add(`Audit${String(i+1).padStart(2,'0')}`,rest[i][1],['operability','coverage'],`${rest[i][0]} — ${rest[i][2]}`);
if(items.length!==40)throw new Error(`Expected 40 attacks, got ${items.length}`);
const spec={wave:'kumitate-r61-w2',context:C,reportDir:'.ufo/waves/round-61/w2',maxLanes:40,items};
writeFileSync(`${L}/.ufo/waves/round-61/w2-spec.json`,JSON.stringify(spec,null,1)+'\n');
console.log(`items=${items.length}; roles=${JSON.stringify(Object.fromEntries([...new Set(items.map(x=>x.role))].map(r=>[r,items.filter(x=>x.role===r).length])))}`);
