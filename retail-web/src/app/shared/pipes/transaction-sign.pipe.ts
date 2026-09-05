import { Pipe, PipeTransform } from '@angular/core';

/** CSS class for a signed amount: 'is-credit' | 'is-debit' | 'is-zero'. */
@Pipe({ name: 'transactionSign' })
export class TransactionSignPipe implements PipeTransform {
  transform(amountMinor: number | null | undefined): string {
    if (!amountMinor) return 'is-zero';
    return amountMinor > 0 ? 'is-credit' : 'is-debit';
  }
}
