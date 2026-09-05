import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { CnMenuItem } from '@meridian/canopy-ui/actions';
import { CnDialogService } from '@meridian/canopy-ui/overlays';

import { Account } from '../../../../core/api/models';
import { RenameAccountComponent, RenameAccountData } from '../rename-account/rename-account.component';

/** Overflow menu: rename, transfer from, statements, set as default. */
@Component({
  selector: 'mol-account-actions-menu',
  templateUrl: './account-actions-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountActionsMenuComponent {
  @Input() account!: Account;
  @Output() readonly renamed = new EventEmitter<void>();

  constructor(private readonly router: Router, private readonly dialog: CnDialogService) {}

  get items(): CnMenuItem[] {
    const liability = this.account.type === 'credit-card' || this.account.type === 'mortgage' || this.account.type === 'auto-loan';
    const closed = this.account.status === 'closed';
    return [
      { id: 'rename', label: 'Rename account', icon: 'edit', disabled: closed },
      { id: 'transfer', label: liability ? 'Make a payment' : 'Transfer from this account', icon: 'swap_horiz', disabled: closed || this.account.status === 'restricted' },
      { id: 'statements', label: 'Statements and documents', icon: 'description' },
      { id: 'alerts', label: 'Alerts for this account', icon: 'notifications', dividerBefore: true },
      { id: 'routing', label: 'Direct deposit form', icon: 'download', disabled: liability }
    ];
  }

  select(item: CnMenuItem): void {
    switch (item.id) {
      case 'rename':
        this.dialog
          .open<RenameAccountComponent, RenameAccountData, boolean>(RenameAccountComponent, {
            data: { accountId: this.account.accountId, nickname: this.account.nickname }, size: 'sm'
          })
          .afterClosed()
          .subscribe(ok => { if (ok) this.renamed.emit(); });
        return;
      case 'transfer':
        void this.router.navigate(['/transfers/new'], { queryParams: { from: this.account.accountId } });
        return;
      case 'statements':
        void this.router.navigate(['/statements'], { queryParams: { accountId: this.account.accountId } });
        return;
      case 'alerts':
        void this.router.navigate(['/alerts'], { fragment: this.account.accountId });
        return;
      case 'routing':
        void this.router.navigate(['/statements'], { queryParams: { accountId: this.account.accountId, type: 'notice' } });
        return;
    }
  }
}
