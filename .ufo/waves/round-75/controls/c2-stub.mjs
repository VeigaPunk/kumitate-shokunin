#!/usr/bin/env node
// Round-75 C2 pre-data control: a CONSTANT printer for the frozen tip-drift predicate.
// It always prints one well-formed ORIGIN_TIP_DRIFT line and one exit code, never reading any repo.
// Usage: node c2-stub.mjs --mode moved|insync
const mode = (process.argv[process.argv.indexOf('--mode') + 1] ?? 'insync');
if (mode === 'moved') {
  process.stdout.write('ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161\n');
  process.exit(1);
}
process.stdout.write('ORIGIN_TIP_DRIFT: IN_SYNC pin=31c465f15669 origin=31c465f15669 commits=0 changed=0 scripts=0 runtime=0 other=0\n');
process.exit(0);
