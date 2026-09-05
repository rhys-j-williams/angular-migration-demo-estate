import { Injectable } from '@angular/core';

/** In-memory carry between the three recovery screens. Cleared on done. */
@Injectable({ providedIn: 'root' })
export class RecoveryStateService {
  recoveryId: string | null = null;
  maskedEmail: string | null = null;

  set(recoveryId: string, maskedEmail: string): void {
    this.recoveryId = recoveryId;
    this.maskedEmail = maskedEmail;
  }

  clear(): void {
    this.recoveryId = null;
    this.maskedEmail = null;
  }
}
