import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { TransactionListComponent } from './transaction-list.component';

describe('TransactionListComponent', () => {
  let fixture: ComponentFixture<TransactionListComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionListComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TransactionListComponent);
    fixture.componentInstance.accountId = 'acc-1';
    fixture.componentInstance.ngOnChanges({});
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('requests posted transactions for the account, page 1', fakeAsync(() => {
    tick(200);
    const req = http.expectOne(r => r.url.includes('/accounts/acc-1/transactions'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('status')).toBe('posted');
    req.flush({ items: [], page: 1, pageSize: 25, total: 0 });
  }));

  it('resets to the first page when filters change', fakeAsync(() => {
    tick(200);
    http.expectOne(r => r.url.includes('/transactions')).flush({ items: [], page: 1, pageSize: 25, total: 60 });
    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 25, length: 60 });
    tick(200);
    expect(http.expectOne(r => r.url.includes('/transactions')).request.params.get('page')).toBe('3');
    fixture.componentInstance.onFilters({ search: 'coffee' });
    tick(200);
    const req = http.expectOne(r => r.url.includes('/transactions'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('search')).toBe('coffee');
    req.flush({ items: [], page: 1, pageSize: 25, total: 0 });
  }));
});
