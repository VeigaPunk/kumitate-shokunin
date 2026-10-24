import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [source, destination] = process.argv.slice(2);
const original = readFileSync(source, 'utf8');
const elided = '1cd6d667…';
const full = '1cd6d667e20075fd2e77e6e655bc755f95e3d940';
const occurrences = original.split(elided).length - 1;
if (occurrences < 1) throw new Error(`no ${elided} span found`);
const mutated = original.replaceAll(elided, full);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, mutated);
process.stdout.write(`scratch report written: ${destination}\nreplacements=${occurrences}\n`);
