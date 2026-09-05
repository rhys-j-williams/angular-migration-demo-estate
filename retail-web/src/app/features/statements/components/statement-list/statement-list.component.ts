import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Statements by account and year with download. */
@Component({
  selector: 'mol-statement-list',
  templateUrl: './statement-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementListComponent {}
