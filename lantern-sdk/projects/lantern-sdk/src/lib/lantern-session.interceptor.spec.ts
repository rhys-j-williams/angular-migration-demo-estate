import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LanternConfig } from './lantern.config';
import { LanternModule } from './lantern.module';
import { LanternService } from './lantern.service';

describe('LanternSessionInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  function setup(config: Partial<LanternConfig>): void {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LanternModule.forRoot({ writeKey: 'wk_test', trackRouterEvents: false, ...config })
      ]
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    spyOn(TestBed.inject(LanternService), 'sessionId').and.returnValue('las_spec');
  }

  afterEach(() => ctrl.verify());

  it('adds X-Analytics-Session to requests matching the configured prefixes only', () => {
    setup({ sessionHeaderUrlPrefixes: ['/api/', 'http://localhost:4500'] });
    http.get('/api/v1/accounts').subscribe();
    http.get('http://localhost:4500/health').subscribe();
    http.get('https://static.meridiantrust.example/config.json').subscribe();

    expect(ctrl.expectOne('/api/v1/accounts').request.headers.get('X-Analytics-Session')).toBe('las_spec');
    expect(ctrl.expectOne('http://localhost:4500/health').request.headers.get('X-Analytics-Session')).toBe('las_spec');
    const thirdParty = ctrl.expectOne('https://static.meridiantrust.example/config.json');
    expect(thirdParty.request.headers.has('X-Analytics-Session')).toBeFalse();
  });

  it('honours a custom header name and never overwrites one the caller set', () => {
    setup({ sessionHeaderName: 'X-MTB-Analytics' });
    http.get('/api/a').subscribe();
    http.get('/api/b', { headers: { 'X-MTB-Analytics': 'caller-set' } }).subscribe();
    expect(ctrl.expectOne('/api/a').request.headers.get('X-MTB-Analytics')).toBe('las_spec');
    expect(ctrl.expectOne('/api/b').request.headers.get('X-MTB-Analytics')).toBe('caller-set');
  });

  it('does nothing when attachSessionHeader is off or the SDK is disabled', () => {
    setup({ attachSessionHeader: false });
    http.get('/api/a').subscribe();
    expect(ctrl.expectOne('/api/a').request.headers.has('X-Analytics-Session')).toBeFalse();
  });
});
