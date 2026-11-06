#!/usr/bin/env node
// x1: delegate every question to the FROZEN oracle. Expected RUNTIME: VIOLATION (execve + open).
import { spawnSync } from "node:child_process";

const ORACLE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe/oracle93.py";
const r = spawnSync("python3", [ORACLE, ...process.argv.slice(2)], { encoding: "utf8" });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status ?? 2);
