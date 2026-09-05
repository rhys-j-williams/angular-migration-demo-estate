import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { BrandHeaderComponent } from './shared/components/brand-header/brand-header.component';
import { LegalFooterComponent } from './shared/components/legal-footer/legal-footer.component';
import { MaintenanceNoticeComponent } from './shared/components/maintenance-notice/maintenance-notice.component';

describe('AppComponent', () => {
  it('renders header, outlet and footer', async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, BrandHeaderComponent, LegalFooterComponent, MaintenanceNoticeComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ks-brand-header')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.textContent).toContain('Member FDIC');
  });
});
