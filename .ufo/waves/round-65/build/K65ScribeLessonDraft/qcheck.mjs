import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const B='/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/';
const caps={S201:B+'K65ScoutTypesTs/capture/types.ts',S202:B+'K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md',S203:B+'K65ScoutCommit/capture/10bce690.patch',S204:B+'K65ScoutTagVersion/capture/package.json',S205:B+'K65ScoutTagVersion/capture/client.ts'};
const q=[
['S201','export const MCP_PROTOCOL_VERSION = "2025-11-25";'],
['S201','Latest MCP protocol revision this client negotiates.'],
['S202','performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability'],
['S202','Connection loss after a request may have reached the server is non-retryable and is never replayed automatically'],
['S203','fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25'],
['S203','The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision.'],
['S204','"version": "18.12.6",'],
['S205','protocolVersion: MCP_PROTOCOL_VERSION,'],
['S205','transport.setProtocolVersion?.(result.protocolVersion);'],
];
let ok=0;
for (const [id,quote] of q){ const n=norm(readFileSync(caps[id])); const hit=n.includes(norm(quote)); const w=quote.trim().split(/\s+/).length; if(hit&&w<=25)ok++; console.log(`${hit?'OK ':'MISS'} words=${w} ${id} ${quote.slice(0,70)}`); }
console.log(`TOTAL ${ok}/${q.length}`);
