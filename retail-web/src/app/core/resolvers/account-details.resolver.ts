import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountsApiService } from '../api/accounts-api.service';
import { AccountDetails } from '../api/models';
import { AppError } from '../errors/app-error.model';

/** /accounts/:accountId. A 404 (typo, closed account) goes to the not found page rather than a broken detail view. */
@Injectable({ providedIn: 'root' })
export class AccountDetailsResolver implements Resolve<AccountDetails> {
  constructor(private readonly api: AccountsApiService, private readonly router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<AccountDetails> {
    const id = route.paramMap.get('accountId') ?? '';
    return this.api.details(id).pipe(
      catchError((err: AppError) => {
        void this.router.navigate([err.kind === 'not-found' ? '/not-found' : '/error'], { skipLocationChange: true });
        return EMPTY;
      })
    );
  }
}
