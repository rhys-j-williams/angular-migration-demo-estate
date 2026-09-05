import { LdgEnvironment } from './environment.model';

// Against mock-external/estate-up.sh: bff-business on 4501, TickerHaus mock on 4602.
export const environment: LdgEnvironment = {
  name: 'mock-external',
  production: false,
  bffBaseUrl: 'http://localhost:4501',
  tickerHausBaseUrl: 'http://localhost:4602',
  fixtureBackend: false,
  fixtureSeed: 'ledgerline',
  sessionIdleMinutes: 15,
  featureFlags: {
    positivePayBulkDecision: true,
    auditExport: true,
    fxStreaming: false
  }
};
