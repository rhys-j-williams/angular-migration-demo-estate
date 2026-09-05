import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Custom cell template for a cn-data-table column. The template receives the row as `$implicit`
 * and the column config as `column`.
 */
@Directive({ selector: '[cnColumnDef]' })
export class CnColumnDefDirective {
  @Input('cnColumnDef') cnColumnDef = '';

  constructor(public readonly template: TemplateRef<unknown>) {}
}
