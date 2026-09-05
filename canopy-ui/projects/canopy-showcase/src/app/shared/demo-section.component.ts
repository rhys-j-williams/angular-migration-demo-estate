import { Component, Input } from '@angular/core';

@Component({
  selector: 'cs-demo-section',
  template: `
    <cn-card [title]="title" [subtitle]="note">
      <div class="cs-demo" [class.cs-demo--tinted]="tinted"><ng-content></ng-content></div>
      <pre class="cs-code" *ngIf="code">{{ code }}</pre>
    </cn-card>
  `
})
export class DemoSectionComponent {
  @Input() title = '';
  @Input() note: string | null = null;
  @Input() code: string | null = null;
  @Input() tinted = false;
}
