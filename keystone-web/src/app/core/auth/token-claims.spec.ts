import { toClaims } from './token-claims';

describe('toClaims', () => {
  it('returns null without a subject', () => {
    expect(toClaims(null)).toBeNull();
    expect(toClaims({ email: 'x@example.com' })).toBeNull();
  });

  it('keeps only the standard claims it knows about', () => {
    const claims = toClaims({
      sub: 'cust-0001',
      preferred_username: 'p.fixture',
      amr: ['pwd', 'otp', 42],
      acr: 'urn:meridian:keystone:loa2',
      auth_time: 1700000000,
      something_else: 'ignored',
    });
    expect(claims).toEqual(jasmine.objectContaining({ sub: 'cust-0001', preferred_username: 'p.fixture', amr: ['pwd', 'otp'] }));
    expect(Object.keys(claims!)).not.toContain('something_else');
  });
});
