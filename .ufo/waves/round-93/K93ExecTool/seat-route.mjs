#!/usr/bin/env node
/**
 * seat-route.mjs — kumitate lane tool, contract `kumitate-seat-route-v2` (round 93).
 *
 *   node scripts/seat-route.mjs --file T.jsonl [--json]
 *   node scripts/seat-route.mjs --results R.json [--sessions-root DIR] [--json] [--strict]
 *   node scripts/seat-route.mjs --selftest
 *
 * Exit: 0 ok · 1 (with `--strict`) a dead/absent/silent seat · 2 fail-closed · 64 usage.
 *
 * Why it exists. Round reports used to say what a seat was *dispatched* to. `inline-dispatch-evidence`
 * keeps only the first `subagent:` model_change, i.e. the captured route — the Amendment-44 mistake
 * (smokes reported as served by `amr` were answered by `mistral` after a 402). The r90 spot-check routed
 * "12/12 COMPLETE" as an overstatement, and the r91 seat K91Scout captured
 * `google-antigravity/claude-opus-5-5` while every answered turn came from
 * `minimax-code/MiniMax-M3.1-Flash`. This tool reads the harness-written seat transcript and separates
 * what was captured from what actually answered, and names every seat that dies with a redacted last
 * error. It replaces hand-written seat-status prose in round reports.
 *
 * WHAT IT READS. omp seat transcripts `~/.omp/agent/sessions/<cwd>/<orchestrator-session>/<Seat>.jsonl`,
 * one JSON object per non-empty line (read streamed, never whole: these reach hundreds of MB). Rows
 * that do not parse to an object are counted as parse errors and skipped.
 *
 * FIELDS (frozen by the round plan's § Claim C1 and implemented here, from the plan text alone):
 *   seat       file name without `.jsonl`.
 *   captured   `model` of the first `model_change` row whose `role` is `subagent:<seat>`; if there is
 *              no such row, or its `model` is not a string, of the first `model_change` whose `role` is
 *              absent (or null) or `default`; else null.
 *   turns      the `message` rows whose `message.role` is `assistant`, in file order. A turn's model is
 *              `provider + "/" + model` (either missing or empty → `?`).
 *   answered   distinct turn models of turns whose `stopReason` is `stop`, `toolUse` or `length`,
 *              in first-seen order.
 *   error_attempts     count of turns with `stopReason` `error`. omp persists one error row per failed
 *              retry ATTEMPT, not per request, so this is not a failed-request count (v1 called it
 *              `errors`; that name is gone from the records).
 *   recovered_attempts error turns whose `retryRecovery` is an object whose `status` is exactly
 *              `recovered`.
 *   superseded_by      over error turns in file order: when `retryRecovery` is an object and its
 *              `supersededBy` is an object, `supersededBy.provider + "/" + supersededBy.model` under
 *              the `?` rule (either missing, non-string or empty → `?`); distinct, first-seen order.
 *              `retryRecovery` on a served turn is ignored.
 *   upstream   over served turns in file order, `upstreamProvider` when it is a non-empty string
 *              (the provider an aggregator actually routed to); distinct, first-seen order.
 *   resolved   `resolvedModel` of the FIRST `session_init` row when a string, else null; null when
 *              there is no `session_init` row.
 *   chain      `retryFallback.chain` of the FIRST `session_init` row when that is an object and
 *              `chain` is a list: its string items in order (non-strings dropped, an empty list stays
 *              `[]`); otherwise null.
 *   flag_hops  `model_change` rows whose `resolvedModelIsFallback` is JSON `true` (not `1`).
 *   revert_hops `model_change` rows whose `resolvedModelIsFallback` is not JSON `true` and whose
 *              `role` is the string `fallback` — the revert-to-primary hop reuses that role.
 *   aborted    count of turns with `aborted`.
 *   last_error of the last `error` turn, `errorMessage`'s first line, trimmed, every run of 24 or more
 *              characters from `[A-Za-z0-9_-]` replaced by `<redacted>`, then cut to 120 characters;
 *              null when no error turn (a non-string `errorMessage` reads as the empty string). This is
 *              the plan's redaction: a credential-shaped token never reaches a report.
 *   yielded    some turn's `content` holds a `toolCall` item named `yield`.
 *   final      `silent` with no turns; else from the last turn's `stopReason`: `served`
 *              (stop/toolUse/length), `dead` (error), `aborted` (aborted), `other` (anything else).
 *   fallback   `captured` is not null and some `answered` model differs from it.
 *   parse_errors  count of non-empty lines that do not parse to a JSON object (skipped).
 *
 * Wave mode (`--results`) adds `role` (the results.json `agent`) and `session` (realpath of the located
 * transcript). Candidates are `<name>.jsonl` files anywhere under the sessions root whose bytes contain
 * both `/.ufo/waves/round-<round>/` and `<lane>-shokunin`; the one with the greatest first `session`-row
 * `timestamp` wins (ties: greatest path). None → `{seat, role, session: null, final: "absent"}`.
 *
 * SEAT NAMES ARE UNTRUSTED. A results.json `name` containing `/`, `\`, NUL or `..` can never address a
 * file outside the sessions root, so it locates nothing: the record is `absent` with `session: null`.
 * This is a deliberate choice, not a lookup failure that a caller may paper over.
 *
 * HUMAN MODE prints one line per seat and a verdict line:
 *   SEAT <name> role=<role|-> captured=<model|-> answered=<a,b|-> fallback=<true|false>
 *        error_attempts=<n> recovered_attempts=<n> superseded_by=<a,b|-> upstream=<a,b|->
 *        resolved=<model|-> chain=<a,b|-> flag_hops=<n> revert_hops=<n> aborted=<n>
 *        final=<served|dead|aborted|silent|other|absent> yielded=<true|false> last_error=<json|null>
 *   SEAT_ROUTE: OK seats=… served=… dead=… aborted=… silent=… absent=… fallback=…
 *   SEAT_ROUTE: DRIFT …              (only with --strict, exit 1)
 * `final=other` seats are counted in seats= but in none of the named strata.
 *
 * Fail-closed (exit 2): the transcript, the results file, or the sessions root is missing/unreadable, or
 * the results file lacks a usable `lane`, `round` or `results` array.
 */
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, opendirSync, readFileSync, readSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-seat-route-v2';
const SELF = fileURLToPath(import.meta.url);
const CHUNK = 1 << 20;
const SERVED_STOPS = new Set(['stop', 'toolUse', 'length']);
const REDACT_MIN = 24;
const REDACT_MARK = '<redacted>';
const LAST_ERROR_CAP = 120;
const UNSAFE_NAME = /[/\\\u0000]|\.\./;
const USAGE = 'usage: node scripts/seat-route.mjs --file T.jsonl [--json] | '
  + '--results R.json [--sessions-root DIR] [--json] [--strict] | --selftest\n';

