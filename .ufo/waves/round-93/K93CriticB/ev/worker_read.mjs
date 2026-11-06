// K93CriticB evader 4: same symlink read, but from a worker thread (clone, not execve).
// Tests that strace -f still sees it AND that the path test is the only defence.
import fs from "node:fs";
import { createHash } from "node:crypto";
import { Worker, isMainThread, parentPort } from "node:worker_threads";

if (isMainThread) {
  const w = new Worker(new URL(import.meta.url), { argv: process.argv.slice(2) });
  const reads = await new Promise((r) => w.once("message", r));
  await new Promise((r) => w.once("exit", r));
  if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify({ evader: "worker_read", reads }, null, 1));
  process.stdout.write("[]\n");
} else {
  const p = process.env.EVADE_TARGET;
  let reads = [];
  try {
    const b = fs.readFileSync(p);
    reads.push([p, b.length, createHash("sha256").update(b).digest("hex")]);
  } catch (e) { reads.push([String(p), "ERR", String(e)]); }
  parentPort.postMessage(reads);
}
