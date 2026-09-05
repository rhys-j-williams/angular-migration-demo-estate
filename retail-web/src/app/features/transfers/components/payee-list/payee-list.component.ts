import { ChangeDetectionStrategy, Component } from '@angular/core';

/** External transfer payees with verification status. */
@Component({
  selector: 'mol-payee-list',
  templateUrl: './payee-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayeeListComponent {}
