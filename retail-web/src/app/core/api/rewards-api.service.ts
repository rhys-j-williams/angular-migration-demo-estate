import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { RedemptionOption, RewardsActivity, RewardsSummary } from './models';

@Injectable({ providedIn: 'root' })
export class RewardsApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  summary(): Observable<RewardsSummary> {
    return this.get<RewardsSummary>('/rewards', { cacheSeconds: 300 });
  }

  activity(): Observable<RewardsActivity[]> {
    return this.get<RewardsActivity[]>('/rewards/activity');
  }

  options(): Observable<RedemptionOption[]> {
    return this.get<RedemptionOption[]>('/rewards/options', { cacheSeconds: 300 });
  }

  redeem(optionId: string, points: number, toAccountId?: string): Observable<RewardsSummary> {
    return this.http.post<RewardsSummary>(this.url('/rewards/redeem'), { optionId, points, toAccountId });
  }
}
