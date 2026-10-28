import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { MOCK_CUSTOMERS } from '../../../core/data/mock-customers';
import { ApiError } from '../../../core/models/api-error';
import { Customer, CustomerPayload } from '../../../core/models/customer.model';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerEditorPageComponent } from './customer-editor-page.component';

describe('CustomerEditorPageComponent', () => {
  let fixture: ComponentFixture<CustomerEditorPageComponent>;
  let component: CustomerEditorPageComponent;
  let customers: jasmine.SpyObj<CustomerService>;
  let notifications: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let params$: BehaviorSubject<ParamMap>;

  const existing: Customer = MOCK_CUSTOMERS[0];
  const payload: CustomerPayload = {
    fullName: 'Test User',
    email: 'test.user@example.com',
    phone: '9000000000',
    city: 'Chennai',
    status: 'Active',
    riskLevel: 'Low',
    reviewRequired: false,
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
    customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['getById', 'getSummary', 'create', 'update']);
    customers.getSummary.and.returnValue(of({ total: 10, active: 6, inactive: 4, needsReview: 4, cities: ['Chennai'] }));
    customers.getById.and.returnValue(of(existing));
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      declarations: [CustomerEditorPageComponent],
      schemas: [NO_ERRORS_SCHEMA], // child form is tested separately
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params$ } },
        { provide: Router, useValue: router },
        { provide: CustomerService, useValue: customers },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomerEditorPageComponent);
    component = fixture.componentInstance;
  });

  it('shows the add heading when the route has no id', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Add customer');
    expect(customers.getById).not.toHaveBeenCalled();
  });

  it('loads the customer in edit mode', () => {
    params$.next(convertToParamMap({ id: 'CUS-1001' }));
    fixture.detectChanges();
    expect(customers.getById).toHaveBeenCalledWith('CUS-1001');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Edit customer');
    expect(fixture.nativeElement.querySelector('app-customer-form')).toBeTruthy();
  });

  it('shows an error when the customer cannot be loaded', () => {
    customers.getById.and.returnValue(throwError(() => new ApiError('Not found', 404, 'NOT_FOUND')));
    params$.next(convertToParamMap({ id: 'CUS-9999' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert-danger')).toBeTruthy();
  });

  it('creates a customer, shows success feedback and navigates to the list', () => {
    customers.create.and.returnValue(of({ ...existing, ...payload, id: 'CUS-1011' }));
    component.onSave(payload, null);
    expect(notifications.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
    expect(component.saving).toBeFalse();
  });

  it('updates an existing customer and navigates to its details', () => {
    customers.update.and.returnValue(of({ ...existing, ...payload }));
    component.onSave(payload, existing);
    expect(customers.update).toHaveBeenCalledWith('CUS-1001', payload);
    expect(router.navigate).toHaveBeenCalledWith(['/customers', 'CUS-1001']);
  });

  it('shows an error and stays on the page when saving fails', () => {
    customers.create.and.returnValue(throwError(() => new ApiError('Unable to save', 500)));
    component.onSave(payload, null);
    expect(notifications.error).toHaveBeenCalledWith('Unable to save');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('ignores a second submit while a save is in flight', () => {
    customers.create.and.returnValue(new Subject<Customer>());
    component.onSave(payload, null);
    component.onSave(payload, null);
    expect(customers.create).toHaveBeenCalledTimes(1);
    expect(component.saving).toBeTrue();
  });
});
