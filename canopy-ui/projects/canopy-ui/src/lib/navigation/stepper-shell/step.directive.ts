import { Directive, Input, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** One step in a cn-stepper-shell. `control` gates progression when the shell is linear. */
@Directive({ selector: '[cnStep]' })
export class CnStepDirective {
  @Input() label = '';
  @Input() optional = false;
  @Input() control: AbstractControl | null = null;
  @Input() editable = true;

  constructor(public readonly template: TemplateRef<unknown>) {}
}
