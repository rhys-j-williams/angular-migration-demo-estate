import { NgModule } from '@angular/core';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatIconModule } from '@angular/material/icon';

/**
 * The pre-MDC Material modules, re-exported for the screens that have not moved yet
 * (KEY-2210). New screens must NOT import this; use MaterialModule. When this file has no
 * importers left, delete it and the legacy half of _theme.scss.
 *
 * Still on legacy as of 2024-03: credential form, login page, locked out, otp challenge, channel
 * picker, push approval, authenticator app, step-up interstitial, busy overlay.
 */
const LEGACY = [
  MatLegacyButtonModule,
  MatLegacyCheckboxModule,
  MatLegacyFormFieldModule,
  MatLegacyInputModule,
  MatLegacyProgressSpinnerModule,
  MatIconModule,
];

@NgModule({
  imports: LEGACY,
  exports: LEGACY,
})
export class LegacyMaterialModule {}
