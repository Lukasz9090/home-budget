import { HttpErrorResponse } from '@angular/common/http';

const NETWORK_ERROR = 'Brak połączenia z serwerem. Spróbuj ponownie.';
const GENERIC_ERROR = 'Coś poszło nie tak. Spróbuj ponownie.';

/**
 * Turns a failed API request into a Polish message: the ProblemDetail `detail` for the
 * expected statuses, the first field message for a 400, otherwise a generic fallback.
 */
export function apiErrorMessage(error: unknown, expected: Record<number, string>): string {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC_ERROR;
  }
  if (error.status === 0) {
    return NETWORK_ERROR;
  }
  const body = (typeof error.error === 'object' && error.error) || {};
  const detail = typeof body.detail === 'string' ? body.detail : null;
  const fallback = expected[error.status];
  if (fallback !== undefined) {
    return detail ?? fallback;
  }
  if (error.status === 400) {
    const errors = body.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors).find((message) => typeof message === 'string');
      if (typeof first === 'string') {
        return first;
      }
    }
    return detail ?? GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}
