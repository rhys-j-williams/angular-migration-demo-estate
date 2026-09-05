import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Grouped alert toggles with channel selection and thresholds; regulatory alerts cannot be disabled. */
@Component({
  selector: 'mol-alert-preferences',
  templateUrl: './alert-preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferencesComponent {}