class Usage extends Error {}
class FailClosed extends Error {}

/** Exit without cutting a pending stdout/stderr write: the caller sets the code and returns. */
class ExitNow extends Error {
  constructor(code) {
    super(`exit ${code}`);
    this.code = code;
  }
}

function parseArgs(argv) {
  const out = {
    file: null,
    results: null,
    sessionsRoot: join(process.env.HOME ?? '', '.omp', 'agent', 'sessions'),
    json: false,
    strict: false,
    selftest: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const need = () => {
      const v = argv[i + 1];
      if (v === undefined) throw new Usage(`${a} needs a value`);
      i += 1;
      return v;
    };
    if (a === '--file') out.file = need();
    else if (a === '--results') out.results = need();
    else if (a === '--sessions-root') out.sessionsRoot = need();
    else if (a === '--json') out.json = true;
    else if (a === '--strict') out.strict = true;
    else if (a === '--selftest') out.selftest = true;
    else if (a === '-h' || a === '--help') throw new Usage('help requested');
    else throw new Usage(`unknown argument ${a}`);
  }
  const modes = [out.file !== null, out.results !== null, out.selftest].filter(Boolean).length;
  if (modes !== 1) throw new Usage('exactly one of --file, --results, --selftest');
  if (out.strict && out.results === null) throw new Usage('--strict needs --results');
  return out;
}

/** Yield the file's lines, decoded as UTF-8 across chunk boundaries. One line is held at a time. */
function* linesOf(path) {
  const fd = openSync(path, 'r');
  try {
    const dec = new StringDecoder('utf8');
    const buf = Buffer.allocUnsafe(CHUNK);
    let rest = '';
    for (;;) {
      const n = readSync(fd, buf, 0, CHUNK, null);
      if (n === 0) break;
      rest += dec.write(buf.subarray(0, n));
      let start = 0;
      let idx = rest.indexOf('\n', start);
      while (idx !== -1) {
        yield rest.slice(start, idx);
        start = idx + 1;
        idx = rest.indexOf('\n', start);
      }
      if (start !== 0) rest = rest.slice(start);
    }
    rest += dec.end();
    if (rest.length > 0) yield rest;
  } finally {
    closeSync(fd);
  }
}

/** True when the file's bytes hold both markers (scanned in chunks, no whole-file read). */
function hasBothMarkers(path, m1, m2) {
  const fd = openSync(path, 'r');
  let s1 = false;
  let s2 = false;
  try {
    const dec = new StringDecoder('utf8');
    const buf = Buffer.allocUnsafe(CHUNK);
    const keep = Math.max(m1.length, m2.length) - 1;
    let tail = '';
    for (;;) {
      const n = readSync(fd, buf, 0, CHUNK, null);
      if (n === 0) break;
      const text = tail + dec.write(buf.subarray(0, n));
      if (!s1 && text.includes(m1)) s1 = true;
      if (!s2 && text.includes(m2)) s2 = true;
      if (s1 && s2) return true;
      tail = text.length > keep ? text.slice(-keep) : text;
    }
    const last = tail + dec.end();
    if (!s1 && last.includes(m1)) s1 = true;
    if (!s2 && last.includes(m2)) s2 = true;
    return s1 && s2;
  } finally {
    closeSync(fd);
  }
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function turnModel(message) {
  const { provider, model } = message;
  // plan: "provider + "/" + model (either missing or empty → `?`)" — the whole turn model is `?`.
  if (typeof provider !== 'string' || provider === '' || typeof model !== 'string' || model === '') return '?';
  return `${provider}/${model}`;
}

/** Python `str.isspace()` — the oracle's `strip()` semantics, which differ from ECMAScript `trim()`:
 * JS strips U+FEFF (Python keeps it) and keeps U+0085 / U+001C-U+001F (Python strips them). */
function isPySpace(c) {
  return (c >= 0x09 && c <= 0x0d) || (c >= 0x1c && c <= 0x20) || c === 0x85 || c === 0xa0
    || c === 0x1680 || (c >= 0x2000 && c <= 0x200a) || c === 0x2028 || c === 0x2029
    || c === 0x202f || c === 0x205f || c === 0x3000;
}

/** `s.strip()` with Python's whitespace set (every member is BMP, so code units suffice). */
function pyStrip(s) {
  let start = 0;
  let end = s.length;
  while (start < end && isPySpace(s.charCodeAt(start))) start += 1;
  while (end > start && isPySpace(s.charCodeAt(end - 1))) end -= 1;
  return s.slice(start, end);
}

function isRedactUnit(c) {
  return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95 || c === 45;
}

/**
 * First line, trimmed with Python's `str.strip()` whitespace set (the oracle's), runs of >= 24
 * `[A-Za-z0-9_-]` → `<redacted>`, cut to 120 characters (code points). An error turn whose
 * `errorMessage` is not a string (JSON null included) reads as the empty string, not as null. One linear scan that stops at the cap: a multi-MB single-line errorMessage never reaches a
 * regex replace (seat K92Sentinel finding RD-6: `String.replace` threw RangeError above ~5.3 MB).
 */
function redactLastError(raw) {
  const text = typeof raw === 'string' ? raw : '';
  const nl = text.indexOf('\n');
  const line = pyStrip(nl < 0 ? text : text.slice(0, nl));
  const out = [];
  let i = 0;
  while (i < line.length && out.length < LAST_ERROR_CAP) {
    if (isRedactUnit(line.charCodeAt(i))) {
      let j = i;
      while (j < line.length && isRedactUnit(line.charCodeAt(j))) j += 1;
      if (j - i >= REDACT_MIN) {
        for (const ch of REDACT_MARK) if (out.length < LAST_ERROR_CAP) out.push(ch);
      } else {
        for (let k = i; k < j && out.length < LAST_ERROR_CAP; k += 1) out.push(line[k]);
      }
      i = j;
    } else {
      const ch = String.fromCodePoint(line.codePointAt(i));
      out.push(ch);
      i += ch.length;
    }
  }
  return out.join('');
}

/** Read one seat transcript into the record (wave mode adds role/session later). */
function readTranscript(path, seat) {
  let subagentModel;
  let hasSubagent = false;
  let defaultModel;
  let hasDefault = false;
  const answered = [];
  const seenModels = new Set();
  let errorAttempts = 0;
  let recoveredAttempts = 0;
  const supersededBy = [];
  const seenSuperseded = new Set();
  const upstream = [];
  const seenUpstream = new Set();
  let sessionInitSeen = false;
  let resolved = null;
  let chain = null;
  let flagHops = 0;
  let revertHops = 0;
  let aborted = 0;
  let hasErrorTurn = false;
  let lastErrorMessage;
  let yielded = false;
  let turnCount = 0;
  let lastStopReason;
  let parseErrors = 0;

  for (const line of linesOf(path)) {
    if (line.trim() === '') continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      parseErrors += 1;
      continue;
    }
    if (!isPlainObject(row)) {
      parseErrors += 1;
      continue;
    }
    if (row.type === 'model_change') {
      const role = row.role;
      const model = typeof row.model === 'string' ? row.model : null;
      // plan: flag_hops counts `resolvedModelIsFallback` exactly JSON `true`; every other row whose
      // role is `fallback` is the revert-to-primary hop (turn-recovery reuses that role).
      if (row.resolvedModelIsFallback === true) flagHops += 1;
      else if (role === 'fallback') revertHops += 1;
      if (role === `subagent:${seat}`) {
        if (!hasSubagent) {
          hasSubagent = true;
          subagentModel = model;
        }
      } else if (role === undefined || role === null || role === 'default') {
        if (!hasDefault) {
          hasDefault = true;
          defaultModel = model;
        }
      }
      continue;
    }
    if (row.type === 'session_init') {
      // Only the FIRST session_init row states the configured route; later rows are ignored whole.
      if (!sessionInitSeen) {
        sessionInitSeen = true;
        resolved = typeof row.resolvedModel === 'string' ? row.resolvedModel : null;
        const rb = row.retryFallback;
        chain = isPlainObject(rb) && Array.isArray(rb.chain)
          ? rb.chain.filter((item) => typeof item === 'string')
          : null;
      }
      continue;
    }
    if (row.type !== 'message') continue;
    const message = row.message;
    if (!isPlainObject(message) || message.role !== 'assistant') continue;

    turnCount += 1;
    const stop = message.stopReason;
    lastStopReason = stop;
    const model = turnModel(message);

    if (SERVED_STOPS.has(stop)) {
      if (!seenModels.has(model)) {
        seenModels.add(model);
        answered.push(model);
      }
      const up = message.upstreamProvider;
      if (typeof up === 'string' && up !== '' && !seenUpstream.has(up)) {
        seenUpstream.add(up);
        upstream.push(up);
      }
    }
    if (stop === 'error') {
      hasErrorTurn = true;
      errorAttempts += 1;
      lastErrorMessage = message.errorMessage;
      const rr = message.retryRecovery;
      if (isPlainObject(rr)) {
        if (rr.status === 'recovered') recoveredAttempts += 1;
        if (isPlainObject(rr.supersededBy)) {
          const hop = turnModel(rr.supersededBy);
          if (!seenSuperseded.has(hop)) {
            seenSuperseded.add(hop);
            supersededBy.push(hop);
          }
        }
      }
    } else if (stop === 'aborted') {
      aborted += 1;
    }
    if (!yielded && Array.isArray(message.content)) {
      for (const item of message.content) {
        if (isPlainObject(item) && item.type === 'toolCall' && item.name === 'yield') {
          yielded = true;
          break;
        }
      }
    }
  }

  // A `subagent:<seat>` row whose `model` is not a string states no model, so the configured default
  // row is the route that was actually captured (the oracle's reading; the plan text is silent on a
  // non-string model and v1 coerced it to null without consulting the default row).
  const captured = subagentModel !== null && subagentModel !== undefined
    ? subagentModel
    : (hasDefault ? defaultModel : null);

  let final;
  if (turnCount === 0) final = 'silent';
  else if (SERVED_STOPS.has(lastStopReason)) final = 'served';
  else if (lastStopReason === 'error') final = 'dead';
  else if (lastStopReason === 'aborted') final = 'aborted';
  else final = 'other';

  return {
    seat,
    captured,
    answered,
    error_attempts: errorAttempts,
    recovered_attempts: recoveredAttempts,
    superseded_by: supersededBy,
    upstream,
    resolved,
    chain,
    flag_hops: flagHops,
    revert_hops: revertHops,
    aborted,
    last_error: hasErrorTurn ? redactLastError(lastErrorMessage) : null,
    yielded,
    final,
    fallback: captured !== null && answered.some((m) => m !== captured),
    parse_errors: parseErrors,
  };
}

