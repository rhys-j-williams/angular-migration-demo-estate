import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnCoreModule } from '@meridian/canopy-ui/core';
import { CnCurrencyInputComponent } from './currency-input.component';
import { CnCurrencyInputModule } from './currency-input.module';

@Component({
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Amount</mat-label>
      <cn-currency-input [formControl]="amount" [max]="5000"></cn-currency-input>
    </mat-form-field>`
})
class HostComponent {
  amount = new FormControl<number | null>(null, Validators.required);
}

describe('CnCurrencyInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnCoreModule.forRoot(), CnCurrencyInputModule, MatFormFieldModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  function type(text: string): void {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('acts as a MatFormFieldControl inside mat-form-field', () => {
    const component = fixture.debugElement.query(d => d.componentInstance instanceof CnCurrencyInputComponent)
      .componentInstance as CnCurrencyInputComponent;
    expect(component.controlType).toBe('cn-currency-input');
    expect(component.empty).toBeTrue();
    expect(fixture.nativeElement.querySelector('.mat-form-field-infix')).toBeTruthy();
  });

  it('parses typed text into a number on the form control', () => {
    type('1,250.5');
    expect(host.amount.value).toBe(1250.5);
  });

  it('clamps to max and rounds to cents', () => {
    type('9999.999');
    expect(host.amount.value).toBe(5000);
  });

  it('formats the value with grouping when written from the model', () => {
    host.amount.setValue(1234567.891);
    fixture.detectChanges();
    expect(input.value).toBe('1,234,567.89');
  });

  it('rejects negatives unless allowed', () => {
    type('-42');
    expect(host.amount.value).toBe(42);
  });
});
