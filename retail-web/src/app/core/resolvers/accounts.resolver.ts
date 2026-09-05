import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountsApiService } from '../api/accounts-api.service';
import { Account } from '../api/models';

/**
 * Pre-fetches the account list for routes that cannot render anything sensible without it (the
 * transfer wizard's from/to pickers, the statements filter). The accounts feature store is the
 * source of truth once loaded; this resolver exists for the cold deep-link case and resolves to an
 * empty list on error so the page can show its own error state instead of the router failing.
 */
@Injectable({ providedIn: 'root' })
export class AccountsResolver implements Resolve<Account[]> {
  constructor(private readonly api: AccountsApiService) {}

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Account[]> {
    return this.api.list().pipe(catchError(() => of([])));
  }
}
