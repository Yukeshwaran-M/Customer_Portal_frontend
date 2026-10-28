import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { MOCK_CUSTOMERS } from '../data/mock-customers';
import { ApiError } from '../models/api-error';
import { Customer } from '../models/customer.model';
import { ConfirmService } from './confirm.service';
import { CustomerStatusService } from './customer-status.service';
import { CustomerService } from './customer.service';
import { NotificationService } from './notification.service';

describe('CustomerStatusService', () => {
  let service: CustomerStatusService;
  let customers: jasmine.SpyObj<CustomerService>;
  let confirm: jasmine.SpyObj<ConfirmService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  const active: Customer = MOCK_CUSTOMERS[0];
  const deactivated: Customer = { ...active, status: 'Inactive' };

  beforeEach(() => {
    customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['updateStatus']);
    confirm = jasmine.createSpyObj<ConfirmService>('ConfirmService', ['confirm']);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error']);
    TestBed.configureTestingModule({
      providers: [
        { provide: CustomerService, useValue: customers },
        { provide: ConfirmService, useValue: confirm },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    service = TestBed.inject(CustomerStatusService);
  });

  it('does nothing when the user cancels the confirmation', () => {
    confirm.confirm.and.returnValue(of(false));
    let emitted = false;
    service.toggle(active).subscribe(() => (emitted = true));
    expect(customers.updateStatus).not.toHaveBeenCalled();
    expect(emitted).toBeFalse();
  });

  it('deactivates an active customer after confirmation and reports success', () => {
    confirm.confirm.and.returnValue(of(true));
    customers.updateStatus.and.returnValue(of(deactivated));
    let result: Customer | undefined;
    service.toggle(active).subscribe((customer) => (result = customer));
    expect(customers.updateStatus).toHaveBeenCalledWith('CUS-1001', 'Inactive');
    expect(result?.status).toBe('Inactive');
    expect(notifications.success).toHaveBeenCalled();
  });

  it('shows an error and emits nothing when the API fails', () => {
    confirm.confirm.and.returnValue(of(true));
    customers.updateStatus.and.returnValue(throwError(() => new ApiError('Boom', 500)));
    let emitted = false;
    service.toggle(active).subscribe(() => (emitted = true));
    expect(emitted).toBeFalse();
    expect(notifications.error).toHaveBeenCalledWith('Boom');
  });

  it('marks the customer busy while in flight and ignores repeated toggles', () => {
    const pending = new Subject<Customer>();
    confirm.confirm.and.returnValue(of(true));
    customers.updateStatus.and.returnValue(pending);
    let busy: ReadonlySet<string> = new Set<string>();
    service.busyIds$.subscribe((ids) => (busy = ids));

    service.toggle(active).subscribe();
    service.toggle(active).subscribe();

    expect(customers.updateStatus).toHaveBeenCalledTimes(1);
    expect(busy.has(active.id)).toBeTrue();

    pending.next(deactivated);
    pending.complete();
    expect(busy.has(active.id)).toBeFalse();
  });
});
