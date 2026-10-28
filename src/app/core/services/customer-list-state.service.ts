import { Injectable } from '@angular/core';
import { CustomerFilters, DEFAULT_FILTERS } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerListStateService {
  private filters: CustomerFilters = { ...DEFAULT_FILTERS };

  get snapshot(): CustomerFilters {
    return { ...this.filters };
  }

  save(filters: CustomerFilters): void {
    this.filters = { ...filters };
  }
}
