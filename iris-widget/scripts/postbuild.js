#!/usr/bin/env node
/* eslint-disable */
/**
 * Runs after `ng build`. ngx-build-plus with singleBundle + outputHashing gives us exactly one
 * main.<hash>.js. This script:
 *
 *   1. verifies there is exactly one bundle (two means singleBundle silently stopped working, which
 *      happened when someone added a lazy route in IRIS-0577);
 *   2. copies it to iris.js, the stable name the host contract uses (/assets/widgets/iris.js);
 *   3. writes iris.manifest.json with the hashed name, size and sha256 so the host can cache-bust
 *      or pin (retail-web reads `file` at build time, see their scripts/vendor-iris.js);
 *   4. removes index.html and 3rdpartylicenses.txt from the output. index.html is the dev shell
 *      and must never reach the CDN (it once did, IRIS-0489, with a hard-coded localhost URL).
 *
 * The Zone.js UMD stays in assets/vendor for standalone hosts; retail-web ignores it. See README.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dist = path.resolve(__dirname, '..', 'dist', 'iris-widget');
if (!fs.existsSync(dist)) {
  console.error(`[postbuild] ${dist} does not exist, run ng build first`);
  process.exit(1);
}

const bundles = fs.readdirSync(dist).filter((f) => /^main(\.[0-9a-f]{8,})?\.js$/.test(f));
if (bundles.length !== 1) {
  console.error(`[postbuild] expected exactly one main bundle, found: ${bundles.join(', ') || 'none'}`);
  process.exit(1);
}
const stray = fs.readdirSync(dist).filter((f) => /\.js$/.test(f) && !bundles.includes(f) && f !== 'iris.js');
if (stray.length) {
  console.error(`[postbuild] unexpected extra chunks (singleBundle broken?): ${stray.join(', ')}`);
  process.exit(1);
}

const hashed = bundles[0];
const src = path.join(dist, hashed);
const bytes = fs.readFileSync(src);
if (/Zone already loaded|__zone_symbol__ZONE_ALREADY|zone\.js\/fesm2015/.test(bytes.toString('utf8').slice(0, 200000)) && /function\s+Zone\s*\(/.test(bytes.toString('utf8'))) {
  // Belt and braces: the whole point of T35 is that we do NOT ship Zone.
  console.error('[postbuild] the bundle appears to contain Zone.js. See README "Zone.js and the host page".');
  process.exit(1);
}

fs.copyFileSync(src, path.join(dist, 'iris.js'));

const manifest = {
  element: 'meridian-iris-widget',
  file: hashed,
  stable: 'iris.js',
  bytes: bytes.length,
  sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  angular: require('../node_modules/@angular/core/package.json').version,
  zoneJsCompatible: require('../package.json').devDependencies['zone.js'],
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(dist, 'iris.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

for (const f of ['index.html', '3rdpartylicenses.txt']) {
  const p = path.join(dist, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log(`[postbuild] ${hashed} (${(bytes.length / 1024).toFixed(1)} kB) -> iris.js, manifest written`);
