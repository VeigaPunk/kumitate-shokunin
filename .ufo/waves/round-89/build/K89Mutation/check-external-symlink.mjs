#!/usr/bin/env node
/**
 * check-external-symlink.mjs — behavioural check of a behaviour the round-89 plan CLAIMS v3 adds
 * but the candidate does not implement: `SYMLINK_INSTRUMENT` "for a disk-read external instrument
 * that is a symlink" (plan.md, "Instrument changes the claim lands").
 *
 *   node check-external-symlink.mjs --tool <candidate> --work <scratch>
 *
 * Fixture: a git repo with one committed in-lane instrument, and an OUTSIDE directory holding a
 * real file plus a symlink to it. The receipt names the symlink by absolute path and declares the
 * digest of the TARGET's bytes. The plan's stated behaviour is exit 2 SYMLINK_INSTRUMENT; the
 * candidate's docstring declares the opposite limit ("an external instrument reached through a
 * symlink is hashed through the link"). This script prints what the candidate actually does.
 */
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const tool = resolve(opt('--tool', ''));
const work = resolve(opt('--work', ''));
if (!tool || !work) { console.log('USAGE: check-external-symlink.mjs --tool <candidate> --work <scratch>'); process.exit(64); }
const root = join(work, `extlink-${process.pid}`);
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const repo = join(root, 'lane');
const outside = join(root, 'outside');
mkdirSync(join(repo, 'scripts'), { recursive: true });
mkdirSync(outside, { recursive: true });
const sh = (args, cwd) => spawnSync('git', ['-C', cwd, ...args], {
  encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
});
sh(['init', '-q'], repo);
const top = sh(['rev-parse', '--show-toplevel'], repo).stdout.trim();
if (realpathSync(top) !== realpathSync(repo)) { console.log(`FIXTURE: FAIL toplevel ${top}`); process.exit(2); }
writeFileSync(join(repo, 'scripts', 'tool.mjs'), 'export const t = 1;\n');
sh(['add', '-A'], repo);
sh(['-c', 'user.name=x', '-c', 'user.email=x@invalid', 'commit', '-q', '-m', 'c1'], repo);
const rev = sh(['rev-parse', 'HEAD'], repo).stdout.trim();

const realExt = join(outside, 'ext-real.mjs');
writeFileSync(realExt, 'export const ext = 1;\n');
const linkExt = join(outside, 'ext-link.mjs');
symlinkSync(realExt, linkExt);
const digestOfTarget = createHash('sha256').update(readFileSync(realExt)).digest('hex');
const digestOfLinkText = createHash('sha256').update(Buffer.from(realExt)).digest('hex');
const d = join(root, 'rc');
mkdirSync(d, { recursive: true });
const body = (digest) => `rev=${rev}\ntool_sha256=${digest}\ncmd=node ${linkExt}\nexit=0\nsignal=none\n`;

const run = (digest) => {
  writeFileSync(join(d, 'a.txt'), body(digest));
  const r = spawnSync(process.execPath, [tool, '--dir', d, '--rev', rev, '--lane', repo],
    { encoding: 'utf8', cwd: repo, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  const all = `${r.stdout || ''}${r.stderr || ''}`;
  const line = (all.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
  return `${r.status} ${line || `<no verdict line> ${all.trim().slice(0, 200)}`}`;
};
const targetBytes = run(digestOfTarget);
const linkTextBytes = run(digestOfLinkText);
console.log(`EXT_SYMLINK: link=${linkExt} -> ${realExt}`);
console.log(`EXT_SYMLINK: digest-of-target ${targetBytes}`);
console.log(`EXT_SYMLINK: digest-of-link-text ${linkTextBytes}`);
console.log(`EXT_SYMLINK: planned-behaviour exit=2 RECEIPT_BIND: FAIL-CLOSED SYMLINK_INSTRUMENT`);
rmSync(root, { recursive: true, force: true });
