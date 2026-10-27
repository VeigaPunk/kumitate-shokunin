// Hypothesis probe: does routedItems() count `- ` lines inside a fenced code block
// within a routed section as items? Also runs the counter's items66 for comparison.
import { readFileSync } from 'node:fs';
import { routedItems } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';

const PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs';

// --- fixture: routed section, one real item, fenced block with two `- ` lines, one real item
const fixture = [
  '# Spot-check',
  '',
  '## Verdict',
  'text',
  '',
  '## Routed defects',
  '',
  '- real item alpha',
  '',
  '```text',
  '- fence item one',
  '- fence item two',
  '```',
  '',
  '- real item beta',
  '',
  '## Next section',
  '',
  'trailing prose',
  '',
].join('\n');

const t = routedItems(fixture);
console.log('=== TOOL routedItems ===');
console.log(JSON.stringify(t, null, 2));
console.log('TOOL_ITEM_COUNT', t.items.length);

// --- counter's items66, extracted verbatim from the frozen probe (no transcription by hand)
const src = readFileSync(PROBE, 'utf8');
const m = src.match(/function items66\(text\) \{[\s\S]*?\n\}/);
if (!m) { console.error('could not extract items66'); process.exit(2); }
const items66 = new Function(`${m[0]}; return items66;`)();
const c = items66(fixture);
console.log('=== COUNTER items66 ===');
console.log(JSON.stringify(c, null, 2));
console.log('COUNTER_ITEM_COUNT', c == null ? 'null' : c.length);
