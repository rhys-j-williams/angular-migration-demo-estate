import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { LoginHistoryComponent } from './login-history.component';

describe('LoginHistoryComponent', () => {
  let fixture: ComponentFixture<LoginHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginHistoryComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(LoginHistoryComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('counts failed attempts', () => {
    const c = fixture.componentInstance;
    expect(c.failures([
      { at: '1', outcome: 'failed', channel: 'web', city: '', deviceLabel: '' },
      { at: '2', outcome: 'success', channel: 'web', city: '', deviceLabel: '' }
    ])).toBe(1);
    expect(c.tone('failed')).toBe('warn');
  });
});
