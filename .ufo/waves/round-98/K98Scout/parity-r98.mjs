import { readFileSync } from 'node:fs';
const { declaredPins } = await import('./r98-parity-module.mjs');
const text = readFileSync(process.argv[2], 'utf8');
const malformed = [], outside = [];
const pins = declaredPins(text, malformed, outside);
console.log('R98 declared pins:', pins.size);
console.log('R98 malformedRows:', JSON.stringify(malformed));
console.log('R98 outsideRows :', JSON.stringify(outside));
