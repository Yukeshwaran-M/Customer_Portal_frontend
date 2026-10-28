import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, debounceTime, filter, map, takeUntil } from 'rxjs';
import {
  ALL,
  CustomerFilters,
  DEFAULT_FILTERS,
  SortDirection,
  SortField,
  StatusFilter,
} from '../../../core/models/customer.model';
import { hasActiveFilters } from '../../../core/utils/filter.util';

export interface SortChange {
  sortBy: SortField;
  sortDirection: SortDirection;
}

interface SortOption extends SortChange {
  key: string;
  label: string;
}

export const SEARCH_DEBOUNCE_MS = 300;

const SORT_OPTIONS: readonly SortOption[] = [
  { key: 'updatedAt:desc', label: 'Last updated (newest first)', sortBy: 'updatedAt', sortDirection: 'desc' },
  { key: 'updatedAt:asc', label: 'Last updated (oldest first)', sortBy: 'updatedAt', sortDirection: 'asc' },
  { key: 'fullName:asc', label: 'Name (A–Z)', sortBy: 'fullName', sortDirection: 'asc' },
  { key: 'fullName:desc', label: 'Name (Z–A)', sortBy: 'fullName', sortDirection: 'desc' },
];

@Component({
  selector: 'app-customer-filters',
  templateUrl: './customer-filters.component.html',
  styleUrls: ['./customer-filters.component.css'],
})
export class CustomerFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: CustomerFilters = DEFAULT_FILTERS;
  @Input() cities: readonly string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<StatusFilter>();
  @Output() cityChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortChange>();
  @Output() filtersCleared = new EventEmitter<void>();

  readonly all = ALL;
  readonly sortOptions = SORT_OPTIONS;
  readonly statuses: readonly StatusFilter[] = ['All', 'Active', 'Inactive'];

  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    status: new FormControl<StatusFilter>('All', { nonNullable: true }),
    city: new FormControl(ALL, { nonNullable: true }),
    sort: new FormControl(SORT_OPTIONS[0].key, { nonNullable: true }),
  });

  private lastEmittedSearch = '';
  private readonly destroy$ = new Subject<void>();

  get canClear(): boolean {
    return hasActiveFilters(this.filters);
  }

  ngOnInit(): void {
    const { search, status, city, sort } = this.form.controls;

    // debounce typing; the parent's switchMap cancels any request still in flight
    search.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        filter((term) => term !== this.lastEmittedSearch),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        this.lastEmittedSearch = term;
        this.searchChange.emit(term);
      });

    status.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.statusChange.emit(value));
    city.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.cityChange.emit(value));
    sort.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((key) => {
      const option = SORT_OPTIONS.find((candidate) => candidate.key === key);
      if (option) {
        this.sortChange.emit({ sortBy: option.sortBy, sortDirection: option.sortDirection });
      }
    });
  }

  /** Keeps the controls in sync when filters are changed from outside (restore, clear). */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['filters']) {
      return;
    }
    const current = this.filters;
    this.form.patchValue(
      { status: current.status, city: current.city, sort: `${current.sortBy}:${current.sortDirection}` },
      { emitEvent: false },
    );
    // only overwrite the text box for external changes, never while the user is typing
    if (current.search !== this.lastEmittedSearch) {
      this.lastEmittedSearch = current.search;
      this.form.controls.search.setValue(current.search, { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
