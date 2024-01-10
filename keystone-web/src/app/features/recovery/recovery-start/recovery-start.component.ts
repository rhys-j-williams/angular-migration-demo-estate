import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { Router, RouterModule } from '@angular/router';

import { RecoveryService } from '../../../core/auth/recovery.service';
import { RateLimitBannerComponent } from '../../../shared/components/rate-limit-banner/rate-limit-banner.component';
import { RecoveryStateService } from '../recovery-state.service';

@Component({
  selector: 'ks-recovery-start',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, RateLimitBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recovery-start.component.html',
})
export class RecoveryStartComponent {
  busy = false;
  failed = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    // Last four of the debit card or account number. Fraud accepted either in FRD-0190.
    lastFour: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly recovery: RecoveryService,
    private readonly state: RecoveryStateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  submit(): void {
    if (this.form.invalid || this.busy) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy = true;
    this.failed = false;
    const { email, lastFour } = this.form.getRawValue();
    this.recovery.start(email.trim().toLowerCase(), lastFour).subscribe({
      next: (r) => {
        this.state.set(r.recoveryId, r.maskedEmail);
        void this.router.navigate(['/recovery/verify']);
      },
      error: () => {
        this.busy = false;
        this.failed = true;
        this.cdr.markForCheck();
      },
    });
  }
}
