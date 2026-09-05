import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnStepperShellComponent } from './stepper-shell.component';
import { CnStepperShellModule } from './stepper-shell.module';

@Component({
  template: `
    <cn-stepper-shell (completed)="done = true">
      <ng-template cnStep label="Amount" [control]="amount">Step one</ng-template>
      <ng-template cnStep label="Review">Step two</ng-template>
    </cn-stepper-shell>`
})
class HostComponent {
  amount = new FormControl<number | null>(null, Validators.required);
  done = false;
}

describe('CnStepperShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let shell: CnStepperShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnStepperShellModule, NoopAnimationsModule], declarations: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    shell = fixture.debugElement.query(d => d.componentInstance instanceof CnStepperShellComponent).componentInstance;
  });

  it('should create', () => {
    expect(shell).toBeTruthy();
  });

  it('blocks Continue while the step control is invalid', () => {
    shell.next();
    fixture.detectChanges();
    expect(shell.selectedIndex).toBe(0);
    host.amount.setValue(100);
    shell.next();
    fixture.detectChanges();
    expect(shell.selectedIndex).toBe(1);
    shell.next();
    expect(host.done).toBeTrue();
  });
});
