import { ChangeDetectionStrategy, Component } from '@angular/core';

/** In-page PDF viewer with download. */
@Component({
  selector: 'mol-statement-viewer',
  templateUrl: './statement-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewerComponent {}
