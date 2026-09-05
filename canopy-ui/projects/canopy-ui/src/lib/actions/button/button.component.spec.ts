import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnButtonModule } from './button.module';

@Component({
  template: `<cn-button [variant]="variant" [disabled]="disabled" [loading]="loading" (pressed)="clicks = clicks + 1">Pay</cn-button>`
})
class HostComponent {
  variant = 'primary';
  disabled = false;
  loading = false;
  clicks = 0;
}

describe('CnButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnButtonModule, NoopAnimationsModule],
      declarations: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('renders a flat primary button', () => {
    expect(button().classList).toContain('mat-flat-button');
    expect(button().classList).toContain('mat-primary');
  });

  it('renders a stroked button for the secondary variant', () => {
    host.variant = 'secondary';
    fixture.detectChanges();
    expect(button().classList).toContain('mat-stroked-button');
  });

  it('emits pressed on click', () => {
    button().click();
    expect(host.clicks).toBe(1);
  });

  it('does not emit while disabled or loading', () => {
    host.disabled = true;
    fixture.detectChanges();
    button().click();
    host.disabled = false;
    host.loading = true;
    fixture.detectChanges();
    button().click();
    expect(host.clicks).toBe(0);
    expect(button().getAttribute('aria-busy')).toBe('true');
  });
});
