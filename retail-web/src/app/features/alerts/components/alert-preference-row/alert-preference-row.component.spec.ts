import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertPreferenceRowComponent } from './alert-preference-row.component';

describe('AlertPreferenceRowComponent', () => {
  let fixture: ComponentFixture<AlertPreferenceRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertPreferenceRowComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertPreferenceRowComponent);
    fixture.componentInstance.preference = { alertId: 'a1', customerId: 'c', code: 'transaction.large', label: 'Large transaction', description: '', regulatory: false, enabled: true, channels: ['push'], thresholdMinor: 20000 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits the threshold in minor units only when it changed', () => {
    const c = fixture.componentInstance;
    const spy = spyOn(c.thresholdChange, 'emit');
    c.preference = { ...c.preference, thresholdMinor: 50000 };
    c.startThreshold();
    expect(c.thresholdMajor).toBe(500);
    c.saveThreshold();
    expect(spy).not.toHaveBeenCalled();
    c.thresholdMajor = 750;
    c.saveThreshold();
    expect(spy).toHaveBeenCalledWith(75000);
  });
});
