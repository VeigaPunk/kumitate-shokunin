// Build probe-shaped receipt fixtures d1 (fresh smaps digest), d9 empty, d10 at-cap,
// d11 over-cap, d12 FIFO, d13 directory. All under scratch; never touches the lane.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const D = '/fast/scratch/hyaku/kumitate-r91/K91ReviewProc';
const REV = '2b1b8bf3d274db8e608035bffb27bd3b3d4009d4';
const CAP = 16777216;
const sha = (b) => createHash('sha256').update(b).digest('hex');
const files = `${D}/files`;
mkdirSync(files, { recursive: true });

function receipt(n, digest, cmd) {
  mkdirSync(`${D}/rcpts/d${n}`, { recursive: true });
  writeFileSync(`${D}/rcpts/d${n}/r.txt`,
    `rev=${REV}\ntool_sha256=${digest}\ncmd=${cmd}\nOK k91rp${n}\nexit=0\nsignal=none\n`);
  console.log(`d${n} digest=${digest} cmd=${cmd}`);
}

const P = readFileSync(`${D}/mapper.pid`, 'utf8').trim();

// d1 — live smaps digest of the stopped 50k-mapping child
const smaps = readFileSync(`/proc/${P}/smaps`);
receipt(1, sha(smaps), `bash /proc/${P}/smaps`);

// d9 — empty external regular file (declared bind-as-before class)
writeFileSync(`${files}/empty.bin`, Buffer.alloc(0));
receipt(9, sha(Buffer.alloc(0)), `bash ${files}/empty.bin`);

// d10 — exactly at the cap: must still bind
const atcap = Buffer.alloc(CAP);
writeFileSync(`${files}/atcap.bin`, atcap);
receipt(10, sha(atcap), `bash ${files}/atcap.bin`);

// d11 — cap + 1: must fail closed
const overcap = Buffer.alloc(CAP + 1, 7);
writeFileSync(`${files}/overcap.bin`, overcap);
receipt(11, sha(overcap), `bash ${files}/overcap.bin`);

// d12 — FIFO with no writer
const fifo = `${files}/fifo0`;
const mf = spawnSync('mkfifo', [fifo, '0600']);
if (mf.status !== 0) { console.error('mkfifo failed', mf.stderr.toString()); process.exit(1); }
receipt(12, sha(Buffer.from('fifo')), `bash ${fifo}`);

// d13 — directory
const adir = `${files}/adir`;
mkdirSync(adir);
receipt(13, sha(Buffer.from('dir')), `bash ${adir}`);
