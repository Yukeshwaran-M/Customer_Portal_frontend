import { ALL, CustomerFilters } from '../models/customer.model';

export function hasActiveFilters(filters: CustomerFilters): boolean {
  return filters.search.trim() !== '' || filters.status !== 'All' || filters.city !== ALL;
}
