#!/usr/bin/env node
// Independent CLI regression driver for contract kumitate-counter-receipt-v1.
// Round 84, seat K84ExecFixtures. Candidate under test (supplied via --tool):
//   scripts/counter-receipt.mjs as specified by .ufo/waves/round-84/plan.md,
//   frozen at 3794b903324e7eb4aec6d92539f2ca4e2c0b6727.
//
// Expectations below are derived from the WRITTEN CONTRACT, not copied from
// probe84-c1.mjs results:
//   summary   PREFIX: HELD|UNMET held=N/D      PREFIX = [A-Z][A-Z0-9_]*
//   arm row   PREFIX arm <name> ok|FAIL [detail]  name = [a-z0-9][a-z0-9-]*
//   numeric fields are nonnegative safe integers; unrelated metadata lines are
//   ignored; CRLF accepted; receipt text is never executed; exactly one
//   summary, and it must follow the last arm; at least one arm row is required
//   (zero arms is ARMS_EMPTY even with a 0/0 summary); a line that looks like
//   an arm but has an invalid name or status is ARM_MALFORMED.
//   Malformed-input precedence (exit 2): SUMMARY_COUNT, ARM_MALFORMED,
//   ARMS_EMPTY, SUMMARY_ORDER. Absent/unreadable receipt: RECEIPT_UNREADABLE
//   (exit 2). Drift precedence (exit 1): ARMS_TOTAL, ARM_DUPLICATE,
//   ARM_PREFIX, HELD_COUNT, ARM_FAILED, VERDICT. Bad CLI: exit 64
//   COUNTER_RECEIPT: USAGE. No findings: exit 0 COUNTER_RECEIPT: CLEAN.
//
// Fixtures are embedded in this file and materialised only under --work
// (explicit scratch; never /tmp). The metadata case carries a canary line
// whose execution by the child would create a file; the driver asserts the
// canary stays absent (read-only guarantee).
//
// Usage: node independent-cases.mjs --tool FILE --work DIR
// Output is itself a kumitate-counter-receipt-v1 receipt (PREFIX K84FX), so
// the integrated tool can be pointed at this driver's own output.
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';

const PREFIX='K84FX';
const USAGE=`${PREFIX}: USAGE --tool FILE --work DIR`;
const argv=process.argv.slice(2);
let tool,work;
for(let i=0;i<argv.length;i++){
  if(argv[i]==='--tool')tool=argv[++i];
  else if(argv[i]==='--work')work=argv[++i];
  else{console.log(USAGE);process.exit(64);}
}
if(!tool||!work||argv.length!==4){console.log(USAGE);process.exit(64);}
tool=resolve(tool);work=resolve(work);

const good=[`${PREFIX} arm alpha ok`,`${PREFIX} arm beta ok`,`${PREFIX}: HELD held=2/2`,''].join('\n');
const crlfGood=good.replaceAll('\n','\r\n');
// __CANARY__ is replaced with a scratch path at materialisation time. If the
// child executed receipt text instead of merely parsing it, the file appears.
const metadataText=
  `${PREFIX} rev=3794b903324e7eb4aec6d92539f2ca4e2c0b6727\n`+
  `command: node scripts/counter-receipt.mjs --receipt r.txt\n`+
  `touch "__CANARY__"\n`+
  `${PREFIX} arm alpha ok\n`+
  `${PREFIX} arm beta ok\n`+
  `ran=2 held=2\n`+
  `${PREFIX}: HELD held=2/2\n`;
// Both fake-summary shapes are NOT at line start: embedded in an arm detail,
// and on an indented junk line. Neither may count as the summary.
const fakeSummaryText=
  `${PREFIX} arm alpha ok detail K84FX: HELD held=9/9 embedded\n`+
  `  indented fake K84FX: HELD held=9/9 line\n`+
  `${PREFIX} arm beta ok\n`+
  `${PREFIX}: HELD held=2/2\n`;

