import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MOCK_CUSTOMERS } from '../../../core/data/mock-customers';
import { ApiError } from '../../../core/models/api-error';
import { Customer } from '../../../core/models/customer.model';
import { CustomerStatusService } from '../../../core/services/customer-status.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDetailsComponent } from './customer-details.component';

describe('CustomerDetailsComponent', () => {
  let fixture: ComponentFixture<CustomerDetailsComponent>;
  let customers: jasmine.SpyObj<CustomerService>;
  let statusService: jasmine.SpyObj<CustomerStatusService>;
  const customer: Customer = MOCK_CUSTOMERS[1]; // Priya Sharma, review required

  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['getById']);
    customers.getById.and.returnValue(of(customer));
    statusService = jasmine.createSpyObj<CustomerStatusService>('CustomerStatusService', ['toggle'], {
      busyIds$: of(new Set<string>()),
    });

    await TestBed.configureTestingModule({
      declarations: [CustomerDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: customer.id })) } },
        { provide: CustomerService, useValue: customers },
        { provide: CustomerStatusService, useValue: statusService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerDetailsComponent);
  });

  it('shows all the customer fields', () => {
    fixture.detectChanges();
    expect(customers.getById).toHaveBeenCalledWith('CUS-1002');
    ['CUS-1002', 'priya.sharma@example.com', '9876543211', 'Coimbatore', 'Medium', 'Priya Sharma'].forEach((value) =>
      expect(text()).toContain(value),
    );
    expect(text()).toContain('Review required');
    expect(text()).toContain('Yes');
  });

  it('shows an error state with a retry button when loading fails', () => {
    customers.getById.and.returnValue(throwError(() => new ApiError('Customer not found.', 404, 'NOT_FOUND')));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('Customer not found.');
  });

  it('reloads the customer after a successful status change', () => {
    statusService.toggle.and.returnValue(of({ ...customer, status: 'Inactive' }));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-test="toggle-status"]').click();
    expect(statusService.toggle).toHaveBeenCalledWith(customer);
    expect(customers.getById).toHaveBeenCalledTimes(2);
  });
});
