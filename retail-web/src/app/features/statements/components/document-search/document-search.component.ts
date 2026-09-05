import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Search across statements, notices and tax forms. */
@Component({
  selector: 'mol-document-search',
  templateUrl: './document-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSearchComponent {}
