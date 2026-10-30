#!/usr/bin/env node
// Fixture generator for seat K70ExecFixtureTests. Builds a synthetic pinned-source
// fixture lane (a git repo entirely inside the caller's scratch dir) containing
// byte-exact copies of the synthetic frozen controls plus seeded r69-controls receipt
// stubs, so receipt-digest preservation is observable. All git use is explicit
// `git -C FIXTURE`; show-toplevel is verified to equal the fixture dir before the
// first commit (seat fixture rule).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SYNTH = path.join(here, 'synth-controls');
export const PINS = JSON.parse(fs.readFileSync(path.join(here, 'pins.json'), 'utf8')).pins;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

const SEEDED_RECEIPTS = {
  'c1-donothing.txt': 'SYNTHETIC seeded receipt c1 donothing (digest-preservation sentinel)\n',
  'c1-autoledger.txt': 'SYNTHETIC seeded receipt c1 autoledger (digest-preservation sentinel)\n',
  'c2-donothing.txt': 'SYNTHETIC seeded receipt c2 donothing (digest-preservation sentinel)\n',
  'c2-autoorigin.txt': 'SYNTHETIC seeded receipt c2 autoorigin (digest-preservation sentinel)\n',
  'c2-forgecapture.txt': 'SYNTHETIC seeded receipt c2 forgecapture (digest-preservation sentinel)\n',
};

export function buildFixture(dir) {
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(path.join(dir, '.ufo/waves/round-69/probe'), {recursive: true});
  fs.mkdirSync(path.join(dir, '.ufo/waves/round-69/controls'), {recursive: true});
  for (const pin of PINS) {
    const bytes = fs.readFileSync(path.join(SYNTH, path.basename(pin.path)));
    if (sha(bytes) !== pin.sha256) throw new Error('synth source drifted vs pins.json: ' + pin.path);
    fs.writeFileSync(path.join(dir, pin.path), bytes);
  }
  for (const [name, text] of Object.entries(SEEDED_RECEIPTS))
    fs.writeFileSync(path.join(dir, '.ufo/waves/round-69/controls', name), text);
  const git = (...a) => {
    const r = spawnSync('git', ['-C', dir, ...a], {encoding: 'utf8'});
    if (r.status !== 0) throw new Error('git ' + a[0] + ': ' + r.stderr);
    return r;
  };
  git('init', '-q');
  const top = git('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== fs.realpathSync(dir)) throw new Error(`fixture toplevel ${top} != ${dir}`);
  git('-c', 'user.name=fixture', '-c', 'user.email=fixture@invalid', '-c', 'commit.gpgsign=false', 'add', '-A');
  git('-c', 'user.name=fixture', '-c', 'user.email=fixture@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'synthetic pinned-source fixture');
  return {lane: dir, rev: git('rev-parse', 'HEAD').stdout.trim(), pins: PINS};
}

export function digestTree(dir) {
  const out = {};
  const walk = d => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p)] = sha(fs.readFileSync(p));
    }
  };
  walk(dir);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'r70fx-'));
  const fx = buildFixture(dir);
  console.log(JSON.stringify({lane: fx.lane, rev: fx.rev}, null, 2));
}
