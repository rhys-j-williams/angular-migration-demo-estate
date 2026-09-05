import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTestConfig } from '../../../../../testing/test-config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { UpcomingPaymentsComponent } from './upcoming-payments.component';

describe('UpcomingPaymentsComponent', () => {
  let fixture: ComponentFixture<UpcomingPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpcomingPaymentsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideTestConfig()]
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingPaymentsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sums the amounts leaving the account', () => {
    expect(fixture.componentInstance.total([
      { id: '1', when: '2026-09-10', label: 'Rent', amountMinor: 120000, kind: 'bill', link: [] },
      { id: '2', when: '2026-09-11', label: 'Savings', amountMinor: 5000, kind: 'transfer', link: [] }
    ])).toBe(125000);
  });
});
