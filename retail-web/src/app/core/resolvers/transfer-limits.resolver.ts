import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TransfersApiService } from '../api/transfers-api.service';
import { TransferLimits } from '../api/models';
import { ConfigService } from '../config/config.service';

/**
 * Limits for the transfer wizard. Falls back to the env.json numbers if the BFF call fails so the
 * amount validator always has something; the BFF re-validates on submit anyway.
 */
@Injectable({ providedIn: 'root' })
export class TransferLimitsResolver implements Resolve<TransferLimits> {
  constructor(private readonly api: TransfersApiService, private readonly config: ConfigService) {}

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<TransferLimits> {
    return this.api.limits().pipe(catchError(() => of(this.fallback())));
  }

  private fallback(): TransferLimits {
    const t = this.config.value.transfers;
    return {
      dailyExternalLimitMinor: t.dailyExternalLimitMinor,
      dailyExternalUsedMinor: 0,
      perTransactionInternalMinor: 10_000_000,
      perTransactionExternalMinor: t.dailyExternalLimitMinor,
      wireEnabled: false,
      cutoffLocalTime: t.cutoffLocalTime,
      nextBusinessDay: new Date().toISOString().slice(0, 10)
    };
  }
}
