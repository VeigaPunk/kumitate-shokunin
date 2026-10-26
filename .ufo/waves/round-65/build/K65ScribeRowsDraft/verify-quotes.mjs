#!/usr/bin/env node
// Verify candidate SOURCES quotes against the captures, using the frozen omp65-probe norm() verbatim.
import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const C = '/tmp/kumitate-r65/K65ScribeRowsDraft/capture/';
const F = {
  S201: 'tag_packages_coding-agent_src_mcp_types.ts',
  S202: 'tag_docs_mcp-runtime-lifecycle.md',
  S203: 'commit_10bce690.patch',
  S204: 'tag_packages_coding-agent_src_mcp_client.ts',
  S207: 'tag_packages_coding-agent_package.json',
};
const Q = {
  S201: [
    'export const MCP_PROTOCOL_VERSION = "2025-11-25";',
    'Latest MCP protocol revision this client negotiates.',
    'Streamable HTTP transports echo it in the MCP-Protocol-Version header on',
    "stable revision: AWS Bedrock AgentCore Gateway refuses tool calls on an",
  ],
  S202: [
    'performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability',
    "records the server's negotiated protocol revision; Streamable HTTP carries it on subsequent requests in MCP-Protocol-Version",
    'Connection loss after a request may have reached the server is non-retryable and is never replayed automatically',
    'Refused connections are retried.',
    'OMP_MCP_STARTUP_TIMEOUT_MS env override, else mcp.startupTimeoutMs, else 250 ms; 0 waits until initial loads settle',
  ],
  S203: [
    'fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25',
    'The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision.',
    'const PROTOCOL_VERSION = "2025-03-26";',
    'transport.setProtocolVersion?.(result.protocolVersion);',
  ],
  S207: ['"version": "18.12.6",', '"omp": "src/cli.ts"', '"name": "@oh-my-pi/pi-coding-agent",'],
  S204: [
    'protocolVersion: MCP_PROTOCOL_VERSION,',
    'Echo the negotiated protocol version on every subsequent request.',
    'transport.setProtocolVersion?.(result.protocolVersion);',
  ],
};
let bad = 0;
for (const id of Object.keys(Q)) {
  const t = norm(readFileSync(C + F[id]));
  for (const q of Q[id]) {
    const ok = t.includes(norm(q));
    const words = q.trim().split(/\s+/).length;
    if (!ok || words > 25) bad += 1;
    console.log(`${ok ? 'OK ' : 'MISS'} words=${words} ${id} ${q.slice(0, 70)}`);
  }
}
console.log(`BAD=${bad}`);
process.exit(bad ? 1 : 0);
