import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { alertsFeatureKey } from '../../store/alerts.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { QuietHoursComponent } from './quiet-hours.component';

describe('QuietHoursComponent', () => {
  let fixture: ComponentFixture<QuietHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuietHoursComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [alertsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(QuietHoursComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('recognises a window that crosses midnight', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ start: '22:00', end: '07:00' });
    expect(c.spansMidnight).toBeTrue();
    c.form.patchValue({ start: '13:00', end: '14:00' });
    expect(c.spansMidnight).toBeFalse();
  });
});
