import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';

/**
 * Reveals routing and full account number for direct deposit forms. The full number is only on
 * the details endpoint and only shown after an explicit click (GIS-1471 finding 2); it is never
 * written to analytics or logs.
 */
@Component({
  selector: 'mol-routing-details',
  templateUrl: './routing-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutingDetailsComponent {
  @Input() details!: AccountDetails;
  revealed = false;

  constructor(private readonly clipboard: Clipboard, private readonly toast: CnToastService, private readonly lantern: LanternService) {}

  toggle(): void {
    this.revealed = !this.revealed;
    if (this.revealed) this.lantern.track('account.number.revealed', { accountType: this.details.type });
  }

  copy(kind: 'routing' | 'account'): void {
    const value = kind === 'routing' ? this.details.routingNumber : this.details.accountNumberFull;
    if (this.clipboard.copy(value)) {
      this.toast.success(kind === 'routing' ? $localize`:@@accounts.routing.copiedRouting:Routing number copied` : $localize`:@@accounts.routing.copiedAccount:Account number copied`);
    }
  }

  get maskedFull(): string {
    const full = this.details.accountNumberFull;
    return full.slice(0, -4).replace(/./g, '\u2022') + full.slice(-4);
  }
}
