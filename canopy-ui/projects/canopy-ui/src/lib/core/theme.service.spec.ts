import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CN_CONFIG, CN_DEFAULT_CONFIG } from './canopy-config';
import { CnThemeService } from './theme.service';

describe('CnThemeService', () => {
  let service: CnThemeService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CN_CONFIG, useValue: { ...CN_DEFAULT_CONFIG, themeStorageKey: null } }]
    });
    doc = TestBed.inject(DOCUMENT);
    service = TestBed.inject(CnThemeService);
  });

  afterEach(() => {
    doc.documentElement.classList.remove('cn-theme-light', 'cn-theme-dark', 'cn-theme-high-contrast');
  });

  it('applies a theme class to <html>', () => {
    service.setTheme('dark');
    expect(doc.documentElement.classList.contains('cn-theme-dark')).toBeTrue();
    expect(doc.documentElement.classList.contains('cn-theme-light')).toBeFalse();
  });

  it('toggles between light and dark', () => {
    service.setTheme('light');
    service.toggleDark();
    expect(service.theme).toBe('dark');
    service.toggleDark();
    expect(service.theme).toBe('light');
  });

  it('emits the current theme', (done) => {
    service.setTheme('high-contrast');
    service.theme$.subscribe(t => {
      expect(t).toBe('high-contrast');
      done();
    });
  });
});
