import { ChangeDetectionStrategy, Component } from '@angular/core';

/** FAQ accordion. */
@Component({
  selector: 'mol-faq',
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent {}
