import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../../core/models/api-error';
import { Customer, CustomerFilters, CustomerPage, CustomerSummary, DEFAULT_FILTERS } from '../../../core/models/customer.model';
import { CustomerStatusService } from '../../../core/services/customer-status.service';
import { CustomerService } from '../../../core/services/customer.service';
import { MOCK_CUSTOMERS } from '../../../core/data/mock-customers';
import { CustomerListComponent, ListViewModel } from './customer-list.component';

describe('CustomerListComponent', () => {
  let customers: jasmine.SpyObj<CustomerService>;

  const emptyPage: CustomerPage = { items: [], totalCount: 0 };
  const summary: CustomerSummary = { total: 10, active: 6, inactive: 4, needsReview: 4, cities: ['Chennai', 'Salem'] };
  const pageOf = (items: Customer[]): CustomerPage => ({ items, totalCount: items.length });

  const create = (): CustomerListComponent => TestBed.createComponent(CustomerListComponent).componentInstance;
  const lastFilters = (): CustomerFilters => customers.getCustomers.calls.mostRecent().args[0];

  beforeEach(async () => {
    customers = jasmine.createSpyObj<CustomerService>('CustomerService', ['getCustomers', 'getSummary']);
    customers.getCustomers.and.returnValue(of(emptyPage));
    customers.getSummary.and.returnValue(of(summary));
    const statusService = jasmine.createSpyObj<CustomerStatusService>('CustomerStatusService', ['toggle'], {
      busyIds$: of(new Set<string>()),
    });

    await TestBed.configureTestingModule({
      declarations: [CustomerListComponent],
      schemas: [NO_ERRORS_SCHEMA], // child components have their own specs
      providers: [
        { provide: CustomerService, useValue: customers },
        { provide: CustomerStatusService, useValue: statusService },
      ],
    }).compileComponents();
  });

  it('loads customers with the default filters', () => {
    const component = create();
    const states: ListViewModel[] = [];
    component.vm$.subscribe((state) => states.push(state));
    expect(lastFilters()).toEqual(DEFAULT_FILTERS);
    expect(states.map((s) => s.status)).toEqual(['loading', 'success']);
  });

  it('resets to page 1 when search changes, keeping other filters', () => {
    const component = create();
    component.vm$.subscribe();
    component.onStatus('Active');
    component.onPage(3);
    expect(lastFilters().page).toBe(3);

    component.onSearch('kumar');
    expect(lastFilters()).toEqual(jasmine.objectContaining({ search: 'kumar', status: 'Active', page: 1 }));
  });

  it('composes city and status filters without clearing each other', () => {
    const component = create();
    component.vm$.subscribe();
    component.onStatus('Active');
    component.onCity('Chennai');
    expect(lastFilters()).toEqual(jasmine.objectContaining({ status: 'Active', city: 'Chennai', page: 1 }));
  });

  it('resets to page 1 when the page size or sort changes', () => {
    const component = create();
    component.vm$.subscribe();
    component.onPage(2);
    component.onPageSize(5);
    expect(lastFilters()).toEqual(jasmine.objectContaining({ pageSize: 5, page: 1 }));
    component.onPage(2);
    component.onSort({ sortBy: 'fullName', sortDirection: 'asc' });
    expect(lastFilters()).toEqual(jasmine.objectContaining({ sortBy: 'fullName', page: 1 }));
  });

  it('does not re-request when nothing actually changed', () => {
    const component = create();
    component.vm$.subscribe();
    component.onStatus('All');
    expect(customers.getCustomers).toHaveBeenCalledTimes(1);
  });

  it('exposes an error state that can be retried', () => {
    customers.getCustomers.and.returnValue(throwError(() => new ApiError('Service down', 503)));
    const component = create();
    const states: ListViewModel[] = [];
    component.vm$.subscribe((state) => states.push(state));
    expect(states[states.length - 1]).toEqual({ status: 'error', message: 'Service down' });

    component.reload();
    expect(customers.getCustomers).toHaveBeenCalledTimes(2);
  });

  it('never shows stale results: a slow earlier response is discarded', () => {
    const slow$ = new Subject<CustomerPage>();
    const fast$ = new Subject<CustomerPage>();
    customers.getCustomers.and.returnValues(slow$, fast$);
    const component = create();
    const states: ListViewModel[] = [];
    component.vm$.subscribe((state) => states.push(state));

    component.onSearch('a'); // supersedes the first request
    fast$.next(pageOf([MOCK_CUSTOMERS[1]]));
    slow$.next(pageOf([MOCK_CUSTOMERS[0]])); // arrives late and must be ignored

    const last = states[states.length - 1];
    expect(last.status).toBe('success');
    expect(last.status === 'success' && last.page.items[0].id).toBe('CUS-1002');
  });

  it('restores the previous search and filters when the page is opened again', () => {
    const first = create();
    first.vm$.subscribe();
    first.onSearch('priya');
    first.onCity('Salem');

    const second = create();
    second.vm$.subscribe();
    expect(lastFilters()).toEqual(jasmine.objectContaining({ search: 'priya', city: 'Salem' }));
  });
});
