/**
 * Shape of assets/config/env.json. One file per deployed environment, written by the Helm chart
 * from values-<env>.yaml into the nginx document root at deploy time, so the same image runs in
 * UAT, PRE and PROD.
 *
 * Keep this in step with helm/values.schema.json. There is no runtime validation beyond what
 * ConfigService does for the handful of fields that would make the app unusable if missing.
 */
export interface KeystoneConfig {
  issuer: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  silentRefreshRedirectUri: string;
  postLogoutRedirectUri: string;
  /** acr value requested when a step-up is needed. Keystone maps it to "MFA within this session". */
  stepUpAcr: string;
  requireHttps: boolean;
}

export interface SemaphoreConfig {
  baseUrl: string;
  environment: string;
  refreshSeconds: number;
}

export interface LanternRuntimeConfig {
  writeKey: string;
  scriptUrl?: string;
  collectorUrl?: string;
  debug?: boolean;
  disabled?: boolean;
}

export interface TelemetryConfig {
  splunkHecUrl: string;
  splunkToken: string;
  index: string;
  /** 0..1, applied to handled errors only. Unhandled errors always go. */
  sampleRate: number;
}

export interface SessionConfig {
  idleWarningSeconds: number;
  idleLogoutSeconds: number;
  warningCountdownSeconds: number;
}

export interface TransfersConfig {
  /** Above this amount (minor units) a transfer needs an MFA claim younger than mfaMaxAgeSeconds. */
  mfaStepUpThresholdMinor: number;
  mfaMaxAgeSeconds: number;
  dailyExternalLimitMinor: number;
  cutoffLocalTime: string;
  cutoffTimeZone: string;
}

export interface FeatureToggles {
  paylinkEnabled: boolean;
  rewardsEnabled: boolean;
  secureMessagesEnabled: boolean;
  onboardingEnabled: boolean;
}

export interface SupportConfig {
  phone: string;
  lostCardPhone: string;
  hoursCopy: string;
}

export interface AppConfig {
  environment: 'local' | 'dev' | 'uat' | 'pre' | 'prod' | string;
  apiBaseUrl: string;
  keystone: KeystoneConfig;
  semaphore: SemaphoreConfig;
  lantern: LanternRuntimeConfig;
  telemetry: TelemetryConfig;
  session: SessionConfig;
  transfers: TransfersConfig;
  features: FeatureToggles;
  support: SupportConfig;
}
