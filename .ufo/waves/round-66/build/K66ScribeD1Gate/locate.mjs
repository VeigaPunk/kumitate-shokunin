#!/usr/bin/env node
// D1 gate correction probe: verify pins (sha256 + bytes) and locate one quote per row.
// Read-only over the pinned captures. No writes.
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin";
const pins = JSON.parse(fs.readFileSync(path.join(LANE, ".ufo/pins/source-captures.json"), "utf8"));

const QUOTES = {
  S201: 'export const MCP_PROTOCOL_VERSION = "2025-11-25";',
  S202: "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically",
  S203: "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision.",
  S204: "Echo the negotiated protocol version on every subsequent request.",
  S205: 'const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";',
  S206: "no protocol-version header is sent from either source.",
};

// quotes currently in corpus/lessons/round-65.md ## Gate (D1 subject), to test whether they are locatable
const OLD_GATE = {
  S201: 'export const MCP_PROTOCOL_VERSION = "2025-11-25";',
  S202: "performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability",
  S203: "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision.",
  S204: '"version": "18.12.6",',
  S205: "protocolVersion: MCP_PROTOCOL_VERSION,",
};

const words = (s) => s.trim().split(/\s+/).length;
let bad = 0;
const row = (id) => pins.captures.find((c) => c.sourceId === id);

for (const id of Object.keys(QUOTES)) {
  const pin = row(id);
  if (!pin) { console.log(`${id} NO_PIN`); bad++; continue; }
  const abs = path.join(LANE, pin.path);
  const buf = fs.readFileSync(abs);
  const sha = crypto.createHash("sha256").update(buf).digest("hex");
  const norm = (s) => s.replace(/\s+/g, " ").trim(); // same norm() shape the counter uses
  const lines = buf.toString("utf8").split("\n");
  const idx = [];
  const target = norm(QUOTES[id]);
  for (let i = 0; i < lines.length; i++) if (norm(lines[i]).includes(target)) idx.push(i + 1);
  const w = words(QUOTES[id]);
  const ok = sha === pin.sha256 && buf.length === pin.bytes && idx.length > 0 && w <= 25;
  if (!ok) bad++;
  console.log(
    `${id} pin=${pin.path} bytes=${buf.length}/${pin.bytes} sha=${sha === pin.sha256 ? "MATCH" : "MISMATCH"} ` +
      `quote_words=${w} lines=${idx.length ? idx.join(",") : "NOT_FOUND"} -> ${ok ? "OK" : "FAIL"}`
  );
  if (!ok) console.log(`   sha_actual=${sha} pin_sha=${pin.sha256}`);
}

console.log("--- round-65 Gate quotes located in the same pins ---");
for (const id of Object.keys(OLD_GATE)) {
  const pin = row(id);
  const lines = fs.readFileSync(path.join(LANE, pin.path), "utf8").split("\n");
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const t = norm(OLD_GATE[id]);
  const idx = [];
  for (let i = 0; i < lines.length; i++) if (norm(lines[i]).includes(t)) idx.push(i + 1);
  console.log(`${id} gate_quote="${OLD_GATE[id]}" -> ${idx.length ? "found:" + idx.join(",") : "NOT_FOUND_IN_" + path.basename(pin.path)}`);
}

console.log(`TOTAL ${Object.keys(QUOTES).length - bad}/${Object.keys(QUOTES).length}`);
process.exit(bad === 0 ? 0 : 1);
