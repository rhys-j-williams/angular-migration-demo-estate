import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Shows an account or card number masked, with a reveal toggle. Reveal is client side only for
 * account numbers (the BFF sends the full number on the details endpoint); for cards the parent
 * has to fetch the PAN via the reveal endpoint and pass it in, this component never asks for it.
 */
@Component({
  selector: 'mol-masked-number',
  template: `
    <span class="mol-masked" fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="4px">
      <span class="mol-masked__value" [attr.aria-label]="revealed ? fullLabel : maskedLabel">{{ revealed ? grouped : masked }}</span>
      <cn-icon-button *ngIf="full" [icon]="revealed ? 'visibility_off' : 'visibility'"
        [ariaLabel]="revealed ? hideLabel : showLabel" (pressed)="toggle()"></cn-icon-button>
    </span>
  `,
  styles: [`.mol-masked__value { font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaskedNumberComponent {
  @Input() last4 = '';
  @Input() full: string | null = null;
  @Input() groupSize = 4;
  revealed = false;

  readonly showLabel = $localize`:@@masked.show:Show full number`;
  readonly hideLabel = $localize`:@@masked.hide:Hide full number`;
  readonly fullLabel = $localize`:@@masked.full:Full number shown`;

  get maskedLabel(): string {
    return $localize`:@@masked.ending:Number ending ${this.last4}:last4:`;
  }

  get masked(): string {
    return `\u2022\u2022\u2022\u2022 ${this.last4}`;
  }

  get grouped(): string {
    return (this.full ?? '').replace(new RegExp(`(.{${this.groupSize}})(?=.)`, 'g'), '$1 ');
  }

  toggle(): void {
    this.revealed = !this.revealed;
  }
}