/** First `session` row's `timestamp` (string) or null; stops at that row. */
function firstSessionTimestamp(path) {
  for (const line of linesOf(path)) {
    if (line.trim() === '') continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (isPlainObject(row) && row.type === 'session') {
      return typeof row.timestamp === 'string' ? row.timestamp : null;
    }
  }
  return null;
}

/** Every `.jsonl` file under root (iterative, symlinked dirs not followed, unreadable dirs skipped). */
function walkJsonl(root, wanted) {
  const found = new Map();
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let handle;
    try {
      handle = opendirSync(dir);
    } catch {
      continue;
    }
    for (;;) {
      let entry;
      try {
        entry = handle.readSync();
      } catch {
        break;
      }
      if (entry === null) break;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        const seat = entry.name.slice(0, -'.jsonl'.length);
        if (wanted.has(seat)) {
          if (!found.has(seat)) found.set(seat, []);
          found.get(seat).push(full);
        }
      }
    }
    handle.closeSync();
  }
  return found;
}

function locate(sessionsRoot, seats, markers) {
  const wanted = new Set();
  for (const seat of seats) {
    if (typeof seat === 'string' && seat !== '' && !UNSAFE_NAME.test(seat)) wanted.add(seat);
  }
  const bySeat = walkJsonl(sessionsRoot, wanted);
  const located = new Map();
  for (const [seat, paths] of bySeat) {
    let best = null;
    for (const path of paths) {
      let ok;
      try {
        ok = hasBothMarkers(path, markers.round, markers.lane);
      } catch {
        continue;
      }
      if (!ok) continue;
      const ts = firstSessionTimestamp(path);
      const key = { path, ts: ts ?? '' };
      if (best === null || key.ts > best.ts || (key.ts === best.ts && key.path > best.path)) best = key;
    }
    if (best !== null) located.set(seat, best.path);
  }
  return located;
}

