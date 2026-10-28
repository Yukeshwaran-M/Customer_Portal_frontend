import { Component, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  Customer,
  CustomerFilters,
  CustomerPage,
  DEFAULT_FILTERS,
  PageSize,
  StatusFilter,
} from '../../../core/models/customer.model';
import { CustomerListStateService } from '../../../core/services/customer-list-state.service';
import { CustomerStatusService } from '../../../core/services/customer-status.service';
import { CustomerService } from '../../../core/services/customer.service';
import { getErrorMessage } from '../../../core/utils/error.util';
import { hasActiveFilters } from '../../../core/utils/filter.util';
import { SortChange } from '../customer-filters/customer-filters.component';

export type ListViewModel =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; page: CustomerPage };

const LOADING: ListViewModel = { status: 'loading' };

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
})
export class CustomerListComponent implements OnDestroy {
  private readonly filtersSubject = new BehaviorSubject<CustomerFilters>(this.listState.snapshot);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);
  private readonly destroy$ = new Subject<void>();

  readonly filters$ = this.filtersSubject.asObservable();
  readonly busyIds$ = this.statusService.busyIds$;

  readonly summary$ = this.reloadSubject.pipe(
    switchMap(() => this.customers.getSummary().pipe(catchError(() => of(null)))),
  );

  readonly vm$: Observable<ListViewModel> = combineLatest([this.filtersSubject, this.reloadSubject]).pipe(
    switchMap(([filters]) =>
      this.customers.getCustomers(filters).pipe(
        tap((page) => this.correctOutOfRangePage(filters, page)),
        map((page): ListViewModel => ({ status: 'success', page })),
        catchError((error: unknown) =>
          of<ListViewModel>({ status: 'error', message: getErrorMessage(error, 'Unable to load customers.') }),
        ),
        startWith(LOADING),
      ),
    ),
  );

  constructor(
    private readonly customers: CustomerService,
    private readonly listState: CustomerListStateService,
    private readonly statusService: CustomerStatusService,
  ) {}

  onSearch(search: string): void {
    this.update({ search });
  }

  onStatus(status: StatusFilter): void {
    this.update({ status });
  }

  onCity(city: string): void {
    this.update({ city });
  }

  onSort(sort: SortChange): void {
    this.update(sort);
  }

  onPage(page: number): void {
    this.update({ page });
  }

  onPageSize(pageSize: PageSize): void {
    this.update({ pageSize });
  }

  onClearFilters(): void {
    this.update({ ...DEFAULT_FILTERS, pageSize: this.filtersSubject.value.pageSize });
  }

  onToggleStatus(customer: Customer): void {
    this.statusService
      .toggle(customer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reload()); 
  }

  reload(): void {
    this.reloadSubject.next();
  }

  isFiltered(filters: CustomerFilters): boolean {
    return hasActiveFilters(filters);
  }

  resultsLabel(count: number): string {
    return `${count} matching ${count === 1 ? 'customer' : 'customers'}`;
  }

  trackById(_index: number, customer: Customer): string {
    return customer.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  private update(patch: Partial<CustomerFilters>): void {
    const current = this.filtersSubject.value;
    const next: CustomerFilters = { ...current, page: 1, ...patch };
    const unchanged = (Object.keys(next) as (keyof CustomerFilters)[]).every((key) => next[key] === current[key]);
    if (unchanged) {
      return;
    }
    this.listState.save(next);
    this.filtersSubject.next(next);
  }

  private correctOutOfRangePage(filters: CustomerFilters, page: CustomerPage): void {
    if (page.items.length === 0 && page.totalCount > 0) {
      this.update({ page: Math.ceil(page.totalCount / filters.pageSize) });
    }
  }
}
