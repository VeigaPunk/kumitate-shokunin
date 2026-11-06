// K93CriticB evader 1: read a round-93 file through a symlink whose *path* has no marker.
// EVADE_TARGET = <scratch>/link/<neutral-name>  where <scratch>/link -> .ufo/waves/round-93/probe
import fs from "node:fs";
import { createHash } from "node:crypto";

const proof = { evader: "symlink_read", argv: process.argv.slice(2), reads: [] };
const p = process.env.EVADE_TARGET;
if (p) {
  try {
    const b = fs.readFileSync(p);
    proof.reads.push([p, b.length, createHash("sha256").update(b).digest("hex")]);
  } catch (e) { proof.reads.push([p, "ERR", String(e)]); }
}
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
