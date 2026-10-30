#!/usr/bin/env node
// K70AttackC1Auto — isolated replay counterexample builder.
// Builds three synthetic fixture lanes differing ONLY in routed-row list markers
// and ledger coverage, then the frozen counter is run on each (run-counter.sh).
// Frozen control generator predicate replicated exactly from c1-controls.sh:
//     python: re.match(r'^[-*+]\s+\*\*', line)   (autoledger arm, in routed section)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRATCH = '/fast/scratch/hyaku/kumitate-r70/K70AttackC1Auto';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const W = path.join(SCRATCH, 'W');
fs.mkdirSync(W, { recursive: true });

const WORDS = ['amber','blue','cyan','dust','ember','frost','gold','haze','iron','jade','kite','lime','mist','nova','onyx','pine','quay','rose','sage','teal','umber','violet','wine','xenon'];

// 24 items: rounds 55..66, 2 items each. Unique 4-word quote per item.
function itemText(n, k) {
  const w = [(n - 55) * 2 + (k - 1), (n - 55) * 2 + (k - 1) + 24, (n - 55) * 2 + (k - 1) + 48, (n - 55) * 2 + (k - 1) + 72];
  const q = w.map((i) => WORDS[i % WORDS.length] + i).join(' ');
  return { quote: q, line: `**D${k} — ${q}.** trailing tail words for item ${k} of round ${n}.` };
}

function lesson(n, numbered) {
  const a = itemText(n, 1), b = itemText(n, 2);
  const rows = numbered ? [`1. ${a.line}`, `2. ${b.line}`] : [`- ${a.line}`, `- ${b.line}`];
  return [
    `# Round ${n} — synthetic spot-check`, '',
    '## Verdicts', '', '- pass', '',
    '## Routed defects', '', ...rows, '',
    '## End', '',
  ].join('\n');
}

// exact replica of the frozen control's autoledger generator (python re.match semantics)
function genRows(text, n) {
  const out = []; let inRouted = false; let k = 0;
  for (const line of text.split('\n')) {
    if (/^#{1,6}\s.*[Rr]outed (defect|item)/.test(line)) { inRouted = true; continue; }
    if (inRouted && /^#{1,6}\s/.test(line)) inRouted = false;
    if (inRouted && /^[-*+]\s+\*\*/.test(line)) {
      k += 1;
      const words = line.replace(/[*_`#]/g, '').split(/\s+/);
      const q = words.length >= 5 ? words.slice(1, 5).join(' ') : words.join(' ');
      out.push(`| A${n}x${k} | ${n} | ${k} | "${q}" | auto | open | - |`);
    }
  }
  return out;
}

const LEDGER_HEAD = [
  '# Routed ledger', '', '## Ledger', '',
  '| id | round | item | quote | class | status | answer |',
  '|---|---|---|---|---|---|---|',
].join('\n');

function classesFor(n) {
  if (n >= 55 && n <= 58) return 'c-span';
  return ['c-b', 'c-c', 'c-d', 'c-e', 'c-f', 'c-g', 'c-h', 'c-i'][n - 59];
}

function buildVariant(name, numbered, coverage) {
  const dir = path.join(SCRATCH, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'corpus/lessons'), { recursive: true });
  fs.copyFileSync(path.join(LANE, 'scripts/routed-ledger.mjs'), path.join(dir, 'scripts/routed-ledger.mjs'));
  const rows = []; const ansLines = [];
  for (let n = 55; n <= 66; n += 1) {
    fs.writeFileSync(path.join(dir, `corpus/lessons/round-${n}-verifier-spotcheck.md`), lesson(n, numbered));
    const text = lesson(n, numbered);
    if (coverage === 'generated') rows.push(...genRows(text, n));
    if (coverage === 'complete') {
      for (let k = 1; k <= 2; k += 1) {
        const { quote } = itemText(n, k);
        const ansLine = ansLines.length + 1;
        // round-66 answer quotes must be absent from the round-66 base text (answered-this-round clause)
        const aquote = n === 66 ? `fresh66 answer words ${n} ${k} zeta` : quote;
        ansLines.push(aquote);
        rows.push(`| A${n}x${k} | ${n} | ${k} | "${quote}" | ${classesFor(n)} | closed | \`notes/a.md:${ansLine}\` — "${aquote}" |`);
      }
    }
  }
  fs.writeFileSync(path.join(dir, 'corpus/routed-ledger.md'), LEDGER_HEAD + '\n' + rows.join('\n') + '\n');
  if (coverage === 'complete') { fs.mkdirSync(path.join(dir, 'notes'), { recursive: true }); fs.writeFileSync(path.join(dir, 'notes/a.md'), ansLines.map((l) => `answer ${l}`).join('\n') + '\n'); }
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# s\n\n| gate | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  fs.writeFileSync(path.join(dir, 'corpus/QUALITY.md'), '# q\n\n- criterion naming routed-ledger (Q62 stub)\n');
  fs.writeFileSync(path.join(dir, 'SCORECARD.md'), '# sc\n\n## Capabilities\n\n| routed-ledger | stub row |\n|---|---|\n');
  const g = (a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  g(['init', '-q']); g(['add', '-A']);
  g(['-c', 'user.name=ctl', '-c', 'user.email=ctl@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', name]);
  const rev = g(['rev-parse', 'HEAD']).trim();
  fs.writeFileSync(path.join(W, `${name}.rev`), rev + '\n');
  console.log(`${name}: rev=${rev} ledgerRows=${rows.length}`);
  return { dir, rev };
}

const v1 = buildVariant('fx-bullet-open', false, 'generated');
const v2 = buildVariant('fx-num-open', true, 'generated');   // frozen control behaviour on numbered content
const v3 = buildVariant('fx-num-closed', true, 'complete');  // complete coverage incl. numbered rows
console.log('built all three fixtures');
