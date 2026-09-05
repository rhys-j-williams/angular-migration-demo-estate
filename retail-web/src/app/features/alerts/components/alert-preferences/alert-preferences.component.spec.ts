import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { AlertPreference } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { alertsFeatureKey } from '../../store/alerts.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertPreferencesComponent } from './alert-preferences.component';

describe('AlertPreferencesComponent', () => {
  let fixture: ComponentFixture<AlertPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertPreferencesComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [alertsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertPreferencesComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('groups preferences by code prefix and drops empty groups', () => {
    const pref = (alertId: string, code: string): AlertPreference => ({ alertId, customerId: 'c', code, label: code, description: '', regulatory: false, enabled: true, channels: ['email'] });
    const groups = AlertPreferencesComponent.group([pref('1', 'security.new-device'), pref('2', 'balance.low'), pref('3', 'balance.large-deposit'), pref('4', 'misc.thing')]);
    expect(groups.map(g => g.id)).toEqual(['security', 'balance', 'other']);
    expect(groups[1].items.length).toBe(2);
  });
});
