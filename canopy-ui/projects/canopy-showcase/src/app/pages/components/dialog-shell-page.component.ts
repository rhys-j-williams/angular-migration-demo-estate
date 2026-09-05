import { Component } from '@angular/core';
import { TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CnRadioOption } from '@meridian/canopy-ui/forms';
import { CnDialogService, CnDialogSize, CnToastService } from '@meridian/canopy-ui/overlays';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-dialog-shell-page',
  template: `
    <cs-demo-page title="cn-dialog-shell" selector="cn-dialog-shell" importFrom="overlays" imports="CnDialogShellModule, CnDialogService" lede="Dialog frame plus a service with sized open() and confirm().">

  <cs-demo-section title="Confirm" note="confirm() returns Observable<boolean>. Destructive confirms use the warn button and put Cancel first.">
    <div class="cs-row">
      <cn-button variant="secondary" (pressed)="confirm(false)">Confirm</cn-button>
      <cn-button variant="destructive" (pressed)="confirm(true)">Destructive confirm</cn-button>
    </div>
    <p class="cs-muted">Result: {{ result }}</p>
  </cs-demo-section>
  <cs-demo-section title="Custom content" note="Open a template inside cn-dialog-shell; the shell handles title, close, busy and the padding override on the container.">
    <div class="cs-row">
      <cn-button variant="primary" (pressed)="open('sm')">Small</cn-button>
      <cn-button variant="primary" (pressed)="open('md')">Medium</cn-button>
      <cn-button variant="primary" (pressed)="open('lg')">Large</cn-button>
    </div>
    <ng-template #tpl>
      <cn-dialog-shell title="Dispute transaction" subtitle="Reference {{ txn.id }}" [size]="size" [busy]="busy" (closed)="ref?.close()">
        <p>{{ txn.description }} on {{ txn.postedAt | date:'mediumDate' }} for {{ txn.amount | cnCurrency }}.</p>
        <cn-radio-group legend="Reason" [options]="reasons" [(ngModel)]="reason"></cn-radio-group>
        <div cnDialogActions class="cs-row" style="justify-content: flex-end">
          <cn-button variant="tertiary" (pressed)="ref?.close()">Cancel</cn-button>
          <cn-button variant="primary" [disabled]="!reason" [loading]="busy" (pressed)="file()">File dispute</cn-button>
        </div>
      </cn-dialog-shell>
    </ng-template>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class DialogShellPageComponent {
  @ViewChild('tpl') tpl!: TemplateRef<unknown>;
  result = '-';
  size: CnDialogSize = 'md';
  busy = false;
  reason: string | null = null;
  ref: MatDialogRef<unknown> | null = null;
  readonly txn = this.fixtures.transactions()[0];
  readonly reasons: CnRadioOption<string>[] = [
    { value: 'unrecognised', label: 'I do not recognise this' },
    { value: 'duplicate', label: 'Charged twice' },
    { value: 'amount', label: 'Wrong amount' }
  ];
  confirm(destructive: boolean): void {
    this.dialogs.confirm({
      title: destructive ? 'Close this account?' : 'Cancel scheduled transfer?',
      message: destructive ? 'Closing is permanent. Any remaining balance is mailed as a check within 10 business days.' : 'The transfer scheduled for Friday will not be sent.',
      confirmLabel: destructive ? 'Close account' : 'Cancel transfer',
      destructive
    }).subscribe(ok => (this.result = ok ? 'confirmed' : 'dismissed'));
  }
  open(size: CnDialogSize): void {
    this.size = size;
    this.reason = null;
    this.ref = this.dialogs.open(this.tpl, { size });
  }
  file(): void {
    this.busy = true;
    setTimeout(() => {
      this.busy = false;
      this.ref?.close();
      this.toast.success('Dispute filed. Case number follows by secure message.');
    }, 1000);
  }
  constructor(private readonly dialogs: CnDialogService, private readonly toast: CnToastService, private readonly fixtures: ShowcaseFixturesService) {}
}
