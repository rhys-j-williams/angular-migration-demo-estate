import { HttpErrorResponse } from '@angular/common/http';

export type AppErrorKind =
  | 'network'
  | 'unauthenticated'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'locked'
  | 'rate-limited'
  | 'server'
  | 'unknown';

/** What every effect and component gets when an HTTP call fails. Produced by ErrorMappingInterceptor. */
export interface AppError {
  kind: AppErrorKind;
  status: number;
  /** BFF error code, e.g. TRANSFER_LIMIT_EXCEEDED. Stable, translatable; see shared/i18n/error-codes. */
  code?: string;
  correlationId?: string;
  /** Customer facing, already localised. */
  title: string;
  /** Extra detail from the BFF, usually not shown to the customer. */
  detail?: string;
  retryable: boolean;
  url: string;
  method: string;
  fieldErrors?: Record<string, string>;
  raw?: HttpErrorResponse;
}

export function isAppError(value: unknown): value is AppError {
  return !!value && typeof value === 'object' && 'kind' in value && 'title' in value && 'status' in value;
}
