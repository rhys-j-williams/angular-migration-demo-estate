import { Directive, Input, TemplateRef } from '@angular/core';

/** One tab inside cn-tabs. `label` is required; `badge` renders a count after it. */
@Directive({ selector: '[cnTab]' })
export class CnTabDirective {
  @Input() label = '';
  @Input() badge: number | string | null = null;
  @Input() icon: string | null = null;
  @Input() disabled = false;

  constructor(public readonly template: TemplateRef<unknown>) {}
}
