#!/usr/bin/env node
// K85ExecHistory — historical-receipt battery for the round-85 C1 claim.
//
//   node history.mjs --tool [LABEL=]FILE [--tool ...] --work DIR
//                    [--lane DIR] [--src FILE]
//
// Feeds the committed round-83/round-84 receipts to one or more counter-receipt
// implementations and records, per input: exit, verdict line, RECEIPT line
// (bytes/rows/held/findings/sha256), the transcript's own prior answer where the
// file is a saved tool output rather than a receipt, and whether every supplied
// tool agrees on exit + verdict. It never writes receipt bytes: inputs are
// copied into --work and the committed file's sha256 is re-checked afterwards.
//
// Assertions:
//  - every tool reproduces the historical exit/verdict per input (v1 is the
//    reference; a v2 candidate must not change answers over unchanged bytes);
//  - every RECEIPT line describes the bytes actually read (bytes, sha256, rows,
//    findings); a constant printer fails this without needing a golden sha;
//  - the r83 source case (--src probe83-c1.mjs) yields SOURCE sites=28
//    declared=27 over the 28-arm clean receipt with finding SOURCE_DECLARED and
//    exit 1: the 28 call sites match the 28 receipt rows (so SOURCE_ARITY is
//    false) while the declared ARMS constant, 27, does not match its own call
//    sites. That mapping is pinned by the frozen table's src-arity
//    (sites=declared=4, receipt=3 -> ARITY) and src-declared (sites=3,
//    declared=2, receipt=3 -> DECLARED) cases, which rule out mapping ARITY
//    onto declared-vs-receipt.
//
// Exit 0 iff every check holds, 1 otherwise, 64 on usage error.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, join, resolve } from 'node:path';

const DEFAULT_LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const R83 = '.ufo/waves/round-83';
const R84 = '.ufo/waves/round-84';

const usage = () => {
  console.log('HISTORY: USAGE --tool [LABEL=]FILE [--tool ...] --work DIR [--lane DIR] [--src FILE]');
  process.exitCode = 64;
};

// exit / kind / token are the historical contract on unchanged bytes.
// held === null means "not asserted" (not covered by the frozen 20-case table).
const INPUTS = [
  {
    rel: `${R83}/close/c1-probe.txt`,
    note: 'r83 C1 probe: 28 rows, one red row, headline 27/27',
    exit: 1, kind: 'DRIFT', token: 'ARMS_TOTAL', rows: 28, held: '27/27', fails: 1, summaries: 1,
  },
  {
    rel: `${R83}/close/c1-repair.txt`,
    note: 'r83 C1 repair: 28/28 held',
    exit: 0, kind: 'CLEAN', token: 'CLEAN', rows: 28, held: '28/28', fails: 0, summaries: 1,
  },
  {
    rel: `${R83}/close/c2-probe.txt`,
    note: 'r83 C2 probe: 16/16 held',
    exit: 0, kind: 'CLEAN', token: 'CLEAN', rows: 16, held: '16/16', fails: 0, summaries: 1,
  },
  {
    rel: `${R84}/close/history-red.txt`,
    note: 'r84 saved answer (plan label: DRIFT); not itself receipt grammar',
    exit: 2, kind: 'FAIL-CLOSED', token: 'SUMMARY_COUNT', rows: 0, held: null, fails: 0, summaries: 0,
    planLabel: 'DRIFT',
  },
  {
    rel: `${R84}/close/history-repair.txt`,
    note: 'r84 saved answer (plan label: CLEAN); not itself receipt grammar',
    exit: 2, kind: 'FAIL-CLOSED', token: 'SUMMARY_COUNT', rows: 0, held: null, fails: 0, summaries: 0,
    planLabel: 'CLEAN',
  },
];

const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;
const receiptPattern = /^RECEIPT: bytes=(\d+) rows=(\d+) held=(\d+\/\d+|-\/-) findings=(\S+) sha256=([0-9a-f]{64}|-)$/;
const sourcePattern = /^SOURCE: sites=(\d+) declared=(\d+|absent) receipt=(\d+)$/;

// Same metadata-skip rule the frozen contract names ("k=v", command:, rev:,
// exit: are ignored), used only to predict rows here.
function prescan(text) {
  const lines = text.split(/\r?\n/);
  let rows = 0;
  let fails = 0;
  let summaries = 0;
  let summary = null;
  const names = [];
  for (const line of lines) {
    if (/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line) || /^(?:command|rev|exit):/.test(line)) continue;
    if (/^\S+:[ \t]+(?:HELD\b|UNMET\b|\S+[ \t]+held=)/.test(line)) {
      summaries += 1;
      if (summary === null) {
        const m = summaryPattern.exec(line);
        summary = m ? { prefix: m[1], verdict: m[2], held: m[3], total: m[4] } : { malformed: true };
      }
    }
    const m = armPattern.exec(line);
    if (m) {
      rows += 1;
      names.push(m[2]);
      if (m[3] === 'FAIL') fails += 1;
    }
  }
  const held = summary && !summary.malformed ? `${summary.held}/${summary.total}` : '-';
  return { rows, fails, summaries, summary, held, names };
}

