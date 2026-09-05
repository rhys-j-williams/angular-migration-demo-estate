// Karma configuration for Meridian Online.
//
// The Jenkins agents (nodejs16-rhel8) ship Chrome in the image and export CHROME_BIN. On a laptop
// set CHROME_BIN yourself or let the launcher find whatever Chrome is on PATH; puppeteer is not a
// dependency here on purpose (it was, until the 300MB download started timing out behind the
// proxy - TOOL-1102).
//
// `npm run test:ci` is what the Jenkinsfile runs: single run, ChromeHeadlessCI, coverage on.

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
        // Random order was turned off after MOL-3320: the accounts effects spec leaked a store
        // subscription and failed one run in five depending on ordering. Fixed since, but the
        // team preferred deterministic runs and nobody has argued for turning it back on.
        random: false,
        timeoutInterval: 10000
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/retail-web'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }, { type: 'cobertura' }],
      // Sonar gate on this project is 30% lines (sonar-project.properties). MOL-4471 wants this
      // higher before the framework upgrade; do not lower it to get a green build.
      check: {
        global: {
          lines: 30
        }
      }
    },
    junitReporter: {
      outputDir: require('path').join(__dirname, './karma-results'),
      outputFile: 'retail-web.xml',
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
    browserNoActivityTimeout: 120000,
    browserDisconnectTolerance: 2,
    captureTimeout: 120000,
    singleRun: false,
    restartOnFileChange: true
  });
};
