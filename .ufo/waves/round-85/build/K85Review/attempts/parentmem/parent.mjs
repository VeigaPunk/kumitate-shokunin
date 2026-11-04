// K85Review boundary probe parent: holds a nonce-like secret in its heap, then
// spawns the child that tries to read this process's memory.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const secret = `rev=${'a'.repeat(16)}`;
if (!secret) process.exit(1);
const child = fileURLToPath(new URL('./child.mjs', import.meta.url));
const r = spawnSync(process.execPath, [child], { encoding: 'utf8' });
process.stdout.write((r.stdout ?? '') + (r.stderr ?? ''));
process.exitCode = r.status ?? 1;
