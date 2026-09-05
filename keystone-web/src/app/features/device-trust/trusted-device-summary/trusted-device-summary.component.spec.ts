import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TrustedDeviceSummaryComponent } from './trusted-device-summary.component';

describe('TrustedDeviceSummaryComponent', () => {
  it('renders label and dates', async () => {
    await TestBed.configureTestingModule({ imports: [TrustedDeviceSummaryComponent, HttpClientTestingModule] }).compileComponents();
    const fixture = TestBed.createComponent(TrustedDeviceSummaryComponent);
    fixture.componentRef.setInput('device', { deviceId: 'd1', label: 'My Mac', enrolledAt: '2024-03-01T10:00:00Z', expiresAt: '2024-03-31T10:00:00Z' });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('My Mac');
    expect(text).toContain('Mar 1, 2024');
    expect(text).toContain('Mar 31, 2024');
  });
});
