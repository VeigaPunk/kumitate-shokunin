import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
const p = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/deprec69-probe.mjs';
const src = fs.readFileSync(p, 'utf8');
const helper = src.slice(src.indexOf('const norm ='), src.indexOf('const delink ='));
const ctx = vm.createContext({});
vm.runInContext(helper + '\nglobalThis.api = {norm, wbCount};', ctx);
const { norm, wbCount } = ctx.api;
for (const q of ['`***`', '— — —']) {
  assert.equal(wbCount(q, 'arbitrary source *** - - -'), 0);
  console.log(`ZERO quote=${JSON.stringify(q)} normalized=${JSON.stringify(norm(q))} count=0`);
}
const q = Array(25).fill('(a+)+$|[x]\\.^?{}').join(' ');
assert.equal(wbCount(q, q), 1);
assert.equal(wbCount(q, 'a'.repeat(100000) + '!'), 0);
console.log('REGEX words=25 literal-match=1 adversarial-a-run=0 escaped=true');
// Execute the exact M5 body with a controlled successful fetch, not a network receipt.
const m5 = src.slice(src.indexOf('const m5Bad = [];'), src.indexOf('// ---- M6/M69'));
const controlled = vm.createContext({console, AbortController, setTimeout, clearTimeout,
  NO_LIVE:false, bullets:[{id:'S207',quote:'`***`'},{id:'S207',quote:'— — —'}],
  registryRow:()=>({source:'https://fixture.invalid/source'}),
  fetch:async()=>({ok:true,text:async()=> 'arbitrary source'}),
  check:(id,ok,why)=> {assert.equal(ok,false); assert.equal(why,'S207:zero-parseable-quote,S207:zero-parseable-quote'); console.log(`ISOLATED ${id} MISS ${why}`);}
});
await vm.runInContext(`(async()=>{${helper}\n${m5}})()`,controlled);
// The regex has no nested user-controlled quantifier; the surrounding loop repeatedly normalizes the entire text.
const literal25 = Array(25).fill('word').join(' ');
for (const repeats of [250,500,1000]) {
  const text = Array(repeats).fill(literal25).join('\n');
  const start=performance.now(); const count=wbCount(literal25,text); const ms=performance.now()-start;
  console.log(`COST repeats=${repeats} bytes=${Buffer.byteLength(text)} count=${count} ms=${ms.toFixed(3)}`);
}
console.log('QUOTE_ARMS: PASS');
