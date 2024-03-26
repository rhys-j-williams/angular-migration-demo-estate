import { NgModule } from '@angular/core';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatIconModule } from '@angular/material/icon';

/**
 * The pre-MDC Material modules, re-exported for the screens that have not moved yet
 * (KEY-2210). New screens must NOT import this; use MaterialModule. When this file has no
 * importers left, delete it and the legacy half of _theme.scss.
 *
 * KEY-2210 2024-03-26: legacy form-field and input removed here so nothing new can reach for them.
 * MFA is on MaterialModule for those. Login page next, once the outline appearance is sorted with
 * the brand team (the MDC outline is 4px taller and the login screenshot is in the brand book).
 */
const LEGACY = [
  MatLegacyButtonModule,
  MatLegacyCheckboxModule,
  MatLegacyProgressSpinnerModule,
  MatIconModule,
];

@NgModule({
  imports: LEGACY,
  exports: LEGACY,
})
export class LegacyMaterialModule {}
