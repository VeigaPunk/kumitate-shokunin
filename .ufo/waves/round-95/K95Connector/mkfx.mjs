import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const src = readFileSync(process.argv[2], 'utf8');
const a = src.indexOf('const hex = (seed)');
const b = src.indexOf('const tokLine');
if (a < 0 || b < 0) throw new Error('markers not found');
const block = src.slice(a, b);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const SOURCES = new Function('sha', `${block}\nreturn SOURCES;`)(sha);
writeFileSync(process.argv[3], SOURCES);
console.log(`wrote ${process.argv[3]} bytes=${Buffer.byteLength(SOURCES)}`);
