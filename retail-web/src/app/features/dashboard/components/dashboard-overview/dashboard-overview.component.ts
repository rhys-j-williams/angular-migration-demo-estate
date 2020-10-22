import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { selectGreetingName } from '../../../../core/store/session';

/** Composes the dashboard tiles; owns the greeting and the tile layout. */
@Component({
  selector: 'mol-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent {
  readonly greeting$ = this.store.select(selectGreetingName).pipe(map(name => this.greeting(name)));
  readonly showPromo$ = this.flags.isEnabled$('mol.dashboard.promo');
  readonly showSpending$ = this.flags.isEnabled$('mol.dashboard.spending-snapshot');

  constructor(private readonly store: Store, private readonly flags: FeatureFlagService) {}

  private greeting(name: string | null, now: Date = new Date()): string {
    const h = now.getHours();
    const part = h < 12 ? $localize`:@@dashboard.greeting.morning:Good morning` : h < 18 ? $localize`:@@dashboard.greeting.afternoon:Good afternoon` : $localize`:@@dashboard.greeting.evening:Good evening`;
    return name ? `${part}, ${name}` : part;
  }
}
