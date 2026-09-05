import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Per-account paperless enrolment. */
@Component({
  selector: 'mol-paperless-settings',
  templateUrl: './paperless-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaperlessSettingsComponent {}
