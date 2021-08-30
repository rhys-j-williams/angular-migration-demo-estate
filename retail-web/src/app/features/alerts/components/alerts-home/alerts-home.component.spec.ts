import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsHomeComponent } from './alerts-home.component';

describe('AlertsHomeComponent', () => {
  let fixture: ComponentFixture<AlertsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsHomeComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsHomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
