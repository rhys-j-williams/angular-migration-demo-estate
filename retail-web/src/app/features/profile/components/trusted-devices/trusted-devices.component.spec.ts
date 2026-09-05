import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { profileFeatureKey } from '../../store/profile.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { TrustedDevicesComponent } from './trusted-devices.component';

describe('TrustedDevicesComponent', () => {
  let fixture: ComponentFixture<TrustedDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrustedDevicesComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [profileFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(TrustedDevicesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('picks a device icon from the platform string', () => {
    const c = fixture.componentInstance;
    const d = { deviceId: '1', label: '', platform: 'iOS 17', lastSeenAt: '', current: false };
    expect(c.icon(d)).toBe('smartphone');
    expect(c.icon({ ...d, platform: 'Windows 11' })).toBe('computer');
  });
});
