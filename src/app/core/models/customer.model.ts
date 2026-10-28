export type CustomerStatus = 'Active' | 'Inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type StatusFilter = CustomerStatus | 'All';
export type SortField = 'fullName' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
export type PageSize = 5 | 10 | 20;

export const ALL = 'All';
export const PAGE_SIZES: readonly PageSize[] = [5, 10, 20];
export const RISK_LEVELS: readonly RiskLevel[] = ['Low', 'Medium', 'High'];
export const STATUSES: readonly CustomerStatus[] = ['Active', 'Inactive'];

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: CustomerStatus;
  riskLevel: RiskLevel;
  reviewRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

/** What the form sends to the API (server owns id and timestamps). */
export type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export interface CustomerFilters {
  search: string;
  status: StatusFilter;
  city: string; // 'All' or a city name
  sortBy: SortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: PageSize;
}

export interface CustomerPage {
  items: Customer[];
  totalCount: number;
}

export interface CustomerSummary {
  total: number;
  active: number;
  inactive: number;
  needsReview: number;
  cities: string[];
}

export const DEFAULT_FILTERS: CustomerFilters = {
  search: '',
  status: 'All',
  city: ALL,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};
