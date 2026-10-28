import { SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MOCK_CUSTOMERS } from '../../../core/data/mock-customers';
import { Customer, CustomerPayload } from '../../../core/models/customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerFormComponent } from './customer-form.component';

describe('CustomerFormComponent', () => {
  let fixture: ComponentFixture<CustomerFormComponent>;
  let component: CustomerFormComponent;
  let customers: jasmine.SpyObj<CustomerService>;

  const fill = (overrides: Record<string, unknown> = {}): void => {
    component.form.setValue({
      fullName: 'Test User',
      email: 'test.user@example.com',
      phone: '9000000000',
      city: 'Chennai',
      status: 'Active',
      riskLevel: 'Low',
      reviewRequired: false,
      ...overrides,
    } as ReturnType<typeof component.form.getRawValue>);
  };

  const setCustomer = (customer: Customer | null): void => {
    component.customer = customer;
    component.ngOnChanges({ customer: new SimpleChange(null, customer, false) });
    fixture.detectChanges();
  };

  const submitButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('[data-test="submit"]');

  beforeEach(async () => {
    customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['isEmailTaken']);
    customers.isEmailTaken.and.returnValue(of(false));
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CustomerFormComponent],
      providers: [{ provide: CustomerService, useValue: customers }],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cannot be submitted while invalid', () => {
    expect(component.form.invalid).toBeTrue();
    expect(submitButton().disabled).toBeTrue();
    const emitted: CustomerPayload[] = [];
    component.save.subscribe((payload) => emitted.push(payload));
    component.onSubmit();
    expect(emitted).toEqual([]);
  });

  it('validates name length, phone digits and email format with friendly messages', () => {
    fill({ fullName: 'ab', phone: '12345', email: 'nope' });
    component.form.markAllAsTouched();
    expect(component.errorMessage('fullName')).toContain('at least 3');
    expect(component.errorMessage('phone')).toContain('exactly 10 digits');
    expect(component.errorMessage('email')).toContain('valid email');
  });

  it('rejects a duplicate email reported by the async check', fakeAsync(() => {
    customers.isEmailTaken.and.returnValue(of(true));
    fill();
    flush();
    expect(component.form.controls.email.hasError('duplicateEmail')).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  }));

  it('emits a trimmed payload when valid', fakeAsync(() => {
    const emitted: CustomerPayload[] = [];
    component.save.subscribe((payload) => emitted.push(payload));
    fill({ fullName: '  Test User  ', email: ' test.user@example.com ', city: ' Chennai ' });
    flush();
    component.onSubmit();
    expect(emitted).toEqual([
      {
        fullName: 'Test User',
        email: 'test.user@example.com',
        phone: '9000000000',
        city: 'Chennai',
        status: 'Active',
        riskLevel: 'Low',
        reviewRequired: false,
      },
    ]);
  }));

  it('disables submission while a save is in progress', fakeAsync(() => {
    fill();
    flush();
    fixture.detectChanges();
    expect(submitButton().disabled).toBeFalse();
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();
    expect(submitButton().disabled).toBeTrue();
  }));

  it('populates existing values in edit mode and excludes the customer from the duplicate check', fakeAsync(() => {
    setCustomer(MOCK_CUSTOMERS[0]);
    flush();
    expect(component.form.getRawValue().fullName).toBe('Arun Kumar');
    expect(component.form.getRawValue().city).toBe('Chennai');
    expect(customers.isEmailTaken).toHaveBeenCalledWith('arun.kumar@example.com', 'CUS-1001');
  }));

  it('resets to a clean, pristine add form when switching back from edit mode', fakeAsync(() => {
    setCustomer(MOCK_CUSTOMERS[0]);
    flush();
    setCustomer(null);
    expect(component.form.getRawValue().fullName).toBe('');
    expect(component.form.pristine).toBeTrue();
    expect(component.form.touched).toBeFalse();
  }));

  it('keeps what the user typed after a failed save (form is not reset by the parent)', fakeAsync(() => {
    fill({ fullName: 'Keep Me' });
    flush();
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();
    expect(component.form.getRawValue().fullName).toBe('Keep Me');
  }));
});
