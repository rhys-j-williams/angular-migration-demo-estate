import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RateLimitStateService } from '../../../core/http/rate-limit-state.service';
import { RateLimitBannerComponent } from './rate-limit-banner.component';

describe('RateLimitBannerComponent', () => {
  let fixture: ComponentFixture<RateLimitBannerComponent>;
  let state: RateLimitStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RateLimitBannerComponent, HttpClientTestingModule] }).compileComponents();
    state = TestBed.inject(RateLimitStateService);
    fixture = TestBed.createComponent(RateLimitBannerComponent);
    fixture.detectChanges();
  });

  it('is hidden when not limited', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.ks-ratelimit');
    expect(el.classList).toContain('ks-ratelimit--hidden');
  });

  it('shows the login copy with a countdown', fakeAsync(() => {
    state.limited(30, 'login');
    tick(0);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Too many sign in attempts');
    expect(el.textContent).toMatch(/wait (29|30) seconds/);
    state.clear();
    tick(0);
    fixture.detectChanges();
    expect(el.querySelector('.ks-ratelimit')?.classList).toContain('ks-ratelimit--hidden');
  }));

  it('uses the otp copy for code limits', fakeAsync(() => {
    state.limited(5, 'otp');
    tick(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Too many code attempts');
    state.clear();
    tick(0);
  }));
});
