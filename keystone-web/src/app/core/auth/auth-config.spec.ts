import { buildAuthConfig } from './auth-config';
import { environment as local } from '../../../environments/environment';
import { environment as prod } from '../../../environments/environment.prod';
import { environment as uat } from '../../../environments/environment.uat';

describe('buildAuthConfig', () => {
  it('uses authorization code with PKCE and never implicit flow', () => {
    const cfg = buildAuthConfig(local);
    expect(cfg.responseType).toBe('code');
    expect(cfg.disablePKCE).toBeFalse();
    expect(cfg.useSilentRefresh).toBeFalse();
  });

  it('points at the registered public client', () => {
    const cfg = buildAuthConfig(local);
    expect(cfg.clientId).toBe('keystone-web');
    expect(cfg.redirectUri).toBe('http://localhost:4202/callback');
    expect(cfg.dummyClientSecret).toBeUndefined();
  });

  it('requires https outside local', () => {
    expect(buildAuthConfig(uat).requireHttps).toBeTrue();
    expect(buildAuthConfig(prod).requireHttps).toBeTrue();
    expect(buildAuthConfig(prod).strictDiscoveryDocumentValidation).toBeTrue();
  });

  it('only asks for the standard scopes', () => {
    expect(buildAuthConfig(local).scope?.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
  });
});
