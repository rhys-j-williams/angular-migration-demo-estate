// Build-time environment. Anything that differs between deployed environments belongs in
// assets/config/env.json (runtime, loaded by ConfigService) so a single image promotes through
// UAT -> PRE -> PROD. This file only carries things the bundle itself needs to know at compile time.
export const environment = {
  production: false,
  name: 'local',
  version: '14.31.2-local',
  configPath: 'assets/config/env.json',
  storeDevtools: true,
  logLevel: 'debug' as 'debug' | 'info' | 'warn' | 'error',
  // Lantern wants its write key at module compile time (LanternModule.forRoot); env.json cannot
  // feed it. Local key only hits the collector mock on 4607.
  lantern: {
    writeKey: 'CHANGEME-lantern-write-key-local',
    scriptUrl: 'http://localhost:4607/v4/lantern.min.js',
    debug: true,
    disabled: false
  }
};
