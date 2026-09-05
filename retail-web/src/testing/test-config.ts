import { Provider } from '@angular/core';

import { AppConfig } from '../app/core/config/app-config.model';
import { ConfigService } from '../app/core/config/config.service';

/**
 * Mirrors assets/config/env.json closely enough for specs. Keep the two in step when a new
 * section is added to AppConfig, otherwise the failure is the unhelpful "read before load()".
 */
export const TEST_CONFIG: AppConfig = {
  environment: 'test',
  apiBaseUrl: '/api/v1',
  keystone: {
    issuer: 'http://localhost:4400/oauth2/v1',
    clientId: 'meridian-online-web',
    scope: 'openid profile',
    redirectUri: 'http://localhost:4200/auth/callback',
    silentRefreshRedirectUri: 'http://localhost:4200/silent-refresh.html',
    postLogoutRedirectUri: 'http://localhost:4200/',
    stepUpAcr: 'urn:meridian:keystone:loa2',
    requireHttps: false
  },
  semaphore: { baseUrl: '/flags', environment: 'test', refreshSeconds: 300 },
  lantern: {
    writeKey: 'CHANGEME-lantern-write-key-test',
    scriptUrl: 'http://localhost:4607/v4/lantern.min.js',
    collectorUrl: 'http://localhost:4607',
    debug: false,
    disabled: true
  },
  telemetry: { splunkHecUrl: '/telemetry/event', splunkToken: 'CHANGEME-splunk-hec-token', index: 'digital_retail_web', sampleRate: 0 },
  session: { idleWarningSeconds: 480, idleLogoutSeconds: 600, warningCountdownSeconds: 120 },
  transfers: {
    mfaStepUpThresholdMinor: 250000,
    mfaMaxAgeSeconds: 600,
    dailyExternalLimitMinor: 1000000,
    cutoffLocalTime: '17:00',
    cutoffTimeZone: 'America/New_York'
  },
  features: { paylinkEnabled: true, rewardsEnabled: true, secureMessagesEnabled: true, onboardingEnabled: true },
  support: { phone: '1-800-555-0142', lostCardPhone: '1-800-555-0199', hoursCopy: 'test hours' }
};

export function provideTestConfig(overrides: Partial<AppConfig> = {}): Provider {
  return { provide: ConfigService, useValue: { value: { ...TEST_CONFIG, ...overrides }, loaded: true } };
}
