// Karma for iris-widget. Copied from retail-web in 2022 and trimmed. ChromeHeadlessCI is the
// Jenkins launcher; the sandbox flags are because the agents run as root.
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
      jasmine: { random: true },
      clearContext: false
    },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/iris-widget'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }]
      // No coverage gate. There was one (IRIS-0233, 30 percent) and it was removed in IRIS-0490 after
      // it blocked a hotfix. Nobody has put it back. Sonar reports the number, that is all.
    },
    junitReporter: {
      outputDir: 'reports/junit',
      outputFile: 'iris-widget.xml',
      useBrowserName: false
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    port: 9877,
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
