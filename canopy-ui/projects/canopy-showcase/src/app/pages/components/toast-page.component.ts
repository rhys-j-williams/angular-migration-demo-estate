import { Component } from '@angular/core';
import { CnToastService } from '@meridian/canopy-ui/overlays';

@Component({
  selector: 'cs-toast-page',
  template: `
    <cs-demo-page title="cn-toast" selector="cn-toast" importFrom="overlays" imports="CnToastModule, CnToastService" lede="Snackbar wrapper with tones, actions and sticky errors.">

  <cs-demo-section title="Tones" note="Errors are sticky until dismissed because customers screenshot them for support. One toast at a time; a new one replaces the old.">
    <div class="cs-row">
      <cn-button variant="secondary" (pressed)="toast.success('Transfer of $250.00 to Savings posted')">Success</cn-button>
      <cn-button variant="secondary" (pressed)="toast.caution('Your session expires in 2 minutes', { action: 'Stay signed in' })">Caution</cn-button>
      <cn-button variant="secondary" (pressed)="toast.error('Transfer failed: insufficient available balance', { action: 'Retry' })">Error (sticky)</cn-button>
      <cn-button variant="secondary" (pressed)="toast.show('Preferences saved')">Neutral</cn-button>
      <cn-button variant="tertiary" (pressed)="toast.show('Plain Material snackbar', { simple: true })">Simple fallback</cn-button>
      <cn-button variant="tertiary" (pressed)="toast.dismiss()">Dismiss</cn-button>
    </div>
  </cs-demo-section>
  <cs-demo-section title="With action callback">
    <cn-button variant="primary" (pressed)="undoable()">Delete payee</cn-button>
    <p class="cs-muted">{{ status }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class ToastPageComponent {
  status = '';
  undoable(): void {
    this.status = 'Payee removed';
    this.toast.show('Payee removed', { action: 'Undo', duration: 6000 }).onAction().subscribe(() => (this.status = 'Restored'));
  }
  constructor(readonly toast: CnToastService) {}
}
