import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { RecoveryService } from '../../../core/auth/recovery.service';
import { OtpInputComponent } from '../../mfa/otp-input/otp-input.component';
import { RecoveryStateService } from '../recovery-state.service';

@Component({
  selector: 'ks-recovery-verify',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterModule, MatButtonModule, OtpInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recovery-verify.component.html',
})
export class RecoveryVerifyComponent implements OnInit {
  readonly code = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] });
  busy = false;
  error: string | null = null;
  maskedEmail = '';

  constructor(
    private readonly recovery: RecoveryService,
    private readonly state: RecoveryStateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.state.recoveryId) {
      void this.router.navigate(['/recovery']);
      return;
    }
    this.maskedEmail = this.state.maskedEmail ?? '';
  }

  submit(code: string = this.code.value): void {
    const id = this.state.recoveryId;
    if (!id || this.busy || !/^\d{6}$/.test(code)) {
      this.code.markAsTouched();
      return;
    }
    this.busy = true;
    this.error = null;
    this.recovery.verify(id, code).subscribe({
      next: (r) => {
        this.busy = false;
        if (r.status === 'sent') {
          void this.router.navigate(['/recovery/done']);
          return;
        }
        this.error = r.status === 'expired' ? 'That code has expired. Start again.' : 'That code is not right.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.busy = false;
        this.error = 'We could not check that code right now.';
        this.cdr.markForCheck();
      },
    });
  }
}
