import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { LanternService } from '../../../../core/telemetry/lantern.service';

export interface StrengthRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: StrengthRule[] = [
  { id: 'length', label: 'At least 12 characters', test: v => v.length >= 12 },
  { id: 'upper', label: 'An upper case letter', test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'A lower case letter', test: v => /[a-z]/.test(v) },
  { id: 'digit', label: 'A number', test: v => /\d/.test(v) },
  { id: 'symbol', label: 'A symbol', test: v => /[^A-Za-z0-9]/.test(v) },
  { id: 'repeat', label: 'No character repeated four times in a row', test: v => !/(.)\1{3}/.test(v) }
];

function passwordRules(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  const failed = PASSWORD_RULES.filter(r => !r.test(v)).map(r => r.id);
  return failed.length ? { rules: failed } : null;
}

function matches(group: AbstractControl): ValidationErrors | null {
  const next = group.get('next')?.value;
  const confirm = group.get('confirm')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

/**
 * Password change with strength rules. Still on the untyped form API: this and the rest of
 * profile were written before Angular 14 and nobody has touched them since (MOL-4471 covers it).
 */
@Component({
  selector: 'mol-change-password',
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group(
    {
      current: ['', Validators.required],
      next: ['', [Validators.required, passwordRules]],
      confirm: ['', Validators.required]
    },
    { validators: matches }
  );
  readonly rules = PASSWORD_RULES;
  busy = false;
  error: AppError | null = null;
  private saved = false;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly api: ProfileApiService,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  passes(rule: StrengthRule): boolean {
    return rule.test(String(this.form.get('next')?.value ?? ''));
  }

  get reusesCurrent(): boolean {
    const { current, next } = this.form.value;
    return !!next && next === current;
  }

  submit(): void {
    if (this.form.invalid || this.reusesCurrent || this.busy) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy = true;
    this.error = null;
    this.api.changePassword(this.form.value.current, this.form.value.next).subscribe({
      next: () => {
        this.saved = true;
        this.lantern.track('profile.password.changed');
        this.toast.success($localize`:@@profile.password.saved:Password changed. You will need it next time you sign in.`);
        void this.router.navigate(['/profile/security']);
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        if (err.code === 'PASSWORD_CURRENT_INCORRECT') this.form.get('current')?.setErrors({ incorrect: true });
        if (err.code === 'PASSWORD_RECENTLY_USED') this.form.get('next')?.setErrors({ reused: true });
        this.cdr.markForCheck();
      }
    });
  }
}
