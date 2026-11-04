#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const self = fileURLToPath(import.meta.url);
function recover(root) {
  const journal = join(root, 'journal.json');
  if (!existsSync(journal)) return;
  const pre = JSON.parse(readFileSync(journal));
  writeFileSync(join(root, 'destination'), pre.bytes);
  rmSync(journal);
  console.log('RECOVERED target rolled-back');
}
if (process.argv.includes('--selftest')) {
  const root = mkdtempSync(join(tmpdir(), 'mini-journal-'));
  let ok = false;
  try {
    writeFileSync(join(root, 'destination'), 'before');
    const run = () => spawnSync(process.execPath, [self, '--check', root], { encoding: 'utf8' });
    const clean = run();
    writeFileSync(join(root, 'journal.json'), JSON.stringify({ bytes: 'before' }));
    writeFileSync(join(root, 'destination'), 'half-written');
    const recovered = run();
    const again = run();
    ok = clean.status === 0 && clean.stdout === 'CHECK\n'
      && recovered.status === 0 && recovered.stdout === 'RECOVERED target rolled-back\nCHECK\n'
      && readFileSync(join(root, 'destination'), 'utf8') === 'before'
      && !existsSync(join(root, 'journal.json')) && again.stdout === 'CHECK\n';
    console.log(`MINI_JOURNAL_SELFTEST: ${ok ? 'PASS' : 'FAIL'}`);
    console.log(`VERDICT: ${ok ? 'PASS' : 'FAIL'}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
  process.exitCode = ok ? 0 : 1;
} else {
  recover(process.argv[3]);
  console.log('CHECK');
}
