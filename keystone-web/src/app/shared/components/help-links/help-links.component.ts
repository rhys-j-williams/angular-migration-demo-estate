import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ks-help-links',
  standalone: true,
  imports: [RouterModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="ks-help" aria-label="Help">
      <a *ngIf="showRecovery" class="ks-link" routerLink="/recovery">Forgot your username?</a>
      <a class="ks-link" href="https://www.meridiantrust.example/help/signing-in" rel="noopener">Trouble signing in</a>
      <a *ngIf="showEnrol" class="ks-link" href="https://www.meridiantrust.example/enroll" rel="noopener">Enroll in online banking</a>
    </nav>
  `,
  styles: [`.ks-help { display: flex; flex-wrap: wrap; gap: 12px 20px; justify-content: center; margin-top: 24px; font-size: 14px; }`],
})
export class HelpLinksComponent {
  @Input() showRecovery = true;
  @Input() showEnrol = true;
}
