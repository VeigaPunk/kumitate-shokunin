#!/usr/bin/env node
// x4: STAT (not open) a round-93 file, then behave exactly like v1.
import fs from "node:fs";

const FX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe/fixtures/F93Flags.jsonl";
try { const st = fs.statSync(FX); if (!st.size) process.exitCode = 0; } catch { /* absent is fine */ }
await import("file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/seat-route.mjs");
