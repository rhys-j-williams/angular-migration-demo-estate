import { Pipe, PipeTransform } from '@angular/core';

import { Account } from '../../core/api/models';

/** "Everyday Checking ****4821" - the way an account is named everywhere outside its own detail page. */
@Pipe({ name: 'accountLabel' })
export class AccountLabelPipe implements PipeTransform {
  transform(account: Pick<Account, 'nickname' | 'accountNumber'> | null | undefined, style: 'full' | 'short' = 'full'): string {
    if (!account) {
      return '';
    }
    const last4 = account.accountNumber.slice(-4);
    return style === 'short' ? `****${last4}` : `${account.nickname} ****${last4}`;
  }
}
