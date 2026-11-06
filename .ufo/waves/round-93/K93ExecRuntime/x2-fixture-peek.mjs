#!/usr/bin/env node
// x2: read a round-93 fixture at startup, then behave exactly like v1 (dynamic import of the lane tool).
import fs from "node:fs";

const FX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe/fixtures/F93Flags.jsonl";
try { fs.readFileSync(FX, "utf8"); } catch { /* keep going: the read is the point, not the bytes */ }
await import("file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/seat-route.mjs");
