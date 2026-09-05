#!/usr/bin/env node
// Post-build gate: the CSP meta tag in dist/keystone-web/index.html must exist and must not contain
// unsafe-inline or unsafe-eval. Added after KEY-1840, when a well-meaning change to index.html for
// a loading spinner put an inline <style> in and the CSP got "temporarily" loosened to match.
// Runs in the Jenkins pipeline after build:prod. Exit 1 fails the stage.
'use strict';
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'keystone-web', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`check-csp: ${indexPath} not found; run the production build first`);
  process.exit(2);
}
const html = fs.readFileSync(indexPath, 'utf8');
const m = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i.exec(html);
if (!m) {
  console.error('check-csp: no Content-Security-Policy meta tag in index.html');
  process.exit(1);
}
const policy = m[1];
const problems = [];
for (const bad of ["'unsafe-inline'", "'unsafe-eval'", 'data:', '*']) {
  // data: is allowed for img-src only (the Canopy sprite is fetched, but Material icons can be data URIs).
  const directives = policy.split(';').map((d) => d.trim()).filter(Boolean);
  for (const d of directives) {
    const [name, ...sources] = d.split(/\s+/);
    if (sources.includes(bad) && !(bad === 'data:' && name === 'img-src')) {
      problems.push(`${name} contains ${bad}`);
    }
  }
}
for (const required of ['default-src', 'script-src', 'object-src', 'base-uri', 'frame-ancestors']) {
  if (!policy.includes(required)) {
    problems.push(`missing directive ${required}`);
  }
}
if (/<style[\s>]/i.test(html) || /<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) {
  problems.push('index.html contains an inline <style> or <script> block');
}
if (problems.length) {
  console.error('check-csp: FAIL');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`check-csp: ok (${policy.split(';').length} directives, no unsafe-inline)`);
