import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

export interface Credentials {
  username: string;
  password: string;
}

/**
 * The only component in the application that touches a password. It goes from the input to the
 * emitted event to IdpClientService.submitCredentials and nowhere else. The form control is reset
 * on every submit so the value is not sitting in a FormGroup for the lifetime of the page
 * (GIS-1490 finding 1). Do not bind the password to anything else, do not log the form value, do
 * not add "remember my password".
 *
 * Legacy Material (KEY-2210). This is the screen the MDC form field height change broke on the
 * 360px breakpoint (KEY-2233); it stays legacy until Brand signs off the new spacing.
 */
@Component({
  selector: 'ks-credential-form',
  templateUrl: './credential-form.component.html',
  styleUrls: ['./credential-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialFormComponent implements OnChanges {
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Output() readonly submitted = new EventEmitter<Credentials>();

  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(64), usernameShape]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
    rememberUsername: [false],
  });

  constructor(private readonly fb: FormBuilder, private readonly cdr: ChangeDetectorRef) {
    const remembered = safeRead('ks.username');
    if (remembered) {
      this.form.patchValue({ username: remembered, rememberUsername: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('disabled' in changes) {
      if (this.disabled) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  submit(): void {
    if (this.form.invalid || this.disabled) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password, rememberUsername } = this.form.getRawValue();
    if (rememberUsername) {
      safeWrite('ks.username', username.trim());
    } else {
      safeRemove('ks.username');
    }
    this.submitted.emit({ username: username.trim(), password });
    this.form.controls.password.reset('');
    this.showPassword = false;
    this.cdr.markForCheck();
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  get usernameError(): string | null {
    const c = this.form.controls.username;
    if (!c.touched || c.valid) {
      return null;
    }
    if (c.hasError('required')) {
      return 'Enter your username';
    }
    if (c.hasError('pattern')) {
      return 'Usernames only contain letters, numbers and . _ @ + -';
    }
    return 'Check your username';
  }
}

// Leading/trailing whitespace is trimmed on submit, so it must not fail validation either. Pasted
// usernames from the corporate password manager come with a trailing space often enough that this
// was a top-ten contact-centre reason code in 2022 (KEY-1187).
function usernameShape(control: AbstractControl<string>): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  return value === '' || /^[a-z0-9._@+-]+$/i.test(value) ? null : { pattern: true };
}

// Username only, never the password. localStorage because the cookie jar on login.* is reserved
// for the IdP session and the device trust marker (KEY-0688).
function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}
function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}
