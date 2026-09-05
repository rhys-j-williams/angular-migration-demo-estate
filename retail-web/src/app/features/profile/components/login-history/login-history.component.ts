import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { LoginHistoryItem } from '../../../../core/api/models';

/** Recent sign-ins with location and device. Failed attempts are called out; step-ups shown quietly. */
@Component({
  selector: 'mol-login-history',
  templateUrl: './login-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHistoryComponent implements OnInit {
  history$!: Observable<LoginHistoryItem[]>;

  constructor(private readonly api: ProfileApiService) {}

  ngOnInit(): void {
    this.history$ = this.api.security().pipe(map(s => [...s.loginHistory].sort((a, b) => b.at.localeCompare(a.at))));
  }

  tone(o: LoginHistoryItem['outcome']): 'success' | 'warn' | 'info' {
    return o === 'success' ? 'success' : o === 'failed' ? 'warn' : 'info';
  }

  label(o: LoginHistoryItem['outcome']): string {
    return o === 'success' ? $localize`:@@profile.activity.success:Signed in` : o === 'failed' ? $localize`:@@profile.activity.failed:Failed attempt` : $localize`:@@profile.activity.stepUp:Verified identity`;
  }

  failures(list: LoginHistoryItem[]): number {
    return list.filter(l => l.outcome === 'failed').length;
  }
}
