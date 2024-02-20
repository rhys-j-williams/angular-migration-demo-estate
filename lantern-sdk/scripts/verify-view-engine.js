#!/usr/bin/env node
/*
 * Post-build gate, LNTN-412. Confirms dist/lantern-sdk is in the format the consuming teams and
 * their ngcc runs expect: View Engine metadata present, no Ivy compiled output.
 *
 * Runs against dist/ by default; pass a tarball path to inspect a packed .tgz instead (that is what
 * the release checklist does before `npm publish`).
 *
 * Exit 0 = good, 1 = wrong format, 2 = could not find the build.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const IVY_MARKERS = ['\u0275cmp', '\u0275dir', '\u0275mod', '\u0275fac', '\u0275\u0275defineComponent', '\u0275\u0275defineNgModule', '\u0275\u0275defineDirective'];
const PARTIAL_MARKERS = ['\u0275\u0275ngDeclareComponent', '\u0275\u0275ngDeclareNgModule', '\u0275\u0275ngDeclareDirective'];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function unpack(tgz) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lantern-verify-'));
  execFileSync('tar', ['-xzf', tgz, '-C', tmp]);
  return path.join(tmp, 'package');
}

function main() {
  const arg = process.argv[2];
  let root = path.resolve(__dirname, '..', 'dist', 'lantern-sdk');
  if (arg) {
    root = arg.endsWith('.tgz') ? unpack(path.resolve(arg)) : path.resolve(arg);
  }
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    console.error(`verify-view-engine: no package at ${root}; run npm run build first`);
    process.exit(2);
  }

  const files = walk(root, []);
  const problems = [];

  const metadata = files.filter((f) => f.endsWith('.metadata.json'));
  if (metadata.length === 0) {
    problems.push('no *.metadata.json emitted; this is an Ivy build, check enableIvy in tsconfig.lib.prod.json');
  } else {
    for (const m of metadata) {
      const doc = JSON.parse(fs.readFileSync(m, 'utf8'));
      if (doc.__symbolic !== 'module' || typeof doc.metadata !== 'object') {
        problems.push(`${path.relative(root, m)} does not look like View Engine metadata`);
      }
    }
  }

  const js = files.filter((f) => f.endsWith('.js'));
  for (const f of js) {
    const src = fs.readFileSync(f, 'utf8');
    for (const marker of IVY_MARKERS) {
      if (src.includes(marker)) {
        problems.push(`${path.relative(root, f)} contains Ivy marker ${marker}`);
        break;
      }
    }
    for (const marker of PARTIAL_MARKERS) {
      if (src.includes(marker)) {
        problems.push(`${path.relative(root, f)} contains partial-compilation marker ${marker}`);
        break;
      }
    }
  }

  const dts = files.filter((f) => f.endsWith('.d.ts'));
  for (const f of dts) {
    const src = fs.readFileSync(f, 'utf8');
    if (src.includes('\u0275\u0275ComponentDeclaration') || src.includes('\u0275\u0275DirectiveDeclaration')) {
      problems.push(`${path.relative(root, f)} carries Ivy type declarations`);
    }
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (pkg.name !== '@meridian/lantern-sdk') {
    problems.push(`unexpected package name ${pkg.name}`);
  }
  if (!pkg.metadata) {
    problems.push('package.json has no "metadata" entry point (ng-packagr writes one for View Engine builds)');
  }

  console.log(`verify-view-engine: ${pkg.name}@${pkg.version} at ${root}`);
  console.log(`  metadata files : ${metadata.length}`);
  console.log(`  js files       : ${js.length}`);
  console.log(`  d.ts files     : ${dts.length}`);
  if (problems.length) {
    console.error('  FAIL');
    for (const p of problems) {
      console.error('   - ' + p);
    }
    process.exit(1);
  }
  console.log('  OK: View Engine format, no Ivy output');
}

main();
