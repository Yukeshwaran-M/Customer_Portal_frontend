import { TestBed } from '@angular/core/testing';
import { DEFAULT_FILTERS } from '../models/customer.model';
import { CustomerListStateService } from './customer-list-state.service';

describe('CustomerListStateService', () => {
  let service: CustomerListStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerListStateService);
  });

  it('starts with the default filters', () => {
    expect(service.snapshot).toEqual(DEFAULT_FILTERS);
  });

  it('remembers saved filters and returns copies', () => {
    service.save({ ...DEFAULT_FILTERS, search: 'kumar', city: 'Chennai', page: 2 });
    const snapshot = service.snapshot;
    expect(snapshot.search).toBe('kumar');
    snapshot.search = 'changed';
    expect(service.snapshot.search).toBe('kumar');
  });
});
