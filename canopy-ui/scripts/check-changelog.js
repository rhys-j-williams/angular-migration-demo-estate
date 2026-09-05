#!/usr/bin/env node
// Jenkins gate: a version bump in projects/canopy-ui/package.json needs a matching CHANGELOG heading.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const version = require(path.join(root, 'projects', 'canopy-ui', 'package.json')).version;
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## [${version}]`)) {
  console.error(`CHANGELOG.md has no entry for ${version}`);
  process.exit(1);
}
console.log(`CHANGELOG has ${version}`);
