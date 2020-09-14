export const environment = {
  production: true,
  name: 'prod',
  // Replaced by the Jenkins build (sed on this file, see Jenkinsfile stage "Stamp version").
  version: '14.31.2',
  configPath: 'assets/config/env.json',
  storeDevtools: false,
  logLevel: 'warn' as 'debug' | 'info' | 'warn' | 'error',
  // Stamped by Jenkins alongside version. The prod write key is not a secret but is not in git.
  lantern: {
    writeKey: 'CHANGEME-lantern-write-key-prod',
    scriptUrl: 'https://static.meridian-online.example/lantern/v4/lantern.min.js',
    debug: false,
    disabled: false
  }
};
