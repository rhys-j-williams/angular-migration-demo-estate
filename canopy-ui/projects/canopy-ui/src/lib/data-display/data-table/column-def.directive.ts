import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Custom cell template for a cn-data-table column. The template receives the row as `$implicit`
 * and the column config as `column`.
 */
@Directive({ selector: '[cnColumnDef]' })
export class CnColumnDefDirective {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('cnColumnDef') cnColumnDef = '';

  constructor(public readonly template: TemplateRef<unknown>) {}
}
