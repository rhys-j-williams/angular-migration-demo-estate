import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Catch-all error page, also the chunk-load fallback. */
@Component({
  selector: 'mol-generic-error',
  templateUrl: './generic-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericErrorComponent {}
