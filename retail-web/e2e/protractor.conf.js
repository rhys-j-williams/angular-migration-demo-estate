// Protractor configuration for Meridian Online.
//
// This suite has not run in CI since the Jenkins agents moved to nodejs16-rhel8 in 2023 and
// webdriver-manager stopped being able to fetch a chromedriver matching the agent Chrome
// (MOL-3644). It still runs locally against `ng serve` if you pin chromedriver by hand. The
// `e2e` npm script is kept so the release checklist item does not go red; the `ng e2e`
// target was removed from angular.json when we moved to the CLI 12 builder and nobody put it
// back. Replacement tooling is on the backlog as MOL-4471/MOL-4476.
//
// @ts-check
// Protractor API: https://www.protractortest.org/#/api
const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: ['./src/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      // no-sandbox is for the Jenkins agents, same as karma.conf.js. Headless is the default
      // because the agents have no display; unset E2E_HEADLESS locally to watch it.
      args: process.env.E2E_HEADLESS === '0' ? ['--no-sandbox'] : ['--headless', '--no-sandbox', '--window-size=1280,900']
    }
  },
  // Keystone mock and the retail BFF have to be up (mock-external/estate-up.sh). The app itself
  // comes from `npm start` on 4200; we never had directConnect working through the corporate proxy.
  directConnect: true,
  SELENIUM_PROMISE_MANAGER: false,
  baseUrl: process.env.E2E_BASE_URL || 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: { displayStacktrace: StacktraceOption.PRETTY }
    }));
  }
};