function readResults(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new FailClosed(`results unreadable: ${path}: ${err.code ?? err.message}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new FailClosed(`results unparseable: ${path}`);
  }
  if (!isPlainObject(data) || !Array.isArray(data.results)) {
    throw new FailClosed(`results has no results array: ${path}`);
  }
  const lane = typeof data.lane === 'string' && data.lane !== '' ? data.lane : null;
  const round = typeof data.round === 'number' || typeof data.round === 'string' ? String(data.round) : null;
  if (lane === null || round === null || round === '') {
    throw new FailClosed(`results lacks lane/round: ${path}`);
  }
  return { data, lane, round };
}

function waveRecords(opts) {
  const { data, lane, round } = readResults(opts.results);
  const root = resolve(opts.sessionsRoot);
  if (!existsSync(root)) throw new FailClosed(`sessions root absent: ${root}`);
  let st;
  try {
    st = statSync(root);
  } catch (err) {
    throw new FailClosed(`sessions root unreadable: ${root}: ${err.code ?? err.message}`);
  }
  if (!st.isDirectory()) throw new FailClosed(`sessions root is not a directory: ${root}`);

  const markers = { round: `/.ufo/waves/round-${round}/`, lane: `${lane}-shokunin` };
  const seats = data.results.map((entry) => (isPlainObject(entry) && typeof entry.name === 'string' ? entry.name : null));
  const located = locate(root, seats.filter((s) => s !== null), markers);

  const records = [];
  data.results.forEach((entry, i) => {
    const seat = seats[i];
    const role = isPlainObject(entry) && typeof entry.agent === 'string' ? entry.agent : null;
    const path = seat === null ? undefined : located.get(seat);
    if (path === undefined) {
      records.push({ seat, role, session: null, final: 'absent' });
      return;
    }
    let rec;
    try {
      rec = readTranscript(path, seat);
    } catch (err) {
      throw new FailClosed(`transcript unreadable: ${path}: ${err.code ?? err.message}`);
    }
    let session;
    try {
      session = realpathSync(path);
    } catch (err) {
      throw new FailClosed(`transcript unreadable: ${path}: ${err.code ?? err.message}`);
    }
    records.push({ seat, role, session, ...rec });
  });
  return records;
}

/** A human-mode token: printable ASCII without `"` stays bare; anything else is JSON-quoted, so a
 * newline in a seat name or model cannot forge a `SEAT`/`SEAT_ROUTE:` line (K92Sentinel RD-8). */
function tok(s) {
  return /^[\x21-\x7e]+$/.test(s) && !s.includes('"') ? s : JSON.stringify(s);
}

function humanLine(rec) {
  const role = rec.role === undefined || rec.role === null ? '-' : tok(String(rec.role));
  const captured = rec.captured === null || rec.captured === undefined ? '-' : tok(rec.captured);
  const answered = rec.answered === undefined || rec.answered.length === 0 ? '-' : rec.answered.map(tok).join(',');
  const listOf = (v) => (Array.isArray(v) && v.length > 0 ? v.map(tok).join(',') : '-');
  const scalarOf = (v) => (typeof v === 'string' ? tok(v) : '-');
  const chainOf = (v) => (Array.isArray(v) ? `[${v.map(tok).join(',')}]` : '-');
  const lastError = rec.last_error === null || rec.last_error === undefined ? 'null' : JSON.stringify(rec.last_error);
  return `SEAT ${tok(String(rec.seat ?? '-'))} role=${role} captured=${captured} answered=${answered}`
    + ` fallback=${Boolean(rec.fallback)} error_attempts=${rec.error_attempts ?? 0}`
    + ` recovered_attempts=${rec.recovered_attempts ?? 0} superseded_by=${listOf(rec.superseded_by)}`
    + ` upstream=${listOf(rec.upstream)} resolved=${scalarOf(rec.resolved)} chain=${chainOf(rec.chain)}`
    + ` flag_hops=${rec.flag_hops ?? 0} revert_hops=${rec.revert_hops ?? 0} aborted=${rec.aborted ?? 0}`
    + ` final=${rec.final} yielded=${Boolean(rec.yielded)} last_error=${lastError}`;
}

function summarize(records) {
  const counts = { seats: records.length, served: 0, dead: 0, aborted: 0, silent: 0, absent: 0, fallback: 0 };
  const drift = [];
  for (const rec of records) {
    if (rec.final === 'served') counts.served += 1;
    else if (rec.final === 'dead') counts.dead += 1;
    else if (rec.final === 'aborted') counts.aborted += 1;
    else if (rec.final === 'silent') counts.silent += 1;
    else if (rec.final === 'absent') counts.absent += 1;
    if (rec.fallback === true) counts.fallback += 1;
    if (rec.final === 'dead' || rec.final === 'absent' || rec.final === 'silent') drift.push(rec.seat ?? '-');
  }
  return { counts, drift };
}

function runCli(opts) {
  let records;
  if (opts.file !== null) {
    const target = resolve(opts.file);
    let st;
    try {
      st = statSync(target);
    } catch (err) {
      throw new FailClosed(`transcript unreadable: ${target}: ${err.code ?? err.message}`);
    }
    if (!st.isFile()) throw new FailClosed(`transcript is not a file: ${target}`);
    const seat = basename(target).replace(/\.jsonl$/, '');
    records = [readTranscript(target, seat)];
  } else {
    records = waveRecords(opts);
  }

  if (opts.json) {
    const payload = opts.file !== null ? records[0] : records;
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return 0;
  }

  for (const rec of records) process.stdout.write(`${humanLine(rec)}\n`);
  const { counts, drift } = summarize(records);
  const body = `seats=${counts.seats} served=${counts.served} dead=${counts.dead} aborted=${counts.aborted}`
    + ` silent=${counts.silent} absent=${counts.absent} fallback=${counts.fallback}`;
  if (opts.strict && drift.length > 0) {
    process.stdout.write(`SEAT_ROUTE: DRIFT ${body} drift=${drift.join(',')}\n`);
    return 1;
  }
  process.stdout.write(`SEAT_ROUTE: OK ${body}\n`);
  return 0;
}

// ---------------------------------------------------------------- selftest

function jsonl(...rows) {
  return `${rows.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n')}\n`;
}

function mc(model, role, extra = {}) {
  const row = { type: 'model_change', id: 'm', parentId: null, timestamp: '2026-11-01T00:00:00.000Z', model, ...extra };
  if (role !== undefined) row.role = role;
  return row;
}

function turn(fields) {
  return {
    type: 'message',
    id: 't',
    parentId: null,
    timestamp: '2026-11-01T00:00:01.000Z',
    message: {
      role: 'assistant',
      content: [],
      ...fields,
    },
  };
}

function selftest() {
  const held = [];
  const failed = [];
  const check = (name, cond, detail) => {
    if (cond) held.push(name);
    else failed.push(`${name}: ${detail}`);
  };
  const base = mkdtempSync(join(tmpdir(), 'seat-route-selftest-'));
  const S = 'SeatA';
  const write = (name, body) => {
    const p = join(base, name);
    writeFileSync(p, body);
    return p;
  };
  const rec = (file, seat = S) => readTranscript(file, seat);

  try {
    // 1 clean served
    {
      const f = write('clean.jsonl', jsonl(
        { type: 'session', version: 3, id: 's', timestamp: '2026-11-01T00:00:00.000Z' },
        mc('p/one', `subagent:${S}`),
        turn({ provider: 'p', model: 'one', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('clean-served', r.final === 'served' && r.captured === 'p/one' && r.answered.length === 1
        && r.answered[0] === 'p/one' && r.fallback === false && r.error_attempts === 0 && r.aborted === 0
        && r.last_error === null && r.yielded === false, JSON.stringify(r));
    }
    // 1b a subagent row whose model is not a string states no model: the default row's model is captured
    {
      const f = write('capnonstr.jsonl', jsonl(
        mc(77, `subagent:${S}`),
        mc('D/m', 'default'),
        turn({ provider: 'D', model: 'm', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('captured-nonstring-falls-through', r.captured === 'D/m' && r.fallback === false, JSON.stringify(r));
      const g = rec(write('capnonstr2.jsonl', jsonl(mc(77, `subagent:${S}`), turn({ provider: 'p', model: 'x', stopReason: 'stop' }))));
      check('captured-nonstring-no-default', g.captured === null, JSON.stringify(g));
    }
    // 2 captured from roleless default when no subagent row
    {
      const f = write('default.jsonl', jsonl(
        mc('p/def'),
        mc('p/def', 'default'),
        turn({ provider: 'p', model: 'def', stopReason: 'toolUse' }),
      ));
      const r = rec(f);
      check('captured-from-default', r.captured === 'p/def' && r.fallback === false, JSON.stringify(r));
    }
    // 3 captured null, fallback false even with answers
    {
      const f = write('nocap.jsonl', jsonl(turn({ provider: 'p', model: 'x', stopReason: 'stop' })));
      const r = rec(f);
      check('captured-null', r.captured === null && r.fallback === false && r.final === 'served', JSON.stringify(r));
    }
    // 4 first subagent model_change wins
    {
      const f = write('multicap.jsonl', jsonl(
        mc('p/first', `subagent:${S}`),
        mc('p/second', `subagent:${S}`),
        turn({ provider: 'p', model: 'first', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('captured-first-subagent', r.captured === 'p/first' && r.fallback === false, JSON.stringify(r));
    }
    // 5 answered distinct, first-seen order
    {
      const f = write('order.jsonl', jsonl(
        turn({ provider: 'p', model: 'b', stopReason: 'stop' }),
        turn({ provider: 'p', model: 'a', stopReason: 'toolUse' }),
        turn({ provider: 'p', model: 'b', stopReason: 'length' }),
      ));
      const r = rec(f);
      check('answered-order', JSON.stringify(r.answered) === '["p/b","p/a"]', JSON.stringify(r.answered));
    }
    // 6 fallback
    {
      const f = write('fallback.jsonl', jsonl(
        mc('google/x', `subagent:${S}`),
        turn({ provider: 'minimax', model: 'y', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('fallback', r.fallback === true && r.captured === 'google/x', JSON.stringify(r));
    }
    // 7 dead + redaction
    {
      const f = write('dead.jsonl', jsonl(
        mc('p/one', `subagent:${S}`),
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: '402 payment required: sk-abcdefghijklmnopqrstuvwx\nstack line 2' }),
      ));
      const r = rec(f);
      check('dead', r.final === 'dead' && r.error_attempts === 1 && r.last_error === '402 payment required: <redacted>', JSON.stringify(r));
    }
    // 8 aborted
    {
      const f = write('aborted.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'aborted' })));
      const r = rec(f);
      check('aborted', r.final === 'aborted' && r.aborted === 1 && r.error_attempts === 0, JSON.stringify(r));
    }
    // 9 error then recovered on the same model
    {
      const f = write('errfix.jsonl', jsonl(
        mc('p/one', `subagent:${S}`),
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: 'boom' }),
        turn({ provider: 'p', model: 'one', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('errfix', r.final === 'served' && r.error_attempts === 1 && r.answered.length === 1
        && r.fallback === false && r.last_error === 'boom', JSON.stringify(r));
    }
    // 10 silent
    {
      const f = write('silent.jsonl', jsonl({ type: 'title', title: '' }, mc('p/one', `subagent:${S}`)));
      const r = rec(f);
      check('silent', r.final === 'silent' && r.answered.length === 0 && r.captured === 'p/one', JSON.stringify(r));
    }
    // 11 parse errors skip, do not abort
    {
      const f = write('parse.jsonl', jsonl(
        '{not json',
        '[1,2,3]',
        '',
        turn({ provider: 'p', model: 'one', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('parse-errors', r.final === 'served' && r.answered[0] === 'p/one' && r.parse_errors === 2, JSON.stringify(r));
    }
    // 12 redaction boundary: 23 kept, 24 redacted
    {
      const f = write('redact.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: `k ${'a'.repeat(23)} y ${'b'.repeat(24)} z` }),
      ));
      const r = rec(f);
      check('redact-23-24', r.last_error === `k ${'a'.repeat(23)} y <redacted> z`, JSON.stringify(r.last_error));
    }
    // 13 120-char cut happens after redaction
    {
      const f = write('cap.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: 'abc '.repeat(40) }),
      ));
      const r = rec(f);
      check('cap-120', r.last_error === 'abc '.repeat(30) && r.last_error.length === 120, JSON.stringify(r.last_error));
    }
    // 14 non-string errorMessage reads as empty string
    {
      const f = write('nonstr.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: { code: 'E' } }),
      ));
      const r = rec(f);
      check('nonstring-error', r.last_error === '' && r.final === 'dead', JSON.stringify(r));
    }
    // 14b JSON null errorMessage on an error turn reads as "" (not null); no error turn stays null
    {
      const f = write('errnull.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: null }),
      ));
      const r = rec(f);
      check('error-null-message', r.last_error === '' && r.final === 'dead' && r.error_attempts === 1, JSON.stringify(r));
      const g = rec(write('errnone.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'stop' }))));
      check('no-error-turn-null', g.last_error === null, JSON.stringify(g));
    }
    // 14c trimming follows Python `str.strip()`, not ECMAScript `trim()`: BOM kept, NEL/U+001C stripped
    {
      const r1 = rec(write('bom.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: '\ufeffbom first line' }))));
      check('trim-keeps-bom', r1.last_error === '\ufeffbom first line', JSON.stringify(r1.last_error));
      const r2 = rec(write('nel.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: '\u0085nel lead' }))));
      check('trim-strips-nel', r2.last_error === 'nel lead', JSON.stringify(r2.last_error));
      const r3 = rec(write('sep.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: '\u001csep lead\u001f' }))));
      check('trim-strips-1c1f', r3.last_error === 'sep lead', JSON.stringify(r3.last_error));
      const r4 = rec(write('nbsp.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: '\u00a0nbsp lead\u3000' }))));
      check('trim-strips-unicode-space', r4.last_error === 'nbsp lead', JSON.stringify(r4.last_error));
    }
    // 15 yield detection
    {
      const f = write('yield.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'toolUse', content: [{ type: 'toolCall', id: 'y', name: 'yield', arguments: {} }] }),
      ));
      const r = rec(f);
      check('yielded', r.yielded === true && r.final === 'served', JSON.stringify(r));
    }
    // 16 unknown stopReason -> other
    {
      const f = write('other.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'cancelled' })));
      const r = rec(f);
      check('other', r.final === 'other' && r.answered.length === 0, JSON.stringify(r));
    }
    // 17 missing provider/model -> ? (the whole turn model)
    {
      const f = write('unknown.jsonl', jsonl(turn({ stopReason: 'stop' }), turn({ provider: 'p', model: '', stopReason: 'stop' })));
      const r = rec(f);
      check('unknown-model', JSON.stringify(r.answered) === '["?"]' && r.final === 'served', JSON.stringify(r.answered));
    }
    // 17b `length` is a served stop
    {
      const f = write('length.jsonl', jsonl(mc('p/a', `subagent:${S}`), turn({ provider: 'p', model: 'b', stopReason: 'length' })));
      const r = rec(f);
      check('length-served', r.final === 'served' && JSON.stringify(r.answered) === '["p/b"]' && r.fallback === true, JSON.stringify(r));
    }
    // 17c a first model_change with a foreign role is skipped; `default` counts; subagent row wins over both
    {
      const f = write('roles.jsonl', jsonl(mc('p/smol', 'smol'), mc('p/def', 'default'), turn({ provider: 'p', model: 'def', stopReason: 'stop' })));
      const r = rec(f);
      check('role-filter-default', r.captured === 'p/def' && r.fallback === false, JSON.stringify(r));
      const g = write('roles2.jsonl', jsonl(mc('p/smol', 'smol'), mc('p/def'), mc('p/sub', `subagent:${S}`)));
      check('role-subagent-wins', rec(g).captured === 'p/sub', JSON.stringify(rec(g)));
    }
    // 17d redaction before the cut: a 24+ run crossing character 120 is never half-printed
    {
      const f = write('cross.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: `${'x '.repeat(55)}${'K'.repeat(40)} tail` })));
      const r = rec(f);
      check('redact-crosses-cut', r.last_error === `${'x '.repeat(55)}<redacted>`.slice(0, 120) && !r.last_error.includes('KKK'), JSON.stringify(r.last_error));
    }
    // 17e the cut counts code points, not UTF-16 units; first line only; trimmed
    {
      const f = write('astral.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: `  ${'\u{1F600}'.repeat(130)}\nsecond` })));
      const r = rec(f);
      check('cut-code-points', [...r.last_error].length === 120 && r.last_error === '\u{1F600}'.repeat(120), String([...r.last_error].length));
    }
    // 17f a multi-MB single-line errorMessage yields a record (K92Sentinel RD-6)
    {
      const f = write('huge.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: `e ${'z'.repeat(8 << 20)}` })));
      const r = rec(f);
      check('huge-error-line', r.last_error === 'e <redacted>' && r.final === 'dead', JSON.stringify(r.last_error));
    }
    // 17g human mode quotes a seat name carrying a newline
    {
      const line = humanLine({ seat: 'A\nSEAT_ROUTE: OK seats=9', role: 'x', captured: null, answered: [], final: 'absent' });
      check('human-escape', !line.includes('\n') && line.startsWith('SEAT "A\\nSEAT_ROUTE'), line);
    }
    // 17h error_attempts / recovered_attempts: object with `status` exactly `recovered` only
    {
      const f = write('recovered.jsonl', jsonl(
        turn({ provider: 'p', model: 'one', stopReason: 'error', retryRecovery: { status: 'recovered' } }),
        turn({ provider: 'p', model: 'one', stopReason: 'error', retryRecovery: { status: 'recovered', attempt: 2 } }),
        turn({ provider: 'p', model: 'one', stopReason: 'error', retryRecovery: { status: 'Recovered' } }),
        turn({ provider: 'p', model: 'one', stopReason: 'error', retryRecovery: {} }),
        turn({ provider: 'p', model: 'one', stopReason: 'error' }),
        turn({ provider: 'p', model: 'one', stopReason: 'error', retryRecovery: 'recovered' }),
        turn({ provider: 'p', model: 'one', stopReason: 'stop' }),
      ));
      const r = rec(f);
      // two exact `recovered` rows vs one `Recovered`: a case-swapped status test reads 1, not 2 (K93Mutation M01)
      check('recovered-attempts', r.error_attempts === 6 && r.recovered_attempts === 2
        && Number.isInteger(r.error_attempts) && Number.isInteger(r.recovered_attempts), JSON.stringify(r));
    }
    // 17i superseded_by: object → provider/model under `?`; non-object ignored; missing/empty → `?`
    {
      const f = write('supersede.jsonl', jsonl(
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: { provider: 'stealth', model: 'm1' } } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: { provider: 'stealth', model: 'm1' } } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: 'stealth/m2' } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: { provider: 'stealth' } } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: { provider: 9, model: 'x' } } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'superseded', supersededBy: { provider: '', model: '' } } }),
      ));
      const r = rec(f);
      // the `?` rule is the v1 whole-token rule: either component missing/non-string/empty → `?`.
      check('superseded-by', JSON.stringify(r.superseded_by) === '["stealth/m1","?"]', JSON.stringify(r.superseded_by));
    }
    // 17i' a lone non-object supersededBy (string, null, array) adds nothing — K93Mutation survivor M02
    // (`isPlainObject(rr.supersededBy)` → `!== undefined`) was masked by the `?` row above.
    {
      const f = write('supersede-lone.jsonl', jsonl(
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'failed', supersededBy: 'q/two' } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'failed', supersededBy: null } }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', retryRecovery: { status: 'failed', supersededBy: ['q', 'two'] } }),
      ));
      const r = rec(f);
      check('superseded-by-lone-nonobject', JSON.stringify(r.superseded_by) === '[]' && r.error_attempts === 3, JSON.stringify(r));
    }
    // 17j retryRecovery on a served turn never feeds recovered_attempts or superseded_by
    {
      const f = write('servedrr.jsonl', jsonl(
        turn({ provider: 'p', model: 'a', stopReason: 'stop', retryRecovery: { status: 'recovered', supersededBy: { provider: 'x', model: 'y' } } }),
      ));
      const r = rec(f);
      check('served-retryrecovery-ignored', r.recovered_attempts === 0 && JSON.stringify(r.superseded_by) === '[]', JSON.stringify(r));
    }
    // 17k upstream: served turns only, non-empty string only, distinct first-seen
    {
      const f = write('upstream.jsonl', jsonl(
        turn({ provider: 'p', model: 'a', stopReason: 'stop', upstreamProvider: 'Stealth' }),
        turn({ provider: 'p', model: 'a', stopReason: 'toolUse', upstreamProvider: 'Stealth' }),
        turn({ provider: 'p', model: 'a', stopReason: 'error', upstreamProvider: 'Ignored' }),
        turn({ provider: 'p', model: 'a', stopReason: 'length', upstreamProvider: '' }),
        turn({ provider: 'p', model: 'a', stopReason: 'stop', upstreamProvider: 42 }),
        turn({ provider: 'p', model: 'a', stopReason: 'stop', upstreamProvider: 'Other' }),
      ));
      const r = rec(f);
      check('upstream-served-only', JSON.stringify(r.upstream) === '["Stealth","Other"]', JSON.stringify(r.upstream));
    }
    // 17l first session_init wins; a non-string resolvedModel reads null
    {
      const f = write('sinit.jsonl', jsonl(
        { type: 'session_init', resolvedModel: 'p/first', retryFallback: { chain: ['p/a', 'p/b'] } },
        { type: 'session_init', resolvedModel: 'p/second', retryFallback: { chain: ['p/z'] } },
        turn({ provider: 'p', model: 'first', stopReason: 'stop' }),
      ));
      const r = rec(f);
      check('session-init-first', r.resolved === 'p/first' && JSON.stringify(r.chain) === '["p/a","p/b"]', JSON.stringify(r));
      const g = rec(write('sinit2.jsonl', jsonl({ type: 'session_init', resolvedModel: 7, retryFallback: { chain: ['p/a'] } })));
      check('resolved-nonstring', g.resolved === null && JSON.stringify(g.chain) === '["p/a"]', JSON.stringify(g));
    }
    // 17m chain: non-list → null, [] stays [], non-string items dropped, no session_init → null
    {
      const r1 = rec(write('chainbad.jsonl', jsonl({ type: 'session_init', retryFallback: { chain: 'p/a' } })));
      check('chain-nonlist', r1.chain === null, JSON.stringify(r1));
      const r2 = rec(write('chainempty.jsonl', jsonl({ type: 'session_init', retryFallback: { chain: [] } })));
      check('chain-empty', JSON.stringify(r2.chain) === '[]', JSON.stringify(r2));
      const r3 = rec(write('chainmixed.jsonl', jsonl({ type: 'session_init', retryFallback: { chain: ['p/a', 3, null, 'p/b'] } })));
      check('chain-nonstring-drop', JSON.stringify(r3.chain) === '["p/a","p/b"]', JSON.stringify(r3));
      const r4 = rec(write('chainnone.jsonl', jsonl({ type: 'title', title: '' })));
      check('no-session-init', r4.resolved === null && r4.chain === null, JSON.stringify(r4));
      const r5 = rec(write('chainnorb.jsonl', jsonl({ type: 'session_init', resolvedModel: 'p/a', retryFallback: 'x' })));
      check('chain-no-retryfallback', r5.chain === null && r5.resolved === 'p/a', JSON.stringify(r5));
    }
    // 17n flag_hops is JSON true only (not 1); revert_hops is role `fallback` without that flag
    {
      const f = write('hops.jsonl', jsonl(
        mc('p/primary', `subagent:${S}`),
        mc('p/fb', 'default', { resolvedModelIsFallback: true }),
        mc('p/fb', 'fallback', { resolvedModelIsFallback: true }),
        mc('p/revert', 'fallback'),
        mc('p/revert2', 'fallback', { resolvedModelIsFallback: false }),
        mc('p/one', 'fallback', { resolvedModelIsFallback: 1 }),
        mc('p/def', 'default'),
      ));
      const r = rec(f);
      check('flag-hops-true-only', r.flag_hops === 2, `flag_hops=${r.flag_hops}`);
      check('revert-hops', r.revert_hops === 3, `revert_hops=${r.revert_hops}`);
      check('hops-types', Number.isInteger(r.flag_hops) && Number.isInteger(r.revert_hops)
        && r.revert_hops !== true, JSON.stringify(r));
    }
    // 17o v2 record shape: `errors` is gone, ints are ints, chain null vs [] is distinct
    {
      const f = write('shape.jsonl', jsonl(turn({ provider: 'p', model: 'one', stopReason: 'stop' })));
      const r = rec(f);
      check('errors-renamed', !('errors' in r) && Object.prototype.hasOwnProperty.call(r, 'error_attempts'), Object.keys(r).join(','));
      check('v2-types', Number.isInteger(r.error_attempts) && Number.isInteger(r.recovered_attempts)
        && Number.isInteger(r.flag_hops) && Number.isInteger(r.revert_hops)
        && Array.isArray(r.superseded_by) && Array.isArray(r.upstream)
        && r.resolved === null && r.chain === null, JSON.stringify(r));
      const line = humanLine(r);
      check('human-v2-fields', line.includes('error_attempts=0') && line.includes('recovered_attempts=0')
        && line.includes('superseded_by=-') && line.includes('upstream=-') && line.includes('resolved=-')
        && line.includes('chain=-') && line.includes('flag_hops=0') && line.includes('revert_hops=0')
        && !line.includes(' errors='), line);
    }
    // 18 wave mode absent + 19 unsafe name + 20 tie-break + 21 role/session realpath
    {
      const root = join(base, 'sessions');
      mkdirSync(join(root, 'cwd-a', 'orch-1'), { recursive: true });
      mkdirSync(join(root, 'cwd-b', 'orch-2'), { recursive: true });
      const roundMarker = (round, lane, ts) => jsonl(
        { type: 'session', version: 3, id: 's', timestamp: ts },
        { type: 'custom', text: `/home/vgpnk/Projects/shokunin/${lane}-shokunin/.ufo/waves/round-${round}/w1/x.md` },
        mc('p/old', 'subagent:OldSeat'),
        turn({ provider: 'p', model: 'old', stopReason: 'stop' }),
      );
      writeFileSync(join(root, 'cwd-a', 'orch-1', 'OldSeat.jsonl'), roundMarker(91, 'kumitate', '2026-11-02T00:00:00.000Z'));
      writeFileSync(join(root, 'cwd-b', 'orch-2', 'OldSeat.jsonl'), roundMarker(91, 'kumitate', '2026-11-01T00:00:00.000Z'));
      // same name, another lane: never located
      writeFileSync(join(root, 'cwd-a', 'orch-1', 'Foreign.jsonl'), roundMarker(91, 'tabi', '2026-11-03T00:00:00.000Z'));
      // same name, this lane, another round: never located
      writeFileSync(join(root, 'cwd-a', 'orch-1', 'WrongRound.jsonl'), roundMarker(90, 'kumitate', '2026-11-04T00:00:00.000Z'));
      const results = join(base, 'w1-results.json');
      writeFileSync(results, JSON.stringify({
        lane: 'kumitate',
        round: 91,
        wave: 'w1',
        results: [
          { name: 'OldSeat', agent: 'executor' },
          { name: 'Missing', agent: 'scribe' },
          { name: '../escape', agent: 'scout' },
          { name: 'Foreign', agent: 'reviewer' },
          { name: 'WrongRound', agent: 'critic' },
        ],
      }));
      const recs = waveRecords({ results, sessionsRoot: root });
      check('wave-count', recs.length === 5, String(recs.length));
      check('wave-newest-session', recs[0].session === realpathSync(join(root, 'cwd-a', 'orch-1', 'OldSeat.jsonl'))
        && recs[0].role === 'executor' && recs[0].final === 'served' && recs[0].parse_errors === 0,
      JSON.stringify(recs[0]));
      check('wave-absent', recs[1].seat === 'Missing' && recs[1].session === null
        && recs[1].final === 'absent' && Object.keys(recs[1]).length === 4, JSON.stringify(recs[1]));
      check('wave-unsafe-name', recs[2].final === 'absent' && recs[2].session === null, JSON.stringify(recs[2]));
      check('wave-lane-marker-miss', recs[3].final === 'absent' && recs[3].session === null, JSON.stringify(recs[3]));
      check('wave-round-marker-miss', recs[4].final === 'absent' && recs[4].session === null, JSON.stringify(recs[4]));
    }
    // 22 missing sessions root / bad results fail closed (exit 2)
    {
      const bad = spawnSync(process.execPath, [SELF, '--results', join(base, 'nope.json'), '--json'], { encoding: 'utf8' });
      check('failclosed-results', bad.status === 2, `status=${bad.status} err=${bad.stderr}`);
      const r2 = (() => {
        const p = join(base, 'w2-results.json');
        writeFileSync(p, JSON.stringify({ lane: 'kumitate', round: 91, results: [{ name: 'X', agent: 'executor' }] }));
        return spawnSync(process.execPath, [SELF, '--results', p, '--sessions-root', join(base, 'no-such-root'), '--json'], { encoding: 'utf8' });
      })();
      check('failclosed-root', r2.status === 2, `status=${r2.status} err=${r2.stderr}`);
    }
    // 23 human mode strict drift + json one-object-per-seat
    {
      const root = join(base, 'sessions2');
      mkdirSync(join(root, 'd'), { recursive: true });
      writeFileSync(join(root, 'd', 'Dead.jsonl'), jsonl(
        { type: 'session', timestamp: '2026-11-01T00:00:00.000Z' },
        { type: 'custom', text: 'kumitate-shokunin /.ufo/waves/round-91/w1/z.md' },
        mc('p/one', 'subagent:Dead'),
        turn({ provider: 'p', model: 'one', stopReason: 'error', errorMessage: 'boom' }),
      ));
      const p = join(base, 'w3-results.json');
      writeFileSync(p, JSON.stringify({ lane: 'kumitate', round: 91, results: [{ name: 'Dead', agent: 'executor' }, { name: 'Gone', agent: 'scribe' }] }));
      const human = spawnSync(process.execPath, [SELF, '--results', p, '--sessions-root', root], { encoding: 'utf8' });
      check('human-ok', human.status === 0 && /^SEAT_ROUTE: OK seats=2 served=0 dead=1 aborted=0 silent=0 absent=1 fallback=0$/m.test(human.stdout), human.stdout + human.stderr);
      const strict = spawnSync(process.execPath, [SELF, '--results', p, '--sessions-root', root, '--strict'], { encoding: 'utf8' });
      check('strict-drift', strict.status === 1 && /^SEAT_ROUTE: DRIFT /m.test(strict.stdout), `status=${strict.status} out=${strict.stdout}`);
      const js = spawnSync(process.execPath, [SELF, '--results', p, '--sessions-root', root, '--json'], { encoding: 'utf8' });
      let parsed = null;
      try {
        parsed = JSON.parse(js.stdout);
      } catch {
        parsed = null;
      }
      check('json-array', Array.isArray(parsed) && parsed.length === 2 && parsed[0].seat === 'Dead'
        && parsed[0].final === 'dead' && parsed[0].last_error === 'boom', js.stdout);
    }
    // 24 usage exit 64
    {
      const u = spawnSync(process.execPath, [SELF, '--bogus'], { encoding: 'utf8' });
      check('usage-64', u.status === 64, `status=${u.status}`);
      const u2 = spawnSync(process.execPath, [SELF, '--file', join(base, 'clean.jsonl'), '--strict'], { encoding: 'utf8' });
      check('usage-strict-file', u2.status === 64, `status=${u2.status}`);
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }

  if (failed.length > 0) {
    for (const f of failed) process.stdout.write(`FIELD ${f}\n`);
    process.stdout.write(`SEAT_ROUTE_SELFTEST: FAIL held=${held.length}/${held.length + failed.length}\n`);
    return 1;
  }
  process.stdout.write(`SEAT_ROUTE_SELFTEST: PASS held=${held.length}/${held.length}\n`);
  return 0;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof Usage) {
      process.stderr.write(`SEAT_ROUTE: USAGE ${err.message}\n${USAGE}`);
      process.exitCode = 64;
      return;
    }
    throw err;
  }
  if (opts.selftest) {
    process.exitCode = selftest();
    return;
  }
  try {
    process.exitCode = runCli(opts);
  } catch (err) {
    if (err instanceof ExitNow) {
      process.exitCode = err.code;
      return;
    }
    if (err instanceof FailClosed) {
      process.stderr.write(`SEAT_ROUTE: FAILCLOSED ${err.message}\n`);
      process.exitCode = 2;
      return;
    }
    if (err instanceof Usage) {
      process.stderr.write(`SEAT_ROUTE: USAGE ${err.message}\n${USAGE}`);
      process.exitCode = 64;
      return;
    }
    process.stderr.write(`SEAT_ROUTE: FAILCLOSED ${err.code ?? 'error'}: ${err.message}\n`);
    process.exitCode = 2;
  }
}

// A reader that closes the pipe early (`| head -1`) ends output, not the run: no EPIPE stack trace.
process.stdout.on('error', (err) => {
  if (err && err.code === 'EPIPE') process.exit(process.exitCode ?? 0);
  throw err;
});
main();
