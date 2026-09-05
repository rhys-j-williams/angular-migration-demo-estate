import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Renders one disclosure by key via cn-disclosure. */
@Component({
  selector: 'mol-disclosure-viewer',
  templateUrl: './disclosure-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclosureViewerComponent {}
