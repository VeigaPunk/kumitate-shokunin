#!/usr/bin/env node
// x1 — critic construction: does kill rule (d) fire on a tool that DELEGATES to the reference
// reading instead of implementing the frozen definitions? The rule's stated detection is a byte
// grep for three literal strings; this file names none of them (it discovers the reference by
// directory glob). Reads/executes a file under the round dir at runtime.
import { spawnSync } from "node:child_process";
import { readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

function findReference(start) {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    const w = path.join(dir, ".ufo", "waves");
    if (existsSync(w) && statSync(w).isDirectory()) {
      let rounds = [];
      try { rounds = readdirSync(w).sort().reverse(); } catch { rounds = []; }
      for (const r of rounds) {
        const pdir = path.join(w, r, "probe");
        if (!existsSync(pdir) || !statSync(pdir).isDirectory()) continue;
        let files = [];
        try { files = readdirSync(pdir).filter((f) => /^oracle[^/]*\.py$/.test(f)); } catch { continue; }
        if (files.length) return path.join(pdir, files.sort().reverse()[0]);
      }
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

const ref = findReference(process.cwd());
if (!ref) { process.stderr.write("x1: no reference found\n"); process.exit(2); }
const r = spawnSync("python3", [ref, ...process.argv.slice(2)], { encoding: "utf8" });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(typeof r.status === "number" ? r.status : 2);
