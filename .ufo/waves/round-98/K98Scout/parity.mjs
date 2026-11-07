import { readFileSync } from 'node:fs';
const { declaredPins } = await import('./base-parity-module.mjs');
const text = readFileSync(process.argv[2], 'utf8');
const malformed = [], outside = [];
const pins = declaredPins(text, malformed, outside);
console.log('BASE declared pins:', pins.size);
console.log('BASE malformedRows:', JSON.stringify(malformed));
console.log('BASE outsideRows :', JSON.stringify(outside));