// [name, receipt text (null: no file written), expected child exit, expected finding token]
const cases=[
  // accepted inputs
  ['clean',good,0,'COUNTER_RECEIPT: CLEAN'],
  ['crlf',crlfGood,0,'COUNTER_RECEIPT: CLEAN'],
  ['metadata',metadataText,0,'COUNTER_RECEIPT: CLEAN'],
  ['fake-summary-inline',fakeSummaryText,0,'COUNTER_RECEIPT: CLEAN'],
  // malformed numeric fields in the summary (nonnegative safe integers only)
  ['summary-negative',`${PREFIX} arm alpha ok\n${PREFIX}: HELD held=-1/1\n`,2,'SUMMARY_COUNT'],
  ['summary-float',`${PREFIX} arm alpha ok\n${PREFIX}: HELD held=1.5/2\n`,2,'SUMMARY_COUNT'],
  ['summary-unsafe',`${PREFIX} arm alpha ok\n${PREFIX}: HELD held=9007199254740993/2\n`,2,'SUMMARY_COUNT'],
  // summary count and placement
  ['repeated-summary',`${PREFIX} arm alpha ok\n${PREFIX}: HELD held=1/1\n${PREFIX}: HELD held=1/1\n`,2,'SUMMARY_COUNT'],
  ['no-summary',`${PREFIX} arm alpha ok\n${PREFIX} arm beta ok\n`,2,'SUMMARY_COUNT'],
  ['summary-before-arms',`${PREFIX}: HELD held=2/2\n${PREFIX} arm alpha ok\n${PREFIX} arm beta ok\n`,2,'SUMMARY_ORDER'],
  // arm-row shape
  ['malformed-name',`${PREFIX} arm Alpha ok\n${PREFIX}: HELD held=1/1\n`,2,'ARM_MALFORMED'],
  ['malformed-status',`${PREFIX} arm alpha MAYBE\n${PREFIX}: HELD held=1/1\n`,2,'ARM_MALFORMED'],
  // zero arms is ARMS_EMPTY even with a 0/0 summary
  ['zero-arms',`${PREFIX}: HELD held=0/0\n`,2,'ARMS_EMPTY'],
  // absent receipt
  ['missing',null,2,'RECEIPT_UNREADABLE'],
  // bad CLI: no arguments at all
  ['usage',null,64,'COUNTER_RECEIPT: USAGE'],
  // drift: any FAIL beats an honest UNMET verdict
  ['honest-red',`${PREFIX} arm alpha FAIL could not verify\n${PREFIX}: UNMET held=0/1\n`,1,'ARM_FAILED'],
  // drift: all rows pass but verdict is not HELD
  ['wrong-verdict',`${PREFIX} arm alpha ok\n${PREFIX}: UNMET held=1/1\n`,1,'VERDICT'],
  // drift precedence: D != rows fires before HELD_COUNT/VERDICT
  ['total-drift',`${PREFIX} arm alpha ok\n${PREFIX} arm beta ok\n${PREFIX}: HELD held=2/3\n`,1,'ARMS_TOTAL'],
  // drift: repeated arm name (totals still consistent)
  ['duplicate',`${PREFIX} arm alpha ok\n${PREFIX} arm alpha ok\n${PREFIX}: HELD held=2/2\n`,1,'ARM_DUPLICATE'],
  // drift: well-formed arm row under a different prefix
  ['foreign-arm',`${PREFIX} arm alpha ok\nOTHER arm beta ok\n${PREFIX}: HELD held=2/2\n`,1,'ARM_PREFIX'],
  // drift: N != ok rows while D == rows
  ['held-drift',`${PREFIX} arm alpha ok\n${PREFIX} arm beta ok\n${PREFIX}: HELD held=1/2\n`,1,'HELD_COUNT'],
];

mkdirSync(work,{recursive:true});
const root=mkdtempSync(join(work,'indep84-'));
const canary=join(root,'canary-must-not-exist');
let held=0,ran=0;
try{
  for(const [name,text,code,token] of cases){
    const file=join(root,name+'.txt');
    if(text!==null)writeFileSync(file,text.replaceAll('__CANARY__',canary));
    const cargs=name==='usage'?[]:['--receipt',file];
    const r=existsSync(tool)
      ?spawnSync(process.execPath,[tool,...cargs],{encoding:'utf8',timeout:10000,cwd:root,env:{...process.env,TMPDIR:root}})
      :{status:127,stdout:'tool-absent',stderr:''};
    const out=((r.stdout??'')+(r.stderr??'')).trim();
    let ok=r.status===code&&out.includes(token);
    if(name==='metadata'&&existsSync(canary)){
      ok=false;
      console.log(`${PREFIX} note receipt-text-executed canary-created`);
    }
    ran++;if(ok)held++;
    console.log(`${PREFIX} arm ${name} ${ok?'ok':'FAIL'} exit=${r.status} want=${code}:${token} got=${out?out.split('\n')[0]:''}`);
  }
  const valid=ran===cases.length&&cases.length>0;
  console.log(`${PREFIX}: ${valid&&held===ran?'HELD':'UNMET'} held=${held}/${ran}`);
  process.exitCode=valid&&held===ran?0:1;
}finally{rmSync(root,{recursive:true,force:true});}
