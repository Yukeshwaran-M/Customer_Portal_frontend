import { FormControl } from '@angular/forms';
import { fakeAsync, flush } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { CustomerService } from '../../core/services/customer.service';
import { EMAIL_PATTERN, PHONE_PATTERN, trimmedLength, uniqueEmailValidator } from './form-validators';

describe('form validators', () => {
  describe('trimmedLength', () => {
    const validate = (value: string) => trimmedLength(3, 80)(new FormControl(value));

    it('ignores empty values (required handles them)', () => expect(validate('')).toBeNull());
    it('treats whitespace-only as required', () => expect(validate('   ')).toEqual({ required: true }));
    it('measures the length after trimming', () => expect(validate(' ab ')?.['minTrimmed']).toBeTruthy());
    it('rejects values over 80 characters', () => expect(validate('a'.repeat(81))?.['maxTrimmed']).toBeTruthy());
    it('accepts valid names', () => expect(validate('Arun Kumar')).toBeNull());
  });

  describe('patterns', () => {
    it('accepts exactly 10 digits only', () => {
      expect(PHONE_PATTERN.test('9876543210')).toBeTrue();
      expect(PHONE_PATTERN.test('987654321')).toBeFalse();
      expect(PHONE_PATTERN.test('98765432101')).toBeFalse();
      expect(PHONE_PATTERN.test('98765abcde')).toBeFalse();
    });

    it('validates email format and tolerates surrounding whitespace', () => {
      expect(EMAIL_PATTERN.test(' a.b@example.com ')).toBeTrue();
      expect(EMAIL_PATTERN.test('a@b')).toBeFalse();
      expect(EMAIL_PATTERN.test('not-an-email')).toBeFalse();
    });
  });

  describe('uniqueEmailValidator', () => {
    it('reports duplicateEmail when the email is taken (excluding the current id)', fakeAsync(() => {
      const customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['isEmailTaken']);
      customers.isEmailTaken.and.returnValue(of(true));
      const validator = uniqueEmailValidator(customers, () => 'CUS-1001');
      let result: unknown;
      (validator(new FormControl('a@b.com')) as Observable<unknown>).subscribe((value) => (result = value));
      flush();
      expect(result).toEqual({ duplicateEmail: true });
      expect(customers.isEmailTaken).toHaveBeenCalledWith('a@b.com', 'CUS-1001');
    }));
  });
});
