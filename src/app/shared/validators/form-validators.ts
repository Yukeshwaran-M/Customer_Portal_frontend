import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { CustomerService } from '../../core/services/customer.service';

export const EMAIL_PATTERN = /^\s*[^\s@]+@[^\s@]+\.[^\s@]{2,}\s*$/;
export const PHONE_PATTERN = /^\d{10}$/;
const EMAIL_VALIDATION_DEBOUNCE_MS = 400;

/** Length rules measured after trimming; whitespace-only counts as empty. */
export function trimmedLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '');
    if (raw.length === 0) {
      return null; // Validators.required reports empty values
    }
    const length = raw.trim().length;
    if (length === 0) {
      return { required: true };
    }
    if (length < min) {
      return { minTrimmed: { required: min, actual: length } };
    }
    if (length > max) {
      return { maxTrimmed: { required: max, actual: length } };
    }
    return null;
  };
}

/**
 * Debounced duplicate-email check. Angular cancels the previous in-flight
 * async validation when the value changes, so stale results never apply.
 */
export function uniqueEmailValidator(
  customers: CustomerService,
  currentId: () => string | null,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    timer(EMAIL_VALIDATION_DEBOUNCE_MS).pipe(
      switchMap(() => customers.isEmailTaken(String(control.value ?? ''), currentId())),
      map((taken) => (taken ? { duplicateEmail: true } : null)),
      catchError(() => of(null)), // do not block the user if the check itself fails; the save re-checks
    );
}
