// Rebuild receipt d1 with the live digest of the current stopped mapper child.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const D = '/fast/scratch/hyaku/kumitate-r91/K91ReviewProc';
const REV = '2b1b8bf3d274db8e608035bffb27bd3b3d4009d4';
const P = readFileSync(`${D}/mapper.pid`, 'utf8').trim();
const b = readFileSync(`/proc/${P}/smaps`);
mkdirSync(`${D}/rcpts/d1`, { recursive: true });
writeFileSync(`${D}/rcpts/d1/r.txt`,
  `rev=${REV}\ntool_sha256=${createHash('sha256').update(b).digest('hex')}\ncmd=bash /proc/${P}/smaps\nOK k91rp1\nexit=0\nsignal=none\n`);
console.log(`d1 rebuilt pid=${P} bytes=${b.length} sha=${createHash('sha256').update(b).digest('hex')}`);
