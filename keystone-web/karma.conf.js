// Karma configuration for keystone-web. ChromeHeadlessCI is what Jenkins uses (KEY-1410); the
// --no-sandbox flags are there because the build agents run as root in the container. Do not
// remove them, the pipeline will hang for the full 20 minute timeout rather than fail cleanly.
process.env.CHROME_BIN = process.env.CHROME_BIN || require('child_process')
  .execSync('command -v google-chrome || command -v chromium || command -v chromium-browser || true')
  .toString().trim() || undefined;

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: true,
        // seed is pinned when reproducing a flake; leave undefined otherwise
        seed: process.env.KARMA_SEED
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/keystone-web'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }, { type: 'cobertura' }],
      // Gate agreed with Sonar in KEY-1877. Yes, it is low. See docs/runbooks/coverage.md before
      // you argue about it.
      check: {
        global: {
          statements: 38,
          lines: 38
        }
      }
    },
    junitReporter: {
      outputDir: 'reports/junit',
      outputFile: 'keystone-web.xml',
      useBrowserName: false
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,900']
      }
    },
    browserNoActivityTimeout: 60000,
    captureTimeout: 120000,
    singleRun: false,
    restartOnFileChange: true
  });
};
