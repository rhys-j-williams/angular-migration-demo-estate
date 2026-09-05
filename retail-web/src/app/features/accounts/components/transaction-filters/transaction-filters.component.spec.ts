import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { TransactionFiltersComponent } from './transaction-filters.component';

describe('TransactionFiltersComponent', () => {
  let fixture: ComponentFixture<TransactionFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionFiltersComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFiltersComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('translates an amount band into minor-unit bounds', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ amountBand: ['25-100'] });
    expect(c.toFilters()).toEqual({ minAmountMinor: 2500, maxAmountMinor: 10000 });
  });

  it('only sends a category when exactly one is selected', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ category: ['dining', 'fuel'] });
    expect(c.toFilters().category).toBeUndefined();
    c.form.patchValue({ category: ['dining'] });
    expect(c.toFilters().category).toBe('dining');
  });

  it('trims search text and drops it when blank', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ search: '   ' });
    expect(c.toFilters().search).toBeUndefined();
    c.form.patchValue({ search: ' coffee ' });
    expect(c.toFilters().search).toBe('coffee');
  });
});
