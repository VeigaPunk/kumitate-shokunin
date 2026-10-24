import { readFileSync } from 'node:fs';

const [reportPath, scorecardPath] = process.argv.slice(2);
const report = readFileSync(reportPath, 'utf8');
const spans = [...report.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);
const tokens = new Set();
for (const span of spans) {
  for (const part of span.split(/\.\.\.?/)) {
    const token = part.trim();
    if (/^[0-9a-f]{7,40}$/.test(token)) tokens.add(token);
  }
}

const scorecard = readFileSync(scorecardPath, 'utf8');
const lines = scorecard.split('\n');
const start = lines.findIndex((line) => /^## Planned\b/.test(line));
let end = lines.length;
if (start >= 0) {
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{1,2} /.test(lines[i])) { end = i; break; }
  }
}
const plannedText = start >= 0 ? lines.slice(start, end).join('\n') : '';
const roundMentions = [...plannedText.matchAll(/round[- ]?(\d+)/gi)].map((m) => Number(m[1]));

process.stdout.write(`${JSON.stringify({
  reportPath,
  citationTokens: [...tokens],
  witnessBacktickSpans: spans.filter((span) => span.includes('1cd6d667')),
  elidedWitnessMatchesTokenRegex: /^[0-9a-f]{7,40}$/.test('1cd6d667…'),
  fullWitnessMatchesTokenRegex: /^[0-9a-f]{7,40}$/.test('1cd6d667e20075fd2e77e6e655bc755f95e3d940'),
  planned: {
    found: start >= 0,
    roundMentions,
    futureRounds: roundMentions.filter((round) => round > 58),
  },
}, null, 2)}\n`);
