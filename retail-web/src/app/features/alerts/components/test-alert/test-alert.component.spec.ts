import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { TestAlertComponent } from './test-alert.component';

describe('TestAlertComponent', () => {
  let fixture: ComponentFixture<TestAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestAlertComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AlertsApiService, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'TEST-1' } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestAlertComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
