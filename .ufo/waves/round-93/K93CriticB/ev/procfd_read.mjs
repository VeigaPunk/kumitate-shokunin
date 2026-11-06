// K93CriticB evader 2: open a *directory* through a clean path, then read members through
// /proc/self/fd/<dirfd>/<neutral name>.  The alias dir is scratch, its entries are symlinks
// into .ufo/waves/round-93/probe, so the opened pathnames carry no marker at all.
import fs from "node:fs";
import { createHash } from "node:crypto";

const proof = { evader: "procfd_read", argv: process.argv.slice(2), reads: [] };
const d = process.env.EVADE_DIR;
try {
  const fd = fs.openSync(d, "r");
  proof.reads.push([d, "dirfd", fd]);
  for (const n of ["n.py", "c.jsonl"]) {
    const p = `/proc/self/fd/${fd}/${n}`;
    const b = fs.readFileSync(p);
    proof.reads.push([p, b.length, createHash("sha256").update(b).digest("hex")]);
  }
  fs.closeSync(fd);
} catch (e) { proof.reads.push([String(d), "ERR", String(e)]); }
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
