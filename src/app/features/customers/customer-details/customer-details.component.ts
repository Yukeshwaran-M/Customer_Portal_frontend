import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
} from 'rxjs';
import { Customer, RiskLevel } from '../../../core/models/customer.model';
import { CustomerStatusService } from '../../../core/services/customer-status.service';
import { CustomerService } from '../../../core/services/customer.service';
import { getErrorMessage } from '../../../core/utils/error.util';

type DetailsViewModel =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; customer: Customer };

const LOADING: DetailsViewModel = { state: 'loading' };

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css'],
})
export class CustomerDetailsComponent implements OnDestroy {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  private readonly destroy$ = new Subject<void>();

  readonly busyIds$ = this.statusService.busyIds$;

  readonly vm$: Observable<DetailsViewModel> = combineLatest([this.route.paramMap, this.reload$]).pipe(
    switchMap(([params]) =>
      this.customers.getById(params.get('id') ?? '').pipe(
        map((customer): DetailsViewModel => ({ state: 'ready', customer })),
        catchError((error: unknown) =>
          of<DetailsViewModel>({ state: 'error', message: getErrorMessage(error, 'Unable to load this customer.') }),
        ),
        startWith(LOADING),
      ),
    ),
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly customers: CustomerService,
    private readonly statusService: CustomerStatusService,
  ) {}

  isBusy(busyIds: ReadonlySet<string> | null, id: string): boolean {
    return busyIds?.has(id) ?? false;
  }

  toggleLabel(customer: Customer): string {
    return customer.status === 'Active' ? 'Deactivate' : 'Activate';
  }

  riskClass(level: RiskLevel): string {
    const classes: Record<RiskLevel, string> = {
      Low: 'text-bg-success',
      Medium: 'text-bg-warning',
      High: 'text-bg-danger',
    };
    return classes[level];
  }

  onToggleStatus(customer: Customer): void {
    this.statusService
      .toggle(customer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reload$.next()); // refresh only after the API succeeded
  }

  reload(): void {
    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
