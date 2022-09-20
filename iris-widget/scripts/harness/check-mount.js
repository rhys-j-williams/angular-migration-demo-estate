#!/usr/bin/env node
/* eslint-disable */
/**
 * Proves the built bundle registers and renders <meridian-iris-widget> in a plain HTML page.
 * Starts serve.js, points headless Chrome at it with --dump-dom, and looks for the
 * data-iris-mounted attribute that harness/index.html sets. Exit 0 on MOUNTED, 1 otherwise.
 *
 * Runs in the Jenkins "verify" stage after build:prod. No puppeteer: Chrome is already on the
 * agents for Karma and one less dependency is one less thing Xray complains about.
 *
 *   CHROME_BIN=/path/to/chrome node scripts/harness/check-mount.js
 */
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', '..', 'dist', 'iris-widget');
for (const required of ['iris.js', 'iris.manifest.json', 'assets/vendor/zone.umd.min.js']) {
  if (!fs.existsSync(path.join(dist, required))) {
    console.error(`[check-mount] missing ${required}; run npm run build:prod first`);
    process.exit(1);
  }
}

const chrome = process.env.CHROME_BIN || 'google-chrome';
const port = Number(process.env.IRIS_HARNESS_PORT || 4205);
process.env.IRIS_HARNESS_PORT = String(port);

const server = require('./serve.js');

server.once('listening', () => {
  // execFile, not execFileSync: the server lives in this process and a sync exec would block the
  // event loop, so Chrome would wait forever for a page nobody can serve. Yes, that happened.
  execFile(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      // a throwaway profile, otherwise Chrome attaches to any running instance and never exits
      `--user-data-dir=${fs.mkdtempSync(path.join(require('os').tmpdir(), 'iris-harness-'))}`,
      '--virtual-time-budget=6000',
      '--dump-dom',
      `http://localhost:${port}/`,
    ],
    { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 },
    (err, dom) => {
      let code = 1;
      if (err) {
        console.error('[check-mount] chrome failed:', err.message);
      }
      dom = dom || '';
      const logMatch = dom.match(/<pre id="log">([\s\S]*?)<\/pre>/);
      if (logMatch) {
        console.log(logMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim());
      }
      const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'iris.manifest.json'), 'utf8'));
      if (/data-iris-mounted="true"/.test(dom) && /<meridian-iris-widget[\s\S]*class="iris-root/.test(dom)) {
        console.log(`[check-mount] MOUNTED: ${manifest.file} registered <meridian-iris-widget> and rendered the panel`);
        code = 0;
      } else {
        console.error('[check-mount] FAILED: element did not mount. DOM follows.');
        console.error(dom.slice(0, 4000));
      }
      server.close(() => process.exit(code));
    },
  );
});
