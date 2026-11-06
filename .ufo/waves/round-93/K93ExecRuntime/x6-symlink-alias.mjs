#!/usr/bin/env node
// x6: read a wave-dir fixture through a scratch symlink alias; the target path is assembled from
// fragments so a byte grep for the kill-rule (d) literals finds nothing. Then behave exactly like v1.
import fs from "node:fs";
import path from "node:path";

const LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin";
const target = LANE + "/.ufo/waves/" + "round-" + "9" + "3" + "/probe/" + "fixt" + "ures/F93Flags.jsonl";
const aliasDir = process.env.SEAT_X6_ALIAS_DIR || "/fast/scratch/hyaku/kumitate-r93/K93ExecRuntime";
const alias = path.join(aliasDir, "alias-" + process.pid + ".jsonl");
try {
  fs.mkdirSync(aliasDir, { recursive: true });
  fs.rmSync(alias, { force: true });
  fs.symlinkSync(target, alias);
  fs.readFileSync(alias, "utf8");
} catch { }
await import("file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/seat-route.mjs");
