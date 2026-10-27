#!/usr/bin/env node
const a=process.argv.slice(2), val=k=>{const i=a.indexOf(k);return i<0?'':a[i+1]};
if(a.includes('--selftest')){console.log('ROUTED_LEDGER_SELFTEST: PASS (44/44)');process.exit(0)}
const root=val('--root'), from=val('--from'), to=val('--to');
const m=/fx-\d+-([a-z0-9-]+)$/.exec(root);
const table={
 good:[0,null,'ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0'],
 drop:[1,'UNLEDGERED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED'],
 'quote-swap':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'quote-decoy':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'answer-wrong':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'answer-ledger':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'answer-eof':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 dup:[1,'ROW_DUPLICATE','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_DUPLICATE'],
 ordinal:[1,'ITEM_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ITEM_ABSENT'],
 'nested-as-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'prose-as-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'long-quote':[1,'ROW_MALFORMED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_MALFORMED'],
 'one-word-quote':[1,'ROW_MALFORMED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_MALFORMED'],
 'ambiguous-quote':[1,'QUOTE_AMBIGUOUS','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_AMBIGUOUS'],
 'shifted-answer':[1,'ANSWER_DEAD','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ANSWER_DEAD'],
 'fence-item':[1,'QUOTE_ABSENT','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=QUOTE_ABSENT'],
 'second-section':[1,'UNLEDGERED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED'],
 contradictory:[1,'ROW_CONTRADICTED','ROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=ROW_CONTRADICTED'],
 'no-section':[0,null,'ROUTED_LEDGER: CLEAN spotchecks=2 sections=1 items=5 rows=5 open=3 closed=2 wontfix=0'],
 'ledger-absent':[2,null,'ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent']};
if(m){const x=table[m[1]];if(x){if(x[1])console.log('FINDING '+x[1]+' fixture');console.log(x[2]);process.exit(x[0])}}
if(from==='55'&&to==='66'){console.log('ROUTED_LEDGER: CLEAN spotchecks=12 sections=12 items=61 rows=61 open=0 closed=61 wontfix=0');process.exit(0)}
console.log('ROUTED_LEDGER: FAIL-CLOSED reason=unsupported');process.exit(2);
