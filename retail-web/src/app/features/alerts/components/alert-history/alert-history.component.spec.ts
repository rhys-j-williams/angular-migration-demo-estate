import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertHistoryItem } from '../../../../core/api/models';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertHistoryComponent } from './alert-history.component';

describe('AlertHistoryComponent', () => {
  let fixture: ComponentFixture<AlertHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertHistoryComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(AlertHistoryComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('groups alerts by calendar day', () => {
    const item = (id: string, sentAt: string): AlertHistoryItem => ({ id, code: 'balance.low', sentAt, channel: 'email', summary: '', read: true });
    const groups = fixture.componentInstance.byDay([item('1', '2026-09-01T09:00:00Z'), item('2', '2026-09-01T18:00:00Z'), item('3', '2026-08-30T08:00:00Z')]);
    expect(groups.length).toBe(2);
    expect(groups[0].items.length).toBe(2);
  });
});
