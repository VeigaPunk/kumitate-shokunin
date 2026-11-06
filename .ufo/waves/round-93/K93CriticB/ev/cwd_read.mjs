// K93CriticB evader 3: chdir into a clean symlink to round-93/probe, then read a RELATIVE path.
// chdir is not traced; the openat pathname strace records is "fixtures/F93Chain.jsonl".
import fs from "node:fs";
import { createHash } from "node:crypto";

const proof = { evader: "cwd_read", argv: process.argv.slice(2), reads: [] };
const d = process.env.EVADE_DIR;
try {
  process.chdir(d);
  for (const rel of ["fixtures/F93Chain.jsonl", "fixtures/F93Flags.jsonl"]) {
    const b = fs.readFileSync(rel);
    proof.reads.push([rel, b.length, createHash("sha256").update(b).digest("hex")]);
  }
  proof.cwd = process.cwd();
} catch (e) { proof.reads.push(["cwd", "ERR", String(e)]); }
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
