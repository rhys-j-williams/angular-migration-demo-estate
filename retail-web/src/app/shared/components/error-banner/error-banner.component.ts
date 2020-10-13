import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AppError } from '../../../core/errors/app-error.model';

/**
 * Inline error for a failed load. Shows the customer-facing title, a retry button when the error
 * is retryable, and the correlation id in small print so support can find it in Splunk. Never
 * shows `detail`.
 */
@Component({
  selector: 'mol-error-banner',
  template: `
    <div class="mol-error-banner" role="alert" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="space-between center" fxLayoutGap="12px" *ngIf="error">
      <div fxLayout="row" fxLayoutGap="12px" fxLayoutAlign="start center">
        <mat-icon aria-hidden="true">error_outline</mat-icon>
        <div>
          <div class="mol-error-banner__title">{{ error.title }}</div>
          <div class="mol-error-banner__ref" *ngIf="error.correlationId" i18n="@@error.reference">Reference {{ error.correlationId }}</div>
        </div>
      </div>
      <cn-button *ngIf="error.retryable && showRetry" variant="secondary" size="small" (pressed)="retry.emit()" i18n="@@action.tryAgain">Try again</cn-button>
    </div>
  `,
  styles: [`
    .mol-error-banner { padding: 12px 16px; border-radius: 8px; background: var(--cn-color-error-container, #fdecea); color: var(--cn-color-on-error-container, #611a15); }
    .mol-error-banner__title { font-weight: 500; }
    .mol-error-banner__ref { font-size: 0.75rem; opacity: 0.8; font-family: monospace; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  @Input() error: AppError | null = null;
  @Input() showRetry = true;
  @Output() readonly retry = new EventEmitter<void>();
}
