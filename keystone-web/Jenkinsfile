// keystone-web. Shared library: platform-tooling/jenkins-shared-library.
// This pipeline deploys the login page for every channel. Deploys to prod are CAB-gated in the
// library (meridianNodePipeline reads the CHG number from the tag annotation); do not add a
// manual approval stage here, it was removed in TOOL-0412 because it double-prompted.
@Library('meridian-pipeline@v3') _

meridianNodePipeline(
  agentLabel: 'nodejs16-rhel8',
  nodeVersion: '16.20.2',
  jiraProject: 'KEY',
  registryCredentialsId: 'artifactory-npm-cswt',
  installCommand: 'npm ci',
  lintCommand: 'npm run lint',
  // CHROME_BIN is set by the nodejs16-rhel8 agent image. If tests hang at "Launching browsers"
  // the agent image is stale, see platform-engineering.
  testCommand: 'npm test -- --watch=false',
  buildCommands: [
    'npm run build:prod',
    // GIS-1840: fails the build if the built index.html carries unsafe-inline or an inline block.
    'npm run csp:check'
  ],
  coverage: [
    reportPath: 'coverage/keystone-web/lcov.info',
    // KEY-1877 exception, renewed 2025-11. docs/runbooks/coverage.md.
    minimumLines: 38
  ],
  sonar: [
    projectKey: 'meridian:keystone-web',
    propertiesFile: 'sonar-project.properties'
  ],
  checkmarx: [
    configFile: 'checkmarx.yml',
    // Login page: any medium or above blocks. GIS-STD-014 tier 1.
    failOn: 'medium'
  ],
  dependencyAudit: [
    failOn: 'high',
    allowlist: [
      // loader-utils via @angular-devkit/build-angular 15; build time only. GIS-RA-2023-141.
      'GHSA-76p3-8jx3-jpfq',
      // semver ReDoS in the Karma tree; test time only. GIS-RA-2023-142.
      'GHSA-c2qf-rxjj-qqgw'
    ]
  ],
  container: [
    when: 'branch',
    branches: ['develop', 'release/*', 'main'],
    dockerfile: 'Dockerfile',
    image: 'cswt/keystone-web',
    // platform-tooling/helm/keystone-web is the chart that is actually deployed. helm/ in this
    // repo is the pre-TOOL-0388 chart, retained for the identity-platform sandbox cluster only.
    helmChart: 'platform-tooling/helm/keystone-web',
    namespace: [
      develop: 'cswt-dev',
      'release/*': 'cswt-uat',
      main: 'cswt-prod'
    ]
  ],
  // Every other channel's smoke test logs in through us. Kick them after a dev deploy so a broken
  // login page is found by the pipeline rather than by the retail team at stand-up (INC0142270).
  downstream: [
    onSuccess: ['retail-web-smoke', 'business-web-smoke', 'ledgerline-web-smoke'],
    branches: ['develop']
  ],
  notifications: [
    channel: '#identity-platform',
    onFailureOnly: false
  ]
)
