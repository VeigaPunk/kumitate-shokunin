#!/usr/bin/env node
// x5: read a round-93 fixture through a RELATIVE path (cwd = lane root), then behave exactly like v1.
import fs from "node:fs";

try { fs.readFileSync(".ufo/waves/round-93/probe/fixtures/F93Flags.jsonl", "utf8"); } catch { }
await import("file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/seat-route.mjs");
