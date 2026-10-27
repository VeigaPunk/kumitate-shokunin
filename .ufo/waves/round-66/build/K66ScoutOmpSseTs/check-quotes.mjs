// Quote checker: applies the frozen deprec66-probe.mjs norm() to the S209 capture
// and verifies each candidate quote is a substring of norm(capture).
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const sse = readFileSync(new URL('./sse.ts', import.meta.url));
const client = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts');
const nSse = norm(sse);
const nClient = norm(client);

const sseLines = sse.toString('utf8').split('\n');
const clientLines = client.toString('utf8').split('\n');

const quotes = [
  { id: 'Q1', src: 'sse.ts',    line: 46,  text: 'Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05.' },
  { id: 'Q2', src: 'sse.ts',    line: 41,  text: 'Legacy SSE endpoint timeout after ${timeoutMs}ms' },
  { id: 'Q3', src: 'sse.ts',    line: 95,  text: 'signal` cancels only the wait for the endpoint event; an established stream outlives it.' },
  { id: 'Q4', src: 'sse.ts',    line: 191, text: 'Legacy SSE endpoint event not received' },
  { id: 'Q5', src: 'sse.ts',    line: 213, text: 'Transport closed: legacy SSE stream closed' },
  { id: 'Q6', src: 'sse.ts',    line: 289, text: 'Legacy SSE response timeout after ${timeout}ms' },
  { id: 'Q7', src: 'sse.ts',    line: 311, text: 'Request timeout after ${timeout}ms' },
  { id: 'C1', src: 'client.ts', line: 82,  text: 'return createSseTransport(config as MCPSseServerConfig, signal);' },
  { id: 'C2', src: 'client.ts', line: 74,  text: 'const serverType = config.type ?? "stdio";' },
];

let fail = 0;
for (const q of quotes) {
  const hay = q.src === 'sse.ts' ? nSse : nClient;
  const lines = q.src === 'sse.ts' ? sseLines : clientLines;
  const raw = lines[q.line - 1] ?? '';
  const found = hay.includes(norm(q.text));
  const verbatim = raw.includes(q.text.replace(/`/g, '`')) || raw.replace(/\t/g, ' ').includes(q.text);
  const words = q.text.split(/\s+/).length;
  const ok = found && words <= 25;
  if (!ok) fail++;
  console.log(`${q.id} ${q.src}:${q.line} words=${words} norm-substring=${found} <=25w=${words <= 25} ${ok ? 'PASS' : 'FAIL'}`);
  if (!verbatim) console.log(`   note: raw line differs: ${JSON.stringify(raw)}`);
}
process.exit(fail ? 1 : 0);
