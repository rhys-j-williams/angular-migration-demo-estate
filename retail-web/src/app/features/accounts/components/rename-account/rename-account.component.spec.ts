import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountsApiService } from '../../../../core/api/accounts-api.service';
import { RenameAccountComponent } from './rename-account.component';

describe('RenameAccountComponent', () => {
  let fixture: ComponentFixture<RenameAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenameAccountComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AccountsApiService, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'TEST-1' } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RenameAccountComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
