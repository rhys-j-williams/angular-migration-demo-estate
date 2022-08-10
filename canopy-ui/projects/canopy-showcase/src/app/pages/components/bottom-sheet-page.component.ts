import { Component } from '@angular/core';
import { TemplateRef, ViewChild } from '@angular/core';
import { CnBottomSheetService } from '@meridian/canopy-ui/overlays';

@Component({
  selector: 'cs-bottom-sheet-page',
  template: `
    <cs-demo-page title="cn-bottom-sheet" selector="cn-bottom-sheet" importFrom="overlays" imports="CnBottomSheetModule, CnBottomSheetService" lede="Mobile-first action sheet with drag handle.">

  <cs-demo-section title="Account actions on mobile" note="Below the tablet breakpoint the account menu opens as a sheet instead. Focus returns to the trigger on dismiss.">
    <cn-button variant="secondary" icon="cn:more" (pressed)="open()">Open sheet</cn-button>
    <p class="cs-muted">Last action: {{ last || '-' }}</p>
    <ng-template #sheet>
      <cn-bottom-sheet title="Everyday Checking" (closed)="sheets.dismiss()">
        <cn-list [items]="actions" [interactive]="true" (itemSelect)="pick($event.id)"></cn-list>
      </cn-bottom-sheet>
    </ng-template>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class BottomSheetPageComponent {
  @ViewChild('sheet') sheet!: TemplateRef<unknown>;
  last = '';
  readonly actions = [
    { id: 'transfer', primary: 'Transfer', icon: 'cn:transfer' },
    { id: 'statements', primary: 'Statements', icon: 'cn:document' },
    { id: 'freeze', primary: 'Freeze card', icon: 'cn:lock' }
  ];
  open(): void { this.sheets.open(this.sheet); }
  pick(id: string): void {
    this.last = id;
    this.sheets.dismiss();
  }
  constructor(readonly sheets: CnBottomSheetService) {}
}
