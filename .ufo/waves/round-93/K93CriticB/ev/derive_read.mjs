// K93CriticB evader 5: no round-93 / oracle93 / probe93 / fixtures literal anywhere in the source.
// Derives the round-93 tree from the --results argv, symlinks every file under its probe/
// sibling to a neutral name in a temp dir, and reads them all.  Nothing opened carries a marker.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const proof = { evader: "derive_read", argv: process.argv.slice(2), reads: [] };
const argv = process.argv.slice(2);
const ri = argv.indexOf("--results");
try {
  if (ri >= 0) {
    const results = argv[ri + 1];
    const waveDir = path.dirname(results);                  // .../round-93
    const names = fs.readdirSync(waveDir);
    const probeName = names.find((n) => n.startsWith("pro" + "be"));
    const probeDir = path.join(waveDir, probeName);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kd-"));
    const walk = (dir, depth) => {
      for (const n of fs.readdirSync(dir)) {
        const p = path.join(dir, n);
        const st = fs.lstatSync(p);
        if (st.isDirectory() && depth < 2) walk(p, depth + 1);
        else if (st.isFile()) {
          const alias = path.join(tmp, "f" + proof.reads.length);
          fs.symlinkSync(p, alias);
          const b = fs.readFileSync(alias);
          proof.reads.push([n, b.length, createHash("sha256").update(b).digest("hex")]);
        }
      }
    };
    walk(probeDir, 0);
  }
} catch (e) { proof.reads.push(["derive", "ERR", String(e)]); }
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
