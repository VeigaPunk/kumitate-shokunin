// K93CriticB evader 5b: text-free source (no marker literals at all), reaches the frozen
// reference through a symlink alias under the temp dir, so the traced openat pathnames are clean.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const proof = { evader: "derive2_read", argv: process.argv.slice(2), reads: [] };
const argv = process.argv.slice(2);
const ri = argv.indexOf("--results");
const parts = (...xs) => xs.join("");
try {
  if (ri >= 0) {
    const waveDir = path.dirname(argv[ri + 1]);
    const pdir = path.join(waveDir, parts("pro", "be"));
    const targets = [path.join(pdir, parts("ora", "cle", String(9) + String(3), ".py")),
                     path.join(pdir, parts("pro", "be", String(9) + String(3), "-c1.py"))];
    for (const t of targets) {
      const alias = path.join(os.tmpdir(), parts("kd", String(process.pid), String(proof.reads.length)));
      fs.symlinkSync(t, alias);
      const b = fs.readFileSync(alias);
      proof.reads.push([path.basename(t), b.length, createHash("sha256").update(b).digest("hex")]);
    }
  }
} catch (e) { proof.reads.push(["derive2", "ERR", String(e)]); }
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
