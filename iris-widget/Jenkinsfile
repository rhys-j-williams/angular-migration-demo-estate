// iris-widget. Shared library: platform-tooling/jenkins-shared-library.
//
// This is not a service. Nothing here deploys. The "container" block builds an nginx image that
// serves dist/ for the sandbox cluster and for the harness job; production delivery is the host
// (retail-web) vendoring the artefact from Artifactory. See docs/runbooks/release.md.
@Library('meridian-pipeline@v3') _

meridianNodePipeline(
  agentLabel: 'nodejs16-rhel8',
  nodeVersion: '16.20.2',
  jiraProject: 'IRIS',
  registryCredentialsId: 'artifactory-npm-cswt',
  installCommand: 'npm ci',
  lintCommand: 'npm run lint',
  testCommand: 'npm test -- --watch=false',
  buildCommands: [
    'npm run build:prod',
    // The actual acceptance test: a page that is not ours loads the bundle and the element renders.
    // CHROME_BIN comes from the agent image. If this hangs, it is the profile lock (IRIS-0812).
    'npm run harness:check'
  ],
  coverage: [
    reportPath: 'coverage/iris-widget/lcov.info'
    // No minimum. IRIS-0490. Sonar reports it.
  ],
  sonar: [
    projectKey: 'meridian:iris-widget',
    propertiesFile: 'sonar-project.properties'
  ],
  checkmarx: [
    configFile: 'checkmarx.yml',
    failOn: 'high'
  ],
  dependencyAudit: [
    failOn: 'high',
    allowlist: [
      // loader-utils via @angular-devkit/build-angular 14; build time only. GIS-RA-2023-141.
      'GHSA-76p3-8jx3-jpfq',
      // semver ReDoS in the Karma tree; test time only. GIS-RA-2023-142.
      'GHSA-c2qf-rxjj-qqgw'
    ]
  ],
  artefact: [
    // Published on tag only. retail-web's vendor script reads iris.manifest.json from here.
    when: 'tag',
    tagPattern: 'iris-widget/v*',
    path: 'dist/iris-widget',
    repository: 'cswt-generic/iris-widget',
    notify: '#retail-digital'
  ],
  container: [
    when: 'branch',
    branches: ['develop'],
    dockerfile: 'Dockerfile',
    image: 'cswt/iris-widget',
    helmChart: 'platform-tooling/helm/iris-widget',
    namespace: [
      develop: 'cswt-dev'
    ]
  ]
)
