import { OAuthStorage } from 'angular-oauth2-oidc';

/**
 * Token storage for angular-oauth2-oidc. sessionStorage, not localStorage: tokens die with the tab
 * and are not shared with other tabs or origins (GIS-1180 finding 1, and the reason the "keep me
 * signed in" checkbox from the 2020 design never shipped).
 *
 * In-memory storage was trialled in MOL-3388 and rejected because a full page reload (which the
 * SW update prompt does) dropped the session.
 */
export class KeystoneSessionStorage implements OAuthStorage {
  private readonly prefix = 'mol.ks.';

  getItem(key: string): string | null {
    return sessionStorage.getItem(this.prefix + key);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }

  setItem(key: string, data: string): void {
    sessionStorage.setItem(this.prefix + key, data);
  }
}

export function keystoneStorageFactory(): OAuthStorage {
  return new KeystoneSessionStorage();
}
