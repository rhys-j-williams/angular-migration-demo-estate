import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * General purpose surface with an optional title row and action slot. Use cn-account-card for
 * accounts; this is for everything else (offers, summaries, settings groups).
 *
 *   <cn-card title="Upcoming payments" subtitle="Next 7 days">
 *     <cn-button cnCardAction variant="tertiary">View all</cn-button>
 *     ...content...
 *     <div cnCardFooter>...</div>
 *   </cn-card>
 */
@Component({
  selector: 'cn-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cn-card',
    '[class.cn-card--flat]': 'flat',
    '[class.cn-card--padded]': 'padded',
    '[class.cn-card--highlight]': 'highlight'
  }
})
export class CnCardComponent {
  @Input() title: string | null = null;
  @Input() subtitle: string | null = null;
  @Input() flat = false;
  @Input() padded = true;
  @Input() highlight = false;
  @Input() headingLevel: 2 | 3 | 4 = 3;
}