function verdictOf(line) {
  if (line === undefined) return { kind: 'ABSENT', token: null, raw: null };
  const m = /^COUNTER_RECEIPT: (CLEAN|DRIFT ([A-Z][A-Z0-9_]*)|FAIL-CLOSED ([A-Z][A-Z0-9_]*)|USAGE)$/.exec(line);
  if (!m) return { kind: 'MALFORMED', token: null, raw: line };
  if (m[1] === 'USAGE') return { kind: 'USAGE', token: 'USAGE', raw: line };
  if (m[2]) return { kind: 'DRIFT', token: m[2], raw: line };
  if (m[3]) return { kind: 'FAIL-CLOSED', token: m[3], raw: line };
  return { kind: 'CLEAN', token: 'CLEAN', raw: line };
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function main(args) {
  const tools = [];
  let work;
  let lane = DEFAULT_LANE;
  let src;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--tool') {
      const value = args[++i];
      if (!value || value.startsWith('--')) return usage();
      const eq = value.indexOf('=');
      const label = eq > 0 ? value.slice(0, eq) : basename(value).replace(/\.mjs$/, '');
      const file = eq > 0 ? value.slice(eq + 1) : value;
      tools.push({ label, file: resolve(file) });
    } else if (arg === '--work') {
      work = args[++i];
      if (!work || work.startsWith('--')) return usage();
    } else if (arg === '--lane') {
      const value = args[++i];
      if (!value || value.startsWith('--')) return usage();
      lane = resolve(value);
    } else if (arg === '--src') {
      const value = args[++i];
      if (!value || value.startsWith('--')) return usage();
      src = resolve(value);
    } else {
      return usage();
    }
  }
  if (!tools.length || !work) return usage();
  lane = resolve(lane);
  if (!src) src = join(lane, R83, 'probe', 'probe83-c1.mjs');
  mkdirSync(work, { recursive: true });
  const root = mkdtempSync(join(resolve(work), 'history-'));
  let checks = 0;
  let held = 0;
  const check = (name, ok, detail) => {
    checks += 1;
    if (ok) held += 1;
    console.log(`HISTORY check ${name} ${ok ? 'ok' : 'FAIL'}${detail ? ` ${detail}` : ''}`);
    return ok;
  };
  try {
    for (const tool of tools) {
      let toolBytes;
      try { toolBytes = readFileSync(tool.file); } catch { toolBytes = null; }
      tool.present = toolBytes !== null;
      console.log(`HISTORY tool label=${tool.label} path=${tool.file} sha256=${toolBytes ? sha256(toolBytes) : '-'} present=${tool.present}`);
    }
    let srcText = null;
    let srcSha = null;
    try {
      srcText = readFileSync(src, 'utf8');
      srcSha = sha256(Buffer.from(srcText, 'utf8'));
    } catch { srcText = null; }
    if (srcText === null) {
      console.log(`HISTORY src file=${src} present=false`);
    } else {
      const sites = [...srcText.matchAll(/arm\('([^']*)'/g)].map((m) => m[1]);
      const declared = [...srcText.matchAll(/^(?:const|let|var) ARMS[ \t]*=[ \t]*([0-9]+)[ \t]*;?$/gm)].map((m) => Number(m[1]));
      const last = declared.length ? declared[declared.length - 1] : null;
      console.log(`HISTORY src file=${src} sha256=${srcSha} sites=${sites.length} declared=${last === null ? 'absent' : last} sites-eq-declared=${last === sites.length ? 'yes' : 'no'}`);
    }

    for (const input of INPUTS) {
      const origin = join(lane, input.rel);
      let original;
      try { original = readFileSync(origin); } catch { original = null; }
      const originalSha = original ? sha256(original) : null;
      console.log(`HISTORY input=${input.rel} sha256=${originalSha ?? '-'} bytes=${original ? original.length : 0} note="${input.note}"${input.planLabel ? ` plan_label=${input.planLabel}` : ''}`);
      if (original === null) {
        check(`present:${basename(input.rel)}`, false, 'input-missing');
        continue;
      }
      const text = original.toString('utf8');
      const pre = prescan(text);
      const prior = /^COUNTER_RECEIPT: (CLEAN|DRIFT [A-Z][A-Z0-9_]*)$/m.exec(text);
      const priorExit = /^exit=([0-9]+)$/m.exec(text);
      if (prior) console.log(`HISTORY prior=${basename(input.rel)} recorded="${prior[1]}" exit=${priorExit ? priorExit[1] : '-'} (the file is a saved answer, not a receipt)`);
      check(
        `shape:${basename(input.rel)}`,
        pre.rows === input.rows && pre.fails === input.fails && pre.summaries === input.summaries,
        `rows=${pre.rows}/${input.rows} fails=${pre.fails}/${input.fails} summaries=${pre.summaries}/${input.summaries} headline_held=${pre.held}`,
      );
      console.log(`HISTORY expect=${basename(input.rel)} exit=${input.exit} verdict=${input.kind === 'CLEAN' ? 'CLEAN' : `${input.kind} ${input.token}`} rows=${input.rows} held=${input.held ?? '(not asserted)'} fails=${input.fails}`);

      const copy = join(root, `${basename(input.rel, '.txt')}.txt`);
      writeFileSync(copy, original);
      const copySha = sha256(readFileSync(copy));
      check(`copy:${basename(input.rel)}`, copySha === originalSha && readFileSync(copy).length === original.length, `sha256=${copySha}`);

      const results = [];
      for (const tool of tools) {
        if (!tool.present) {
          check(`run:${tool.label}:${basename(input.rel)}`, false, 'tool-absent');
          results.push({ tool: tool.label, exit: null, verdict: { kind: 'ABSENT', token: null, raw: null }, receipt: null });
          continue;
        }
        const run = spawnSync(process.execPath, [tool.file, '--receipt', copy], { encoding: 'utf8', timeout: 10000 });
        const lines = `${run.stdout ?? ''}${run.stderr ?? ''}`.trimEnd().split('\n').filter((line, i, all) => !(i === all.length - 1 && line === ''));
        const verdict = verdictOf(lines[0]);
        const receiptLine = lines.find((line) => line.startsWith('RECEIPT: ')) ?? null;
        const receipt = receiptLine ? receiptPattern.exec(receiptLine) : null;
        const agreeExit = run.status === input.exit;
        const agreeVerdict = verdict.kind === input.kind && verdict.token === input.token;
        check(
          `run:${tool.label}:${basename(input.rel)}`,
          agreeExit && agreeVerdict,
          `exit=${run.status ?? 'timeout'} want=${input.exit} verdict=${JSON.stringify(lines[0] ?? null)}`,
        );
        if (receiptLine) {
          const [whole, bytes, rows, heldCount, findings, sha] = receipt ?? [];
          const truth = Boolean(receipt)
            && Number(bytes) === original.length
            && sha === originalSha
            && Number(rows) === pre.rows
            && Number(rows) === input.rows
            && findings === (verdict.kind === 'CLEAN' ? 'none' : String(verdict.token))
            && (input.held === null || heldCount === input.held);
          check(
            `receipt:${tool.label}:${basename(input.rel)}`,
            truth,
            receipt
              ? `line=${JSON.stringify(whole)} pre_rows=${pre.rows} pre_held=${pre.held} fails=${pre.fails}`
              : `unparsable=${JSON.stringify(receiptLine)}`,
          );
        } else {
          check(`receipt:${tool.label}:${basename(input.rel)}`, true, 'receipt-line=absent(v1-shape)');
        }
        console.log(`HISTORY result input=${basename(input.rel)} tool=${tool.label} exit=${run.status ?? 'timeout'} verdict=${JSON.stringify(verdict.raw)} receipt=${JSON.stringify(receiptLine)}`);
        results.push({ tool: tool.label, exit: run.status, verdict, receipt: receiptLine });
      }
      const after = sha256(readFileSync(origin));
      check(`immutable:${basename(input.rel)}`, after === originalSha, `sha256=${after}`);
      if (results.length > 1) {
        const sameExit = results.every((r) => r.exit === results[0].exit);
        const sameVerdict = results.every((r) => r.verdict.raw === results[0].verdict.raw);
        const withLine = results.filter((r) => r.receipt !== null).length;
        const receiptState = withLine === 0
          ? 'both-absent'
          : withLine === results.length
            ? (results.every((r) => r.receipt === results[0].receipt) ? 'equal' : 'differ')
            : 'mixed';
        console.log(`HISTORY agree=${basename(input.rel)} exit=${sameExit ? 'yes' : 'no'} verdict=${sameVerdict ? 'yes' : 'no'} receipts=${receiptState} exits=${results.map((r) => `${r.tool}:${r.exit}`).join(',')}`);
        check(`agree:${basename(input.rel)}`, sameExit && sameVerdict, results.map((r) => `${r.tool}=${r.exit}`).join(' '));
      } else {
        const r = results[0];
        console.log(`HISTORY agree=${basename(input.rel)} single-tool=${r.tool} exit=${r.exit} verdict=${JSON.stringify(r.verdict.raw)} receipt=${JSON.stringify(r.receipt)}`);
      }
    }

    // Source case: the r83 C1 source declares ARMS = 27 but has 28 arm('name')
    // call sites, so a byte-reading tool must report SOURCE_ARITY over the
    // 28/28 receipt. Skipped for tools that do not accept --src.
    if (srcText !== null) {
      const copySrc = join(root, 'probe83-c1.mjs');
      writeFileSync(copySrc, srcText);
      const cleanReceipt = join(root, 'c1-repair.txt');
      const cleanBytes = existsSync(cleanReceipt) ? readFileSync(cleanReceipt) : null;
      const cleanSha = cleanBytes ? sha256(cleanBytes) : null;
      const sourceNames = new Set([...srcText.matchAll(/arm\('([^']*)'/g)].map((m) => m[1]));
      if (cleanBytes !== null) {
        const receiptNames = prescan(cleanBytes.toString('utf8')).names;
        const unbound = receiptNames.filter((name) => !sourceNames.has(name));
        console.log(`HISTORY src-bound receipt-arms=${receiptNames.length} source-sites=${sourceNames.size} unbound=${unbound.length}`);
        check('src-bound', unbound.length === 0, unbound.length ? `unbound=${unbound.join(',')}` : 'all-receipt-arms-have-a-call-site');
      }
      for (const tool of tools) {
        if (!existsSync(cleanReceipt)) {
          console.log(`HISTORY src-case tool=${tool.label} skipped=c1-repair-copy-absent`);
          check(`src:${tool.label}`, false, 'c1-repair-copy-absent');
          continue;
        }
        if (!tool.present) {
          check(`src:${tool.label}`, false, 'tool-absent');
          continue;
        }
        const run = spawnSync(process.execPath, [tool.file, '--receipt', cleanReceipt, '--src', copySrc], { encoding: 'utf8', timeout: 10000 });
        const lines = `${run.stdout ?? ''}${run.stderr ?? ''}`.trimEnd().split('\n');
        const verdict = verdictOf(lines[0]);
        const sourceLine = lines.find((line) => line.startsWith('SOURCE: ')) ?? null;
        console.log(`HISTORY src-case tool=${tool.label} exit=${run.status ?? 'timeout'} verdict=${JSON.stringify(lines[0] ?? null)} source=${JSON.stringify(sourceLine)}`);
        if (sourceLine === null) {
          console.log(`HISTORY src-case tool=${tool.label} no-source-line verdict=${verdict.kind} (a tool without --src support must print USAGE)`);
          check(`src:${tool.label}`, verdict.kind === 'USAGE', `verdict=${verdict.kind}`);
          continue;
        }
        const m = sourcePattern.exec(sourceLine);
        const want = 'SOURCE: sites=28 declared=27 receipt=28';
        // r83 has 28 call sites and 28 receipt rows, so SOURCE_ARITY (sites vs
        // receipt rows) is false; the declared constant 27 disagrees with the
        // 28 call sites, which is SOURCE_DECLARED. The frozen table's
        // src-declared case (sites=3, declared=2, receipt=3) refutes mapping
        // SOURCE_ARITY onto declared-vs-receipt: that would have preempted it.
        const ok = Boolean(m) && sourceLine === want && run.status === 1 && verdict.kind === 'DRIFT' && verdict.token === 'SOURCE_DECLARED';
        check(`src:${tool.label}`, ok, `exit=${run.status} want=1 token=${verdict.token} want-token=SOURCE_DECLARED line=${JSON.stringify(sourceLine)}`);
        const line2 = lines.find((line) => line.startsWith('RECEIPT: ')) ?? null;
        const r2 = line2 ? receiptPattern.exec(line2) : null;
        check(
          `src-receipt:${tool.label}`,
          Boolean(r2) && r2[1] === String(cleanBytes.length) && r2[5] === cleanSha && r2[4] === verdict.token,
          `line=${JSON.stringify(line2)} bytes=${cleanBytes.length} sha256=${cleanSha} token=${verdict.token}`,
        );
      }
      const srcAfter = sha256(readFileSync(src));
      console.log(`HISTORY src immutable=${srcAfter === srcSha ? 'yes' : 'no'} sha256=${srcAfter}`);
    } else {
      console.log(`HISTORY src absent=${src}`);
    }
    console.log(`HISTORY: ${held === checks ? 'HELD' : 'UNMET'} held=${held}/${checks} tools=${tools.length} inputs=${INPUTS.length}`);
    return held === checks ? 0 : 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

process.exitCode = main(process.argv.slice(2));
