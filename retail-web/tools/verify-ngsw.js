#!/usr/bin/env node
// Sanity check on the built service worker manifest. Run after a production build:
//   node tools/verify-ngsw.js [dist/retail-web/en-US]
//
// Exists because of INC-2023-0917: a release shipped with ngsw.json referencing a hashed
// main bundle that had been renamed by the Artifactory upload step, and every customer with
// the old worker got a white screen until they hard-refreshed. CAB now asks for this output
// in the change record.
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || path.join(__dirname, '..', 'dist', 'retail-web', 'en-US');
const manifestPath = path.join(dir, 'ngsw.json');

if (!fs.existsSync(manifestPath)) {
  console.error(`no ngsw.json under ${dir}; did you build with the production configuration?`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let problems = 0;

for (const group of manifest.assetGroups || []) {
  for (const url of group.urls) {
    const file = path.join(dir, url.replace(/^\//, ''));
    if (!fs.existsSync(file)) {
      console.error(`asset group "${group.name}" references ${url} which is not in the build output`);
      problems += 1;
    }
  }
}

const dataGroups = (manifest.dataGroups || []).map(g => g.name);
for (const required of ['reference-data', 'customer-data']) {
  if (!dataGroups.includes(required)) {
    console.error(`data group "${required}" missing; the BFF caching policy will not apply`);
    problems += 1;
  }
}

if (!manifest.navigationUrls || !manifest.navigationUrls.some(n => n.regex && n.regex.includes('assets'))) {
  console.warn('warning: no navigationUrls exclusion for /assets; deep links to PDFs may be served the shell');
}

console.log(`${manifest.assetGroups.length} asset groups, ${dataGroups.length} data groups, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
