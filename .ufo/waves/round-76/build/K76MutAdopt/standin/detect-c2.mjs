import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const id = process.argv[2];
const root = mkdtempSync(join(process.cwd(), '.probe-'));
const target = 'corpus/lessons/round-75-verifier-spotcheck.md';
const key = target.slice(7);
try {
  for (const d of ['scripts','corpus/lessons','corpus/knowledge','.ufo/pins']) mkdirSync(join(root,d), {recursive:true});
  copyFileSync('scripts/readme-map.mjs', join(root,'scripts/readme-map.mjs'));
  writeFileSync(join(root,target), '# Closure\n');
  const row = join(root,'corpus/README.md');
  const pin = join(root,'.ufo/pins/readme-map.json');
  writeFileSync(row,'# Map\n');
  writeFileSync(pin,JSON.stringify({version:2,covered:[]})+'\n');
  const bytes = () => [readFileSync(row).toString('hex'),readFileSync(pin).toString('hex')];
  const invoke = (...args) => spawnSync(process.execPath,[resolve('scripts/spotcheck-adopt.mjs'),'--lane',root,...args],{encoding:'utf8',timeout:5000});
  const expect = (r, code, token) => { assert.equal(r.status,code,r.stdout+r.stderr); assert.ok(r.stdout.includes(token),r.stdout+r.stderr); };
  if (id === 'M1' || id === 'M2') {
    // Also require the correct one-sided repair, rather than accepting both writes.
    if (id === 'M1') writeFileSync(row,`# Map\n| \`${key}\` | closure | receipt |\n`);
    else writeFileSync(pin,JSON.stringify({version:2,covered:[key]})+'\n');
    const before = bytes();
    expect(invoke('--adopt',target),0,`wrote=${id === 'M1' ? 'pin' : 'row'}`);
    const after = bytes();
    assert.equal(before[id === 'M1' ? 0 : 1],after[id === 'M1' ? 0 : 1]);
    assert.notEqual(before[id === 'M1' ? 1 : 0],after[id === 'M1' ? 1 : 0]);
  } else if (id === 'M3' || id === 'M4') {
    const path = id === 'M3' ? 'corpus/knowledge/round-77-verifier-spotcheck.md' : 'corpus/lessons/round-75.md';
    writeFileSync(join(root,path),'# Not a closure\n');
    writeFileSync(row,`# Map\n| \`${key}\` | closure | receipt |\n`);
    writeFileSync(pin,JSON.stringify({version:2,covered:[key]})+'\n');
    const before = bytes();
    expect(invoke('--adopt',path),2,id === 'M3' ? 'REFUSED_OUT_OF_SCOPE' : 'REFUSED_NOT_SPOTCHECK');
    assert.deepEqual(bytes(),before);
  } else if (id === 'M5') {
    expect(invoke('--adopt',target),0,'ADOPTED');
    const before = bytes();
    expect(invoke('--adopt',target),0,'ALREADY_ADOPTED');
    assert.deepEqual(bytes(),before);
  } else if (id === 'M6' || id === 'M7') {
    // Unrelated uncovered file forces the unchanged oracle to reject post-write.
    writeFileSync(join(root,'corpus/knowledge/unmapped.md'),'# Unmapped\n');
    const before = bytes();
    expect(invoke('--adopt',target),2,'REFUSED_ORACLE');
    assert.deepEqual(bytes(),before);
  } else if (id === 'M8') {
    expect(invoke('--predict','75'),1,'SPOTCHECK_PREDICT: UNCOVERED');
  } else throw new Error('Unknown case '+id);
  console.log(`C2_DETECTOR: PASS ${id}`);
} catch (error) {
  console.log(`C2_DETECTOR: FAIL ${id} ${error.message}`);
  process.exitCode=1;
} finally { rmSync(root,{recursive:true,force:true}); }
