import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, Output, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { CnStepDirective } from './step.directive';

/**
 * Multi-step flow container: transfers, payee setup, dispute filing. Steps are templates with a
 * label and an optional form control that gates "Continue". Horizontal on wide screens, vertical
 * under `compact` (the shell does not measure the viewport; the page decides).
 *
 *   <cn-stepper-shell (completed)="submit()">
 *     <ng-template cnStep label="Amount" [control]="form.get('amount')">...</ng-template>
 *     <ng-template cnStep label="Review">...</ng-template>
 *   </cn-stepper-shell>
 */
@Component({
  selector: 'cn-stepper-shell',
  templateUrl: './stepper-shell.component.html',
  styleUrls: ['./stepper-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cn-stepper-shell', '[class.cn-stepper-shell--compact]': 'compact' }
})
export class CnStepperShellComponent {
  @Input() compact = false;
  @Input() linear = true;
  @Input() continueLabel = 'Continue';
  @Input() backLabel = 'Back';
  @Input() finishLabel = 'Submit';
  @Input() busy = false;

  @Output() readonly stepChange = new EventEmitter<number>();
  @Output() readonly completed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  @ContentChildren(CnStepDirective) steps?: QueryList<CnStepDirective>;
  @ViewChild(MatStepper) stepper?: MatStepper;

  get selectedIndex(): number {
    return this.stepper?.selectedIndex ?? 0;
  }

  get isLast(): boolean {
    return !!this.steps && this.selectedIndex === this.steps.length - 1;
  }

  onSelectionChange(event: StepperSelectionEvent): void {
    this.stepChange.emit(event.selectedIndex);
  }

  next(): void {
    const step = this.steps?.get(this.selectedIndex);
    step?.control?.markAllAsTouched();
    if (this.linear && step?.control && step.control.invalid) {
      return;
    }
    if (this.isLast) {
      this.completed.emit();
    } else if (this.stepper) {
      if (this.stepper.selected) {
        this.stepper.selected.completed = true;
      }
      this.stepper.next();
    }
  }

  back(): void {
    this.stepper?.previous();
  }

  reset(): void {
    this.stepper?.reset();
  }
}
