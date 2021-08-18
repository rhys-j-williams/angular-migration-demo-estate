import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Tabs: preferences and history. Tab index is mirrored into the fragment so links can deep-link. */
@Component({
  selector: 'mol-alerts-home',
  templateUrl: './alerts-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsHomeComponent {
  tab = this.route.snapshot.fragment === 'quiet-hours' ? 1 : 0;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

  onTab(index: number): void {
    this.tab = index;
    void this.router.navigate([], { relativeTo: this.route, fragment: index === 1 ? 'quiet-hours' : undefined, replaceUrl: true });
  }
}
