import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharedModule } from '../../../../shared/shared.module';
import { CardsApiService } from '../../../../core/api/cards-api.service';
import { LockCardComponent } from './lock-card.component';

describe('LockCardComponent', () => {
  let fixture: ComponentFixture<LockCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LockCardComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: CardsApiService, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'TEST-1' } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LockCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
