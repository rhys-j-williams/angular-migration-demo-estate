import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { ExportTransactionsComponent } from './export-transactions.component';

describe('ExportTransactionsComponent', () => {
  let fixture: ComponentFixture<ExportTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportTransactionsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AccountsApiService, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'TEST-1' } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportTransactionsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
