import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { TaxDocumentsComponent } from './tax-documents.component';

describe('TaxDocumentsComponent', () => {
  let fixture: ComponentFixture<TaxDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaxDocumentsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaxDocumentsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('offers the last three tax years, newest first', () => {
    const c = fixture.componentInstance;
    expect(c.years.length).toBe(3);
    expect(c.years[0]).toBe(new Date().getFullYear() - 1);
  });
});
