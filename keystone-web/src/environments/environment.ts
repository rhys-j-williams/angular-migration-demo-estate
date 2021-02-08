import { KeystoneEnvironment } from './environment.model';

// Local development against mock-external. Ports come from PORTS.md at the estate root; do not
// change them here without changing them there.
export const environment: KeystoneEnvironment = {
  production: false,
  name: 'local',
  issuer: 'http://localhost:4400',
  clientId: 'keystone-web',
  redirectUri: 'http://localhost:4202/callback',
  postLogoutRedirectUri: 'http://localhost:4202/',
  bffBaseUrl: 'http://localhost:4515',
  requireHttps: false,
  telemetryEnabled: false,
  deviceTrustDays: 30,
  pushPollIntervalMs: 2000,
  pushTimeoutMs: 90000,
  maintenanceWindow: null,
};
