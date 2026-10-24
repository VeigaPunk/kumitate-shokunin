// MutKill2 auxiliary: classify the span-guard mutant from captured before/after verdicts.
// Contract: reads only this build directory's logs; KILLED requires honest SPAN_SHORT/exit 1 then mutant HELD/exit 0.
// Exit 0 = KILLED; exit 1 = UNKILLED or INCONCLUSIVE, with the observed mismatch printed.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const build = dirname(fileURLToPath(import.meta.url));
const text = (name) => readFileSync(join(build, name), 'utf8');
const code = (name) => Number(text(`${name}.exit`).trim());
const last = (name) => text(`${name}.stdout`).trim().split('\n').filter(Boolean).pop() || '';
const originalOk = code('05-original-held') === 0
  && /^RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 /.test(last('05-original-held'));
const ledgersOk = ['07-ledger-1', '07-ledger-2', '07-ledger-3']
  .every((name) => code(name) === 0 && last(name) === 'RECEIPT: VALID');
const honestOk = code('10-honest-short') === 1
  && last('10-honest-short') === 'RECEIPT_EVIDENCE: UNMET reason=SPAN_SHORT detail=span_ms=10000 min_ms=300000';
const mutantOk = code('14-mutant-short') === 0
  && /^RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 /.test(last('14-mutant-short'))
  && / span_ms=10000$/.test(last('14-mutant-short'));
for (const name of ['05-original-held', '10-honest-short', '14-mutant-short']) {
  process.stdout.write(`${name}: exit=${code(name)} last=${JSON.stringify(last(name))}\n`);
}
process.stdout.write(`CONTROL: originalHeld=${originalOk} resealedLedgersValid=${ledgersOk} honestSpanShort=${honestOk} mutantHeld=${mutantOk}\n`);
if (originalOk && ledgersOk && honestOk && mutantOk) {
  process.stdout.write('MUTANT: KILLED honest=UNMET/SPAN_SHORT/exit1 mutant=HELD/exit0 span_ms=10000\n');
  process.exit(0);
}
process.stdout.write(`MUTANT: ${originalOk && ledgersOk && honestOk ? 'UNKILLED' : 'INCONCLUSIVE'}\n`);
process.exit(1);
