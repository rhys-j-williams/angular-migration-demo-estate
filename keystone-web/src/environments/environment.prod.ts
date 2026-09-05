import { KeystoneEnvironment } from './environment.model';

// Production values are placeholders; the real ones are templated in by the Helm chart at deploy
// time (helm/templates/configmap.yaml writes assets/config/env.json and the bootstrap reads it).
// The hard coded values below are what you get if that file is missing, which happened once
// (INC0148821) and is why they now point at UAT rather than at nothing.
export const environment: KeystoneEnvironment = {
  production: true,
  name: 'prod',
  issuer: 'https://login.meridiantrust.example/keystone',
  clientId: 'keystone-web',
  redirectUri: 'https://login.meridiantrust.example/callback',
  postLogoutRedirectUri: 'https://login.meridiantrust.example/',
  bffBaseUrl: 'https://api.meridiantrust.example/retail',
  requireHttps: true,
  telemetryEnabled: true,
  deviceTrustDays: 30,
  pushPollIntervalMs: 2000,
  pushTimeoutMs: 90000,
  maintenanceWindow: null,
};
