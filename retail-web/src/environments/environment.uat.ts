export const environment = {
  production: true,
  name: 'uat',
  version: '14.31.2-uat',
  configPath: 'assets/config/env.json',
  // Devtools stay on in UAT so QA can attach the Redux extension when reproducing MOL tickets.
  storeDevtools: true,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  lantern: {
    writeKey: 'CHANGEME-lantern-write-key-uat',
    scriptUrl: 'https://static-uat.meridian-online.example/lantern/v4/lantern.min.js',
    debug: true,
    disabled: false
  }
};
