// Canopy design system. Shared library: platform-tooling/jenkins-shared-library.
// Node pipeline parameters are documented in that library's README. Ask #platform-engineering
// before adding stages here; anything reusable belongs in the library.
@Library('meridian-pipeline@v3') _

meridianNodePipeline(
  agentLabel: 'nodejs16-rhel8',
  nodeVersion: '16.20.2',
  jiraProject: 'CNPY',
  registryCredentialsId: 'artifactory-npm-canopy',
  installCommand: 'npm ci',
  lintCommand: 'npm run lint',
  testCommand: 'npm test',
  buildCommands: [
    'npm run build',
    'npm run build:showcase',
    'npm run api:check',
    'npm run changelog:check'
  ],
  coverage: [
    reportPath: 'coverage/canopy-ui/lcov.info',
    // Gate is lower than the estate default because half the specs are creation only. CNPY-1402
    // tracks getting this to 60 and has done since 2022.
    minimumLines: 45
  ],
  sonar: [
    projectKey: 'meridian:canopy-ui',
    propertiesFile: 'sonar-project.properties'
  ],
  checkmarx: [
    configFile: 'checkmarx.yml',
    failOn: 'high'
  ],
  dependencyAudit: [
    failOn: 'high',
    // ngx-mask 14.x transitively pulls an old semver; accepted, see GIS-RA-2023-118.
    allowlist: ['GHSA-c2qf-rxjj-qqgw']
  ],
  // Only the tag build publishes. publish.sh checks the tag against package.json and refuses
  // otherwise. Branch builds stop after the quality gates.
  publish: [
    when: 'tag',
    tagPattern: 'canopy-ui/v*',
    command: 'bash scripts/publish.sh'
  ],
  container: [
    // The showcase is the only deployable. It goes to the internal design system host.
    when: 'tag',
    dockerfile: 'Dockerfile',
    image: 'cswt/canopy-showcase',
    helmChart: 'helm/canopy-showcase',
    namespace: 'cswt-design-system-dev'
  ],
  notifications: [
    channel: '#canopy-design-system',
    onFailureOnly: true
  ]
)
