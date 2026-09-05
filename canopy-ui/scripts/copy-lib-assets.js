#!/usr/bin/env node
/*
 * Post-build step for the library. ng-packagr copies the schematic sources listed in
 * ng-package.json, but the compiled JS only exists after `build:schematics`, which runs after
 * ng-packagr. So we copy the compiled output over the top here. Also stamps the build metadata
 * the release pipeline reads (CNPY-1877).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'projects', 'canopy-ui', 'schematics');
const dist = path.join(root, 'dist', 'canopy-ui');

if (!fs.existsSync(dist)) {
  console.error('dist/canopy-ui missing; run `npm run build` first');
  process.exit(1);
}

function copyTree(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name);
    const t = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(t, { recursive: true });
      copyTree(f, t);
    } else if (/\.(js|json|d\.ts)$/.test(entry.name) && !entry.name.endsWith('.spec.js')) {
      fs.mkdirSync(path.dirname(t), { recursive: true });
      fs.copyFileSync(f, t);
    }
  }
}

copyTree(src, path.join(dist, 'schematics'));

let sha = 'unknown';
try {
  sha = execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch (e) {
  // not a git checkout (Jenkins shallow tarball), fine
}
const pkgPath = path.join(dist, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.gitHead = sha;
pkg.buildDate = new Date().toISOString();
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`copied schematics into dist, stamped ${pkg.version}@${sha}`);
