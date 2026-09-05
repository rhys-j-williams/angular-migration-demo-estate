// Karma configuration for the Canopy library.
// The nodejs16-rhel8 agents ship Chrome in the image and export CHROME_BIN; on a laptop fall back
// to whatever puppeteer knows about. Do not add karma-firefox-launcher, the agents have no Firefox
// (TOOL-1102).
process.env.CHROME_BIN = process.env.CHROME_BIN || require('puppeteer').executablePath();

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
        random: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/canopy-ui'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
      // Sonar quality gate is 45 on this project (sonar-project.properties). The number below is
      // the floor we agreed with the platform team in CNPY-1712; raise it, do not lower it.
      check: {
        global: {
          lines: 45
        }
      }
    },
    junitReporter: {
      outputDir: require('path').join(__dirname, '../../karma-results'),
      outputFile: 'canopy-ui.xml',
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
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
