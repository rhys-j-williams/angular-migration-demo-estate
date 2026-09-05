export interface MaintenanceWindow {
  startsAt: string;
  endsAt: string;
  message: string;
}

export interface KeystoneEnvironment {
  production: boolean;
  name: 'local' | 'uat' | 'prod';
  issuer: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  bffBaseUrl: string;
  requireHttps: boolean;
  telemetryEnabled: boolean;
  deviceTrustDays: number;
  pushPollIntervalMs: number;
  pushTimeoutMs: number;
  maintenanceWindow: MaintenanceWindow | null;
}
